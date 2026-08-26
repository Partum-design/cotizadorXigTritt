import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendQuoteEmail } from "@/lib/email";
import { renderQuotePdf, mapQuoteItemsToPdf, type QuotePdfData } from "@/lib/quote-pdf";

const itemSchema = z.object({
  productId: z.string().uuid(),
  capacityValue: z.number().finite(),
  material: z.string().optional().default(""),
  power: z.string().optional().default(""),
  engraving: z.boolean().optional().default(false),
  engravingText: z.string().max(120).optional().default(""),
  quantity: z.number().int().min(1).max(999),
});

const submitSchema = z.object({
  lead: z.object({
    fullName: z.string().min(2).max(150),
    company: z.string().max(150).optional().default(""),
    email: z.string().email(),
    phone: z.string().max(40).optional().default(""),
    notes: z.string().max(1000).optional().default(""),
  }),
  items: z.array(itemSchema).min(1).max(50),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { lead, items } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("submit_quote", {
    p_lead: {
      full_name: lead.fullName,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      notes: lead.notes,
    },
    p_items: items.map((i) => ({
      product_id: i.productId,
      capacity_value: i.capacityValue,
      material: i.material,
      power: i.power,
      engraving: i.engraving,
      engraving_text: i.engravingText,
      quantity: i.quantity,
    })),
  });

  if (error || !data) {
    console.error("[quotes/submit] RPC error:", error);
    return NextResponse.json({ error: "submit_failed" }, { status: 500 });
  }

  const result = data as {
    quote_id: string;
    token: string;
    quote_number: string;
    subtotal: number;
    tax: number;
    total: number;
    items: Array<Record<string, unknown>>;
  };

  const { error: markSentError } = await supabase.rpc("mark_quote_sent", { p_token: result.token });
  if (markSentError) {
    console.error("[quotes/submit] mark_quote_sent error:", markSentError);
  }

  const { data: quoteRow } = await supabase
    .from("quotes")
    .select("valid_until, currency, created_at")
    .eq("public_token", result.token)
    .maybeSingle();

  const validUntil =
    (quoteRow as { valid_until: string } | null)?.valid_until ?? new Date(Date.now() + 72 * 3600 * 1000).toISOString();
  const currency = (quoteRow as { currency: string } | null)?.currency ?? "MXN";
  const createdAt = (quoteRow as { created_at: string } | null)?.created_at ?? new Date().toISOString();

  const pdfData: QuotePdfData = {
    quoteNumber: result.quote_number,
    status: "sent",
    createdAt,
    validUntil,
    subtotal: Number(result.subtotal),
    tax: Number(result.tax),
    total: Number(result.total),
    currency,
    lead: {
      fullName: lead.fullName,
      company: lead.company || null,
      email: lead.email,
      phone: lead.phone || null,
    },
    items: mapQuoteItemsToPdf(result.items as never),
    companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "tritton@mezcladorasymolinosindustriales.com.mx",
    companyPhone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "",
  };

  const pdfBuffer = await renderQuotePdf(pdfData).catch((err) => {
    console.error("[quotes/submit] PDF render error:", err);
    return null;
  });

  const emailResult = await sendQuoteEmail(
    lead.email,
    {
      token: result.token,
      quoteNumber: result.quote_number,
      leadName: lead.fullName,
      subtotal: result.subtotal,
      tax: result.tax,
      total: result.total,
      validUntil,
      items: result.items as never,
    },
    pdfBuffer ?? undefined
  );

  return NextResponse.json({
    token: result.token,
    quoteNumber: result.quote_number,
    total: result.total,
    emailSent: emailResult.sent,
  });
}

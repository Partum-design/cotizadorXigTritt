import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendQuoteEmail } from "@/lib/email";

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
    .select("valid_until")
    .eq("public_token", result.token)
    .maybeSingle();

  const emailResult = await sendQuoteEmail(lead.email, {
    token: result.token,
    quoteNumber: result.quote_number,
    leadName: lead.fullName,
    subtotal: result.subtotal,
    tax: result.tax,
    total: result.total,
    validUntil: (quoteRow as { valid_until: string } | null)?.valid_until ?? new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    items: result.items as never,
  });

  return NextResponse.json({
    token: result.token,
    quoteNumber: result.quote_number,
    total: result.total,
    emailSent: emailResult.sent,
  });
}

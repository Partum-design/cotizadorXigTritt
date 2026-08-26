import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendQuoteEmail } from "@/lib/email";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { buildQuotePdfData } from "@/lib/quote-pdf-data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!quote) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (quote.status === "accepted" || quote.status === "rejected") {
    return NextResponse.json({ error: "closed_quote" }, { status: 409 });
  }

  const { data: lead } = await supabase.from("leads").select("*").eq("id", quote.lead_id).maybeSingle();
  const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", id);

  if (!lead) return NextResponse.json({ error: "lead_not_found" }, { status: 404 });

  // Every resend becomes a fresh 72-hour commercial window for the same public micro site.
  const validUntil = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
  await supabase.from("quotes").update({ valid_until: validUntil, status: "sent", sent_at: new Date().toISOString() }).eq("id", id);

  let pdfBuffer: Buffer | null = null;
  try {
    const pdfData = buildQuotePdfData({
      quote: { ...quote, valid_until: validUntil },
      lead,
      items: items ?? [],
      createdAt: quote.created_at,
    });
    pdfBuffer = await renderQuotePdf(pdfData);
  } catch (err) {
    console.error("[quotes/resend] Error generando PDF:", err);
  }

  const result = await sendQuoteEmail(
    lead.email,
    {
      token: quote.public_token,
      quoteNumber: quote.quote_number,
      leadName: lead.full_name,
      subtotal: Number(quote.subtotal),
      tax: Number(quote.tax),
      total: Number(quote.total),
      validUntil,
      items: (items ?? []) as never,
    },
    pdfBuffer
  );

  await supabase.from("quote_events").insert({
    quote_id: id,
    event_type: "resent",
    metadata: { sent: result.sent, valid_until: validUntil },
  });

  return NextResponse.json({ sent: result.sent });
}

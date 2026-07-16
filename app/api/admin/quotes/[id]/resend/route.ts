import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendQuoteEmail } from "@/lib/email";

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

  const { data: lead } = await supabase.from("leads").select("*").eq("id", quote.lead_id).maybeSingle();
  const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", id);

  if (!lead) return NextResponse.json({ error: "lead_not_found" }, { status: 404 });

  const result = await sendQuoteEmail(lead.email, {
    token: quote.public_token,
    quoteNumber: quote.quote_number,
    leadName: lead.full_name,
    subtotal: Number(quote.subtotal),
    tax: Number(quote.tax),
    total: Number(quote.total),
    validUntil: quote.valid_until ?? new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    items: (items ?? []) as never,
  });

  await supabase.from("quote_events").insert({
    quote_id: id,
    event_type: "resent",
    metadata: { sent: result.sent },
  });

  return NextResponse.json({ sent: result.sent });
}

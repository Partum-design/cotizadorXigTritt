import { createClient } from "@/lib/supabase/server";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { buildQuotePdfData } from "@/lib/quote-pdf-data";
import type { PublicQuote } from "@/components/quote/QuoteMicrosite";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_quote_public", { p_token: token });
  const quote = data as unknown as (PublicQuote & { sent_at?: string | null }) | null;

  if (!quote) {
    return new Response("Cotización no encontrada", { status: 404 });
  }

  const pdfData = buildQuotePdfData({
    quote,
    lead: quote.lead,
    items: quote.items,
    createdAt: quote.sent_at ?? null,
  });

  const pdf = await renderQuotePdf(pdfData);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.quote_number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

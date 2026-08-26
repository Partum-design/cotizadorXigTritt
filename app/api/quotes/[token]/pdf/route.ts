import { createClient } from "@/lib/supabase/server";
import { renderQuotePdf, mapQuoteItemsToPdf, type QuotePdfData } from "@/lib/quote-pdf";
import type { PublicQuote } from "@/components/quote/QuoteMicrosite";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_quote_public", { p_token: token });
  const quote = data as unknown as (PublicQuote & { sent_at?: string | null }) | null;

  if (!quote) {
    return new Response("Cotización no encontrada", { status: 404 });
  }

  const pdfData: QuotePdfData = {
    quoteNumber: quote.quote_number,
    status: quote.status,
    createdAt: quote.sent_at ?? null,
    validUntil: quote.valid_until,
    subtotal: Number(quote.subtotal),
    tax: Number(quote.tax),
    total: Number(quote.total),
    currency: quote.currency,
    lead: {
      fullName: quote.lead.full_name,
      company: quote.lead.company,
      email: quote.lead.email,
      phone: quote.lead.phone,
    },
    items: mapQuoteItemsToPdf(quote.items),
    companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "tritton@mezcladorasymolinosindustriales.com.mx",
    companyPhone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "",
  };

  const pdf = await renderQuotePdf(pdfData);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.quote_number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

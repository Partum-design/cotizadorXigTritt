import { createClient } from "@/lib/supabase/server";
import { renderQuotePdf, mapQuoteItemsToPdf, type QuotePdfData } from "@/lib/quote-pdf";
import type { Lead, Quote, QuoteItem } from "@/lib/database.types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { data: quote } = (await supabase.from("quotes").select("*").eq("id", id).maybeSingle()) as unknown as {
    data: Quote | null;
  };
  if (!quote) return new Response("not_found", { status: 404 });

  const [{ data: lead }, { data: items }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", quote.lead_id).maybeSingle() as unknown as Promise<{
      data: Lead | null;
    }>,
    supabase.from("quote_items").select("*").eq("quote_id", id).order("created_at") as unknown as Promise<{
      data: QuoteItem[] | null;
    }>,
  ]);
  if (!lead) return new Response("lead_not_found", { status: 404 });

  const pdfData: QuotePdfData = {
    quoteNumber: quote.quote_number,
    status: quote.status,
    createdAt: quote.created_at,
    validUntil: quote.valid_until,
    subtotal: Number(quote.subtotal),
    tax: Number(quote.tax),
    total: Number(quote.total),
    currency: quote.currency,
    lead: { fullName: lead.full_name, company: lead.company, email: lead.email, phone: lead.phone },
    items: mapQuoteItemsToPdf(items ?? []),
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

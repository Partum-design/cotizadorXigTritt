import type { QuotePdfData, QuotePdfItem } from "@/lib/quote-pdf";

interface RawQuoteItem {
  product_name: string;
  product_model: string | null;
  capacity_value: number | null;
  capacity_unit: string | null;
  material: string | null;
  power: string | null;
  engraving: boolean;
  engraving_text: string | null;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}

interface RawLead {
  full_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  notes?: string | null;
}

interface RawQuote {
  quote_number: string;
  status: string;
  valid_until: string | null;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  currency: string;
}

export function buildQuotePdfData(params: {
  quote: RawQuote;
  lead: RawLead;
  items: RawQuoteItem[];
  createdAt: string | null;
}): QuotePdfData {
  const { quote, lead, items, createdAt } = params;

  return {
    quoteNumber: quote.quote_number,
    status: quote.status,
    createdAt,
    validUntil: quote.valid_until,
    subtotal: Number(quote.subtotal),
    tax: Number(quote.tax),
    total: Number(quote.total),
    currency: quote.currency,
    lead: {
      fullName: lead.full_name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      notes: lead.notes ?? null,
    },
    items: items.map(
      (item): QuotePdfItem => ({
        productName: item.product_name,
        productModel: item.product_model,
        capacityValue: item.capacity_value,
        capacityUnit: item.capacity_unit,
        material: item.material,
        power: item.power,
        engraving: item.engraving,
        engravingText: item.engraving_text,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        subtotal: Number(item.subtotal),
      })
    ),
    companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "TRITTÓN",
    companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "tritton@mezcladorasymolinosindustriales.com.mx",
    companyPhone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "",
  };
}

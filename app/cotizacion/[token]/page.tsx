import { headers } from "next/headers";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductIcon } from "@/components/icons";
import { QuoteActions } from "@/components/quote/QuoteActions";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PublicQuoteItem {
  product_name: string;
  product_model: string | null;
  category_name: string | null;
  capacity_value: number | null;
  capacity_unit: string | null;
  material: string | null;
  power: string | null;
  engraving: boolean;
  engraving_text: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface PublicQuote {
  quote_number: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected";
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  sent_at: string | null;
  valid_until: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  expired: boolean;
  lead: { full_name: string; company: string | null; email: string; phone: string | null };
  items: PublicQuoteItem[];
}

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const hdrs = await headers();

  const { data } = await supabase.rpc("get_quote_public", { p_token: token });
  const quote = data as unknown as PublicQuote | null;

  if (quote && quote.status !== "accepted" && quote.status !== "rejected") {
    await supabase.rpc("track_view", {
      p_token: token,
      p_ip: hdrs.get("x-forwarded-for"),
      p_ua: hdrs.get("user-agent"),
    });
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="container-page py-10">
          {!quote ? (
            <div className="mx-auto max-w-lg rounded-xl border border-brand-border bg-white p-10 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
              <h1 className="mt-4 text-xl font-bold text-brand-navy">Cotizaci&oacute;n no encontrada</h1>
              <p className="mt-2 text-sm text-slate-500">
                Este enlace no es v&aacute;lido o la cotizaci&oacute;n a&uacute;n no ha sido enviada.
              </p>
              <Link href="/" className="mt-6 inline-block text-brand-blue hover:underline">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-brand-navy">
                    Cotizaci&oacute;n {quote.quote_number}
                  </h1>
                  <p className="text-sm text-slate-500">
                    Para {quote.lead.full_name}
                    {quote.lead.company ? ` · ${quote.lead.company}` : ""}
                  </p>
                </div>
                <StatusBadge status={quote.status} expired={quote.expired} />
              </div>

              {quote.status === "accepted" && (
                <Banner tone="green" icon={CheckCircle2}>
                  Aceptaste esta cotizaci&oacute;n el {formatDate(quote.accepted_at!)}. Nuestro equipo
                  se pondr&aacute; en contacto contigo en breve.
                </Banner>
              )}
              {quote.status === "rejected" && (
                <Banner tone="slate" icon={XCircle}>
                  Esta cotizaci&oacute;n fue rechazada el {formatDate(quote.rejected_at!)}.
                </Banner>
              )}
              {quote.expired && quote.status !== "accepted" && quote.status !== "rejected" && (
                <Banner tone="red" icon={AlertTriangle}>
                  Esta cotizaci&oacute;n expir&oacute; el {formatDate(quote.valid_until!)}. El precio ya
                  no est&aacute; garantizado &mdash; cont&aacute;ctanos para generar una nueva.
                </Banner>
              )}
              {!quote.expired && quote.status !== "accepted" && quote.status !== "rejected" && quote.valid_until && (
                <Banner tone="amber" icon={Clock}>
                  V&aacute;lida hasta el {formatDate(quote.valid_until)} (72 horas desde su env&iacute;o).
                </Banner>
              )}

              <div className="mt-6 overflow-hidden rounded-xl border border-brand-border bg-white">
                {quote.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 border-b border-brand-border p-5 last:border-0"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
                      <ProductIcon icon="mixer" className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-brand-navy">
                            {item.product_name}
                            {item.product_model ? ` · ${item.product_model}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.capacity_value} {item.capacity_unit} &middot; {item.material}
                            {item.power ? ` · ${item.power}` : ""}
                            {item.engraving ? ` · Grabado: "${item.engraving_text}"` : ""}
                          </p>
                          <p className="text-xs text-slate-400">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="whitespace-nowrap font-bold text-brand-navy">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="space-y-1.5 bg-slate-50 p-5">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>IVA (16%)</span>
                    <span>{formatCurrency(quote.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-border pt-2 text-lg font-extrabold text-brand-navy">
                    <span>Total</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                </div>
              </div>

              {quote.status !== "accepted" && quote.status !== "rejected" && !quote.expired && (
                <QuoteActions token={token} />
              )}

              <p className="mt-8 text-center text-xs text-slate-400">
                &iquest;Dudas sobre esta cotizaci&oacute;n? Escr&iacute;benos a{" "}
                {process.env.NEXT_PUBLIC_COMPANY_EMAIL} o llama al {process.env.NEXT_PUBLIC_COMPANY_PHONE}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatusBadge({ status, expired }: { status: string; expired: boolean }) {
  if (expired && (status === "sent" || status === "viewed")) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
        Expirada
      </span>
    );
  }
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-amber-100 text-amber-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-slate-200 text-slate-600",
  };
  const labels: Record<string, string> = {
    draft: "Borrador",
    sent: "Enviada",
    viewed: "Vista",
    accepted: "Aceptada",
    rejected: "Rechazada",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[status] ?? map.sent}`}>
      {labels[status] ?? status}
    </span>
  );
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: "amber" | "red" | "green" | "slate";
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const tones = {
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-green-50 border-green-200 text-green-800",
    slate: "bg-slate-100 border-slate-200 text-slate-600",
  } as const;
  return (
    <div className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${tones[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

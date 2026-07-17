import { headers } from "next/headers";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Factory, FileCheck2, ShieldCheck, XCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductVisual } from "@/components/catalog/ProductVisual";
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
          {!quote || (quote.expired && quote.status !== "accepted" && quote.status !== "rejected") ? (
            <div className="mx-auto max-w-lg rounded-xl border border-brand-border bg-white p-10 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
              <h1 className="mt-4 text-xl font-bold text-brand-navy">{quote?.expired ? "Esta propuesta ya no está disponible" : "Cotización no encontrada"}</h1>
              <p className="mt-2 text-sm text-slate-500">
                {quote?.expired ? "El enlace dejó de mostrar la información comercial después de su periodo de vigencia. Solicita una nueva propuesta a tu asesor." : "Este enlace no es válido o la cotización aún no ha sido enviada."}
              </p>
              <Link href="/" className="mt-6 inline-block text-brand-blue hover:underline">
                Volver al inicio
              </Link>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">
              <section className="overflow-hidden rounded-2xl bg-[#07111a] text-white shadow-[0_22px_55px_rgba(7,17,26,.22)]">
                <div className="grid md:grid-cols-[1.2fr_.8fr]">
                  <div className="p-6 sm:p-9">
                    <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-mono text-[10px] tracking-[.2em] text-[#6adfff]">PROPUESTA INDUSTRIAL · TRITTÓN</p><StatusBadge status={quote.status} expired={quote.expired} /></div>
                    <h1 className="mt-6 text-3xl font-black tracking-[-.04em] sm:text-4xl">Una solución construida para tu proceso.</h1>
                    <p className="mt-4 text-sm text-slate-300">Propuesta <span className="font-mono font-bold text-white">{quote.quote_number}</span> preparada para {quote.lead.full_name}{quote.lead.company ? ` · ${quote.lead.company}` : ""}.</p>
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-5 text-xs text-slate-300"><span className="flex items-center gap-2"><Factory className="h-4 w-4 text-[#58d8ff]" />Fabricación mexicana</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#58d8ff]" />Garantía de fabricación</span></div>
                  </div>
                  <ProductVisual name={quote.items[0]?.product_name ?? "Equipo industrial"} material={quote.items[0]?.material} photo className="min-h-[230px]" />
                </div>
              </section>

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
              {!quote.expired && quote.status !== "accepted" && quote.status !== "rejected" && quote.valid_until && (
                <Banner tone="amber" icon={Clock}>
                  V&aacute;lida hasta el {formatDate(quote.valid_until)}{" "}(72 horas desde su env&iacute;o).
                </Banner>
              )}

              <section className="mt-6">
                <div className="mb-3 flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-brand-blue" /><h2 className="font-bold text-brand-navy">Alcance de la propuesta</h2></div>
                <div className="grid gap-4 md:grid-cols-2">
                {quote.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm"
                  >
                    <ProductVisual name={item.product_name} material={item.material} compact className="h-36" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-brand-navy">
                            {item.product_name}
                            {item.product_model ? ` · ${item.product_model}` : ""}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.capacity_value} {item.capacity_unit} &middot; {item.material}
                            {item.power ? ` · ${item.power}` : ""}
                            {item.engraving ? ` · Grabado: "${item.engraving_text}"` : ""}
                          </p>
                          <p className="mt-2 text-xs font-medium text-slate-400">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="whitespace-nowrap font-bold text-brand-navy">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </section>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]">
                <section className="rounded-xl border border-brand-border bg-white p-5"><p className="font-mono text-[10px] tracking-[.16em] text-brand-blue">ESPECIFICACIÓN BASE</p><h2 className="mt-1 text-lg font-bold text-brand-navy">Construida para trabajo continuo</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Spec label="Sistema de mezclado" text="Cintas helicoidales que generan un flujo continuo y una mezcla homogénea." /><Spec label="Motorización" text="Motorreductor TEFC con protección IP55, diseñado para servicio continuo." /><Spec label="Control y seguridad" text="Gabinete de control, arranque, paro y paro de emergencia según configuración." /><Spec label="Entrega y respaldo" text="10 a 12 semanas, con manual de operación y garantía contra defectos de fabricación." /></div></section>
                <section className="overflow-hidden rounded-xl border border-brand-border bg-white">
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
                <div className="border-t border-brand-border p-4 text-[11px] leading-5 text-slate-500"><p><strong>Forma de pago:</strong> 70% de anticipo y 30% al aviso de entrega.</p><p className="mt-1">Precios en MXN; no incluye instalación. IVA incluido en el total.</p></div>
                </section>
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

function Spec({ label, text }: { label: string; text: string }) {
  return <div className="rounded-lg border border-[#e1eaed] bg-[#f9fbfb] p-3"><p className="text-xs font-bold text-brand-navy">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>;
}

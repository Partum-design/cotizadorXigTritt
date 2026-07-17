import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/Badge";
import { QuoteActionsPanel } from "@/components/admin/QuoteActionsPanel";
import { QuoteCanvasEditor } from "@/components/admin/QuoteCanvasEditor";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Lead, Product, Quote, QuoteEvent, QuoteItem } from "@/lib/database.types";

const EVENT_LABELS: Record<string, string> = {
  created: "Cotización creada",
  sent: "Correo enviado al cliente",
  email_opened: "Correo abierto",
  link_clicked: "Enlace de la cotización abierto",
  viewed: "Cotización vista",
  accepted: "Cotización aceptada",
  rejected: "Cotización rechazada",
  invoiced: "Marcada como facturada",
  resent: "Correo reenviado",
  updated: "Propuesta editada",
  note: "Nota interna",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = (await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as unknown as { data: Quote | null };

  if (!quote) notFound();

  const [{ data: lead }, { data: items }, { data: events }, { data: products }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", quote.lead_id).maybeSingle() as unknown as Promise<{
      data: Lead | null;
    }>,
    supabase.from("quote_items").select("*").eq("quote_id", id).order("created_at") as unknown as Promise<{
      data: QuoteItem[] | null;
    }>,
    supabase
      .from("quote_events")
      .select("*")
      .eq("quote_id", id)
      .order("created_at", { ascending: false }) as unknown as Promise<{ data: QuoteEvent[] | null }>,
    supabase.from("products").select("*").order("sort_order") as unknown as Promise<{ data: Product[] | null }>,
  ]);

  const expired =
    !!quote.valid_until && new Date(quote.valid_until) < new Date() && ["sent", "viewed"].includes(quote.status);

  return (
    <div>
      <Link
        href="/admin/cotizaciones"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a cotizaciones
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">{quote.quote_number}</h1>
          {lead && (
            <Link href={`/admin/leads/${lead.id}`} className="text-sm text-brand-blue hover:underline">
              {lead.full_name} {lead.company ? `· ${lead.company}` : ""}
            </Link>
          )}
        </div>
        <StatusBadge status={quote.status} expired={expired} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
            {(items ?? []).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 border-b border-brand-border p-4 last:border-0">
                <div>
                  <p className="font-semibold text-brand-navy">
                    {item.product_name}
                    {item.product_model ? ` · ${item.product_model}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.capacity_value} {item.capacity_unit} &middot; {item.material}
                    {item.power ? ` · ${item.power}` : ""}
                    {item.engraving ? ` · Grabado: "${item.engraving_text}"` : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    Cantidad: {item.quantity} &middot; Costo unit.: {formatCurrency(item.unit_cost)}
                  </p>
                </div>
                <p className="whitespace-nowrap font-bold text-brand-navy">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
            <div className="space-y-1 bg-slate-50 p-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>IVA</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-brand-navy">
                <span>Total</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
              {quote.valid_until && (
                <div className="pt-1 text-xs text-slate-400">
                  V&aacute;lida hasta {formatDate(quote.valid_until)}
                </div>
              )}
            </div>
          </div>

          <QuoteCanvasEditor quoteId={quote.id} items={items ?? []} products={products ?? []} />

          <div className="rounded-xl border border-brand-border bg-white p-5">
            <h2 className="mb-4 font-semibold text-brand-navy">Historial de actividad</h2>
            <ol className="space-y-4 border-l border-brand-border pl-4">
              {(events ?? []).map((ev) => (
                <li key={ev.id} className="relative">
                  <Circle className="absolute -left-[21px] top-1 h-2.5 w-2.5 fill-brand-blue text-brand-blue" />
                  <p className="text-sm font-medium text-slate-700">{EVENT_LABELS[ev.event_type] ?? ev.event_type}</p>
                  <p className="text-xs text-slate-400">{formatDate(ev.created_at)}</p>
                </li>
              ))}
              {(events ?? []).length === 0 && <p className="text-sm text-slate-400">Sin actividad registrada.</p>}
            </ol>
          </div>
        </div>

        <QuoteActionsPanel
          quoteId={quote.id}
          publicToken={quote.public_token}
          invoiced={quote.invoiced}
          adminNotes={quote.admin_notes}
        />
      </div>
    </div>
  );
}

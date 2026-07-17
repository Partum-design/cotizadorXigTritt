import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/Badge";
import { AdminQuoteComposer } from "@/components/admin/AdminQuoteComposer";
import { CustomerProfileEditor } from "@/components/admin/CustomerProfileEditor";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Lead, Product, Quote } from "@/lib/database.types";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead } = (await supabase.from("leads").select("*").eq("id", id).maybeSingle()) as unknown as { data: Lead | null };
  if (!lead) notFound();

  const [{ data: relatedLeads }, { data: products }] = await Promise.all([
    supabase.from("leads").select("id").ilike("email", lead.email.trim()),
    supabase.from("products").select("*").eq("active", true).order("sort_order", { ascending: true }),
  ]) as unknown as [{ data: Array<{ id: string }> | null }, { data: Product[] | null }];
  const leadIds = (relatedLeads ?? [{ id }]).map((entry) => entry.id);
  const { data: quotes } = (await supabase.from("quotes").select("*").in("lead_id", leadIds).order("created_at", { ascending: false })) as unknown as { data: Quote[] | null };
  const history = quotes ?? [];
  const totalQuoted = history.reduce((sum, quote) => sum + quote.total, 0);

  return <div>
    <Link href="/admin/leads" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue"><ArrowLeft className="h-4 w-4" /> Volver a clientes</Link>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-bold tracking-[.18em] text-brand-blue">EXPEDIENTE COMERCIAL</p><h1 className="mt-1 text-2xl font-extrabold text-brand-navy">{lead.full_name}</h1><p className="mt-1 text-sm text-slate-500">Perfil creado automáticamente con la primera cotización. Desde aquí concentra sus datos y propuestas.</p></div><div className="flex gap-3"><MiniStat label="Propuestas" value={String(history.length)} icon={<FileText className="h-4 w-4" />} /><MiniStat label="Inversión propuesta" value={formatCurrency(totalQuoted, "MXN")} icon={<Clock3 className="h-4 w-4" />} /></div></div>

    <div className="mt-6 grid gap-6"><CustomerProfileEditor customer={lead} /><AdminQuoteComposer customerId={lead.id} customerName={lead.full_name} products={products ?? []} /></div>

    <section className="mt-8"><h2 className="font-semibold text-brand-navy">Historial de cotizaciones ({history.length})</h2><p className="mb-3 mt-1 text-sm text-slate-500">Se agrupan las propuestas vinculadas al correo {lead.email}, aunque el contacto se haya capturado más de una vez.</p><div className="space-y-3">{history.map((quote) => <Link key={quote.id} href={`/admin/cotizaciones/${quote.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border bg-white p-4 hover:border-brand-blue"><div><p className="font-semibold text-brand-navy">{quote.quote_number}</p><p className="text-xs text-slate-500">Creada {formatDate(quote.created_at)}</p></div><div className="flex items-center gap-3"><span className="font-bold text-slate-700">{formatCurrency(quote.total, quote.currency)}</span><StatusBadge status={quote.status} expired={!!quote.valid_until && new Date(quote.valid_until) < new Date() && ["sent", "viewed"].includes(quote.status)} />{quote.invoiced && <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">Facturada</span>}</div></Link>)}{!history.length && <p className="rounded-xl border border-dashed border-brand-border p-6 text-center text-sm text-slate-400">Aún no hay cotizaciones para este cliente.</p>}</div></section>
  </div>;
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-lg border border-brand-border bg-white px-3 py-2"><div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{icon}{label}</div><p className="mt-1 text-sm font-extrabold text-brand-navy">{value}</p></div>;
}

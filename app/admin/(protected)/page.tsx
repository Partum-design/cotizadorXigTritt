import Link from "next/link";
import { DollarSign, FileText, Flame, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/StatCard";
import { TemperatureBadge, StatusBadge } from "@/components/admin/Badge";
import { formatCurrency } from "@/lib/utils";
import type { LeadOverview } from "@/lib/database.types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: quotes } = await supabase
    .from("quotes")
    .select("status, total, invoiced");

  const { data: leads } = (await supabase
    .from("leads_overview")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8)) as unknown as { data: LeadOverview[] | null };

  const allQuotes = (quotes ?? []) as { status: string; total: number; invoiced: boolean }[];

  const sinFacturar = allQuotes
    .filter((q) => !q.invoiced && ["sent", "viewed", "accepted"].includes(q.status))
    .reduce((sum, q) => sum + Number(q.total), 0);

  const totalFacturado = allQuotes
    .filter((q) => q.invoiced)
    .reduce((sum, q) => sum + Number(q.total), 0);

  const totalCotizado = allQuotes
    .filter((q) => q.status !== "draft")
    .reduce((sum, q) => sum + Number(q.total), 0);

  const countSinFacturar = allQuotes.filter(
    (q) => !q.invoiced && ["sent", "viewed", "accepted"].includes(q.status)
  ).length;

  const aceptadas = allQuotes.filter((q) => q.status === "accepted").length;
  const enviadas = allQuotes.filter((q) => q.status !== "draft").length;
  const tasaConversion = enviadas > 0 ? Math.round((aceptadas / enviadas) * 100) : 0;

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const tempCounts = (leads ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.temperature] = (acc[l.temperature] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Resumen general del cotizador.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Cotizado sin facturar"
          value={formatCurrency(sinFacturar)}
          sub={`${countSinFacturar} cotizaciones pendientes de facturar`}
          icon={DollarSign}
          tone="amber"
        />
        <StatCard
          label="Total cotizado (histórico)"
          value={formatCurrency(totalCotizado)}
          sub={`${enviadas} cotizaciones enviadas`}
          icon={TrendingUp}
        />
        <StatCard
          label="Facturado"
          value={formatCurrency(totalFacturado)}
          sub="Cotizaciones marcadas como facturadas"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Tasa de aceptación"
          value={`${tasaConversion}%`}
          sub={`${aceptadas} de ${enviadas} cotizaciones aceptadas`}
          icon={FileText}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-brand-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-navy">Leads recientes</h2>
            <Link href="/admin/leads" className="text-sm font-semibold text-brand-blue hover:underline">
              Ver todos &rarr;
            </Link>
          </div>
          <div className="mt-4 divide-y divide-brand-border">
            {(leads ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">A&uacute;n no hay leads.</p>
            )}
            {(leads ?? []).map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{lead.full_name}</p>
                  <p className="truncate text-xs text-slate-500">{lead.company || lead.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {lead.quote_status && <StatusBadge status={lead.quote_status} expired={lead.quote_expired} />}
                  <TemperatureBadge temperature={lead.temperature} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-brand-navy">
            <Flame className="h-4 w-4 text-brand-blue" /> Temperatura de leads
          </h2>
          <div className="mt-4 space-y-3">
            {[
              { key: "caliente", label: "Calientes" },
              { key: "tibio", label: "Tibios" },
              { key: "frio", label: "Fríos" },
              { key: "nuevo", label: "Nuevos" },
            ].map((t) => (
              <div key={t.key} className="flex items-center justify-between">
                <TemperatureBadge temperature={t.key} />
                <span className="text-sm font-bold text-slate-700">{tempCounts[t.key] ?? 0}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-brand-border pt-4 text-sm text-slate-500">
            <Users className="h-4 w-4" /> {totalLeads ?? 0} leads totales
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TemperatureBadge, StatusBadge } from "@/components/admin/Badge";
import { formatCurrency, formatRelative } from "@/lib/utils";
import type { LeadOverview } from "@/lib/database.types";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ temp?: string }>;
}) {
  const { temp } = await searchParams;
  const supabase = await createClient();

  const { data: leads } = (await supabase
    .from("leads_overview")
    .select("*")
    .order("created_at", { ascending: false })) as unknown as { data: LeadOverview[] | null };

  const filtered = temp ? (leads ?? []).filter((l) => l.temperature === temp) : leads ?? [];

  const counts = (leads ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.temperature] = (acc[l.temperature] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-navy">Clientes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Perfiles creados automáticamente al generar una cotización, con su historial comercial.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterChip href="/admin/leads" active={!temp} label={`Todos (${leads?.length ?? 0})`} />
        {["caliente", "tibio", "frio", "nuevo"].map((t) => (
          <FilterChip key={t} href={`/admin/leads?temp=${t}`} active={temp === t} label={`${t} (${counts[t] ?? 0})`} />
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Cotizaci&oacute;n</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Temperatura</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">&Uacute;ltima actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No hay clientes en esta categor&iacute;a.
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-brand-navy hover:underline">
                    {lead.full_name}
                  </Link>
                  <div className="text-xs text-slate-500">{lead.company || "—"}</div>
                  <div className="text-xs text-slate-400">{lead.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{lead.quote_number ?? "—"}</td>
                <td className="px-4 py-3">
                  {lead.quote_status ? (
                    <StatusBadge status={lead.quote_status} expired={lead.quote_expired} />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <TemperatureBadge temperature={lead.temperature} />
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">
                  {lead.total ? formatCurrency(lead.total, lead.currency ?? "MXN") : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {lead.last_viewed_at
                    ? `Vista ${formatRelative(lead.last_viewed_at)}`
                    : lead.sent_at
                    ? `Enviada ${formatRelative(lead.sent_at)}`
                    : formatRelative(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}

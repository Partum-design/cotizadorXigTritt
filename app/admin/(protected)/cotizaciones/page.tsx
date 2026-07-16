import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface QuoteRow {
  id: string;
  quote_number: string;
  status: string;
  total: number;
  currency: string;
  invoiced: boolean;
  valid_until: string | null;
  created_at: string;
  leads: { full_name: string; company: string | null } | null;
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; facturado?: string }>;
}) {
  const { estado, facturado } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("quotes")
    .select("id, quote_number, status, total, currency, invoiced, valid_until, created_at, leads(full_name, company)")
    .order("created_at", { ascending: false });

  if (estado) query = query.eq("status", estado);
  if (facturado === "no") query = query.eq("invoiced", false);
  if (facturado === "si") query = query.eq("invoiced", true);

  const { data: quotes } = (await query) as unknown as { data: QuoteRow[] | null };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-navy">Cotizaciones</h1>
      <p className="mt-1 text-sm text-slate-500">Todas las cotizaciones generadas por el cotizador.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip href="/admin/cotizaciones" active={!estado && !facturado} label="Todas" />
        <Chip href="/admin/cotizaciones?estado=sent" active={estado === "sent"} label="Enviadas" />
        <Chip href="/admin/cotizaciones?estado=viewed" active={estado === "viewed"} label="Vistas" />
        <Chip href="/admin/cotizaciones?estado=accepted" active={estado === "accepted"} label="Aceptadas" />
        <Chip href="/admin/cotizaciones?estado=rejected" active={estado === "rejected"} label="Rechazadas" />
        <Chip href="/admin/cotizaciones?facturado=no" active={facturado === "no"} label="Sin facturar" />
        <Chip href="/admin/cotizaciones?facturado=si" active={facturado === "si"} label="Facturadas" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Facturada</th>
              <th className="px-4 py-3">Creada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {(quotes ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No hay cotizaciones.
                </td>
              </tr>
            )}
            {(quotes ?? []).map((q) => {
              const expired =
                !!q.valid_until && new Date(q.valid_until) < new Date() && ["sent", "viewed"].includes(q.status);
              return (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/cotizaciones/${q.id}`} className="font-semibold text-brand-navy hover:underline">
                      {q.quote_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700">{q.leads?.full_name}</div>
                    <div className="text-xs text-slate-400">{q.leads?.company}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={q.status} expired={expired} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(q.total, q.currency)}</td>
                  <td className="px-4 py-3">
                    {q.invoiced ? (
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                        S&iacute;
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(q.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
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

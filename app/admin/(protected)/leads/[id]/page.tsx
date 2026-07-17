import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Lead, Quote } from "@/lib/database.types";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead } = (await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as unknown as { data: Lead | null };

  if (!lead) notFound();

  // A client may have been captured more than once; consolidate their history by email.
  const { data: relatedLeads } = (await supabase
    .from("leads")
    .select("id")
    .ilike("email", lead.email.trim())) as unknown as { data: Array<{ id: string }> | null };
  const leadIds = (relatedLeads ?? [{ id }]).map((entry) => entry.id);
  const { data: quotes } = (await supabase
    .from("quotes")
    .select("*")
    .in("lead_id", leadIds)
    .order("created_at", { ascending: false })) as unknown as { data: Quote[] | null };

  return (
    <div>
      <Link href="/admin/leads" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue">
        <ArrowLeft className="h-4 w-4" /> Volver a leads
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">{lead.full_name}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
            {lead.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {lead.company}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> {lead.email}
            </span>
            {lead.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {lead.phone}
              </span>
            )}
          </div>
          {lead.notes && <p className="mt-2 max-w-xl text-sm text-slate-600">&ldquo;{lead.notes}&rdquo;</p>}
        </div>
        <span className="text-xs text-slate-400">Lead desde {formatDate(lead.created_at)}</span>
      </div>

      <h2 className="mt-8 mb-3 font-semibold text-brand-navy">
        Historial de cotizaciones ({quotes?.length ?? 0})
      </h2>
      <p className="mb-3 text-sm text-slate-500">Se agrupan todas las propuestas vinculadas al correo {lead.email}, aunque el contacto se haya capturado más de una vez.</p>
      <div className="space-y-3">
        {(quotes ?? []).map((q) => (
          <Link
            key={q.id}
            href={`/admin/cotizaciones/${q.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border bg-white p-4 hover:border-brand-blue"
          >
            <div>
              <p className="font-semibold text-brand-navy">{q.quote_number}</p>
              <p className="text-xs text-slate-500">Creada {formatDate(q.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">{formatCurrency(q.total, q.currency)}</span>
              <StatusBadge
                status={q.status}
                expired={!!q.valid_until && new Date(q.valid_until) < new Date() && ["sent", "viewed"].includes(q.status)}
              />
              {q.invoiced && (
                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                  Facturada
                </span>
              )}
            </div>
          </Link>
        ))}
        {(quotes ?? []).length === 0 && <p className="text-sm text-slate-400">Sin cotizaciones.</p>}
      </div>
    </div>
  );
}

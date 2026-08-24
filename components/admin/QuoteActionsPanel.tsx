"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Copy, FileText, Loader2, Mail, Receipt, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function QuoteActionsPanel({
  quoteId,
  publicToken,
  invoiced,
  adminNotes,
}: {
  quoteId: string;
  publicToken: string;
  invoiced: boolean;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const toggleInvoiced = async () => {
    setBusy("invoiced");
    const supabase = createClient();
    await supabase
      .from("quotes")
      .update({ invoiced: !invoiced, invoiced_at: !invoiced ? new Date().toISOString() : null })
      .eq("id", quoteId);
    setBusy(null);
    router.refresh();
  };

  const resend = async () => {
    setBusy("resend");
    setEmailStatus(null);
    const res = await fetch(`/api/admin/quotes/${quoteId}/resend`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    setEmailStatus(data.sent ? "Correo reenviado." : "No se pudo enviar (configura RESEND_API_KEY).");
    router.refresh();
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/cotizacion/${publicToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveNotes = async () => {
    setBusy("notes");
    const supabase = createClient();
    await supabase.from("quotes").update({ admin_notes: notes }).eq("id", quoteId);
    setBusy(null);
    router.refresh();
  };

  const removeQuote = async () => {
    const confirmed = window.confirm(
      "¿Eliminar esta cotización y su micrositio público? Las partidas y el historial se borrarán; el lead se conservará."
    );
    if (!confirmed) return;
    setBusy("delete");
    setEmailStatus(null);
    const response = await fetch(`/api/admin/quotes/${quoteId}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok || !data.ok) {
      setEmailStatus("No se pudo eliminar la cotización. Inténtalo de nuevo.");
      return;
    }
    router.push("/admin/cotizaciones");
    router.refresh();
  };

  return (
    <div className="space-y-4 rounded-xl border border-brand-border bg-white p-5">
      <h2 className="font-semibold text-brand-navy">Acciones</h2>

      <a
        href={`/api/admin/quotes/${quoteId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy"
      >
        <FileText className="h-4 w-4" /> Ver PDF
      </a>

      <button
        onClick={toggleInvoiced}
        disabled={busy !== null}
        className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${
          invoiced ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-brand-navy text-white hover:bg-brand-navy-dark"
        }`}
      >
        {busy === "invoiced" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
        {invoiced ? "Marcar como no facturada" : "Marcar como facturada"}
      </button>

      <button
        onClick={resend}
        disabled={busy !== null}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-brand-border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {busy === "resend" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Reenviar correo
      </button>
      {emailStatus && <p className="text-xs text-slate-500">{emailStatus}</p>}

      <button
        onClick={copyLink}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-brand-border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "Enlace copiado" : "Copiar enlace público"}
      </button>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notas internas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
        />
        <button
          onClick={saveNotes}
          disabled={busy !== null}
          className="mt-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-60"
        >
          Guardar nota
        </button>
      </div>

      <div className="border-t border-red-100 pt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-red-700"><AlertTriangle className="h-3.5 w-3.5" />Zona de eliminación</p>
        <button
          onClick={removeQuote}
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Eliminar cotización y micrositio
        </button>
        <p className="mt-2 text-[11px] leading-4 text-slate-400">Se conservan los datos del lead; se eliminan la propuesta, sus partidas y su enlace público.</p>
      </div>
    </div>
  );
}

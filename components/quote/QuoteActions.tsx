"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function QuoteActions({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setLoading("accept");
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("accept_quote", { p_token: token });
    setLoading(null);
    const result = data as { ok: boolean; reason?: string } | null;
    if (rpcError || !result?.ok) {
      setError(
        result?.reason === "expired"
          ? "Esta cotización ya expiró."
          : "No pudimos procesar la aceptación. Intenta de nuevo."
      );
      return;
    }
    router.refresh();
  };

  const reject = async () => {
    setLoading("reject");
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("reject_quote", {
      p_token: token,
      p_reason: reason || null,
    });
    setLoading(null);
    const result = data as { ok: boolean; reason?: string } | null;
    if (rpcError || !result?.ok) {
      setError("No pudimos procesar tu respuesta. Intenta de nuevo.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="mt-6 rounded-xl border border-brand-border bg-white p-5">
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {!rejecting ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={accept}
            disabled={loading !== null}
            className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Aceptar cotizaci&oacute;n
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={loading !== null}
            className="flex items-center gap-2 rounded-md border border-brand-border px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            <X className="h-4 w-4" /> Rechazar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            &iquest;Nos cuentas por qu&eacute; (opcional)?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={reject}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-md bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading === "reject" && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar rechazo
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="rounded-md px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

const TEMPERATURE_STYLES: Record<string, string> = {
  caliente: "bg-red-100 text-red-700",
  tibio: "bg-amber-100 text-amber-700",
  frio: "bg-blue-100 text-blue-700",
  nuevo: "bg-slate-100 text-slate-600",
};

const TEMPERATURE_LABELS: Record<string, string> = {
  caliente: "🔥 Caliente",
  tibio: "🌤️ Tibio",
  frio: "❄️ Frío",
  nuevo: "🆕 Nuevo",
};

export function TemperatureBadge({ temperature }: { temperature: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        TEMPERATURE_STYLES[temperature] ?? TEMPERATURE_STYLES.nuevo
      )}
    >
      {TEMPERATURE_LABELS[temperature] ?? temperature}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-slate-200 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  viewed: "Vista",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

export function StatusBadge({ status, expired }: { status: string; expired?: boolean }) {
  if (expired && (status === "sent" || status === "viewed")) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        Expirada
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        STATUS_STYLES[status] ?? STATUS_STYLES.draft
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

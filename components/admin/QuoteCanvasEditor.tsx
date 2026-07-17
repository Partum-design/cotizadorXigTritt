"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product, QuoteItem } from "@/lib/database.types";

type DraftItem = {
  key: string;
  productId: string;
  capacity: number;
  material: string;
  power: string;
  quantity: number;
  unitPrice: number;
};

function fromItem(item: QuoteItem): DraftItem {
  return { key: item.id, productId: item.product_id ?? "", capacity: item.capacity_value ?? 0, material: item.material ?? "", power: item.power ?? "", quantity: item.quantity, unitPrice: item.unit_price };
}

export function QuoteCanvasEditor({ quoteId, items, products }: { quoteId: string; items: QuoteItem[]; products: Product[] }) {
  const [draft, setDraft] = useState<DraftItem[]>(items.filter((item) => item.product_id).map(fromItem));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const totals = useMemo(() => {
    const subtotal = draft.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return { subtotal, tax: Math.round(subtotal * .16 * 100) / 100, total: subtotal * 1.16 };
  }, [draft]);

  const change = (key: string, patch: Partial<DraftItem>) => setDraft((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item));
  const chooseProduct = (key: string, productId: string) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;
    change(key, { productId, capacity: product.capacity_min, material: product.material_options[0] ?? "", power: product.power_options[0] ?? "", unitPrice: product.base_price });
  };
  const add = () => {
    const product = products[0];
    if (!product) return;
    setDraft((current) => [...current, { key: crypto.randomUUID(), productId: product.id, capacity: product.capacity_min, material: product.material_options[0] ?? "", power: product.power_options[0] ?? "", quantity: 1, unitPrice: product.base_price }]);
  };
  const save = async () => {
    if (!draft.length) { setNotice("Incluye al menos una partida en la propuesta."); return; }
    setSaving(true); setNotice(null);
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: draft.map(({ productId, capacity, material, power, quantity, unitPrice }) => ({ productId, capacityValue: capacity, material, power, quantity, unitPrice })) }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "save_failed");
      setNotice("Propuesta actualizada. Ya puedes reenviarla al cliente.");
    } catch { setNotice("No se pudieron guardar los cambios. Inténtalo de nuevo."); }
    setSaving(false);
  };

  return <section className="overflow-hidden rounded-xl border border-brand-border bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border bg-slate-50 px-5 py-4"><div><p className="font-mono text-[10px] tracking-[.16em] text-brand-blue">CANVAS DE PROPUESTA</p><h2 className="mt-1 font-semibold text-brand-navy">Edita la configuración comercial</h2></div><button type="button" onClick={add} className="flex items-center gap-1.5 rounded-md border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-blue-light"><Plus className="h-3.5 w-3.5" />Agregar equipo</button></div>
    <div className="space-y-4 p-4 sm:p-5">
      {draft.map((item, index) => {
        const product = products.find((entry) => entry.id === item.productId);
        return <div key={item.key} className="rounded-lg border border-brand-border p-4"><div className="mb-3 flex items-center justify-between"><p className="font-mono text-[10px] tracking-wider text-brand-blue">PARTIDA {String(index + 1).padStart(2, "0")}</p><button type="button" onClick={() => setDraft((current) => current.filter((entry) => entry.key !== item.key))} className="text-slate-400 hover:text-red-500" aria-label="Eliminar partida"><Trash2 className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Field label="Equipo"><select value={item.productId} onChange={(event) => chooseProduct(item.key, event.target.value)}>{products.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}{entry.model_code ? ` · ${entry.model_code}` : ""}</option>)}</select></Field><Field label={`Capacidad (${product?.capacity_unit ?? ""})`}><input type="number" min={product?.capacity_min ?? 0} max={product?.capacity_max} step={product?.capacity_step ?? 1} value={item.capacity} onChange={(event) => change(item.key, { capacity: Number(event.target.value) || 0 })} /></Field><Field label="Cantidad"><input type="number" min={1} value={item.quantity} onChange={(event) => change(item.key, { quantity: Math.max(1, Number(event.target.value) || 1) })} /></Field><Field label="Acabado"><select value={item.material} onChange={(event) => change(item.key, { material: event.target.value })}>{(product?.material_options ?? [item.material]).map((option) => <option key={option}>{option}</option>)}</select></Field><Field label="Motor"><select value={item.power} onChange={(event) => change(item.key, { power: event.target.value })}>{(product?.power_options.length ? product.power_options : [item.power || "No aplica"]).map((option) => <option key={option}>{option}</option>)}</select></Field><Field label="Precio unitario MXN"><input type="number" min={0} value={item.unitPrice} onChange={(event) => change(item.key, { unitPrice: Math.max(0, Number(event.target.value) || 0) })} /></Field></div><p className="mt-3 text-right text-sm font-bold text-brand-navy">Importe: {formatCurrency(item.unitPrice * item.quantity)}</p></div>;
      })}
      {!draft.length && <p className="rounded-lg border border-dashed border-brand-border p-5 text-center text-sm text-slate-500">Agrega un equipo para comenzar la propuesta.</p>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-border bg-slate-50 p-5"><div className="text-sm text-slate-500">Subtotal <span className="ml-2 font-bold text-brand-navy">{formatCurrency(totals.subtotal)}</span> <span className="mx-2 text-slate-300">·</span>Total <span className="ml-2 font-bold text-brand-navy">{formatCurrency(totals.total)}</span></div><button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-dark disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar edición</button></div>
    {notice && <p className={`mx-5 mb-5 rounded-md px-3 py-2 text-xs ${notice.startsWith("Propuesta") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{notice}</p>}
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-semibold text-slate-500">{label}<span className="mt-1.5 block [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-brand-border [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:font-normal [&_input]:text-slate-700 [&_select]:w-full [&_select]:rounded-md [&_select]:border [&_select]:border-brand-border [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_select]:font-normal [&_select]:text-slate-700">{children}</span></label>; }

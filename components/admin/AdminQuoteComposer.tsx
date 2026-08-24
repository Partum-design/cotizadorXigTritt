"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardPlus, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import type { Product } from "@/lib/database.types";
import { computeTotals, estimateUnitPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

type DraftItem = {
  key: string;
  productId: string;
  capacityValue: number;
  material: string;
  power: string;
  quantity: number;
  unitPrice: number;
};

export function AdminQuoteComposer({ customerId, customerName, products }: { customerId: string; customerName: string; products: Product[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const selected = products.find((product) => product.id === selectedId) ?? products[0];
  const [capacity, setCapacity] = useState(selected?.capacity_min ?? 0);
  const [material, setMaterial] = useState(selected?.material_options[0] ?? "Estándar");
  const [power, setPower] = useState(selected?.power_options[0] ?? "Por definir");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectProduct = (product: Product) => {
    setSelectedId(product.id);
    setCapacity(product.capacity_min);
    setMaterial(product.material_options[0] ?? "Estándar");
    setPower(product.power_options[0] ?? "Por definir");
  };
  const estimatedUnit = selected ? estimateUnitPrice(selected, capacity, false) : 0;
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);
  const totals = computeTotals(subtotal);

  const addItem = () => {
    if (!selected) return;
    setItems((current) => [...current, { key: crypto.randomUUID(), productId: selected.id, capacityValue: capacity, material, power, quantity, unitPrice: estimatedUnit }]);
    setError(null);
  };
  const createQuote = async () => {
    if (!items.length) { setError("Agrega al menos un equipo antes de crear el borrador."); return; }
    setCreating(true); setError(null);
    const response = await fetch(`/api/admin/customers/${customerId}/quotes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId, capacityValue: item.capacityValue, material: item.material, power: item.power, quantity: item.quantity, unitPrice: item.unitPrice })) }) });
    const result = await response.json().catch(() => null);
    setCreating(false);
    if (!response.ok || !result?.quoteId) {
      setError(
        result?.error === "quote_limit_reached"
          ? "Esta cuenta alcanzó su límite de cotizaciones permitidas. Contacta a un administrador para ampliarlo."
          : "No se pudo crear el borrador. Intenta nuevamente."
      );
      return;
    }
    router.push(`/admin/cotizaciones/${result.quoteId}`); router.refresh();
  };

  if (!products.length) return <section className="rounded-xl border border-dashed border-brand-border bg-slate-50 p-6 text-sm text-slate-500">Activa un producto en el catálogo para poder crear una cotización visual.</section>;

  return <section className="overflow-hidden rounded-xl border border-brand-border bg-white">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border bg-brand-navy px-5 py-5 text-white">
      <div><p className="font-mono text-[10px] tracking-[.16em] text-cyan-200">COTIZADOR VISUAL</p><h2 className="mt-1 text-lg font-bold">Nueva propuesta para {customerName}</h2><p className="mt-1 text-sm text-white/65">Arma la selección; después personaliza el micrositio y envíalo desde el editor.</p></div>
      <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold">{items.length} equipos seleccionados</span>
    </div>
    <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => { const active = selected?.id === product.id; return <button key={product.id} type="button" onClick={() => selectProduct(product)} className={`group overflow-hidden rounded-lg border text-left transition ${active ? "border-brand-blue ring-2 ring-brand-blue/15" : "border-brand-border hover:border-brand-blue/60"}`}><div className="h-28 overflow-hidden bg-slate-100"><ProductVisual name={product.name} icon={product.icon} material={product.material_options[0]} capacity={product.capacity_min} photo className="h-full w-full transition duration-300 group-hover:scale-105" /></div><div className="p-3"><p className="text-xs font-bold text-brand-navy">{product.name}</p><p className="mt-1 text-[11px] text-slate-500">{product.model_code ?? product.slug}</p></div></button>; })}
        </div>
        {selected && <div className="rounded-lg border border-brand-border bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3"><div><p className="font-semibold text-brand-navy">Configura {selected.name}</p><p className="text-xs text-slate-500">El precio se recalcula con la capacidad seleccionada.</p></div><span className="text-sm font-bold text-brand-blue">{formatCurrency(estimatedUnit, "MXN")} c/u</span></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-semibold text-slate-500">Capacidad: <span className="text-brand-navy">{capacity.toLocaleString("es-MX")} {selected.capacity_unit}</span><input className="mt-2 w-full accent-brand-blue" type="range" min={selected.capacity_min} max={selected.capacity_max} step={selected.capacity_step || 1} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} /></label>
            <Quantity value={quantity} onChange={setQuantity} />
            <Choice label="Material" value={material} options={selected.material_options.length ? selected.material_options : ["Estándar"]} onChange={setMaterial} />
            <Choice label="Motorización" value={power} options={selected.power_options.length ? selected.power_options : ["Por definir"]} onChange={setPower} />
          </div>
          <button type="button" onClick={addItem} className="mt-5 flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-navy"><Plus className="h-4 w-4" />Agregar a esta propuesta</button>
        </div>}
      </div>
      <aside className="flex flex-col rounded-lg border border-brand-border bg-slate-50 p-4">
        <div className="flex items-center gap-2"><ClipboardPlus className="h-4 w-4 text-brand-blue" /><h3 className="font-semibold text-brand-navy">Resumen de la propuesta</h3></div>
        <div className="mt-4 flex-1 space-y-3">{items.map((item) => { const product = products.find((entry) => entry.id === item.productId); return <div key={item.key} className="rounded-md border border-brand-border bg-white p-3"><div className="flex justify-between gap-2"><div><p className="text-sm font-bold text-brand-navy">{product?.name}</p><p className="mt-1 text-xs text-slate-500">{item.capacityValue} {product?.capacity_unit} · {item.material}</p><p className="text-xs text-slate-500">{item.power} · {item.quantity} unidad{item.quantity === 1 ? "" : "es"}</p></div><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.key !== item.key))} className="h-7 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Quitar equipo"><Trash2 className="h-4 w-4" /></button></div><p className="mt-2 text-right text-sm font-bold text-brand-navy">{formatCurrency(item.unitPrice * item.quantity, "MXN")}</p></div>; })}{!items.length && <p className="rounded-md border border-dashed border-brand-border p-4 text-center text-xs text-slate-400">Tu selección aparecerá aquí.</p>}</div>
        <div className="mt-4 space-y-1 border-t border-brand-border pt-4 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(subtotal, "MXN")}</span></div><div className="flex justify-between text-slate-500"><span>IVA</span><span>{formatCurrency(totals.tax, "MXN")}</span></div><div className="flex justify-between pt-2 text-base font-extrabold text-brand-navy"><span>Inversión estimada</span><span>{formatCurrency(totals.total, "MXN")}</span></div></div>
        {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-600">{error}</p>}
        <button type="button" onClick={createQuote} disabled={creating || !items.length} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-brand-navy px-4 py-3 text-sm font-bold text-white hover:bg-brand-navy-dark disabled:opacity-50">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Crear borrador y abrir editor</button>
      </aside>
    </div>
  </section>;
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div><p className="mb-2 text-xs font-semibold text-slate-500">{label}</p><div className="flex flex-wrap gap-2">{options.map((option) => <button type="button" key={option} onClick={() => onChange(option)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${value === option ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-slate-600 hover:border-brand-blue"}`}>{option}</button>)}</div></div>;
}
function Quantity({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div><p className="mb-2 text-xs font-semibold text-slate-500">Cantidad</p><div className="inline-flex items-center rounded-md border border-brand-border bg-white"><button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="p-2 text-slate-500 hover:text-brand-blue"><Minus className="h-3.5 w-3.5" /></button><span className="min-w-8 text-center text-sm font-bold text-brand-navy">{value}</span><button type="button" onClick={() => onChange(Math.min(999, value + 1))} className="p-2 text-slate-500 hover:text-brand-blue"><Plus className="h-3.5 w-3.5" /></button></div></div>;
}

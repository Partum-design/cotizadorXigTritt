"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, ClipboardCheck, Factory, Loader2, Minus, Plus, ShieldCheck, Trash2, Zap } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { useCart } from "@/lib/cart-context";
import { computeTotals, estimateUnitPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/database.types";

const technicalNotes = [
  ["Construcción", "Artesa y componentes de contacto en AISI 304 / 316 según la selección."],
  ["Mezclado", "Sistema de cintas helicoidales para flujo continuo y mezcla homogénea."],
  ["Control", "Motorreductor TEFC, gabinete de control y paro de emergencia."],
  ["Entrega", "10–12 semanas después del anticipo. Garantía de fabricación por un año."],
];

export function QuoteStudio({ products }: { products: Product[] }) {
  const { items, addItem, removeItem, updateItem, clear, subtotal } = useCart();
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const selected = products.find((product) => product.id === selectedId) ?? products[0];
  const [capacity, setCapacity] = useState(selected?.capacity_min ?? 0);
  const [material, setMaterial] = useState(selected?.material_options[0] ?? "");
  const [power, setPower] = useState(selected?.power_options[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [engraving, setEngraving] = useState(false);
  const [engravingText, setEngravingText] = useState("");
  const [added, setAdded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", company: "", email: "", phone: "", notes: "" });

  const selectProduct = (product: Product) => {
    setSelectedId(product.id);
    setCapacity(product.capacity_min);
    setMaterial(product.material_options[0] ?? "");
    setPower(product.power_options[0] ?? "");
    setQuantity(1);
    setEngraving(false);
    setEngravingText("");
  };

  const unitPrice = useMemo(
    () => (selected ? estimateUnitPrice(selected, capacity, engraving) : 0),
    [selected, capacity, engraving]
  );
  const totals = computeTotals(subtotal);

  const addConfiguredItem = () => {
    if (!selected) return;
    addItem({
      key: `${selected.id}|${capacity}|${material}|${power}|${engraving}|${engravingText}`,
      productId: selected.id,
      slug: selected.slug,
      name: selected.name,
      modelCode: selected.model_code,
      categoryName: null,
      icon: selected.icon,
      capacityValue: capacity,
      capacityUnit: selected.capacity_unit,
      capacityMin: selected.capacity_min,
      capacityMax: selected.capacity_max,
      capacityStep: selected.capacity_step,
      material,
      power,
      engraving,
      engravingText: engraving ? engravingText : "",
      quantity,
      unitPrice,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!items.length) {
      setError("Agrega al menos un equipo a la propuesta.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/quotes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: form,
          items: items.map((item) => ({
            productId: item.productId,
            capacityValue: item.capacityValue,
            material: item.material,
            power: item.power,
            engraving: item.engraving,
            engravingText: item.engravingText,
            quantity: item.quantity,
          })),
        }),
      });
      if (!response.ok) throw new Error("quote_failed");
      const data = await response.json();
      clear();
      window.location.assign(`/gracias?cotizacion=${data.quoteNumber}&token=${data.token}`);
    } catch {
      setError("No pudimos generar tu cotización. Revisa tus datos e inténtalo de nuevo.");
      setSubmitting(false);
    }
  };

  if (!selected) {
    return <div className="container-page py-24 text-center text-slate-600">El catálogo aún no tiene equipos activos.</div>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#eef3f5]">
        <section className="border-b border-white/10 bg-[#07111a] text-white">
          <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-[#5ed1ff]">ESTUDIO DE COTIZACIÓN · TRITTÓN</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">Diseña el equipo que tu proceso necesita.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">Configura materiales, capacidad y motorización. Recibirás un micro sitio de propuesta listo para compartir, válido durante 72 horas.</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[.04] px-3 py-3 text-center">
              <Metric value="01" label="Equipo" />
              <Metric value="02" label="Configura" />
              <Metric value="03" label="Envía" />
            </div>
          </div>
        </section>

        <div className="container-page py-8">
          <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold text-slate-500">
            <span className="whitespace-nowrap text-brand-navy">Selecciona tu equipo</span><ChevronRight className="h-3.5 w-3.5" /><span className="whitespace-nowrap">Define la configuración</span><ChevronRight className="h-3.5 w-3.5" /><span className="whitespace-nowrap">Genera la propuesta</span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#d4e0e5] bg-white p-4 shadow-[0_12px_30px_rgba(24,52,67,.07)] sm:p-6">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div><p className="font-mono text-[10px] tracking-[0.16em] text-brand-blue">01 / CATÁLOGO</p><h2 className="mt-1 text-xl font-extrabold text-brand-navy">Elige una plataforma</h2></div>
                  <Link href="/productos" className="hidden text-sm font-semibold text-brand-blue hover:underline sm:block">Ver catálogo completo</Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => {
                    const active = product.id === selected.id;
                    return (
                      <button key={product.id} onClick={() => selectProduct(product)} className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${active ? "border-[#34bff0] bg-[#eaf8fd] shadow-[0_0_0_3px_rgba(52,191,240,.13)]" : "border-[#dbe6ea] bg-white hover:-translate-y-0.5 hover:border-[#9dc7d8]"}`}>
                        <ProductVisual name={product.name} icon={product.icon} compact className="h-24 rounded-lg" />
                        <div className="mt-3 flex items-start justify-between gap-2"><div><p className="font-bold text-brand-navy">{product.name}</p><p className="mt-0.5 text-xs text-slate-500">{product.model_code ?? "Configuración a medida"}</p></div>{active && <Check className="h-4 w-4 text-[#069ed2]" />}</div>
                        <p className="mt-2 text-xs text-slate-500">{product.capacity_min}–{product.capacity_max} {product.capacity_unit}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-[#d4e0e5] bg-white shadow-[0_12px_30px_rgba(24,52,67,.07)]">
                <div className="grid lg:grid-cols-[.95fr_1.05fr]">
                  <ProductVisual name={selected.name} icon={selected.icon} material={material} capacity={capacity} photo className="min-h-[280px] lg:min-h-full" />
                  <div className="p-5 sm:p-7">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-brand-blue">02 / CONFIGURADOR</p>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black tracking-tight text-brand-navy">{selected.name}</h2><p className="text-sm font-semibold text-slate-500">{selected.model_code ?? "Modelo personalizable"}</p></div><span className="rounded-full bg-[#07111a] px-3 py-1 font-mono text-[10px] tracking-wider text-[#9ce5ff]">INGENIERÍA A MEDIDA</span></div>

                    <div className="mt-6 space-y-6">
                      <div>
                        <div className="flex justify-between text-sm font-bold text-slate-700"><span>Capacidad útil</span><output className="font-mono text-brand-blue">{capacity} {selected.capacity_unit}</output></div>
                        <input type="range" min={selected.capacity_min} max={selected.capacity_max} step={selected.capacity_step} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} className="studio-range mt-3 w-full" />
                        <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400"><span>{selected.capacity_min} {selected.capacity_unit}</span><span>{selected.capacity_max} {selected.capacity_unit}</span></div>
                      </div>
                      <ChoiceSet label="Acabado y contacto con producto" values={selected.material_options} value={material} onChange={setMaterial} />
                      {selected.power_options.length > 0 && <ChoiceSet label="Motorreductor" values={selected.power_options} value={power} onChange={setPower} icon={<Zap className="h-3.5 w-3.5" />} />}
                      {selected.allows_engraving && <div className="rounded-xl border border-dashed border-[#bcd4de] bg-[#f8fbfc] p-3"><label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-brand-navy"><input type="checkbox" checked={engraving} onChange={(event) => setEngraving(event.target.checked)} className="h-4 w-4 accent-brand-blue" />Placa de identificación personalizada <span className="ml-auto text-xs font-normal text-slate-500">+{formatCurrency(selected.engraving_price)}</span></label>{engraving && <input value={engravingText} onChange={(event) => setEngravingText(event.target.value)} maxLength={80} placeholder="Empresa o identificación" className="mt-3 w-full rounded-lg border border-[#cbdbe1] bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue" />}</div>}
                    </div>
                  </div>
                </div>
                <div className="grid border-t border-[#dbe6ea] bg-[#f7fafb] sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="grid grid-cols-2 divide-x divide-[#dbe6ea] sm:grid-cols-4">{technicalNotes.map(([label, text]) => <div key={label} className="p-4"><p className="font-mono text-[9px] tracking-[.14em] text-brand-blue">{label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div>)}</div>
                  <div className="border-t border-[#dbe6ea] p-4 sm:border-l sm:border-t-0"><p className="text-xs text-slate-500">Inversión estimada</p><p className="mt-1 text-2xl font-black tracking-tight text-brand-navy">{formatCurrency(unitPrice)}</p><p className="mt-1 text-[10px] text-slate-400">por unidad, antes de IVA</p></div>
                </div>
                <div className="flex flex-col gap-3 border-t border-[#dbe6ea] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><label className="flex items-center gap-3 text-sm font-semibold text-slate-700">Unidades <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-7 w-7 place-items-center rounded-full border border-[#c9d8de] bg-white"><Minus className="h-3 w-3" /></button><span className="w-5 text-center font-mono">{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-[#c9d8de] bg-white"><Plus className="h-3 w-3" /></button></label><button onClick={addConfiguredItem} className="flex items-center justify-center gap-2 rounded-lg bg-[#07111a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123144]">{added ? <><Check className="h-4 w-4 text-[#57d6ff]" />Configuración agregada</> : <><ClipboardCheck className="h-4 w-4 text-[#57d6ff]" />Agregar a mi propuesta</>}</button></div>
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-[#254658] bg-[#07111a] text-white shadow-[0_18px_45px_rgba(7,17,26,.22)] xl:sticky xl:top-24">
              <div className="border-b border-white/10 p-5"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] tracking-[.16em] text-[#5ed1ff]">03 / PROPUESTA</p><h2 className="mt-1 text-xl font-extrabold">Tu selección</h2></div><span className="grid h-9 min-w-9 place-items-center rounded-full bg-[#153142] text-sm font-bold text-[#7addff]">{items.length}</span></div></div>
              <div className="max-h-[330px] space-y-3 overflow-y-auto p-4">{items.length === 0 ? <div className="rounded-xl border border-dashed border-white/15 p-5 text-center"><Factory className="mx-auto h-7 w-7 text-[#5ed1ff]" /><p className="mt-3 text-sm font-semibold">Aún no hay equipos.</p><p className="mt-1 text-xs leading-5 text-slate-400">Configura el primer equipo para ver la propuesta aquí.</p></div> : items.map((item) => <div key={item.key} className="rounded-xl border border-white/10 bg-white/[.04] p-3"><div className="flex gap-2"><ProductVisual name={item.name} icon={item.icon} material={item.material} compact className="h-12 w-16 shrink-0 rounded-md" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-bold">{item.name}</p><button onClick={() => removeItem(item.key)} className="text-slate-400 hover:text-red-300" aria-label="Eliminar equipo"><Trash2 className="h-3.5 w-3.5" /></button></div><p className="mt-1 text-[11px] text-slate-400">{item.capacityValue} {item.capacityUnit} · {item.material}</p><div className="mt-2 flex items-center justify-between"><input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(item.key, { quantity: Math.max(1, Number(event.target.value) || 1) })} className="w-11 rounded bg-white/10 px-1.5 py-1 text-center text-xs outline-none" /><p className="text-sm font-bold">{formatCurrency(item.unitPrice * item.quantity)}</p></div></div></div></div>)}</div>
              <div className="border-y border-white/10 bg-black/15 p-5"><TotalRow label="Subtotal" value={formatCurrency(subtotal)} /><TotalRow label="IVA (16%)" value={formatCurrency(totals.tax)} /><div className="mt-3 flex items-end justify-between"><span className="font-semibold">Total</span><span className="text-2xl font-black tracking-tight text-[#7addff]">{formatCurrency(totals.total)}</span></div></div>
              <form onSubmit={submit} className="space-y-3 p-5"><p className="text-sm font-bold">¿A dónde enviamos la propuesta?</p><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><input required placeholder="Nombre completo *" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="studio-input" /><input placeholder="Empresa" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="studio-input" /><input required type="email" placeholder="Correo electrónico *" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="studio-input" /><input placeholder="Teléfono" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="studio-input" /></div><textarea placeholder="Material a procesar o notas" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={2} className="studio-input resize-none" />{error && <p className="text-xs text-red-300">{error}</p>}<button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#31c0f4] px-4 py-3 text-sm font-black text-[#06202c] transition hover:bg-[#7addff] disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}Generar micro sitio</button><p className="flex items-center justify-center gap-1 text-center text-[10px] leading-4 text-slate-400"><ShieldCheck className="h-3 w-3" />Propuesta protegida y válida por 72 horas.</p></form>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ChoiceSet({ label, values, value, onChange, icon }: { label: string; values: string[]; value: string; onChange: (value: string) => void; icon?: React.ReactNode }) {
  if (!values.length) return null;
  return <div><p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-700">{icon}{label}</p><div className="flex flex-wrap gap-2">{values.map((option) => <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${value === option ? "border-[#2bbce9] bg-[#e9f8fd] text-[#087ea8]" : "border-[#d4e1e6] bg-white text-slate-600 hover:border-[#94c9db]"}`}>{option}</button>)}</div></div>;
}

function Metric({ value, label }: { value: string; label: string }) { return <div className="px-4"><p className="font-mono text-sm font-bold text-[#69d8ff]">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{label}</p></div>; }
function TotalRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between py-1 text-sm text-slate-300"><span>{label}</span><span>{value}</span></div>; }

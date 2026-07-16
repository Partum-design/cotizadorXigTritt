"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { computeTotals } from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, updateItem, clear, subtotal } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
  });

  const { tax, total } = computeTotals(subtotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/quotes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: form,
          items: items.map((i) => ({
            productId: i.productId,
            capacityValue: i.capacityValue,
            material: i.material,
            power: i.power,
            engraving: i.engraving,
            engravingText: i.engravingText,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) throw new Error("submit_failed");
      const data = await res.json();
      clear();
      router.push(`/gracias?cotizacion=${data.quoteNumber}&token=${data.token}`);
    } catch {
      setError("No pudimos generar tu cotización. Intenta de nuevo en unos minutos.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-slate-50">
        <div className="container-page py-10">
          <h1 className="text-2xl font-extrabold text-brand-navy">Mi cotizaci&oacute;n</h1>

          {items.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-brand-border bg-white py-16 text-center">
              <ShoppingCart className="h-10 w-10 text-slate-300" />
              <p className="mt-4 text-slate-500">A&uacute;n no has agregado equipo a tu cotizaci&oacute;n.</p>
              <Link
                href="/productos"
                className="mt-4 rounded-md bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-dark"
              >
                Ver cat&aacute;logo
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-4 rounded-xl border border-brand-border bg-white p-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
                      <ProductIcon icon={item.icon} className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/productos/${item.slug}`} className="font-semibold text-brand-navy hover:underline">
                            {item.name}
                          </Link>
                          {item.modelCode && (
                            <span className="ml-2 text-xs font-medium text-slate-400">{item.modelCode}</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-slate-400 hover:text-red-500"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.capacityValue} {item.capacityUnit} &middot; {item.material}
                        {item.power ? ` · ${item.power}` : ""}
                        {item.engraving ? ` · Grabado: "${item.engravingText}"` : ""}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          Cantidad
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.key, { quantity: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="w-16 rounded border border-brand-border px-2 py-1 text-sm"
                          />
                        </label>
                        <span className="font-bold text-brand-navy">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-brand-border bg-white p-5">
                  <h2 className="font-semibold text-brand-navy">Resumen</h2>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Subtotal</dt>
                      <dd>{formatCurrency(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">IVA (16%)</dt>
                      <dd>{formatCurrency(tax)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-brand-border pt-2 text-base font-bold text-brand-navy">
                      <dt>Total estimado</dt>
                      <dd>{formatCurrency(total)}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-[11px] text-slate-400">
                    El precio final se confirma en tu cotizaci&oacute;n formal, v&aacute;lida por 72 horas.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-brand-border bg-white p-5">
                  <h2 className="font-semibold text-brand-navy">Tus datos</h2>
                  <input
                    required
                    placeholder="Nombre completo *"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                  />
                  <input
                    placeholder="Empresa"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Correo electrónico *"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                  />
                  <input
                    placeholder="Teléfono"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                  />
                  <textarea
                    placeholder="Notas (opcional)"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Generar cotizaci&oacute;n
                  </button>
                  <p className="text-center text-[11px] text-slate-400">
                    Te enviaremos la cotizaci&oacute;n formal a tu correo, v&aacute;lida por 72 horas.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

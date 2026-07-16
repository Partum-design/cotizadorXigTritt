"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { estimateUnitPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/database.types";

export function ProductConfigurator({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string | null;
}) {
  const { addItem } = useCart();
  const [capacity, setCapacity] = useState(product.capacity_min);
  const [material, setMaterial] = useState(product.material_options[0] ?? "");
  const [power, setPower] = useState(product.power_options[0] ?? "");
  const [engraving, setEngraving] = useState(false);
  const [engravingText, setEngravingText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const unitPrice = useMemo(
    () => estimateUnitPrice(product, capacity, engraving),
    [product, capacity, engraving]
  );

  const handleAdd = () => {
    addItem({
      key: `${product.id}|${capacity}|${material}|${power}|${engraving}|${engravingText}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      modelCode: product.model_code,
      categoryName,
      icon: product.icon,
      capacityValue: capacity,
      capacityUnit: product.capacity_unit,
      capacityMin: product.capacity_min,
      capacityMax: product.capacity_max,
      capacityStep: product.capacity_step,
      material,
      power,
      engraving,
      engravingText: engraving ? engravingText : "",
      quantity,
      unitPrice,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-xl border border-brand-border bg-white p-6 shadow-sm h-fit sticky top-24">
      <h2 className="text-lg font-bold text-brand-navy">Configura tu equipo</h2>
      <p className="mt-1 text-sm text-slate-500">
        Ajusta las especificaciones y agrega el equipo a tu cotizaci&oacute;n.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">
              Capacidad ({product.capacity_unit})
            </label>
            <span className="text-sm font-bold text-brand-navy">
              {capacity} {product.capacity_unit}
            </span>
          </div>
          <input
            type="range"
            min={product.capacity_min}
            max={product.capacity_max}
            step={product.capacity_step}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-2 w-full accent-brand-blue"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>
              {product.capacity_min} {product.capacity_unit}
            </span>
            <span>
              {product.capacity_max} {product.capacity_unit}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Material</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          >
            {product.material_options.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {product.power_options.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-slate-700">Potencia del motor</label>
            <select
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
            >
              {product.power_options.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {product.allows_engraving && (
          <div className="rounded-md border border-dashed border-brand-border p-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={engraving}
                onChange={(e) => setEngraving(e.target.checked)}
                className="h-4 w-4 accent-brand-blue"
              />
              Grabado con el logo / nombre de tu empresa
              <span className="ml-auto text-xs font-normal text-slate-500">
                +{formatCurrency(product.engraving_price)}
              </span>
            </label>
            {engraving && (
              <input
                type="text"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value)}
                placeholder="Texto o nombre de la empresa a grabar"
                maxLength={80}
                className="mt-2 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
              />
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-slate-700">Cantidad</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1.5 w-24 rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg bg-brand-blue-light p-4">
        <span className="text-sm font-medium text-brand-navy">Precio estimado / unidad</span>
        <span className="text-xl font-extrabold text-brand-navy">{formatCurrency(unitPrice)}</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        Precio estimado antes de IVA. El precio final se calcula al generar la cotizaci&oacute;n.
      </p>

      <button
        onClick={handleAdd}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
      >
        {added ? (
          <>
            <Check className="h-4 w-4" /> Agregado a tu cotizaci&oacute;n
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" /> Agregar a mi cotizaci&oacute;n
          </>
        )}
      </button>
      {added && (
        <Link
          href="/cotizar"
          className="mt-3 block text-center text-sm font-semibold text-brand-blue hover:underline"
        >
          Ver mi cotizaci&oacute;n &rarr;
        </Link>
      )}
    </div>
  );
}

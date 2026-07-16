"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_ICONS } from "@/components/icons";
import type { Product, ProductCategory } from "@/lib/database.types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: ProductCategory[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    model_code: product?.model_code ?? "",
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    icon: product?.icon ?? "mixer",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    specs: product?.specs ?? "",
    capacity_min: product?.capacity_min ?? 0,
    capacity_max: product?.capacity_max ?? 100,
    capacity_unit: product?.capacity_unit ?? "L",
    capacity_step: product?.capacity_step ?? 1,
    material_options: (product?.material_options ?? ["Acero al carbón", "Acero inoxidable AISI 304", "Acero inoxidable AISI 316"]).join(", "),
    power_options: (product?.power_options ?? []).join(", "),
    allows_engraving: product?.allows_engraving ?? true,
    base_cost: product?.base_cost ?? 0,
    base_price: product?.base_price ?? 0,
    price_per_capacity_unit: product?.price_per_capacity_unit ?? 0,
    engraving_price: product?.engraving_price ?? 3500,
    active: product?.active ?? true,
    sort_order: product?.sort_order ?? 0,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      model_code: form.model_code || null,
      category_id: form.category_id || null,
      icon: form.icon,
      short_description: form.short_description || null,
      description: form.description || null,
      specs: form.specs || null,
      capacity_min: Number(form.capacity_min),
      capacity_max: Number(form.capacity_max),
      capacity_unit: form.capacity_unit,
      capacity_step: Number(form.capacity_step),
      material_options: form.material_options.split(",").map((s) => s.trim()).filter(Boolean),
      power_options: form.power_options.split(",").map((s) => s.trim()).filter(Boolean),
      allows_engraving: form.allows_engraving,
      base_cost: Number(form.base_cost),
      base_price: Number(form.base_price),
      price_per_capacity_unit: Number(form.price_per_capacity_unit),
      engraving_price: Number(form.engraving_price),
      active: form.active,
      sort_order: Number(form.sort_order),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    const { error: dbError } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("products").delete().eq("id", product.id);
    setDeleting(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-brand-border bg-white p-5 sm:grid-cols-2">
        <Field label="Nombre">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
        </Field>
        <Field label="Slug (URL)">
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder={slugify(form.name) || "auto-generado"}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Modelo">
          <input value={form.model_code} onChange={(e) => set("model_code", e.target.value)} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
        </Field>
        <Field label="Categoría">
          <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ícono">
          <select value={form.icon} onChange={(e) => set("icon", e.target.value)} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none">
            {Object.keys(CATEGORY_ICONS).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Orden">
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Descripción corta" full>
          <input
            value={form.short_description}
            onChange={(e) => set("short_description", e.target.value)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Descripción" full>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Especificaciones" full>
          <textarea value={form.specs} onChange={(e) => set("specs", e.target.value)} rows={2} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
        </Field>
      </div>

      <div className="grid gap-4 rounded-xl border border-brand-border bg-white p-5 sm:grid-cols-3">
        <Field label="Capacidad mínima">
          <input
            type="number"
            value={form.capacity_min}
            onChange={(e) => set("capacity_min", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Capacidad máxima">
          <input
            type="number"
            value={form.capacity_max}
            onChange={(e) => set("capacity_max", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Unidad">
          <input value={form.capacity_unit} onChange={(e) => set("capacity_unit", e.target.value)} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
        </Field>
        <Field label="Incremento (step)">
          <input
            type="number"
            value={form.capacity_step}
            onChange={(e) => set("capacity_step", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Materiales (separados por coma)" full>
          <input
            value={form.material_options}
            onChange={(e) => set("material_options", e.target.value)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Potencias (separadas por coma)" full>
          <input value={form.power_options} onChange={(e) => set("power_options", e.target.value)} className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none" />
        </Field>
      </div>

      <div className="grid gap-4 rounded-xl border border-brand-border bg-white p-5 sm:grid-cols-2">
        <Field label="Costo base (MXN)">
          <input
            type="number"
            value={form.base_cost}
            onChange={(e) => set("base_cost", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Precio base (MXN)">
          <input
            type="number"
            value={form.base_price}
            onChange={(e) => set("base_price", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Precio por unidad de capacidad extra">
          <input
            type="number"
            value={form.price_per_capacity_unit}
            onChange={(e) => set("price_per_capacity_unit", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <Field label="Precio del grabado">
          <input
            type="number"
            value={form.engraving_price}
            onChange={(e) => set("engraving_price", Number(e.target.value) as never)}
            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.allows_engraving}
            onChange={(e) => set("allows_engraving", e.target.checked)}
            className="h-4 w-4 accent-brand-blue"
          />
          Permite grabado
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-brand-blue"
          />
          Activo (visible en el catálogo)
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-dark disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? "Guardar cambios" : "Crear producto"}
        </button>
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${full ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ProductCategory } from "@/lib/database.types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const inputClass =
  "w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:border-brand-blue focus:outline-none";

export function CategoryForm({ category }: { category?: ProductCategory }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    kind: category?.kind ?? "mezcladora",
    description: category?.description ?? "",
    sort_order: category?.sort_order ?? 0,
    active: category?.active ?? true,
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
      kind: form.kind,
      description: form.description || null,
      sort_order: Number(form.sort_order),
      active: form.active,
    };
    const supabase = createClient();
    const { error: dbError } = category
      ? await supabase.from("product_categories").update(payload).eq("id", category.id)
      : await supabase.from("product_categories").insert(payload);
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    router.push("/admin/categorias");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!category) return;
    if (!confirm("¿Eliminar esta categoría? Los productos quedarán sin categoría.")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("product_categories").delete().eq("id", category.id);
    setDeleting(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    router.push("/admin/categorias");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-brand-border bg-white p-5">
      <label className="block text-sm font-medium text-slate-700">
        Nombre
        <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={`mt-1.5 ${inputClass}`} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Slug
        <input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder={slugify(form.name) || "auto-generado"}
          className={`mt-1.5 ${inputClass}`}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Tipo
        <select value={form.kind} onChange={(e) => set("kind", e.target.value as never)} className={`mt-1.5 ${inputClass}`}>
          <option value="mezcladora">Mezcladora</option>
          <option value="trituradora">Trituradora</option>
          <option value="otro">Otro</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Descripción
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className={`mt-1.5 ${inputClass}`}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Orden
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => set("sort_order", Number(e.target.value) as never)}
          className={`mt-1.5 w-24 ${inputClass}`}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
          className="h-4 w-4 accent-brand-blue"
        />
        Activa
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-dark disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {category ? "Guardar cambios" : "Crear categoría"}
        </button>
        {category && (
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

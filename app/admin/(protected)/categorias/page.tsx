import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/database.types";

const KIND_LABELS: Record<string, string> = {
  mezcladora: "Mezcladora",
  trituradora: "Trituradora",
  otro: "Otro",
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = (await supabase
    .from("product_categories")
    .select("*")
    .order("sort_order")) as unknown as { data: ProductCategory[] | null };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Categorías</h1>
          <p className="mt-1 text-sm text-slate-500">{categories?.length ?? 0} categorías de producto.</p>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-dark"
        >
          <Plus className="h-4 w-4" /> Nueva categoría
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {(categories ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/categorias/${c.id}`} className="font-semibold text-brand-navy hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{KIND_LABELS[c.kind] ?? c.kind}</td>
                <td className="px-4 py-3 text-slate-500">{c.sort_order}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      c.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c.active ? "Activa" : "Inactiva"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

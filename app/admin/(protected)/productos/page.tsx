import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductCategory } from "@/lib/database.types";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order") as unknown as Promise<{ data: Product[] | null }>,
    supabase.from("product_categories").select("*") as unknown as Promise<{ data: ProductCategory[] | null }>,
  ]);

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">{products?.length ?? 0} productos en el catálogo.</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-dark"
        >
          <Plus className="h-4 w-4" /> Nuevo producto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Capacidad</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Costo</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {(products ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
                      <ProductIcon icon={p.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-brand-navy hover:underline">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.model_code}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.category_id ? categoryMap.get(p.category_id) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.capacity_min}–{p.capacity_max} {p.capacity_unit}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">{formatCurrency(p.base_price)}</td>
                <td className="px-4 py-3 text-slate-500">{formatCurrency(p.base_cost)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      p.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {p.active ? "Activo" : "Inactivo"}
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

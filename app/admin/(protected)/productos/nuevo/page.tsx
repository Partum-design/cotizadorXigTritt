import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductCategory } from "@/lib/database.types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = (await supabase
    .from("product_categories")
    .select("*")
    .order("sort_order")) as unknown as { data: ProductCategory[] | null };

  return (
    <div>
      <Link href="/admin/productos" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue">
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-extrabold text-brand-navy">Nuevo producto</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}

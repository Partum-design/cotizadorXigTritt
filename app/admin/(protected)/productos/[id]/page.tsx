import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product, ProductCategory } from "@/lib/database.types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle() as unknown as Promise<{ data: Product | null }>,
    supabase.from("product_categories").select("*").order("sort_order") as unknown as Promise<{
      data: ProductCategory[] | null;
    }>,
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/productos" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue">
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-extrabold text-brand-navy">{product.name}</h1>
      <ProductForm product={product} categories={categories ?? []} />
    </div>
  );
}

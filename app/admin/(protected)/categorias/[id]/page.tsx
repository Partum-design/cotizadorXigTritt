import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/CategoryForm";
import type { ProductCategory } from "@/lib/database.types";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = (await supabase
    .from("product_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle()) as unknown as { data: ProductCategory | null };

  if (!category) notFound();

  return (
    <div>
      <Link href="/admin/categorias" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue">
        <ArrowLeft className="h-4 w-4" /> Volver a categorías
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-extrabold text-brand-navy">{category.name}</h1>
      <CategoryForm category={category} />
    </div>
  );
}

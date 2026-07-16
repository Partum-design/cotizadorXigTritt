import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <Link href="/admin/categorias" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-blue">
        <ArrowLeft className="h-4 w-4" /> Volver a categorías
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-extrabold text-brand-navy">Nueva categoría</h1>
      <CategoryForm />
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { ProductConfigurator } from "@/components/catalog/ProductConfigurator";
import { ProductCard } from "@/components/catalog/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductCategory } from "@/lib/database.types";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = (await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle()) as unknown as { data: Product | null };

  if (!product) notFound();

  const [{ data: category }, { data: related }] = await Promise.all([
    product.category_id
      ? ((supabase
          .from("product_categories")
          .select("*")
          .eq("id", product.category_id)
          .maybeSingle()) as unknown as Promise<{ data: ProductCategory | null }>)
      : Promise.resolve({ data: null }),
    (supabase
      .from("products")
      .select("*")
      .eq("category_id", product.category_id ?? "")
      .neq("id", product.id)
      .eq("active", true)
      .limit(3)) as unknown as Promise<{ data: Product[] | null }>,
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b border-brand-border bg-white py-4">
          <div className="container-page flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/productos" className="hover:text-brand-blue">
              Cat&aacute;logo
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {category && (
              <>
                <Link href={`/productos?categoria=${category.slug}`} className="hover:text-brand-blue">
                  {category.name}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
            <span className="text-slate-700">{product.name}</span>
          </div>
        </div>

        <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
          <div>
            <ProductVisual name={product.name} icon={product.icon} material={product.material_options[0]} photo className="aspect-[4/3] rounded-2xl border border-[#1e3d4c] shadow-xl" />
            <div className="mt-6 space-y-4">
              <div>
                <p className="font-mono text-[10px] tracking-[.18em] text-brand-blue">PLATAFORMA INDUSTRIAL CONFIGURABLE</p>
                <h1 className="text-2xl font-extrabold text-brand-navy">{product.name}</h1>
                {product.model_code && (
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Modelo {product.model_code}
                  </p>
                )}
              </div>
              <p className="leading-7 text-slate-600">{product.description || product.short_description || "Equipo industrial diseñado para procesos continuos y configurado según su operación."}</p>
              {product.specs && (
                <div className="rounded-xl border border-[#dbe6ea] bg-slate-50 p-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Especificaciones
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{product.specs}</p>
                </div>
              )}
              <div className="grid grid-cols-3 divide-x divide-[#dbe6ea] rounded-xl border border-[#dbe6ea] bg-white text-center">
                <div className="p-3"><p className="font-mono text-[10px] text-brand-blue">CAPACIDAD</p><p className="mt-1 text-xs font-bold text-brand-navy">{product.capacity_min}–{product.capacity_max} {product.capacity_unit}</p></div>
                <div className="p-3"><p className="font-mono text-[10px] text-brand-blue">CONTROL</p><p className="mt-1 text-xs font-bold text-brand-navy">TEFC / IP55</p></div>
                <div className="p-3"><p className="font-mono text-[10px] text-brand-blue">SOPORTE</p><p className="mt-1 text-xs font-bold text-brand-navy">1 año garantía</p></div>
              </div>
            </div>
          </div>

          <ProductConfigurator product={product} categoryName={category?.name ?? null} />
        </div>

        {related && related.length > 0 && (
          <section className="container-page pb-16">
            <h2 className="text-xl font-bold text-brand-navy">Tambi&eacute;n te puede interesar</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

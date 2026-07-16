import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/catalog/ProductCard";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/lib/database.types";

const KIND_LABELS: Record<string, string> = {
  mezcladora: "Mezcladoras",
  trituradora: "Trituradoras",
  otro: "Otros equipos",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; categoria?: string }>;
}) {
  const { tipo, categoria } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = (await supabase
    .from("product_categories")
    .select("*")
    .eq("active", true)
    .order("sort_order")) as unknown as { data: ProductCategory[] | null };

  let query = supabase.from("products").select("*").eq("active", true).order("sort_order");
  if (categoria) {
    const cat = categories?.find((c) => c.slug === categoria);
    if (cat) query = query.eq("category_id", cat.id);
  } else if (tipo) {
    const kindCategoryIds = (categories ?? []).filter((c) => c.kind === tipo).map((c) => c.id);
    query = query.in("category_id", kindCategoryIds.length ? kindCategoryIds : ["00000000-0000-0000-0000-000000000000"]);
  }
  const { data: products } = (await query) as unknown as { data: Product[] | null };

  const categoriesByKind = (categories ?? []).reduce<Record<string, ProductCategory[]>>((acc, c) => {
    (acc[c.kind] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-brand-navy py-12 text-white">
          <div className="container-page">
            <h1 className="text-3xl font-extrabold">Cat&aacute;logo de equipo industrial</h1>
            <p className="mt-2 max-w-2xl text-white/75">
              Elige una l&iacute;nea, configura capacidad y material, y agr&eacute;gala a tu
              cotizaci&oacute;n.
            </p>
          </div>
        </div>

        <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Tipo de equipo
              </h3>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                <Link
                  href="/productos"
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium",
                    !tipo && !categoria
                      ? "bg-brand-navy text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  Todo el equipo
                </Link>
                {Object.entries(KIND_LABELS).map(([kind, label]) => (
                  <Link
                    key={kind}
                    href={`/productos?tipo=${kind}`}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium",
                      tipo === kind ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {Object.entries(categoriesByKind).map(([kind, cats]) => (
              <div key={kind} className={cn(tipo && tipo !== kind ? "hidden lg:block lg:opacity-40" : "")}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {KIND_LABELS[kind]}
                </h3>
                <ul className="space-y-1">
                  {cats.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/productos?categoria=${c.slug}`}
                        className={cn(
                          "block rounded px-2 py-1 text-sm",
                          categoria === c.slug
                            ? "bg-brand-blue-light font-semibold text-brand-blue"
                            : "text-slate-600 hover:text-brand-blue"
                        )}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          <div>
            {products && products.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No hay equipo disponible en esta categor&iacute;a.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

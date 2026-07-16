import Link from "next/link";
import { ArrowRight, Mail, ShieldCheck, Timer, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductIcon } from "@/components/icons";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product, ProductCategory } from "@/lib/database.types";

export const revalidate = 60;

const KIND_META: Record<string, { title: string; blurb: string; icon: string }> = {
  mezcladora: {
    title: "Mezcladoras industriales",
    blurb: "Cintas helicoidales, paletas, sigma, doble cono, reja de arado, tornillo cónico y verticales.",
    icon: "mixer",
  },
  trituradora: {
    title: "Trituradoras industriales",
    blurb: "Molinos pulverizadores, de martillos, de cuchillas y molinos coloidales de refinación.",
    icon: "grinder",
  },
  otro: {
    title: "Otros equipos",
    blurb: "Agitadores de alto cizallamiento, tamizadoras, marmitas y tanques industriales.",
    icon: "tank",
  },
};

export default async function Home() {
  const supabase = await createClient();

  const [{ data: categories }, { data: featured }] = await Promise.all([
    supabase
      .from("product_categories")
      .select("*")
      .eq("active", true)
      .order("sort_order") as unknown as Promise<{ data: ProductCategory[] | null }>,
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .limit(6) as unknown as Promise<{ data: Product[] | null }>,
  ]);

  const kindCounts = (categories ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.kind] = (acc[c.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-brand-navy text-white">
          <div className="absolute inset-0 opacity-[0.07]" aria-hidden>
            <svg width="100%" height="100%">
              <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M36 0H0V36" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="container-page relative py-20 md:py-28">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">
              Fabricantes de equipo industrial
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight text-balance md:text-5xl">
              Configura tu mezcladora o trituradora y recibe tu cotizaci&oacute;n al instante
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/75 md:text-lg">
              Expertos en granulometr&iacute;a, homogeneizaci&oacute;n y refinaci&oacute;n. Elige
              capacidad, material y grabado de tu empresa &mdash; nosotros generamos la
              cotizaci&oacute;n formal y te la enviamos por correo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-colors"
              >
                Ver cat&aacute;logo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/cotizar"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Mi cotizaci&oacute;n
              </Link>
            </div>
            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8 text-white/85">
              <div>
                <dt className="text-2xl font-bold">17</dt>
                <dd className="text-xs text-white/60">L&iacute;neas de equipo</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold">72h</dt>
                <dd className="text-xs text-white/60">Validez de cotizaci&oacute;n</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold">100%</dt>
                <dd className="text-xs text-white/60">Configurable en l&iacute;nea</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="container-page py-16">
          <h2 className="text-2xl font-bold text-brand-navy">Nuestras l&iacute;neas de equipo</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Cada equipo se configura seg&uacute;n tu capacidad, material y necesidad de grabado
            de marca antes de generar la cotizaci&oacute;n.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {Object.entries(KIND_META).map(([kind, meta]) => (
              <Link
                key={kind}
                href={`/productos?tipo=${kind}`}
                className="group rounded-xl border border-brand-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
                  <ProductIcon icon={meta.icon} className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-brand-navy">{meta.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{meta.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                  {kindCounts[kind] ?? 0} categor&iacute;as{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-brand-blue-light/60 py-16">
          <div className="container-page">
            <h2 className="text-2xl font-bold text-brand-navy">C&oacute;mo funciona</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Wrench,
                  title: "1. Configura tu equipo",
                  text: "Elige capacidad, material, potencia y si quieres grabado con el logo de tu empresa.",
                },
                {
                  icon: Mail,
                  title: "2. Recibe tu cotización",
                  text: "Te llega por correo con precios, especificaciones y un enlace para verla y aceptarla.",
                },
                {
                  icon: Timer,
                  title: "3. Válida por 72 horas",
                  text: "Acepta dentro de ese plazo para asegurar el precio cotizado; después se debe regenerar.",
                },
              ].map((step) => (
                <div key={step.title} className="rounded-xl bg-white p-6 shadow-sm">
                  <step.icon className="h-6 w-6 text-brand-blue" />
                  <h3 className="mt-3 font-semibold text-brand-navy">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        {featured && featured.length > 0 && (
          <section className="container-page py-16">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-brand-navy">Equipo destacado</h2>
              <Link href="/productos" className="text-sm font-semibold text-brand-blue hover:underline">
                Ver todo &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* TRUST STRIP */}
        <section className="border-t border-brand-border bg-white py-10">
          <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" /> Fabricaci&oacute;n mexicana
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" /> Acero AISI 304 / 316
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" /> Grabado de marca disponible
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" /> Cotizaci&oacute;n formal por correo
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

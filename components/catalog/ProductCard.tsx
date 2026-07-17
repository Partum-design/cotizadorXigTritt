import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductIcon } from "@/components/icons";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/database.types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#98cbdc] hover:shadow-xl"
    >
      <ProductVisual name={product.name} icon={product.icon} compact className="h-40" />
      <div className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue">
          <ProductIcon icon={product.icon} className="h-5 w-5" />
        </div>
        {product.model_code && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            {product.model_code}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-semibold text-brand-navy">{product.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.short_description}</p>
      <div className="mt-3 text-xs text-slate-500">
        Capacidad: {product.capacity_min}&ndash;{product.capacity_max} {product.capacity_unit}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-3">
        <div>
          <div className="text-[11px] text-slate-500">Desde</div>
          <div className="font-bold text-brand-navy">{formatCurrency(product.base_price)}</div>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-brand-blue">
          Configurar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
      </div>
    </Link>
  );
}

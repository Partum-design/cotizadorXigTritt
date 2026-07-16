import type { Product } from "@/lib/database.types";

/**
 * Mirrors the pricing logic in the submit_quote Postgres function so the UI can show a live
 * preview. The database always recomputes the authoritative price at submit time.
 */
export function estimateUnitPrice(
  product: Pick<Product, "base_price" | "capacity_min" | "capacity_max" | "price_per_capacity_unit" | "engraving_price" | "allows_engraving">,
  capacityValue: number,
  engraving: boolean
) {
  const capacity = Math.min(Math.max(capacityValue, product.capacity_min), Math.max(product.capacity_max, product.capacity_min));
  const extra = Math.max(capacity - product.capacity_min, 0) * product.price_per_capacity_unit;
  const engravingCost = engraving && product.allows_engraving ? product.engraving_price : 0;
  return Math.round(product.base_price + extra + engravingCost);
}

export const IVA_RATE = 0.16;

export function computeTotals(subtotal: number) {
  const tax = Math.round(subtotal * IVA_RATE * 100) / 100;
  const total = subtotal + tax;
  return { tax, total };
}

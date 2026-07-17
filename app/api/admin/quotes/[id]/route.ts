import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ items: z.array(z.object({ productId: z.string().uuid(), capacityValue: z.number().finite().nonnegative(), material: z.string().max(160), power: z.string().max(160), quantity: z.number().int().min(1).max(999), unitPrice: z.number().finite().nonnegative() })).min(1).max(50) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: quote } = await supabase.from("quotes").select("id, status").eq("id", id).maybeSingle();
  if (!quote) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const ids = parsed.data.items.map((item) => item.productId);
  const { data: products } = await supabase.from("products").select("id, name, model_code, category_id, capacity_unit").in("id", ids);
  if (!products || products.length !== new Set(ids).size) return NextResponse.json({ error: "product_not_found" }, { status: 400 });
  const categoryIds = [...new Set(products.map((product) => product.category_id).filter(Boolean))] as string[];
  const { data: categories } = categoryIds.length ? await supabase.from("product_categories").select("id, name").in("id", categoryIds) : { data: [] };
  const productById = new Map(products.map((product) => [product.id, product]));
  const categoryById = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const lineItems = parsed.data.items.map((item) => {
    const product = productById.get(item.productId)!;
    const subtotal = Math.round(item.unitPrice * item.quantity * 100) / 100;
    return { quote_id: id, product_id: product.id, product_name: product.name, product_model: product.model_code, category_name: product.category_id ? categoryById.get(product.category_id) ?? null : null, capacity_value: item.capacityValue, capacity_unit: product.capacity_unit, material: item.material, power: item.power, engraving: false, engraving_text: null, quantity: item.quantity, unit_price: item.unitPrice, unit_cost: 0, subtotal };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * .16 * 100) / 100;
  const { error: deleteError } = await supabase.from("quote_items").delete().eq("quote_id", id);
  if (deleteError) return NextResponse.json({ error: "replace_failed" }, { status: 500 });
  const { error: insertError } = await supabase.from("quote_items").insert(lineItems);
  if (insertError) return NextResponse.json({ error: "replace_failed" }, { status: 500 });
  const { error: updateError } = await supabase.from("quotes").update({ subtotal, tax, total: subtotal + tax, updated_at: new Date().toISOString() }).eq("id", id);
  if (updateError) return NextResponse.json({ error: "total_update_failed" }, { status: 500 });
  await supabase.from("quote_events").insert({ quote_id: id, event_type: "updated", metadata: { editor: user.id, item_count: lineItems.length } });
  return NextResponse.json({ ok: true });
}

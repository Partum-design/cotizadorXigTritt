import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), capacityValue: z.number().finite().nonnegative(), material: z.string().max(160), power: z.string().max(160), quantity: z.number().int().min(1).max(999), unitPrice: z.number().finite().nonnegative() })).min(1).max(50),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: leadId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: lead } = await supabase.from("leads").select("id").eq("id", leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
  const ids = parsed.data.items.map((item) => item.productId);
  const { data: products } = await supabase.from("products").select("id, name, model_code, category_id, capacity_unit").in("id", ids);
  if (!products || products.length !== new Set(ids).size) return NextResponse.json({ error: "product_not_found" }, { status: 400 });
  const categoryIds = [...new Set(products.map((product) => product.category_id).filter(Boolean))] as string[];
  const { data: categories } = categoryIds.length ? await supabase.from("product_categories").select("id, name").in("id", categoryIds) : { data: [] };
  const productById = new Map(products.map((product) => [product.id, product]));
  const categoryById = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.round(subtotal * .16 * 100) / 100;
  const token = crypto.randomUUID();
  const timestamp = new Date();
  const quoteNumber = `ADM-${timestamp.getFullYear().toString().slice(-2)}${String(timestamp.getMonth() + 1).padStart(2, "0")}${String(timestamp.getDate()).padStart(2, "0")}-${token.replaceAll("-", "").slice(0, 5).toUpperCase()}`;
  const { data: quote, error: quoteError } = await supabase.from("quotes").insert({ quote_number: quoteNumber, lead_id: leadId, public_token: token, status: "draft", subtotal, tax, total: subtotal + tax, currency: "MXN", valid_hours: 72, created_by: user.id }).select("id").single();
  if (quoteError) {
    if (quoteError.message.includes("quote_limit_reached")) {
      return NextResponse.json({ error: "quote_limit_reached" }, { status: 403 });
    }
    return NextResponse.json({ error: "create_quote_failed" }, { status: 500 });
  }
  if (!quote) return NextResponse.json({ error: "create_quote_failed" }, { status: 500 });
  const lineItems = parsed.data.items.map((item) => {
    const product = productById.get(item.productId)!;
    const lineSubtotal = Math.round(item.unitPrice * item.quantity * 100) / 100;
    return { quote_id: quote.id, product_id: product.id, product_name: product.name, product_model: product.model_code, category_name: product.category_id ? categoryById.get(product.category_id) ?? null : null, capacity_value: item.capacityValue, capacity_unit: product.capacity_unit, material: item.material, power: item.power, engraving: false, engraving_text: null, quantity: item.quantity, unit_price: item.unitPrice, unit_cost: 0, subtotal: lineSubtotal };
  });
  const { error: itemsError } = await supabase.from("quote_items").insert(lineItems);
  if (itemsError) { await supabase.from("quotes").delete().eq("id", quote.id); return NextResponse.json({ error: "create_items_failed" }, { status: 500 }); }
  await supabase.from("quote_events").insert({ quote_id: quote.id, event_type: "created", metadata: { source: "admin_customer_profile", editor: user.id } });
  return NextResponse.json({ ok: true, quoteId: quote.id });
}

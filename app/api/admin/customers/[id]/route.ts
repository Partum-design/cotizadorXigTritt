import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const customerSchema = z.object({
  fullName: z.string().min(2).max(150),
  company: z.string().max(150).optional().default(""),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
});

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = customerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { error } = await supabase.from("leads").update({ full_name: parsed.data.fullName, company: parsed.data.company || null, email: parsed.data.email.toLowerCase(), phone: parsed.data.phone || null, notes: parsed.data.notes || null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: customer } = await supabase.from("leads").select("email").eq("id", id).maybeSingle();
  if (!customer) return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
  const { data: relatedLeads } = await supabase.from("leads").select("id").ilike("email", customer.email.trim());
  const leadIds = (relatedLeads ?? [{ id }]).map((lead) => lead.id);
  const { data: quotes } = await supabase.from("quotes").select("id").in("lead_id", leadIds);
  const quoteIds = (quotes ?? []).map((quote) => quote.id);
  if (quoteIds.length) {
    const [{ error: itemsError }, { error: eventsError }] = await Promise.all([
      supabase.from("quote_items").delete().in("quote_id", quoteIds),
      supabase.from("quote_events").delete().in("quote_id", quoteIds),
    ]);
    if (itemsError || eventsError) return NextResponse.json({ error: "delete_history_failed" }, { status: 500 });
    const { error: quotesError } = await supabase.from("quotes").delete().in("id", quoteIds);
    if (quotesError) return NextResponse.json({ error: "delete_history_failed" }, { status: 500 });
  }
  const { error: leadError } = await supabase.from("leads").delete().in("id", leadIds);
  if (leadError) return NextResponse.json({ error: "delete_customer_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

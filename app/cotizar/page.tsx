import { QuoteStudio } from "@/components/quote/QuoteStudio";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/database.types";

export default async function QuotePage() {
  const supabase = await createClient();
  const { data } = (await supabase.from("products").select("*").eq("active", true).order("sort_order")) as unknown as { data: Product[] | null };
  return <QuoteStudio products={data ?? []} />;
}

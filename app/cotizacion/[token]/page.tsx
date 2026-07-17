import { headers } from "next/headers";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { QuoteMicrosite, type PublicQuote } from "@/components/quote/QuoteMicrosite";
import { createClient } from "@/lib/supabase/server";

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const hdrs = await headers();
  const { data } = await supabase.rpc("get_quote_public", { p_token: token });
  const quote = data as unknown as PublicQuote | null;
  if (quote && quote.status !== "accepted" && quote.status !== "rejected") {
    await supabase.rpc("track_view", { p_token: token, p_ip: hdrs.get("x-forwarded-for"), p_ua: hdrs.get("user-agent") });
  }
  const unavailable = !quote || (quote.expired && quote.status !== "accepted" && quote.status !== "rejected");
  return <><Header /><main className="flex-1">{unavailable ? <Unavailable expired={quote?.expired ?? false} /> : <QuoteMicrosite quote={quote} token={token} companyEmail={process.env.NEXT_PUBLIC_COMPANY_EMAIL} companyPhone={process.env.NEXT_PUBLIC_COMPANY_PHONE} />}</main><Footer /></>;
}

function Unavailable({ expired }: { expired: boolean }) { return <div className="container-page flex min-h-[65vh] items-center justify-center py-14"><div className="max-w-lg rounded-2xl border border-brand-border bg-white p-10 text-center shadow-xl"><AlertTriangle className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-5 text-2xl font-black tracking-tight text-brand-navy">{expired ? "Esta propuesta ya no está disponible" : "Cotización no encontrada"}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{expired ? "El periodo comercial de este micrositio terminó. Solicita a tu asesor una nueva propuesta con la configuración actualizada." : "Este enlace no es válido o la cotización todavía no ha sido enviada."}</p><Link href="/" className="mt-7 inline-flex rounded-lg bg-brand-navy px-5 py-3 text-sm font-bold text-white hover:bg-brand-navy-dark">Volver al inicio</Link></div></div>; }

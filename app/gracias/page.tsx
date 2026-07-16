import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ cotizacion?: string; token?: string }>;
}) {
  const { cotizacion, token } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container-page flex flex-col items-center py-24 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <h1 className="mt-6 text-3xl font-extrabold text-brand-navy">
            &iexcl;Tu cotizaci&oacute;n fue generada!
          </h1>
          {cotizacion && (
            <p className="mt-2 text-lg font-semibold text-brand-blue">{cotizacion}</p>
          )}
          <p className="mt-4 max-w-md text-slate-600">
            <Mail className="mr-1 inline h-4 w-4" /> Te enviamos el detalle a tu correo
            electr&oacute;nico. Es v&aacute;lida por 72 horas a partir de este momento.
          </p>
          <div className="mt-8 flex gap-3">
            {token && (
              <Link
                href={`/cotizacion/${token}`}
                className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-navy-dark"
              >
                Ver mi cotizaci&oacute;n
              </Link>
            )}
            <Link
              href="/productos"
              className="rounded-md border border-brand-border px-6 py-3 text-sm font-semibold text-brand-navy hover:bg-slate-50"
            >
              Seguir explorando
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

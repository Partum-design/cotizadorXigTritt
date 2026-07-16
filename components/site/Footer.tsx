import Link from "next/link";
import { Logo } from "./Logo";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-navy-dark text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <Logo dark />
          <p className="max-w-sm text-sm text-white/70">
            En Mezcladoras y Molinos Industriales TRITT&Oacute;N somos expertos en
            granulometr&iacute;a, homogeneizaci&oacute;n y refinaci&oacute;n. Fabricamos equipo
            industrial a la medida para la industria mexicana y latinoamericana.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/90">
            Equipo
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link href="/productos?tipo=mezcladora" className="hover:text-white">
                Mezcladoras industriales
              </Link>
            </li>
            <li>
              <Link href="/productos?tipo=trituradora" className="hover:text-white">
                Trituradoras industriales
              </Link>
            </li>
            <li>
              <Link href="/productos?tipo=otro" className="hover:text-white">
                Otros equipos
              </Link>
            </li>
            <li>
              <Link href="/cotizar" className="hover:text-white">
                Mi cotizaci&oacute;n
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/90">
            Contacto
          </h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> {process.env.NEXT_PUBLIC_COMPANY_PHONE}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" /> {process.env.NEXT_PUBLIC_COMPANY_EMAIL}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" /> CDMX &middot; Guadalajara
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="container-page flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} TRITT&Oacute;N. Todos los derechos reservados.</span>
          <Link href="/admin" className="hover:text-white/80">
            Acceso administraci&oacute;n
          </Link>
        </div>
      </div>
    </footer>
  );
}

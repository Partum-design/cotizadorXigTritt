"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/productos", label: "Todo el equipo" },
  { href: "/productos?tipo=mezcladora", label: "Mezcladoras" },
  { href: "/productos?tipo=trituradora", label: "Trituradoras" },
  { href: "/productos?tipo=otro", label: "Otros equipos" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-brand-border">
      <div className="hidden sm:block bg-brand-navy text-white text-xs">
        <div className="container-page flex items-center justify-between py-1.5">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" /> {process.env.NEXT_PUBLIC_COMPANY_PHONE}
          </span>
          <span>Cotizaciones en l&iacute;nea &middot; Respuesta el mismo d&iacute;a</span>
        </div>
      </div>
      <div className="container-page flex items-center justify-between py-3">
        <Logo />
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-slate-700 hover:text-brand-blue transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/cotizar"
            className="relative flex items-center gap-2 rounded-md border border-brand-navy/20 px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-blue-light transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Mi cotizaci&oacute;n</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden p-2 text-brand-navy"
            onClick={() => setOpen((v) => !v)}
            aria-label="Men&uacute;"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <div className={cn("lg:hidden border-t border-brand-border", open ? "block" : "hidden")}>
        <nav className="container-page flex flex-col py-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium text-slate-700 border-b border-brand-border last:border-0"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

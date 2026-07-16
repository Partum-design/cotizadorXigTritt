import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)}>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-black text-base",
          dark ? "bg-white text-brand-navy" : "bg-brand-navy text-white"
        )}
      >
        T
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            dark ? "text-white" : "text-brand-navy"
          )}
        >
          TRITT&Oacute;N
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.16em]",
            dark ? "text-white/60" : "text-brand-blue"
          )}
        >
          Mezcladoras &amp; Trituradoras
        </span>
      </span>
    </Link>
  );
}

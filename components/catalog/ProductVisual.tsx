import Image from "next/image";
import { ProductIcon } from "@/components/icons";

type ProductVisualProps = {
  name: string;
  icon?: string;
  material?: string | null;
  capacity?: number | null;
  photo?: boolean;
  compact?: boolean;
  className?: string;
};

/** A product view that is useful even when a catalog record has no uploaded photograph. */
export function ProductVisual({
  name,
  icon = "mixer",
  material,
  capacity,
  photo = false,
  compact = false,
  className = "",
}: ProductVisualProps) {
  const stainless = /inox|aisi|316|304/i.test(material ?? "");
  const isRibbon = /ribbon|cinta|list[oó]n/i.test(name);

  if (photo && isRibbon) {
    return (
      <div className={`relative overflow-hidden bg-[#07111a] ${className}`}>
        <Image
          src="/images/ribbon-blender-hero.png"
          alt={`Mezcladora industrial ${name}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 620px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111a]/80 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-white/80 backdrop-blur">
          VISTA REFERENCIAL
        </span>
      </div>
    );
  }

  const scale = capacity ? Math.min(1.25, Math.max(0.78, 0.78 + Math.log10(Math.max(capacity, 1)) / 8)) : 1;
  const steel = stainless ? "#DCE7EC" : "#A8B2BB";
  const steelDark = stainless ? "#8FA8B4" : "#65727D";

  return (
    <div
      className={`relative overflow-hidden bg-[#0a1721] ${className}`}
      aria-label={`Vista técnica de ${name}`}
      role="img"
    >
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(110,174,204,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(110,174,204,.18)_1px,transparent_1px)] [background-size:24px_24px]" />
      <svg viewBox="0 0 520 280" className="relative h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={steel} />
            <stop offset="0.38" stopColor="#F5FBFD" />
            <stop offset="0.76" stopColor={steelDark} />
            <stop offset="1" stopColor="#31434E" />
          </linearGradient>
          <linearGradient id="frame" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#263842" />
            <stop offset="0.5" stopColor="#50636D" />
            <stop offset="1" stopColor="#1B2930" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>
        <path d="M30 230H490" stroke="#4E6A78" strokeWidth="1" strokeDasharray="5 6" />
        <g transform={`translate(${260 - 260 * scale} ${150 - 150 * scale + (compact ? 18 : 0)}) scale(${scale})`}>
          <path d="M107 195H420L442 217H86L107 195Z" fill="url(#frame)" stroke="#91ABB7" strokeWidth="1.4" />
          <path d="M119 198L99 246H130L154 198M382 198L404 246H433L412 198" fill="#24353E" stroke="#91ABB7" strokeWidth="1.4" />
          <path d="M130 116C130 98 144 84 162 84H344C362 84 376 98 376 116V160C376 182 358 200 336 200H170C148 200 130 182 130 160V116Z" fill="url(#shell)" stroke="#D9F3FC" strokeWidth="1.8" />
          <path d="M130 119C147 137 170 145 196 145H311C340 145 363 136 376 119" stroke="#6B8793" strokeWidth="1.1" opacity=".85" />
          <path d="M167 91V79C167 67 177 58 189 58H316C328 58 338 67 338 79V91" stroke="#B8D0DA" strokeWidth="5" />
          <path d="M173 80H332" stroke="#F1FBFF" strokeWidth="3" />
          <path d="M185 112C207 91 230 91 251 112C272 133 295 133 316 112" stroke="#35505D" strokeWidth="3" opacity=".85" />
          <path d="M194 111C216 132 238 132 260 111C282 90 304 90 326 111" stroke="#D9E9EF" strokeWidth="2.5" opacity=".85" />
          <path d="M248 145V191" stroke="#405A66" strokeWidth="7" />
          <path d="M238 191H258L265 206H231L238 191Z" fill="#526D79" stroke="#CAE2EB" />
          <path d="M237 207H260" stroke="#E4F7FF" strokeWidth="3" />
          <path d="M104 126H130" stroke="#1D2D35" strokeWidth="14" />
          <path d="M71 108H106V143H71Z" fill="#263943" stroke="#9DB7C1" strokeWidth="1.3" />
          <circle cx="70" cy="126" r="24" fill="#1B2B34" stroke="#83AFC1" strokeWidth="1.5" />
          <path d="M52 126H88M70 108V144" stroke="#59798A" strokeWidth="1" />
          <rect x="377" y="112" width="35" height="57" rx="2" fill="#E3EFF3" stroke="#8EABB6" strokeWidth="1.4" />
          <circle cx="394" cy="129" r="4" fill="#2FB5ED" />
          <circle cx="394" cy="145" r="4" fill="#FAAC39" />
        </g>
        <circle cx="442" cy="58" r="18" fill="#35B9EF" opacity=".16" filter="url(#glow)" />
        <circle cx="442" cy="58" r="3" fill="#4FD0FF" />
        <path d="M421 58H363" stroke="#5CCBF3" strokeWidth="1" strokeDasharray="3 3" />
        <text x="356" y="49" fill="#BDEAFF" fontSize="9" fontFamily="monospace" letterSpacing="1.2">TABLERO IP55</text>
      </svg>
      {!compact && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-cyan-100/75">
          <ProductIcon icon={icon} className="h-4 w-4" /> {stainless ? "ACERO INOXIDABLE" : "ACABADO INDUSTRIAL"}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ArrowDown, Check, CheckCircle2, Cog, Gauge, ShieldCheck, Timer, Wrench, Zap } from "lucide-react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { QuoteActions } from "@/components/quote/QuoteActions";
import { formatCurrency, formatDate } from "@/lib/utils";

export type PublicQuoteItem = {
  product_name: string;
  product_model: string | null;
  category_name: string | null;
  capacity_value: number | null;
  capacity_unit: string | null;
  material: string | null;
  power: string | null;
  engraving: boolean;
  engraving_text: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type PublicQuote = {
  quote_number: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected";
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  valid_until: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  expired: boolean;
  lead: { full_name: string; company: string | null; email: string; phone: string | null };
  items: PublicQuoteItem[];
};

const NAV = [
  ["equipo", "El equipo"],
  ["proceso", "El proceso"],
  ["motor", "Motorización"],
  ["acabados", "Acabados"],
  ["inversion", "Inversión"],
] as const;

export function QuoteMicrosite({ quote, token, companyEmail, companyPhone }: { quote: PublicQuote; token: string; companyEmail?: string; companyPhone?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [finish, setFinish] = useState<"304" | "316">(/316/i.test(quote.items[0]?.material ?? "") ? "316" : "304");
  const item = quote.items[activeIndex] ?? quote.items[0];
  const profile = useMemo(() => buildProfile(item), [item]);
  const isOpen = quote.status !== "accepted" && quote.status !== "rejected" && !quote.expired;

  const navigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <div className="bg-[#f0f4f5] text-[#102b39]">
    <section className="relative isolate overflow-hidden bg-[#06141d] text-white">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(111,216,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(111,216,255,.13)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-[#006b91] blur-[120px]" />
      <div className="container-page relative grid min-h-[660px] items-end gap-8 pb-12 pt-16 lg:grid-cols-[1.02fr_.98fr] lg:pb-16 lg:pt-24">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] tracking-[.18em] text-cyan-100">PROPUESTA TÉCNICA / {quote.quote_number}</span><StatusPill status={quote.status} /></div>
          <p className="mt-10 font-mono text-[11px] tracking-[.24em] text-[#65d5fb]">{item?.category_name?.toUpperCase() ?? "EQUIPO INDUSTRIAL"}</p>
          <h1 className="mt-3 text-balance text-5xl font-black leading-[.91] tracking-[-.065em] sm:text-6xl lg:text-7xl">{item?.product_name ?? "Solución industrial"}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">{profile.headline}</p>
          <div className="mt-9 grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[.045]">
            <HeroMetric label="MODELO" value={item?.product_model ?? "A medida"} />
            <HeroMetric label="CAPACIDAD" value={`${item?.capacity_value ?? "—"} ${item?.capacity_unit ?? ""}`} />
            <HeroMetric label="MOTOR" value={item?.power ?? "Según carga"} />
          </div>
          <button onClick={() => navigate("equipo")} className="mt-10 flex items-center gap-2 text-sm font-bold text-white/80 transition hover:text-[#68dcff]"><span className="grid h-9 w-9 place-items-center rounded-full border border-white/20"><ArrowDown className="h-4 w-4" /></span>Conoce la solución</button>
        </div>
        <div className="relative lg:translate-y-5"><ProductVisual name={item?.product_name ?? "Equipo industrial"} material={item?.material} capacity={item?.capacity_value} photo className="aspect-[5/4] rounded-2xl border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,.4)]" /><div className="absolute -bottom-4 left-5 rounded-lg border border-cyan-200/20 bg-[#0d2937]/95 px-4 py-3 backdrop-blur"><p className="font-mono text-[9px] tracking-[.16em] text-[#73ddff]">CONFIGURACIÓN PROPUESTA</p><p className="mt-1 text-sm font-bold">{item?.material} · {item?.power || "Motorización a definir"}</p></div></div>
      </div>
    </section>

    <div className="sticky top-0 z-30 border-b border-[#d5e2e6] bg-white/95 backdrop-blur">
      <div className="container-page flex items-center gap-2 overflow-x-auto py-3"><span className="mr-2 hidden font-mono text-[10px] tracking-[.16em] text-slate-400 sm:inline">RECORRIDO</span>{NAV.map(([id, label], index) => <button key={id} onClick={() => navigate(id)} className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-[#e8f7fc] hover:text-[#047fae]">{String(index + 1).padStart(2, "0")} · {label}</button>)}<button onClick={() => navigate("inversion")} className="ml-auto hidden whitespace-nowrap rounded-full bg-[#09212e] px-4 py-2 text-xs font-bold text-white sm:block">Ver propuesta</button></div>
    </div>

    {quote.items.length > 1 && <div className="container-page pt-8"><div className="flex gap-3 overflow-x-auto pb-1">{quote.items.map((entry, index) => <button key={`${entry.product_name}-${index}`} onClick={() => setActiveIndex(index)} className={`min-w-[220px] rounded-xl border p-3 text-left transition ${activeIndex === index ? "border-[#36bee9] bg-white shadow-md" : "border-[#d4e2e6] bg-white/50 hover:bg-white"}`}><p className="text-sm font-bold text-brand-navy">{entry.product_name}</p><p className="mt-1 text-xs text-slate-500">{entry.product_model} · {entry.capacity_value} {entry.capacity_unit}</p></button>)}</div></div>}

    <section id="equipo" className="scroll-mt-20 container-page grid gap-10 py-20 lg:grid-cols-[.85fr_1.15fr] lg:py-28">
      <div><Eyebrow number="01" label="EL EQUIPO" /><h2 className="mt-4 max-w-md text-4xl font-black leading-[.95] tracking-[-.05em] text-[#102b39] sm:text-5xl">La plataforma correcta para una mezcla consistente.</h2><p className="mt-6 max-w-md leading-7 text-slate-600">{profile.description}</p><div className="mt-8 space-y-3">{profile.proof.map((point) => <div key={point} className="flex gap-3 text-sm font-semibold text-[#285062]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#079bc9]" />{point}</div>)}</div></div>
      <div className="rounded-2xl border border-[#cfe0e5] bg-white p-5 shadow-[0_20px_55px_rgba(25,65,82,.09)] sm:p-7"><div className="flex items-center justify-between border-b border-[#e3ecef] pb-4"><div><p className="font-mono text-[10px] tracking-[.16em] text-[#0e95bf]">FICHA DE CONFIGURACIÓN</p><p className="mt-1 text-lg font-black text-brand-navy">{item?.product_model ?? "Configuración a medida"}</p></div><Cog className="h-8 w-8 text-[#50bddd]" /></div><div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[#dce8ec] bg-[#dce8ec] sm:grid-cols-2">{profile.specs.map(([label, value]) => <div key={label} className="bg-white p-4"><p className="font-mono text-[9px] tracking-[.14em] text-slate-400">{label}</p><p className="mt-2 text-sm font-bold leading-5 text-brand-navy">{value}</p></div>)}</div><p className="mt-5 rounded-lg bg-[#f0f8fa] p-3 text-xs leading-5 text-slate-600">Cada especificación se dimensiona conforme al producto, densidad, lote y logística de producción. La configuración final se valida con ingeniería.</p></div>
    </section>

    <section id="proceso" className="scroll-mt-20 overflow-hidden bg-[#09212e] py-20 text-white lg:py-28"><div className="container-page grid gap-12 lg:grid-cols-[1fr_.9fr]"><div><Eyebrow number="02" label="CÓMO TRABAJA" dark /><h2 className="mt-4 max-w-xl text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-5xl">El movimiento que transforma ingredientes en una mezcla uniforme.</h2><p className="mt-6 max-w-xl leading-7 text-slate-300">{profile.process}</p><div className="mt-8 grid gap-3 sm:grid-cols-3"><FlowStep number="01" title="Elevación" text="El producto se levanta desde el fondo." /><FlowStep number="02" title="Cruce" text="Los flujos se encuentran en el centro." /><FlowStep number="03" title="Homogeneidad" text="El ciclo se repite sin puntos muertos." /></div></div><MixDiagram /></div></section>

    <section id="motor" className="scroll-mt-20 container-page grid gap-10 py-20 lg:grid-cols-[.9fr_1.1fr] lg:py-28"><MotorDiagram power={item?.power} /><div><Eyebrow number="03" label="MOTORIZACIÓN & CONTROL" /><h2 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.05em] text-[#102b39] sm:text-5xl">Potencia transmitida con control, no sólo fuerza.</h2><p className="mt-6 leading-7 text-slate-600">El conjunto motriz se selecciona para vencer la carga de tu material y mantener una operación estable. Para esta propuesta, el motorreductor considerado es <strong className="text-brand-navy">{item?.power || "dimensionado por ingeniería"}</strong>.</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><TechCard icon={<Zap />} title="Motorreductor TEFC" text="Montaje horizontal, ventilación exterior y aislamiento clase F." /><TechCard icon={<Gauge />} title="Salida controlada" text={profile.rpm} /><TechCard icon={<ShieldCheck />} title="Protección IP55" text="Preparado para ambientes industriales y servicio continuo." /><TechCard icon={<Wrench />} title="Mantenimiento práctico" text="Caja de conexiones lateral y componentes de transmisión accesibles." /></div></div></section>

    <section id="acabados" className="scroll-mt-20 bg-[#dfeaed] py-20 lg:py-28"><div className="container-page"><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><Eyebrow number="04" label="ACABADOS & CONTACTO" /><h2 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.05em] text-[#102b39] sm:text-5xl">El material también forma parte de la receta.</h2><p className="mt-6 max-w-md leading-7 text-slate-600">Selecciona el nivel de resistencia y sanidad que el proceso exige. La opción cotizada está señalada; puedes compararla aquí antes de aprobar.</p></div><div className="grid gap-4 sm:grid-cols-2">{(["304", "316"] as const).map((grade) => { const selected = finish === grade; const proposed = new RegExp(grade).test(item?.material ?? ""); return <button key={grade} onClick={() => setFinish(grade)} className={`rounded-2xl border p-6 text-left transition ${selected ? "border-[#22b9e8] bg-[#082431] text-white shadow-xl" : "border-white bg-white text-brand-navy hover:border-[#9cdae9]"}`}><div className="flex items-start justify-between"><span className={`font-mono text-xs tracking-[.16em] ${selected ? "text-[#75e1ff]" : "text-[#0b9ac9]"}`}>AISI {grade}</span>{proposed && <span className={`rounded-full px-2 py-1 text-[9px] font-black ${selected ? "bg-cyan-300 text-[#06212e]" : "bg-[#dff6fc] text-[#087da5]"}`}>COTIZADO</span>}</div><p className="mt-8 text-xl font-black">{grade === "304" ? "Equilibrio industrial" : "Resistencia superior"}</p><p className={`mt-3 text-sm leading-6 ${selected ? "text-slate-300" : "text-slate-500"}`}>{grade === "304" ? "Excelente resistencia a corrosión para alimentos, polvos, suplementos y procesos generales." : "Mayor resistencia química para ambientes agresivos, salinos o formulaciones exigentes."}</p><div className={`mt-6 border-t pt-4 text-xs font-bold ${selected ? "border-white/15 text-white" : "border-slate-100 text-brand-navy"}`}>{grade === "304" ? "Acabado sanitario y durable" : "Molibdeno para corrosión localizada"}</div></button>})}</div></div><div className="mt-8 overflow-hidden rounded-2xl border border-[#b8d7df] bg-[#082431]"><div className="grid md:grid-cols-[.9fr_1.1fr]"><ProductVisual name={item?.product_name ?? "Equipo"} material={`Acero inoxidable AISI ${finish}`} capacity={item?.capacity_value} className="min-h-[260px]" /><div className="p-7 text-white"><p className="font-mono text-[10px] tracking-[.16em] text-[#70dffd]">ACABADO EN VISTA</p><h3 className="mt-3 text-2xl font-black">AISI {finish} para las superficies de contacto.</h3><p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">Artesa, tapa, sistema de mezclado y descarga pueden fabricarse en el acero seleccionado; la estructura puede ajustarse en función de la aplicación y el entorno operativo.</p></div></div></div></div></section>

    <section id="inversion" className="scroll-mt-20 bg-[#06141d] py-20 text-white lg:py-28"><div className="container-page"><div className="mx-auto max-w-3xl text-center"><Eyebrow number="05" label="PROPUESTA COMERCIAL" dark /><h2 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-5xl">Tu operación merece una solución que dure.</h2><p className="mx-auto mt-6 max-w-xl leading-7 text-slate-300">Revisa el alcance técnico arriba. Esta es la inversión para llevar esa configuración a tu planta.</p></div><div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/[.05] shadow-[0_28px_80px_rgba(0,0,0,.35)]"><div className="divide-y divide-white/10">{quote.items.map((entry, index) => <div key={`${entry.product_name}-${index}`} className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"><div><p className="font-mono text-[10px] tracking-[.14em] text-[#71dfff]">{String(index + 1).padStart(2, "0")} / EQUIPO</p><p className="mt-1 font-bold">{entry.product_name} {entry.product_model ? `· ${entry.product_model}` : ""}</p><p className="mt-1 text-xs text-slate-400">{entry.capacity_value} {entry.capacity_unit} · {entry.material} · {entry.power || "Configuración estándar"}</p></div><p className="text-xl font-black text-white">{formatCurrency(entry.subtotal)}</p></div>)}</div><div className="grid bg-black/20 p-6 sm:grid-cols-[1fr_auto] sm:items-end"><div className="text-sm leading-7 text-slate-300"><p><strong className="text-white">Incluye:</strong> fabricación, manual de operación y certificado de calidad del acero cuando aplique.</p><p><strong className="text-white">Entrega:</strong> 10 a 12 semanas después del anticipo. Forma de pago: 70% anticipo / 30% al aviso de entrega.</p></div><div className="mt-5 sm:mt-0 sm:text-right"><p className="text-sm text-slate-400">Inversión total con IVA</p><p className="mt-1 text-4xl font-black tracking-[-.05em] text-[#72e0ff]">{formatCurrency(quote.total)}</p><p className="mt-1 font-mono text-[10px] tracking-[.14em] text-slate-400">SUBTOTAL {formatCurrency(quote.subtotal)} · IVA {formatCurrency(quote.tax)}</p></div></div></div>
      {quote.valid_until && isOpen && <div className="mx-auto mt-5 flex max-w-4xl items-center justify-center gap-2 text-center text-xs text-slate-300"><Timer className="h-4 w-4 text-[#70dffd]" />Esta configuración y precio se mantienen vigentes hasta {formatDate(quote.valid_until)}.</div>}
      {quote.status === "accepted" ? <Outcome icon={<CheckCircle2 className="h-5 w-5" />} title="Propuesta aceptada" text={`Confirmaste esta propuesta el ${formatDate(quote.accepted_at!)}. Nuestro equipo se pondrá en contacto contigo.`} /> : quote.status === "rejected" ? <Outcome icon={<Timer className="h-5 w-5" />} title="Propuesta cerrada" text={`Esta propuesta fue rechazada el ${formatDate(quote.rejected_at!)}.`} /> : isOpen ? <QuoteActions token={token} /> : null}
      <p className="mt-9 text-center text-xs text-slate-400">¿Quieres revisar esta configuración con ingeniería? {companyEmail || "tritton@mezcladorasymolinosindustriales.com.mx"} · {companyPhone || "55 3182 3531"}</p>
    </div></section>
  </div>;
}

function buildProfile(item?: PublicQuoteItem) {
  const name = item?.product_name?.toLowerCase() ?? "";
  const mixer = /mezcl|ribbon|cinta|paleta|agitador/.test(name);
  return {
    headline: mixer ? "Mezcla eficiente, repetible y pensada alrededor de las propiedades de tu producto." : "Un equipo industrial configurado para dar control, continuidad y desempeño a tu proceso.",
    description: mixer ? "La artesa horizontal y el sistema de mezclado interno desplazan el producto en direcciones opuestas. Ese recorrido continuo reduce zonas muertas y favorece una mezcla uniforme en ciclos cortos." : "La plataforma se configura para responder a la capacidad, el material de construcción y las condiciones de trabajo de tu operación.",
    proof: mixer ? ["Flujo de mezcla continuo de extremo a centro", "Tapa y descarga configurables para cada producto", "Base estructural para operación y mantenimiento seguros"] : ["Configuración por capacidad y producto a procesar", "Componentes industriales seleccionados para servicio continuo", "Construcción y acabados adaptables a la aplicación"],
    process: mixer ? "Las cintas exteriores elevan el producto y lo conducen de los extremos al centro. Las interiores lo regresan hacia los extremos. El resultado es un movimiento tipo infinito que combina convección y corte para deshacer agrupamientos." : "La energía se transfiere al producto de forma controlada mediante el conjunto motriz y el sistema de proceso correspondiente. Cada configuración se ajusta a la operación, al material y a la capacidad requerida.",
    rpm: mixer ? "Salida final cercana a 60 RPM para un ciclo de mezcla estable, según la configuración de carga." : "Relación de reducción seleccionada para equilibrar torque, velocidad de proceso y consumo energético.",
    specs: [
      ["MODELO", item?.product_model ?? "A medida"],
      ["CAPACIDAD ÚTIL", `${item?.capacity_value ?? "—"} ${item?.capacity_unit ?? ""}`],
      ["MATERIAL", item?.material ?? "Por definir"],
      ["MOTOR", item?.power || "Dimensionado por ingeniería"],
      ["CANTIDAD", `${item?.quantity ?? 1} unidad${item?.quantity === 1 ? "" : "es"}`],
      ["CONTROL", "Arranque, paro y emergencia"],
    ] as [string, string][],
  };
}

function Eyebrow({ number, label, dark = false }: { number: string; label: string; dark?: boolean }) { return <p className={`font-mono text-[10px] tracking-[.2em] ${dark ? "text-[#6cddfb]" : "text-[#0996c1]"}`}>{number} / {label}</p>; }
function HeroMetric({ label, value }: { label: string; value: string }) { return <div className="min-w-0 px-3 py-3 sm:px-4"><p className="font-mono text-[9px] tracking-[.14em] text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-bold text-white">{value}</p></div>; }
function FlowStep({ number, title, text }: { number: string; title: string; text: string }) { return <div className="rounded-xl border border-white/10 bg-white/[.05] p-4"><p className="font-mono text-[10px] text-[#6ddfff]">{number}</p><p className="mt-3 font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div>; }
function TechCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-xl border border-[#d9e7eb] bg-white p-4"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e5f7fc] text-[#078fbc]">{icon}</div><p className="mt-4 text-sm font-bold text-brand-navy">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>; }
function StatusPill({ status }: { status: string }) { const label: Record<string, string> = { accepted: "ACEPTADA", rejected: "CERRADA", viewed: "VISTA", sent: "ENVIADA", draft: "BORRADOR" }; return <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] tracking-wider text-slate-200">{label[status] ?? status}</span>; }
function Outcome({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-xl border border-cyan-200/20 bg-cyan-300/10 p-5 text-cyan-50"><div className="mt-0.5 text-[#75e3ff]">{icon}</div><div><p className="font-bold">{title}</p><p className="mt-1 text-sm text-slate-300">{text}</p></div></div>; }

function MixDiagram() { return <div className="relative flex min-h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-white/[.04] p-6"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(105,220,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(105,220,255,.14)_1px,transparent_1px)] [background-size:32px_32px]" /><svg viewBox="0 0 480 300" className="relative w-full" fill="none"><path d="M84 180C84 129 125 102 176 102H303C354 102 395 129 395 180C395 214 368 238 334 238H145C111 238 84 214 84 180Z" fill="#102d3a" stroke="#8ce5ff" strokeWidth="2"/><path d="M119 147C151 103 184 103 215 147C246 191 278 191 310 147C341 103 373 103 391 140" stroke="#65d9fb" strokeWidth="10" strokeLinecap="round"/><path d="M119 171C151 215 184 215 215 171C246 127 278 127 310 171C341 215 373 215 391 178" stroke="#f0fbff" strokeWidth="8" strokeLinecap="round"/><path d="M65 170H113M368 170H421" stroke="#f0fbff" strokeWidth="14"/><circle cx="55" cy="170" r="26" fill="#1a4354" stroke="#81dcf7" strokeWidth="2"/><path d="M42 170H68M55 157V183" stroke="#81dcf7" strokeWidth="2"/><path d="M86 264H393" stroke="#5b8190" strokeDasharray="5 8"/><path d="M227 238V261M256 238V261" stroke="#a9dfee" strokeWidth="8"/><text x="123" y="71" fill="#8ee5ff" fontSize="12" fontFamily="monospace">FLUJO EN CONTRA DIRECCIÓN</text></svg><div className="absolute bottom-5 left-5 right-5 flex justify-between font-mono text-[10px] tracking-[.14em] text-cyan-100/70"><span>EXTERIOR → CENTRO</span><span>CENTRO → EXTREMOS</span></div></div>; }
function MotorDiagram({ power }: { power?: string | null }) { return <div className="relative overflow-hidden rounded-2xl bg-[#081f2b] p-6 text-white shadow-[0_20px_50px_rgba(7,35,50,.18)]"><div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(112,224,255,.4)_1px,transparent_0)] [background-size:18px_18px]" /><p className="relative font-mono text-[10px] tracking-[.18em] text-[#73e0ff]">CONJUNTO MOTRIZ</p><div className="relative mt-7"><svg viewBox="0 0 480 300" className="w-full" fill="none"><defs><linearGradient id="motorSteel" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d9e8ed"/><stop offset=".45" stopColor="#708b97"/><stop offset="1" stopColor="#233c48"/></linearGradient></defs><rect x="112" y="103" width="205" height="104" rx="26" fill="url(#motorSteel)" stroke="#e8fbff" strokeWidth="2"/><path d="M146 112V198M164 108V202M182 105V205M200 103V207M218 103V207M236 103V207M254 105V205" stroke="#375462" strokeWidth="5"/><circle cx="103" cy="155" r="47" fill="#1e3d4a" stroke="#a9e7fb" strokeWidth="2"/><circle cx="103" cy="155" r="24" stroke="#7bdcf8" strokeWidth="2"/><path d="M80 155H126M103 132V178" stroke="#7bdcf8" strokeWidth="2"/><path d="M317 136H362V174H317" fill="#183746" stroke="#9fe9ff" strokeWidth="2"/><circle cx="372" cy="155" r="28" fill="#223f4b" stroke="#b9f2ff" strokeWidth="2"/><path d="M400 155H444" stroke="#e5f8ff" strokeWidth="10"/><path d="M62 223H401" stroke="#587887" strokeWidth="12"/><path d="M121 223L98 263H143L166 223M331 223L354 263H399L376 223" fill="#284957" stroke="#8bcfe4" strokeWidth="2"/><text x="168" y="151" fill="#102b39" fontSize="20" fontWeight="700">{power ?? "MOTOR"}</text></svg></div><div className="relative mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[.05] p-3 text-xs text-slate-300"><Zap className="h-4 w-4 text-[#70e0ff]" />Motorreductor acoplado al eje mediante transmisión industrial.</div></div>; }

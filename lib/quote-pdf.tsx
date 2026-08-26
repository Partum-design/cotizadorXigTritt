import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

export interface QuotePdfItem {
  productName: string;
  productModel: string | null;
  categoryName?: string | null;
  capacityValue: number | null;
  capacityUnit: string | null;
  material: string | null;
  power: string | null;
  engraving: boolean;
  engravingText: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface QuotePdfSourceItem {
  product_name: string;
  product_model: string | null;
  category_name?: string | null;
  capacity_value: number | null;
  capacity_unit: string | null;
  material: string | null;
  power: string | null;
  engraving: boolean;
  engraving_text: string | null;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}

export function mapQuoteItemsToPdf(items: QuotePdfSourceItem[]): QuotePdfItem[] {
  return items.map((item) => ({
    productName: item.product_name,
    productModel: item.product_model,
    categoryName: item.category_name ?? null,
    capacityValue: item.capacity_value,
    capacityUnit: item.capacity_unit,
    material: item.material,
    power: item.power,
    engraving: item.engraving,
    engravingText: item.engraving_text,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    subtotal: Number(item.subtotal),
  }));
}

export interface QuotePdfData {
  quoteNumber: string;
  status: string;
  createdAt: string | null;
  validUntil: string | null;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  lead: { fullName: string; company: string | null; email: string; phone: string | null };
  items: QuotePdfItem[];
  companyEmail: string;
  companyPhone: string;
}

// Palette mirrors the interactive quote microsite (components/quote/QuoteMicrosite.tsx)
const INK = "#06141d";
const NAVY = "#09212e";
const SLATE = "#102b39";
const CYAN = "#0996c1";
const CYAN_BRIGHT = "#22b9e8";
const CYAN_PALE = "#e5f7fc";
const CARD_BG = "#dfeaed";
const BORDER = "#d4e2e6";
const MUTED = "#64748b";

const money = (amount: number, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value))
    : "—";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  viewed: "Vista",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

function buildEquipmentProfile(item: QuotePdfItem) {
  const name = item.productName.toLowerCase();
  const mixer = /mezcl|ribbon|cinta|paleta|agitador/.test(name);
  return {
    headline: mixer
      ? "Mezcla eficiente, repetible y pensada alrededor de las propiedades de tu producto."
      : "Un equipo industrial configurado para dar control, continuidad y desempeño a tu proceso.",
    description: mixer
      ? "La artesa horizontal y el sistema de mezclado interno desplazan el producto en direcciones opuestas. Ese recorrido continuo reduce zonas muertas y favorece una mezcla uniforme en ciclos cortos."
      : "La plataforma se configura para responder a la capacidad, el material de construcción y las condiciones de trabajo de tu operación.",
    proof: mixer
      ? [
          "Flujo de mezcla continuo de extremo a centro",
          "Tapa y descarga configurables para cada producto",
          "Base estructural para operación y mantenimiento seguros",
        ]
      : [
          "Configuración por capacidad y producto a procesar",
          "Componentes industriales seleccionados para servicio continuo",
          "Construcción y acabados adaptables a la aplicación",
        ],
    process: mixer
      ? "Las cintas exteriores elevan el producto y lo conducen de los extremos al centro. Las interiores lo regresan hacia los extremos. El resultado es un movimiento tipo infinito que combina convección y corte para deshacer agrupamientos."
      : "La energía se transfiere al producto de forma controlada mediante el conjunto motriz y el sistema de proceso correspondiente. Cada configuración se ajusta a la operación, al material y a la capacidad requerida.",
    rpm: mixer
      ? "Salida final cercana a 60 RPM para un ciclo de mezcla estable, según la configuración de carga."
      : "Relación de reducción seleccionada para equilibrar torque, velocidad de proceso y consumo energético.",
    specs: [
      ["MODELO", item.productModel ?? "A medida"],
      ["CAPACIDAD ÚTIL", `${item.capacityValue ?? "—"} ${item.capacityUnit ?? ""}`.trim()],
      ["MATERIAL", item.material ?? "Por definir"],
      ["MOTOR", item.power || "Dimensionado por ingeniería"],
      ["CANTIDAD", `${item.quantity} unidad${item.quantity === 1 ? "" : "es"}`],
      ["CONTROL", "Arranque, paro y emergencia"],
    ] as [string, string][],
  };
}

const styles = StyleSheet.create({
  page: { paddingBottom: 46, fontSize: 9.5, color: SLATE, fontFamily: "Helvetica" },

  // Slim fixed top bar repeated on every page
  topBar: {
    backgroundColor: INK,
    color: "#ffffff",
    paddingHorizontal: 40,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarBrand: { fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  topBarMeta: { fontSize: 8, color: "#9fc2d3" },
  statusPill: {
    fontSize: 6.5,
    color: "#0b2733",
    backgroundColor: "#8fdcff",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 3,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: MUTED },

  // ---------- Hero ----------
  hero: { backgroundColor: INK, color: "#ffffff", paddingHorizontal: 40, paddingTop: 22, paddingBottom: 28 },
  heroTagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: {
    borderWidth: 1,
    borderColor: "#2f5567",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 6.5,
    fontFamily: "Courier-Bold",
    letterSpacing: 1,
    color: "#bdeeff",
  },
  tagMuted: {
    borderWidth: 1,
    borderColor: "#25404d",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 6.5,
    fontFamily: "Courier-Bold",
    letterSpacing: 1,
    color: "#c7d4dc",
  },
  heroCategory: { marginTop: 16, fontSize: 8.5, fontFamily: "Courier-Bold", letterSpacing: 2, color: "#65d5fb" },
  heroTitle: { marginTop: 6, fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff", lineHeight: 1.05 },
  heroHeadline: { marginTop: 10, fontSize: 10.5, color: "#cbd5e1", lineHeight: 1.5, maxWidth: 420 },
  preparedBox: {
    marginTop: 16,
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#1c4456",
    backgroundColor: "#0c2836",
    borderRadius: 8,
    padding: 11,
  },
  preparedLabel: { fontSize: 6.5, fontFamily: "Courier-Bold", letterSpacing: 1.4, color: "#78e1ff" },
  preparedValue: { marginTop: 3, fontSize: 10, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  preparedLine: { marginTop: 2, fontSize: 8, color: "#b6c4cc" },
  heroMetricsRow: {
    marginTop: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#1c3947",
    borderRadius: 8,
    overflow: "hidden",
    maxWidth: 420,
  },
  heroMetric: { flex: 1, paddingVertical: 9, paddingHorizontal: 10, borderRightWidth: 1, borderRightColor: "#1c3947" },
  heroMetricLabel: { fontSize: 6, fontFamily: "Courier-Bold", letterSpacing: 1, color: "#94a8b2" },
  heroMetricValue: { marginTop: 3, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  heroValidity: { marginTop: 14, fontSize: 8, color: "#f3c98e" },

  // ---------- Generic section chrome ----------
  section: { paddingHorizontal: 40, paddingVertical: 20 },
  sectionDark: { paddingHorizontal: 40, paddingVertical: 22, backgroundColor: NAVY, color: "#ffffff" },
  sectionMuted: { paddingHorizontal: 40, paddingVertical: 20, backgroundColor: CARD_BG },
  eyebrow: { fontSize: 8, fontFamily: "Courier-Bold", letterSpacing: 1.6, color: CYAN },
  eyebrowDark: { fontSize: 8, fontFamily: "Courier-Bold", letterSpacing: 1.6, color: "#6cddfb" },
  h2: { marginTop: 6, fontSize: 16, fontFamily: "Helvetica-Bold", color: SLATE, lineHeight: 1.15, maxWidth: 380 },
  h2Dark: { marginTop: 6, fontSize: 16, fontFamily: "Helvetica-Bold", color: "#ffffff", lineHeight: 1.15, maxWidth: 380 },
  bodyText: { marginTop: 8, fontSize: 9, color: "#475569", lineHeight: 1.55, maxWidth: 380 },
  bodyTextDark: { marginTop: 8, fontSize: 9, color: "#c3d3da", lineHeight: 1.55, maxWidth: 380 },

  // ---------- Alcance (multi-item gallery) ----------
  scopeGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  scopeCard: {
    width: "31.3%",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  scopeIndex: { fontSize: 6.5, fontFamily: "Courier-Bold", letterSpacing: 1, color: CYAN },
  scopeName: { marginTop: 4, fontSize: 9, fontFamily: "Helvetica-Bold", color: SLATE },
  scopeMeta: { marginTop: 4, fontSize: 7.5, color: MUTED },

  // ---------- Ficha técnica ----------
  equipoRow: { marginTop: 12, flexDirection: "row", gap: 18 },
  equipoLeft: { flex: 0.85 },
  equipoRight: { flex: 1.15 },
  proofRow: { marginTop: 10, flexDirection: "row", gap: 6, alignItems: "flex-start" },
  proofDot: { marginTop: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: CYAN_BRIGHT },
  proofText: { flex: 1, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#285062", lineHeight: 1.4 },
  specCard: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: "hidden", backgroundColor: "#ffffff" },
  specHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e3ecef",
    padding: 10,
  },
  specHeadLabel: { fontSize: 7, fontFamily: "Courier-Bold", letterSpacing: 1, color: CYAN },
  specHeadValue: { marginTop: 2, fontSize: 10, fontFamily: "Helvetica-Bold", color: SLATE },
  specGrid: { flexDirection: "row", flexWrap: "wrap" },
  specBox: { width: "50%", padding: 9, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#eef3f4" },
  specBoxLabel: { fontSize: 6, fontFamily: "Courier-Bold", letterSpacing: 1, color: "#94a3b8" },
  specBoxValue: { marginTop: 3, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: SLATE },
  engravingNote: { marginTop: 8, fontSize: 7.5, color: MUTED, fontStyle: "italic" },

  // ---------- Proceso (dark) ----------
  flowRow: { marginTop: 12, flexDirection: "row", gap: 8 },
  flowCard: { flex: 1, borderWidth: 1, borderColor: "#1c3947", borderRadius: 6, backgroundColor: "#0c2836", padding: 9 },
  flowNumber: { fontSize: 7, fontFamily: "Courier-Bold", color: "#6ddfff" },
  flowTitle: { marginTop: 6, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  flowText: { marginTop: 3, fontSize: 7, color: "#9fb3bc", lineHeight: 1.4 },

  // ---------- Motorización tech cards ----------
  techGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  techCard: { width: "48.5%", borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 9, backgroundColor: "#ffffff" },
  techBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: CYAN_PALE,
  },
  techTitle: { marginTop: 7, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: SLATE },
  techText: { marginTop: 3, fontSize: 7.5, color: MUTED, lineHeight: 1.4 },

  // ---------- Acabados ----------
  finishRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  finishCard: { borderRadius: 8, padding: 12, borderWidth: 1 },
  finishCardHalf: { flex: 1 },
  finishCardFull: { marginTop: 12 },
  finishCardSelected: { backgroundColor: "#082431", borderColor: CYAN_BRIGHT },
  finishCardIdle: { backgroundColor: "#ffffff", borderColor: BORDER },
  finishGrade: { fontSize: 8, fontFamily: "Courier-Bold", letterSpacing: 1 },
  finishBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#dff6fc",
    color: "#087da5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  finishTitle: { marginTop: 10, fontSize: 11, fontFamily: "Helvetica-Bold" },
  finishText: { marginTop: 5, fontSize: 7.5, lineHeight: 1.4 },

  // ---------- Line pricing per item ----------
  lineRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  lineLabel: { fontSize: 7.5, color: MUTED },
  lineValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: SLATE },

  // ---------- Inversión ----------
  investList: { marginTop: 16, borderWidth: 1, borderColor: "#1c3947", borderRadius: 8, overflow: "hidden" },
  investItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1c3947",
  },
  investItemIndex: { fontSize: 6.5, fontFamily: "Courier-Bold", letterSpacing: 1, color: "#71dfff" },
  investItemName: { marginTop: 3, fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  investItemMeta: { marginTop: 3, fontSize: 7.5, color: "#94a3b8" },
  investItemPrice: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  investFooter: { backgroundColor: "rgba(0,0,0,0.25)", padding: 14, flexDirection: "row", justifyContent: "space-between" },
  investFooterText: { fontSize: 8, color: "#cbd5e1", lineHeight: 1.6, maxWidth: 260 },
  investTotalLabel: { fontSize: 8, color: "#94a3b8", textAlign: "right" },
  investTotalValue: { marginTop: 3, fontSize: 22, fontFamily: "Helvetica-Bold", color: "#72e0ff", textAlign: "right" },
  investBreakdown: { marginTop: 3, fontSize: 7, fontFamily: "Courier", color: "#94a3b8", textAlign: "right" },
  validityBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#1c3947",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  validityText: { fontSize: 8, color: "#cbd5e1" },
  validityStrong: { fontSize: 8, fontFamily: "Courier-Bold", color: "#83e4ff" },
  contactLine: { marginTop: 16, fontSize: 7.5, color: "#94a3b8", textAlign: "center" },
});

function specLine(item: QuotePdfItem) {
  const parts = [
    item.capacityValue != null ? `${item.capacityValue} ${item.capacityUnit ?? ""}`.trim() : null,
    item.material,
    item.power,
  ].filter(Boolean);
  return parts.join(" · ") || "—";
}

function TopBar({ data }: { data: QuotePdfData }) {
  return (
    <View style={styles.topBar} fixed>
      <View>
        <Text style={styles.topBarBrand}>TRITTÓN</Text>
        <Text style={styles.topBarMeta}>{data.quoteNumber}</Text>
      </View>
      <Text style={styles.statusPill}>{(STATUS_LABEL[data.status] ?? data.status).toUpperCase()}</Text>
    </View>
  );
}

function Footer({ data }: { data: QuotePdfData }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        TRITTÓN · {data.companyPhone} · {data.companyEmail}
      </Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  );
}

function Hero({ data }: { data: QuotePdfData }) {
  const primary = data.items[0];
  const profile = primary ? buildEquipmentProfile(primary) : null;
  const recipient = data.lead.company ? `${data.lead.fullName} · ${data.lead.company}` : data.lead.fullName;

  return (
    <View style={styles.hero}>
      <View style={styles.heroTagsRow}>
        <Text style={styles.tag}>PROPUESTA TÉCNICA / {data.quoteNumber}</Text>
        <Text style={styles.tagMuted}>
          {data.items.length} {data.items.length === 1 ? "EQUIPO" : "EQUIPOS"}
        </Text>
      </View>

      <Text style={styles.heroCategory}>{primary?.categoryName?.toUpperCase() ?? "EQUIPO INDUSTRIAL"}</Text>
      <Text style={styles.heroTitle}>{primary?.productName ?? "Solución industrial"}</Text>
      {profile ? <Text style={styles.heroHeadline}>{profile.headline}</Text> : null}

      <View style={styles.preparedBox}>
        <Text style={styles.preparedLabel}>PREPARADA PARA</Text>
        <Text style={styles.preparedValue}>{recipient}</Text>
        <Text style={styles.preparedLine}>{data.lead.email}</Text>
        {data.lead.phone ? <Text style={styles.preparedLine}>{data.lead.phone}</Text> : null}
      </View>

      {primary ? (
        <View style={styles.heroMetricsRow}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>MODELO</Text>
            <Text style={styles.heroMetricValue}>{primary.productModel ?? "A medida"}</Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>CAPACIDAD</Text>
            <Text style={styles.heroMetricValue}>
              {primary.capacityValue ?? "—"} {primary.capacityUnit ?? ""}
            </Text>
          </View>
          <View style={[styles.heroMetric, { borderRightWidth: 0 }]}>
            <Text style={styles.heroMetricLabel}>MOTOR</Text>
            <Text style={styles.heroMetricValue}>{primary.power || "Según carga"}</Text>
          </View>
        </View>
      ) : null}

      {data.validUntil ? <Text style={styles.heroValidity}>Vigente hasta el {date(data.validUntil)}</Text> : null}
    </View>
  );
}

function ScopeSection({ data }: { data: QuotePdfData }) {
  if (data.items.length <= 1) return null;
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.eyebrow}>ALCANCE DEL SUMINISTRO</Text>
      <Text style={styles.h2}>Una solución compuesta por {data.items.length} equipos.</Text>
      <View style={styles.scopeGrid}>
        {data.items.map((entry, index) => (
          <View key={`${entry.productName}-${index}`} style={styles.scopeCard}>
            <Text style={styles.scopeIndex}>EQUIPO {String(index + 1).padStart(2, "0")}</Text>
            <Text style={styles.scopeName}>{entry.productName}</Text>
            <Text style={styles.scopeMeta}>
              {entry.productModel ? `${entry.productModel} · ` : ""}
              {entry.capacityValue ?? "—"} {entry.capacityUnit ?? ""}
            </Text>
            <Text style={styles.scopeMeta}>{entry.material} · {entry.power || "Configuración estándar"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EquipoSection({ item, index, total, currency }: { item: QuotePdfItem; index: number; total: number; currency: string }) {
  const profile = buildEquipmentProfile(item);
  const isStainless = /304|316/i.test(item.material ?? "");
  const grade316 = /316/i.test(item.material ?? "");

  return (
    <View break={index > 0}>
      {/* El equipo */}
      <View style={styles.section}>
        <Text style={styles.eyebrow}>
          {total > 1 ? `EQUIPO ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}` : "EL EQUIPO"}
        </Text>
        <Text style={styles.h2}>{item.productName}</Text>

        <View style={styles.equipoRow}>
          <View style={styles.equipoLeft}>
            <Text style={styles.bodyText}>{profile.description}</Text>
            {profile.proof.map((point) => (
              <View key={point} style={styles.proofRow}>
                <View style={styles.proofDot} />
                <Text style={styles.proofText}>{point}</Text>
              </View>
            ))}
          </View>
          <View style={styles.equipoRight}>
            <View style={styles.specCard}>
              <View style={styles.specHead}>
                <View>
                  <Text style={styles.specHeadLabel}>FICHA DE CONFIGURACIÓN</Text>
                  <Text style={styles.specHeadValue}>{item.productModel ?? "Configuración a medida"}</Text>
                </View>
              </View>
              <View style={styles.specGrid}>
                {profile.specs.map(([label, value]) => (
                  <View key={label} style={styles.specBox}>
                    <Text style={styles.specBoxLabel}>{label}</Text>
                    <Text style={styles.specBoxValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
            {item.engraving && item.engravingText ? (
              <Text style={styles.engravingNote}>Grabado personalizado: &quot;{item.engravingText}&quot;</Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Proceso */}
      <View style={styles.sectionDark} wrap={false}>
        <Text style={styles.eyebrowDark}>CÓMO TRABAJA</Text>
        <Text style={styles.h2Dark}>El movimiento que transforma el producto en una mezcla uniforme.</Text>
        <Text style={styles.bodyTextDark}>{profile.process}</Text>
        <View style={styles.flowRow}>
          <View style={styles.flowCard}>
            <Text style={styles.flowNumber}>01</Text>
            <Text style={styles.flowTitle}>Elevación</Text>
            <Text style={styles.flowText}>El producto se levanta desde el fondo.</Text>
          </View>
          <View style={styles.flowCard}>
            <Text style={styles.flowNumber}>02</Text>
            <Text style={styles.flowTitle}>Cruce</Text>
            <Text style={styles.flowText}>Los flujos se encuentran en el centro.</Text>
          </View>
          <View style={styles.flowCard}>
            <Text style={styles.flowNumber}>03</Text>
            <Text style={styles.flowTitle}>Homogeneidad</Text>
            <Text style={styles.flowText}>El ciclo se repite sin puntos muertos.</Text>
          </View>
        </View>
      </View>

      {/* Motorización */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.eyebrow}>MOTORIZACIÓN &amp; CONTROL</Text>
        <Text style={styles.h2}>Potencia transmitida con control, no sólo fuerza.</Text>
        <Text style={styles.bodyText}>
          El conjunto motriz se selecciona para vencer la carga del material y mantener una operación estable. Para
          esta propuesta, el motorreductor considerado es {item.power || "dimensionado por ingeniería"}.
        </Text>
        <View style={styles.techGrid}>
          <View style={styles.techCard}>
            <View style={styles.techBadge} />
            <Text style={styles.techTitle}>Motorreductor TEFC</Text>
            <Text style={styles.techText}>Montaje horizontal, ventilación exterior y aislamiento clase F.</Text>
          </View>
          <View style={styles.techCard}>
            <View style={styles.techBadge} />
            <Text style={styles.techTitle}>Salida controlada</Text>
            <Text style={styles.techText}>{profile.rpm}</Text>
          </View>
          <View style={styles.techCard}>
            <View style={styles.techBadge} />
            <Text style={styles.techTitle}>Protección IP55</Text>
            <Text style={styles.techText}>Preparado para ambientes industriales y servicio continuo.</Text>
          </View>
          <View style={styles.techCard}>
            <View style={styles.techBadge} />
            <Text style={styles.techTitle}>Mantenimiento práctico</Text>
            <Text style={styles.techText}>Caja de conexiones lateral y componentes de transmisión accesibles.</Text>
          </View>
        </View>
      </View>

      {/* Acabados */}
      <View style={styles.sectionMuted} wrap={false}>
        <Text style={styles.eyebrow}>ACABADOS</Text>
        <Text style={styles.h2}>El material también forma parte de la receta.</Text>
        {isStainless ? (
          <View style={styles.finishRow}>
            {(["304", "316"] as const).map((grade) => {
              const selected = grade === "316" ? grade316 : !grade316;
              return (
                <View
                  key={grade}
                  style={[styles.finishCard, styles.finishCardHalf, selected ? styles.finishCardSelected : styles.finishCardIdle]}
                >
                  <Text style={[styles.finishGrade, { color: selected ? "#75e1ff" : CYAN }]}>AISI {grade}</Text>
                  {selected ? <Text style={styles.finishBadge}>COTIZADO</Text> : null}
                  <Text style={[styles.finishTitle, { color: selected ? "#ffffff" : SLATE }]}>
                    {grade === "304" ? "Equilibrio industrial" : "Resistencia superior"}
                  </Text>
                  <Text style={[styles.finishText, { color: selected ? "#cbd5e1" : MUTED }]}>
                    {grade === "304"
                      ? "Excelente resistencia a corrosión para alimentos, polvos, suplementos y procesos generales."
                      : "Mayor resistencia química para ambientes agresivos, salinos o formulaciones exigentes."}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.finishCard, styles.finishCardIdle, styles.finishCardFull]}>
            <Text style={[styles.finishGrade, { color: CYAN }]}>MATERIAL COTIZADO</Text>
            <Text style={[styles.finishTitle, { color: SLATE }]}>{item.material ?? "Por definir"}</Text>
            <Text style={[styles.finishText, { color: MUTED }]}>
              La estructura y las superficies de contacto se fabrican en el material seleccionado para esta propuesta.
            </Text>
          </View>
        )}

        <View style={styles.lineRow} wrap={false}>
          <View>
            <Text style={styles.lineLabel}>
              {item.quantity} × {money(item.unitPrice, currency)} · {specLine(item)}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 8, color: MUTED }}>Importe de este equipo</Text>
          </View>
          <Text style={styles.lineValue}>{money(item.subtotal, currency)}</Text>
        </View>
      </View>
    </View>
  );
}

function InvestmentSection({ data }: { data: QuotePdfData }) {
  return (
    <View style={styles.sectionDark} break>
      <Text style={styles.eyebrowDark}>PROPUESTA COMERCIAL</Text>
      <Text style={styles.h2Dark}>Tu operación merece una solución que dure.</Text>
      <Text style={styles.bodyTextDark}>
        Revisa el alcance técnico de esta propuesta en las páginas anteriores. Esta es la inversión para llevar esa
        configuración a tu planta.
      </Text>

      <View style={styles.investList}>
        {data.items.map((entry, index) => (
          <View key={`${entry.productName}-${index}`} style={[styles.investItemRow, index === data.items.length - 1 ? { borderBottomWidth: 0 } : undefined]} wrap={false}>
            <View>
              <Text style={styles.investItemIndex}>{String(index + 1).padStart(2, "0")} / EQUIPO</Text>
              <Text style={styles.investItemName}>
                {entry.productName}
                {entry.productModel ? ` · ${entry.productModel}` : ""}
              </Text>
              <Text style={styles.investItemMeta}>
                {entry.capacityValue ?? "—"} {entry.capacityUnit ?? ""} · {entry.material} ·{" "}
                {entry.power || "Configuración estándar"}
              </Text>
            </View>
            <Text style={styles.investItemPrice}>{money(entry.subtotal, data.currency)}</Text>
          </View>
        ))}
        <View style={styles.investFooter} wrap={false}>
          <Text style={styles.investFooterText}>
            Incluye fabricación, manual de operación y certificado de calidad del acero cuando aplique. Entrega
            estimada de 10 a 12 semanas después del anticipo. Forma de pago: 70% anticipo / 30% al aviso de entrega.
          </Text>
          <View>
            <Text style={styles.investTotalLabel}>Inversión total con IVA</Text>
            <Text style={styles.investTotalValue}>{money(data.total, data.currency)}</Text>
            <Text style={styles.investBreakdown}>
              SUBTOTAL {money(data.subtotal, data.currency)} · IVA {money(data.tax, data.currency)}
            </Text>
          </View>
        </View>
      </View>

      {data.validUntil ? (
        <View style={styles.validityBox} wrap={false}>
          <Text style={styles.validityText}>Esta configuración se mantiene vigente hasta {date(data.validUntil)}.</Text>
          <Text style={styles.validityStrong}>{(STATUS_LABEL[data.status] ?? data.status).toUpperCase()}</Text>
        </View>
      ) : null}

      <Text style={styles.contactLine}>
        ¿Quieres revisar esta configuración con ingeniería? {data.companyEmail} · {data.companyPhone}
      </Text>
    </View>
  );
}

export function QuotePdfDocument({ data }: { data: QuotePdfData }) {
  return (
    <Document title={`Cotización ${data.quoteNumber}`} author="TRITTÓN">
      <Page size="A4" style={styles.page}>
        <TopBar data={data} />
        <Hero data={data} />
        <ScopeSection data={data} />
        {data.items.map((item, index) => (
          <EquipoSection key={`${item.productName}-${index}`} item={item} index={index} total={data.items.length} currency={data.currency} />
        ))}
        <InvestmentSection data={data} />
        <Footer data={data} />
      </Page>
    </Document>
  );
}

export async function renderQuotePdf(data: QuotePdfData): Promise<Buffer> {
  return renderToBuffer(<QuotePdfDocument data={data} />);
}

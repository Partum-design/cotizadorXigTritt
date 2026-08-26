import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

export interface QuotePdfItem {
  productName: string;
  productModel: string | null;
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

const NAVY = "#16232b";
const BLUE = "#1e4d64";
const LIGHT_BLUE = "#e5f3f8";
const BORDER = "#dbe4e8";
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

const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 56, paddingHorizontal: 0, fontSize: 9.5, color: NAVY, fontFamily: "Helvetica" },
  header: {
    backgroundColor: BLUE,
    color: "#ffffff",
    paddingHorizontal: 40,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  brandSub: { fontSize: 8, color: "#bfe0ee", marginTop: 3, textTransform: "uppercase", letterSpacing: 1 },
  headerRight: { alignItems: "flex-end" },
  quoteNumber: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  statusPill: {
    marginTop: 6,
    fontSize: 7.5,
    color: "#0b2733",
    backgroundColor: "#8fdcff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  body: { paddingHorizontal: 40, paddingTop: 24 },
  infoRow: { flexDirection: "row", gap: 24, marginBottom: 20 },
  infoBlock: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 12 },
  infoLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5 },
  infoValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY },
  infoLine: { fontSize: 9, color: "#334155", marginTop: 2 },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 },
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden" },
  tableHeadRow: { flexDirection: "row", backgroundColor: NAVY },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER },
  th: { color: "#ffffff", fontSize: 7.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", padding: 7, letterSpacing: 0.3 },
  td: { fontSize: 9, padding: 7, color: "#1e293b" },
  tdMuted: { fontSize: 7.5, color: MUTED, marginTop: 1 },
  colProduct: { width: "34%" },
  colSpec: { width: "24%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "16%", textAlign: "right" },
  colSubtotal: { width: "16%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalsBox: { width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsLabel: { fontSize: 9, color: MUTED },
  totalsValue: { fontSize: 9, color: NAVY },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: LIGHT_BLUE,
    borderRadius: 4,
  },
  grandLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY },
  grandValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: BLUE },
  noticeBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 4,
  },
  noticeText: { fontSize: 8.5, color: "#9a3412", lineHeight: 1.4 },
  terms: { marginTop: 16, fontSize: 8.5, color: "#475569", lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: MUTED },
});

function specLine(item: QuotePdfItem) {
  const parts = [
    item.capacityValue != null ? `${item.capacityValue} ${item.capacityUnit ?? ""}`.trim() : null,
    item.material,
    item.power,
  ].filter(Boolean);
  return parts.join(" · ") || "—";
}

export function QuotePdfDocument({ data }: { data: QuotePdfData }) {
  const recipient = data.lead.company ? `${data.lead.fullName} · ${data.lead.company}` : data.lead.fullName;

  return (
    <Document title={`Cotización ${data.quoteNumber}`} author="TRITTÓN">
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.brand}>TRITTÓN</Text>
            <Text style={styles.brandSub}>Mezcladoras &amp; Trituradoras Industriales</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteNumber}>{data.quoteNumber}</Text>
            <Text style={styles.statusPill}>{(STATUS_LABEL[data.status] ?? data.status).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Preparada para</Text>
              <Text style={styles.infoValue}>{recipient}</Text>
              <Text style={styles.infoLine}>{data.lead.email}</Text>
              {data.lead.phone ? <Text style={styles.infoLine}>{data.lead.phone}</Text> : null}
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Detalles de la propuesta</Text>
              <Text style={styles.infoLine}>Fecha: {date(data.createdAt)}</Text>
              <Text style={styles.infoLine}>Válida hasta: {date(data.validUntil)}</Text>
              <Text style={styles.infoLine}>Moneda: {data.currency}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Equipos cotizados</Text>
          <View style={styles.table}>
            <View style={styles.tableHeadRow}>
              <Text style={[styles.th, styles.colProduct]}>Equipo</Text>
              <Text style={[styles.th, styles.colSpec]}>Configuración</Text>
              <Text style={[styles.th, styles.colQty]}>Cant.</Text>
              <Text style={[styles.th, styles.colPrice]}>P. Unitario</Text>
              <Text style={[styles.th, styles.colSubtotal]}>Importe</Text>
            </View>
            {data.items.map((item, index) => (
              <View style={styles.tableRow} key={index} wrap={false}>
                <View style={styles.colProduct}>
                  <Text style={styles.td}>
                    {item.productName}
                    {item.productModel ? ` · ${item.productModel}` : ""}
                  </Text>
                  {item.engraving && item.engravingText ? (
                    <Text style={[styles.tdMuted, { paddingHorizontal: 7 }]}>Grabado: &quot;{item.engravingText}&quot;</Text>
                  ) : null}
                </View>
                <Text style={[styles.td, styles.colSpec]}>{specLine(item)}</Text>
                <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.td, styles.colPrice]}>{money(item.unitPrice, data.currency)}</Text>
                <Text style={[styles.td, styles.colSubtotal]}>{money(item.subtotal, data.currency)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalsBox}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>{money(data.subtotal, data.currency)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>IVA (16%)</Text>
                <Text style={styles.totalsValue}>{money(data.tax, data.currency)}</Text>
              </View>
              <View style={styles.grandRow}>
                <Text style={styles.grandLabel}>Total</Text>
                <Text style={styles.grandValue}>{money(data.total, data.currency)}</Text>
              </View>
            </View>
          </View>

          {data.validUntil ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Esta cotización es válida hasta el {date(data.validUntil)}. Después de esta fecha no podemos
                garantizar el precio ni la disponibilidad del equipo.
              </Text>
            </View>
          ) : null}

          <Text style={styles.terms}>
            Incluye fabricación, manual de operación y certificado de calidad del acero cuando aplique. Entrega
            estimada de 10 a 12 semanas después del anticipo. Forma de pago: 70% anticipo / 30% al aviso de entrega.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            TRITTÓN · {data.companyPhone} · {data.companyEmail}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

export async function renderQuotePdf(data: QuotePdfData): Promise<Buffer> {
  return renderToBuffer(<QuotePdfDocument data={data} />);
}

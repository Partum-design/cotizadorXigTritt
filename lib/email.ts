import { Resend } from "resend";
import { formatCurrency, formatDate } from "@/lib/utils";

interface QuoteItemForEmail {
  product_name: string;
  product_model: string | null;
  capacity_value: number | null;
  capacity_unit: string | null;
  material: string | null;
  power: string | null;
  engraving: boolean;
  engraving_text: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface QuoteEmailData {
  token: string;
  quoteNumber: string;
  leadName: string;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  items: QuoteItemForEmail[];
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function itemRow(item: QuoteItemForEmail) {
  const configParts = [
    item.capacity_value != null ? `${item.capacity_value} ${item.capacity_unit ?? ""}`.trim() : null,
    item.material,
    item.power,
    item.engraving ? `Grabado: "${item.engraving_text ?? ""}"` : null,
  ].filter(Boolean);

  return `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid #e2e8ec;">
      <div style="font-weight:600;color:#16232b;font-size:14px;">${item.product_name}${item.product_model ? ` &middot; ${item.product_model}` : ""}</div>
      <div style="color:#64748b;font-size:12px;margin-top:2px;">${configParts.join(" &middot; ")}</div>
      <div style="color:#64748b;font-size:12px;">Cantidad: ${item.quantity}</div>
    </td>
    <td style="padding:12px 0;border-bottom:1px solid #e2e8ec;text-align:right;white-space:nowrap;font-weight:600;color:#16232b;font-size:14px;">
      ${formatCurrency(item.subtotal)}
    </td>
  </tr>`;
}

export function buildQuoteEmailHtml(data: QuoteEmailData, hasPdf: boolean) {
  const viewUrl = `${SITE_URL}/api/track/click/${data.token}?to=${encodeURIComponent(`/cotizacion/${data.token}`)}`;
  const pixelUrl = `${SITE_URL}/api/track/open/${data.token}`;

  return `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f4f6f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#1e4d64;padding:24px 32px;">
          <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:0.5px;">TRITT&Oacute;N</span>
          <div style="color:#9fc2d3;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Mezcladoras &amp; Trituradoras Industriales</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 4px;font-size:20px;color:#16232b;">Tu cotizaci&oacute;n ${data.quoteNumber}</h1>
          <p style="color:#475569;font-size:14px;line-height:1.6;">Hola ${data.leadName}, gracias por tu inter&eacute;s. Aqu&iacute; tienes el resumen de tu cotizaci&oacute;n${hasPdf ? "; te la adjuntamos tambi&eacute;n en PDF" : ""}:</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            ${data.items.map(itemRow).join("")}
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="padding:4px 0;color:#64748b;font-size:13px;">Subtotal</td><td style="text-align:right;font-size:13px;color:#16232b;">${formatCurrency(data.subtotal)}</td></tr>
            <tr><td style="padding:4px 0;color:#64748b;font-size:13px;">IVA (16%)</td><td style="text-align:right;font-size:13px;color:#16232b;">${formatCurrency(data.tax)}</td></tr>
            <tr><td style="padding:8px 0;color:#16232b;font-size:16px;font-weight:700;">Total</td><td style="text-align:right;font-size:18px;font-weight:800;color:#1e4d64;">${formatCurrency(data.total)}</td></tr>
          </table>

          <div style="margin-top:20px;padding:14px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;color:#9a3412;font-size:13px;">
            &#9203; Esta cotizaci&oacute;n es v&aacute;lida por 72 horas, hasta el <strong>${formatDate(data.validUntil)}</strong>. Despu&eacute;s de ese plazo no podemos garantizar el precio.
          </div>

          <div style="text-align:center;margin-top:28px;">
            <a href="${viewUrl}" style="display:inline-block;background:#3689b2;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;">Ver mi cotizaci&oacute;n y aceptar</a>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:24px;">N&uacute;mero de cotizaci&oacute;n: ${data.quoteNumber}</p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;color:#94a3b8;font-size:11px;text-align:center;">
          TRITT&Oacute;N &middot; ${process.env.NEXT_PUBLIC_COMPANY_PHONE} &middot; ${process.env.NEXT_PUBLIC_COMPANY_EMAIL}
        </td></tr>
      </table>
    </td></tr>
  </table>
  <img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />
</body>
</html>`;
}

export async function sendQuoteEmail(to: string, data: QuoteEmailData, pdfBuffer?: Buffer | null) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY no configurado; se omite el envío del correo.");
    return { sent: false, reason: "missing_api_key" as const };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "TRITTON Cotizaciones <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Tu cotización ${data.quoteNumber} · TRITTÓN`,
      html: buildQuoteEmailHtml(data, Boolean(pdfBuffer)),
      attachments: pdfBuffer
        ? [{ filename: `Cotizacion-${data.quoteNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }]
        : undefined,
    });
    return { sent: true as const };
  } catch (err) {
    console.error("[email] Error enviando cotización:", err);
    return { sent: false, reason: "send_error" as const };
  }
}

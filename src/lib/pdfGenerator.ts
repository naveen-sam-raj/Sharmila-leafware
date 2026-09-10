import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Order, BusinessSettings } from '@/types';

async function getTemplateDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('/invoice-template.png');
      }
    };
    img.onerror = () => resolve('/invoice-template.png');
    img.src = '/invoice-template.png';
  });
}

function buildTemplateOverlayHtml(order: Order, _settings: BusinessSettings, bgDataUrl: string): string {
  const invoiceNo = order.invoiceNumber || order.orderId;
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // ─────────────────────────────────────────────────────────────────────
  // COORDINATE SYSTEM
  //   Template PNG original: 682 × 1024 px
  //   Rendered canvas:        794 × 1123 px
  //   Scale X = 794/682  = 1.1642
  //   Scale Y = 1123/1024 = 1.0967
  //
  // All Y values are measured from the underline centre in the original
  // image and multiplied by 1.0967.
  // All X values are measured from the left edge of the original image
  // and multiplied by 1.1642.
  // ─────────────────────────────────────────────────────────────────────

  // ── Invoice meta (top-right) ──────────────────────────────────────────
  // Original Y underline centres: 197, 228, 259, 290  → scaled ×1.0967
  const metaX = 490;          // original ~421px → scaled 490
  const metaY = [216, 250, 283, 317]; // Invoice No, Date, Order No, Order Date

  // ── Bill To ───────────────────────────────────────────────────────────
  // Original Y: Name ~363, Addr1 ~393, Addr2 ~416, Phone ~453 → scaled
  const billToX        = 155;
  const billToNameY    = 398;
  const billToAddrY    = 431;
  const billToPhoneY   = 497;

  // ── Product table ─────────────────────────────────────────────────────
  // Row 1 Y (original ~507px → 556); row height (original ~25px → 27.4)
  const tableStartY = 556;
  const rowH        = 27.4;

  // Column X positions (original measured → scaled ×1.1642)
  // ITEM NAME:  original text-start ~72px  → 84
  // SIZE:       original col-centre ~347px → 404   (text-align centre)
  // QUANTITY:   original col-centre ~427px → 497   (text-align centre)
  // AMOUNT:     original after-₹    ~510px → 594   (text after pre-printed ₹)
  const colItemX = 75;
  const colSizeX = 310;   // left of SIZE column; we'll text-align centre inside 80px
  const colQtyX  = 395;   // left of QTY column; text-align centre inside 75px
  const colAmtX  = 590;   // starts right after pre-printed ₹

  // ── Totals ────────────────────────────────────────────────────────────
  // Original Y centres: Subtotal ~775, Delivery ~806, Grand Total ~836 → scaled
  // Original X after ₹: ~510px → scaled 594
  const subtotalY    = 850;
  const deliveryY    = 882;
  const grandTotalY  = 914;
  const totalsX      = 594;
  const totalsW      = 160;

  // ── Build item rows ───────────────────────────────────────────────────
  const itemRowsHtml: string[] = [];
  for (let i = 0; i < 10; i++) {
    const item = order.items[i];
    if (!item) break;
    const y = Math.round(tableStartY + i * rowH);
    itemRowsHtml.push(`
      <div style="position:absolute;top:${y}px;left:${colItemX}px;width:232px;
        font-size:11px;font-weight:700;color:#111;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.1;">
        ${item.productName}
      </div>
      <div style="position:absolute;top:${y}px;left:${colSizeX}px;width:82px;
        text-align:center;font-size:11px;font-weight:700;color:#111;line-height:1.1;">
        ${item.size || '-'}
      </div>
      <div style="position:absolute;top:${y}px;left:${colQtyX}px;width:76px;
        text-align:center;font-size:11px;font-weight:700;color:#111;line-height:1.1;">
        ${item.quantity}
      </div>
      <div style="position:absolute;top:${y}px;left:${colAmtX}px;width:130px;
        text-align:left;font-size:11px;font-weight:700;color:#111;line-height:1.1;">
        ${item.total.toLocaleString('en-IN')}
      </div>
    `);
  }

  // ── Totals values ─────────────────────────────────────────────────────
  const subtotalStr   = order.subtotal.toLocaleString('en-IN');
  const deliveryStr   = (order.transportCharge || 0).toLocaleString('en-IN');
  const grandTotalStr = order.grandTotal.toLocaleString('en-IN');

  // ── Customer line (name + optional company) ───────────────────────────
  const customerLine = [
    order.customerName,
    order.companyName ? `(${order.companyName})` : '',
  ].filter(Boolean).join(' ');

  return `
    <div style="
      width:794px;height:1123px;position:relative;
      background:#fff;overflow:hidden;
      font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
      box-sizing:border-box;">

      <!-- ① Template background image (fills 100%) -->
      <img src="${bgDataUrl}" style="
        position:absolute;top:0;left:0;
        width:794px;height:1123px;
        object-fit:fill;z-index:1;" />

      <!-- ② Dynamic data overlay -->
      <div style="position:absolute;top:0;left:0;width:794px;height:1123px;z-index:2;">

        <!-- Invoice meta (top-right) -->
        <div style="position:absolute;top:${metaY[0]}px;left:${metaX}px;width:185px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${invoiceNo}
        </div>
        <div style="position:absolute;top:${metaY[1]}px;left:${metaX}px;width:185px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${dateStr}
        </div>
        <div style="position:absolute;top:${metaY[2]}px;left:${metaX}px;width:185px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${order.orderId}
        </div>
        <div style="position:absolute;top:${metaY[3]}px;left:${metaX}px;width:185px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${dateStr}
        </div>

        <!-- Bill To: Name -->
        <div style="position:absolute;top:${billToNameY}px;left:${billToX}px;width:490px;
          font-size:12px;font-weight:700;color:#111;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1;">
          ${customerLine}
        </div>

        <!-- Bill To: Address (wraps up to 2 lines) -->
        <div style="position:absolute;top:${billToAddrY}px;left:${billToX}px;width:490px;
          font-size:11.5px;font-weight:600;color:#111;
          line-height:1.55;max-height:52px;overflow:hidden;">
          ${order.address || ''}
        </div>

        <!-- Bill To: Phone -->
        <div style="position:absolute;top:${billToPhoneY}px;left:${billToX}px;width:280px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;line-height:1;">
          ${order.phone}
        </div>

        <!-- Product rows -->
        ${itemRowsHtml.join('')}

        <!-- Totals: Subtotal -->
        <div style="position:absolute;top:${subtotalY}px;left:${totalsX}px;width:${totalsW}px;
          text-align:left;font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${subtotalStr}
        </div>

        <!-- Totals: Delivery charges -->
        <div style="position:absolute;top:${deliveryY}px;left:${totalsX}px;width:${totalsW}px;
          text-align:left;font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${deliveryStr}
        </div>

        <!-- Totals: Grand Total (white text on dark green bar) -->
        <div style="position:absolute;top:${grandTotalY}px;left:${totalsX}px;width:${totalsW}px;
          text-align:left;font-size:13px;font-weight:800;color:#fff;white-space:nowrap;">
          ${grandTotalStr}
        </div>

      </div>
    </div>
  `;
}

export async function generateInvoicePDF(order: Order, settings: BusinessSettings): Promise<jsPDF> {
  const bgDataUrl = await getTemplateDataUrl();

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px';
  container.style.height = '1123px';
  container.style.zIndex = '-9999';

  container.innerHTML = buildTemplateOverlayHtml(order, settings, bgDataUrl);
  document.body.appendChild(container);

  // Give image time to fully load before capture
  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    width: 794,
    height: 1123,
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
  return pdf;
}

export async function downloadInvoicePDF(order: Order, settings: BusinessSettings): Promise<void> {
  const doc = await generateInvoicePDF(order, settings);
  doc.save(`Sharmila-Leafware-Invoice-${order.orderId}.pdf`);
}

export async function printInvoicePDF(order: Order, settings: BusinessSettings): Promise<void> {
  const doc = await generateInvoicePDF(order, settings);
  doc.autoPrint();
  const blobUrl = URL.createObjectURL(doc.output('blob'));
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = blobUrl;
  document.body.appendChild(iframe);
  iframe.onload = () => iframe.contentWindow?.print();
}

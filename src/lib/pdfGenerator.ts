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

  // ─── COORDINATE CALIBRATION ──────────────────────────────────────────────
  // Template image original size: 682 × 1024 px
  // Rendered canvas size:          794 × 1123 px
  // Scale X = 794/682 = 1.1642   Scale Y = 1123/1024 = 1.0967
  //
  // All positions below are measured from the original template image
  // and scaled to the 794×1123 canvas.
  // ─────────────────────────────────────────────────────────────────────────

  // Right-side invoice meta block
  // Original X of colon values: ~490px  →  scaled: ~570px
  // Original Y rows: 217, 247, 278, 308  →  scaled: 238, 271, 305, 338
  const metaX = 570;

  // Bill To section
  // Original Y: Name ~370, Address ~400, Phone ~470  →  scaled: 406, 439, 515
  const billToNameY    = 406;
  const billToAddrY    = 439;
  const billToPhoneY   = 515;
  const billToX        = 155; // after the colon

  // Product table
  // Original Y of row 1 header bottom: ~490px → row 1 data starts ~510px → scaled: ~559px
  // Each row height in original: ~25px → scaled: ~27.4px
  const tableStartY  = 559;
  const rowH         = 27.4;

  // Column X positions (measured from original, scaled)
  // S.NO col centre: ~35 → 41
  // ITEM NAME col starts after S.NO: ~75 → 87, width ~180 → 209
  // SIZE col centre: ~330 → 384
  // QUANTITY col centre: ~415 → 483
  // AMOUNT col: after ₹ symbol at ~495 → 576, width to ~640 → 744
  const colItem   = 87;
  const colSize   = 330;
  const colQty    = 415;
  const colAmt    = 526; // after pre-printed ₹

  // Totals section (right side boxes)
  // Original Y: Subtotal ~843, Delivery ~870, GrandTotal ~900 → scaled: 924, 954, 987
  const subtotalY    = 924;
  const deliveryY    = 954;
  const grandTotalY  = 987;
  const totalsX      = 540; // left edge of value area
  const totalsW      = 145;

  // ─── BUILD ITEM ROWS ──────────────────────────────────────────────────────
  const itemRowsHtml: string[] = [];
  for (let i = 0; i < 10; i++) {
    const item = order.items[i];
    if (!item) break;
    const y = Math.round(tableStartY + i * rowH);
    itemRowsHtml.push(`
      <div style="position:absolute;top:${y}px;left:${colItem}px;width:235px;
        font-size:11.5px;font-weight:700;color:#111;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1;">
        ${item.productName}
      </div>
      <div style="position:absolute;top:${y}px;left:${colSize}px;width:80px;
        text-align:center;font-size:11.5px;font-weight:700;color:#111;line-height:1;">
        ${item.size || '-'}
      </div>
      <div style="position:absolute;top:${y}px;left:${colQty}px;width:70px;
        text-align:center;font-size:11.5px;font-weight:700;color:#111;line-height:1;">
        ${item.quantity}
      </div>
      <div style="position:absolute;top:${y}px;left:${colAmt}px;width:110px;
        text-align:left;font-size:11.5px;font-weight:700;color:#111;line-height:1;">
        ${item.total.toLocaleString('en-IN')}
      </div>
    `);
  }

  // ─── TOTALS ───────────────────────────────────────────────────────────────
  const subtotalStr   = `${order.subtotal.toLocaleString('en-IN')}`;
  const deliveryStr   = `${(order.transportCharge || 0).toLocaleString('en-IN')}`;
  const grandTotalStr = `${order.grandTotal.toLocaleString('en-IN')}`;

  // Customer details – clamp long strings
  const customerLine = [order.customerName, order.companyName ? `(${order.companyName})` : '']
    .filter(Boolean).join(' ');
  const addressLine  = order.address || '';

  return `
    <div style="
      width:794px;height:1123px;position:relative;
      background:#fff;overflow:hidden;
      font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
      box-sizing:border-box;">

      <!-- Template background image -->
      <img src="${bgDataUrl}" style="
        position:absolute;top:0;left:0;
        width:794px;height:1123px;
        object-fit:fill;z-index:1;" />

      <!-- Overlay layer -->
      <div style="position:absolute;top:0;left:0;width:794px;height:1123px;z-index:2;">

        <!-- ── Invoice meta (top-right) ── -->
        <div style="position:absolute;top:238px;left:${metaX}px;width:190px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${invoiceNo}
        </div>
        <div style="position:absolute;top:271px;left:${metaX}px;width:190px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${dateStr}
        </div>
        <div style="position:absolute;top:305px;left:${metaX}px;width:190px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${order.orderId}
        </div>
        <div style="position:absolute;top:338px;left:${metaX}px;width:190px;
          font-size:12px;font-weight:700;color:#111;white-space:nowrap;">
          ${dateStr}
        </div>

        <!-- ── Bill To ── -->
        <div style="position:absolute;top:${billToNameY}px;left:${billToX}px;width:500px;
          font-size:12.5px;font-weight:700;color:#111;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1;">
          ${customerLine}
        </div>
        <div style="position:absolute;top:${billToAddrY}px;left:${billToX}px;width:500px;
          font-size:11.5px;font-weight:600;color:#111;
          line-height:1.45;max-height:60px;overflow:hidden;">
          ${addressLine}
        </div>
        <div style="position:absolute;top:${billToPhoneY}px;left:${billToX}px;width:300px;
          font-size:12.5px;font-weight:700;color:#111;white-space:nowrap;line-height:1;">
          ${order.phone}
        </div>

        <!-- ── Product rows ── -->
        ${itemRowsHtml.join('')}

        <!-- ── Totals ── -->
        <div style="position:absolute;top:${subtotalY}px;left:${totalsX}px;width:${totalsW}px;
          text-align:right;font-size:12.5px;font-weight:700;color:#111;white-space:nowrap;">
          ${subtotalStr}
        </div>
        <div style="position:absolute;top:${deliveryY}px;left:${totalsX}px;width:${totalsW}px;
          text-align:right;font-size:12.5px;font-weight:700;color:#111;white-space:nowrap;">
          ${deliveryStr}
        </div>
        <div style="position:absolute;top:${grandTotalY}px;left:${totalsX}px;width:${totalsW}px;
          text-align:right;font-size:13px;font-weight:800;color:#fff;white-space:nowrap;">
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

  // Wait for background image to load
  await new Promise((resolve) => setTimeout(resolve, 400));

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

  const pdfWidth  = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  return pdf;
}

export async function downloadInvoicePDF(order: Order, settings: BusinessSettings): Promise<void> {
  const doc = await generateInvoicePDF(order, settings);
  const filename = `Sharmila-Leafware-Invoice-${order.orderId}.pdf`;
  doc.save(filename);
}

export async function printInvoicePDF(order: Order, settings: BusinessSettings): Promise<void> {
  const doc = await generateInvoicePDF(order, settings);
  doc.autoPrint();
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = blobUrl;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.print();
  };
}

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

function buildTemplateOverlayHtml(order: Order, settings: BusinessSettings, bgDataUrl: string): string {
  const invoiceNo = order.invoiceNumber || `INV-2026-${(order.orderId || '0001').replace(/[^0-9]/g, '').padStart(4, '0')}`;
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Calculate table row overlays (10 rows max)
  const itemRowsHtml: string[] = [];
  const startY = 584; // Top Y coordinate of row 1
  const rowHeight = 30.6; // Row height step

  for (let i = 0; i < 10; i++) {
    const item = order.items[i];
    if (!item) break;

    const currentY = startY + i * rowHeight;
    itemRowsHtml.push(`
      <!-- Row ${i + 1} Overlay -->
      <div style="position: absolute; top: ${currentY}px; left: 98px; width: 265px; font-size: 11.5px; font-weight: 700; color: #112A0E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1;">
        ${item.productName}
      </div>
      <div style="position: absolute; top: ${currentY}px; left: 366px; width: 104px; text-align: center; font-size: 11.5px; font-weight: 600; color: #2D5E35; line-height: 1;">
        ${item.size || '-'}
      </div>
      <div style="position: absolute; top: ${currentY}px; left: 472px; width: 102px; text-align: center; font-size: 11.5px; font-weight: 800; color: #112A0E; line-height: 1;">
        ${item.quantity}
      </div>
      <div style="position: absolute; top: ${currentY}px; left: 576px; width: 154px; text-align: right; font-size: 11.5px; font-weight: 800; color: #112A0E; line-height: 1;">
        ${item.total.toLocaleString('en-IN')}
      </div>
    `);
  }

  return `
    <div style="
      width: 794px;
      height: 1192px;
      position: relative;
      background: #FFFFFF;
      overflow: hidden;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      box-sizing: border-box;
    ">
      <!-- 100% Exact Template Graphic Background Image -->
      <img src="${bgDataUrl}" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 794px;
        height: 1192px;
        object-fit: fill;
        z-index: 1;
      " />

      <!-- Dynamic Data Overlay Layer -->
      <div style="position: absolute; top: 0; left: 0; width: 794px; height: 1192px; z-index: 2; pointer-events: none;">

        <!-- 1. TOP RIGHT INVOICE DETAILS OVERLAY -->
        <div style="position: absolute; top: 215px; left: 582px; width: 145px; font-size: 12px; font-weight: 700; color: #112A0E; white-space: nowrap;">
          ${invoiceNo}
        </div>
        <div style="position: absolute; top: 249px; left: 582px; width: 145px; font-size: 12px; font-weight: 600; color: #112A0E; white-space: nowrap;">
          ${dateStr}
        </div>
        <div style="position: absolute; top: 283px; left: 582px; width: 145px; font-size: 12px; font-weight: 700; color: #112A0E; white-space: nowrap;">
          ${order.orderId}
        </div>
        <div style="position: absolute; top: 317px; left: 582px; width: 145px; font-size: 12px; font-weight: 600; color: #112A0E; white-space: nowrap;">
          ${dateStr}
        </div>

        <!-- 2. BILL TO CUSTOMER DETAILS OVERLAY -->
        <div style="position: absolute; top: 397px; left: 152px; width: 520px; font-size: 12px; font-weight: 800; color: #112A0E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${order.customerName} ${order.companyName ? '(' + order.companyName + ')' : ''}
        </div>
        <div style="position: absolute; top: 428px; left: 152px; width: 520px; font-size: 11.5px; font-weight: 600; color: #2D5E35; line-height: 1.35; max-height: 60px; overflow: hidden;">
          ${order.address || 'Mullakkadu, Thoothukudi, Tamil Nadu, India'}
        </div>
        <div style="position: absolute; top: 504px; left: 152px; width: 520px; font-size: 12px; font-weight: 800; color: #112A0E; white-space: nowrap;">
          ${order.phone}
        </div>

        <!-- 3. DYNAMIC PRODUCT ITEMS OVERLAY -->
        ${itemRowsHtml.join('')}

        <!-- 4. NOTES & BANK DETAILS OVERLAY -->
        <div style="position: absolute; top: 962px; left: 48px; width: 320px; font-size: 10px; font-weight: 600; color: #2D5E35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <strong>Bank:</strong> ${settings.bankName || 'Tamilnadu Mercantile Bank'} &nbsp;|&nbsp; <strong>A/C:</strong> ${settings.accountNumber || '50200012345678'}
        </div>
        <div style="position: absolute; top: 997px; left: 48px; width: 320px; font-size: 10px; font-weight: 600; color: #2D5E35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <strong>IFSC:</strong> ${settings.ifscCode || 'TMBL0000123'} &nbsp;|&nbsp; <strong>UPI:</strong> ${settings.upiId || 'sharmilaleafware@upl'}
        </div>
        <div style="position: absolute; top: 1032px; left: 48px; width: 320px; font-size: 10px; font-weight: 600; color: #2D5E35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <strong>Payment Status:</strong> ${order.paymentStatus} &nbsp;|&nbsp; <strong>Balance:</strong> ₹${order.balanceAmount.toLocaleString('en-IN')}
        </div>

        <!-- 5. TOTALS BOX OVERLAY -->
        <div style="position: absolute; top: 965px; left: 630px; width: 102px; text-align: right; font-size: 12.5px; font-weight: 800; color: #112A0E; white-space: nowrap;">
          ${order.subtotal.toLocaleString('en-IN')}
        </div>
        <div style="position: absolute; top: 1005px; left: 630px; width: 102px; text-align: right; font-size: 12.5px; font-weight: 800; color: #112A0E; white-space: nowrap;">
          ${(order.transportCharge || 0).toLocaleString('en-IN')}
        </div>
        <div style="position: absolute; top: 1047px; left: 630px; width: 102px; text-align: right; font-size: 14.5px; font-weight: 900; color: #FFFFFF; white-space: nowrap;">
          ${order.grandTotal.toLocaleString('en-IN')}
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
  container.style.height = '1192px';
  container.style.zIndex = '-9999';

  container.innerHTML = buildTemplateOverlayHtml(order, settings, bgDataUrl);
  document.body.appendChild(container);

  // Allow image loading
  await new Promise((resolve) => setTimeout(resolve, 250));

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    width: 794,
    height: 1192,
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
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

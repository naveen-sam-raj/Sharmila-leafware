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
  const invoiceNo = order.invoiceNumber || `${order.orderId || '25'}`;
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Calculate table row overlays (10 rows max)
  const itemRowsHtml: string[] = [];
  const startY = 533; // Top Y coordinate of row 1 on 794x1123 canvas
  const rowHeight = 26.85; // Row height step on 794x1123 canvas

  for (let i = 0; i < 10; i++) {
    const item = order.items[i];
    if (!item) break;

    const currentY = Math.round(startY + i * rowHeight);
    itemRowsHtml.push(`
      <!-- Row ${i + 1} Overlay -->
      <div style="position: absolute; top: ${currentY}px; left: 110px; width: 260px; font-size: 12.5px; font-weight: 700; color: #000000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1;">
        ${item.productName}
      </div>
      <div style="position: absolute; top: ${currentY}px; left: 375px; width: 110px; text-align: center; font-size: 12.5px; font-weight: 700; color: #000000; line-height: 1;">
        ${item.size || '-'}
      </div>
      <div style="position: absolute; top: ${currentY}px; left: 495px; width: 120px; text-align: center; font-size: 12.5px; font-weight: 700; color: #000000; line-height: 1;">
        ${item.quantity}
      </div>
      <div style="position: absolute; top: ${currentY}px; left: 650px; width: 85px; text-align: left; font-size: 12.5px; font-weight: 700; color: #000000; line-height: 1;">
        ${item.total.toLocaleString('en-IN')}
      </div>
    `);
  }

  const transportCharge = order.transportCharge || 0;
  const subtotalStr = `₹ ${order.subtotal.toLocaleString('en-IN')}`;
  const deliveryStr = `₹ ${transportCharge.toLocaleString('en-IN')}`;
  const grandTotalStr = `₹ ${order.grandTotal.toLocaleString('en-IN')}`;

  return `
    <div style="
      width: 794px;
      height: 1123px;
      position: relative;
      background: #FFFFFF;
      overflow: hidden;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      box-sizing: border-box;
    ">
      <!-- 100% Exact Template Graphic Background Image -->
      <img src="${bgDataUrl}" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 794px;
        height: 1123px;
        object-fit: fill;
        z-index: 1;
      " />

      <!-- Dynamic Data Overlay Layer -->
      <div style="position: absolute; top: 0; left: 0; width: 794px; height: 1123px; z-index: 2; pointer-events: none;">

        <!-- 1. TOP RIGHT INVOICE DETAILS OVERLAY -->
        <div style="position: absolute; top: 186px; left: 590px; width: 145px; font-size: 13px; font-weight: 700; color: #000000; white-space: nowrap; line-height: 1;">
          ${invoiceNo}
        </div>
        <div style="position: absolute; top: 219px; left: 590px; width: 145px; font-size: 13px; font-weight: 700; color: #000000; white-space: nowrap; line-height: 1;">
          ${dateStr}
        </div>
        <div style="position: absolute; top: 252px; left: 590px; width: 145px; font-size: 13px; font-weight: 700; color: #000000; white-space: nowrap; line-height: 1;">
          ${order.orderId}
        </div>
        <div style="position: absolute; top: 286px; left: 590px; width: 145px; font-size: 13px; font-weight: 700; color: #000000; white-space: nowrap; line-height: 1;">
          ${dateStr}
        </div>

        <!-- 2. BILL TO CUSTOMER DETAILS OVERLAY -->
        <div style="position: absolute; top: 356px; left: 160px; width: 510px; font-size: 13.5px; font-weight: 700; color: #000000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1;">
          ${order.customerName} ${order.companyName ? '(' + order.companyName + ')' : ''}
        </div>
        <div style="position: absolute; top: 388px; left: 160px; width: 510px; font-size: 13px; font-weight: 700; color: #000000; line-height: 1.35; max-height: 55px; overflow: hidden;">
          ${order.address || 'Mullakkadu, Thoothukudi, Tamil Nadu'}
        </div>
        <div style="position: absolute; top: 458px; left: 160px; width: 510px; font-size: 13.5px; font-weight: 700; color: #000000; white-space: nowrap; line-height: 1;">
          ${order.phone}
        </div>

        <!-- 3. DYNAMIC PRODUCT ITEMS OVERLAY -->
        ${itemRowsHtml.join('')}

        <!-- 4. TOTALS BOX OVERLAY -->
        <div style="position: absolute; top: 835px; left: 600px; width: 135px; text-align: right; font-size: 13.5px; font-weight: 700; color: #000000; white-space: nowrap; line-height: 1;">
          ${subtotalStr}
        </div>
        <div style="position: absolute; top: 876px; left: 600px; width: 135px; text-align: right; font-size: 13.5px; font-weight: 700; color: #000000; white-space: nowrap; line-height: 1;">
          ${deliveryStr}
        </div>
        <div style="position: absolute; top: 918px; left: 600px; width: 135px; text-align: right; font-size: 14.5px; font-weight: 800; color: #FFFFFF; white-space: nowrap; line-height: 1;">
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

  // Allow image loading
  await new Promise((resolve) => setTimeout(resolve, 250));

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

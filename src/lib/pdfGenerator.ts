import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Order, BusinessSettings } from '@/types';

function buildInvoiceHtml(order: Order, settings: BusinessSettings): string {
  const logoUrl = settings.logoUrl || '/logo-transparent.png';
  const invoiceNo = order.invoiceNumber || `INV-2026-${(order.orderId || '0001').replace(/[^0-9]/g, '').padStart(4, '0')}`;
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalRows = Math.max(10, order.items.length);
  const rowsHtmlArr: string[] = [];

  for (let i = 0; i < totalRows; i++) {
    const item = order.items[i];
    const isEven = i % 2 === 0;
    const bgStyle = isEven ? 'background: #FFFFFF;' : 'background: #FAF8F5;';

    if (item) {
      rowsHtmlArr.push(`
        <tr style="border-bottom: 1px dashed #E2E8F0; ${bgStyle} font-size: 11px; color: #1F2937;">
          <td style="padding: 7px 10px; text-align: center; font-weight: 700; border-right: 1px solid #E2E8F0; color: #163827;">${i + 1}</td>
          <td style="padding: 7px 12px; font-weight: 600; border-right: 1px solid #E2E8F0; color: #0F172A;">${item.productName}</td>
          <td style="padding: 7px 10px; text-align: center; border-right: 1px solid #E2E8F0; color: #475569;">${item.size || '-'}</td>
          <td style="padding: 7px 10px; text-align: center; font-weight: 700; border-right: 1px solid #E2E8F0; color: #0F172A;">${item.quantity}</td>
          <td style="padding: 7px 12px; text-align: right; font-weight: 700; color: #0F172A;">₹ ${item.total.toLocaleString('en-IN')}</td>
        </tr>
      `);
    } else {
      rowsHtmlArr.push(`
        <tr style="border-bottom: 1px dashed #E2E8F0; ${bgStyle} font-size: 11px;">
          <td style="padding: 7px 10px; text-align: center; font-weight: 700; border-right: 1px solid #E2E8F0; color: #CBD5E1;">${i + 1}</td>
          <td style="padding: 7px 12px; border-right: 1px solid #E2E8F0;">&nbsp;</td>
          <td style="padding: 7px 10px; border-right: 1px solid #E2E8F0;">&nbsp;</td>
          <td style="padding: 7px 10px; border-right: 1px solid #E2E8F0;">&nbsp;</td>
          <td style="padding: 7px 12px; text-align: right; color: #94A3B8;">₹</td>
        </tr>
      `);
    }
  }

  const tableRowsHtml = rowsHtmlArr.join('');

  return `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: #FFFFFF;
      box-sizing: border-box;
      padding: 32px 36px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1F2937;
      position: relative;
      overflow: hidden;
    ">
      <!-- Decorative Leaf Accent (Top-Right Background) -->
      <div style="position: absolute; top: -10px; right: -10px; width: 140px; height: 140px; pointer-events: none; opacity: 0.12;">
        <svg viewBox="0 0 100 100" fill="#163827">
          <path d="M50,0 C70,30 100,50 100,100 C50,100 30,70 0,50 C30,30 50,0 50,0 Z" />
        </svg>
      </div>

      <!-- HEADER SECTION -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px;">
        <!-- Left: Brand Logo & Title -->
        <div style="width: 340px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <div style="
              width: 60px;
              height: 60px;
              border-radius: 50%;
              border: 1.5px solid #C8A45D;
              background: #FAF8F5;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 4px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.06);
            ">
              <img src="${logoUrl}" style="max-height: 48px; max-width: 48px; object-contain: contain;" />
            </div>
            <div>
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 900; color: #163827; letter-spacing: 1px; line-height: 1;">
                SHARMILA
              </h1>
              <div style="font-size: 13px; font-weight: 800; color: #C8A45D; letter-spacing: 3.5px; margin-top: 3px;">
                — LEAFWARE —
              </div>
            </div>
          </div>
          <div style="font-size: 8px; font-weight: 700; color: #163827; letter-spacing: 1.6px; text-transform: uppercase; margin-top: 6px; padding-left: 2px;">
            🍃 NATURAL • SUSTAINABLE • BETTER FUTURE 🍃
          </div>
        </div>

        <!-- Right: INVOICE Title & Numbers Table -->
        <div style="text-align: right; width: 330px;">
          <h2 style="margin: 0 0 2px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 38px; font-weight: 900; color: #163827; letter-spacing: 3px; text-transform: uppercase;">
            INVOICE
          </h2>
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 10px;">
            <div style="height: 1.5px; width: 85px; background: #163827; opacity: 0.35;"></div>
            <span style="font-size: 11px; color: #163827;">🍃</span>
            <div style="height: 1.5px; width: 85px; background: #163827; opacity: 0.35;"></div>
          </div>

          <table style="width: 100%; font-size: 11px; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="text-align: right; padding: 2px 8px; font-weight: 600; color: #163827; width: 45%;">Invoice No.</td>
              <td style="text-align: left; padding: 2px 0 2px 8px; border-bottom: 1px solid #CBD5E1; font-family: monospace; font-weight: 700; color: #0F172A;">: ${invoiceNo}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 2px 8px; font-weight: 600; color: #163827;">Invoice Date</td>
              <td style="text-align: left; padding: 2px 0 2px 8px; border-bottom: 1px solid #CBD5E1; color: #0F172A;">: ${dateStr}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 2px 8px; font-weight: 600; color: #163827;">Order No.</td>
              <td style="text-align: left; padding: 2px 0 2px 8px; border-bottom: 1px solid #CBD5E1; font-family: monospace; font-weight: 700; color: #0F172A;">: ${order.orderId}</td>
            </tr>
            <tr>
              <td style="text-align: right; padding: 2px 8px; font-weight: 600; color: #163827;">Order Date</td>
              <td style="text-align: left; padding: 2px 0 2px 8px; border-bottom: 1px solid #CBD5E1; color: #0F172A;">: ${dateStr}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- BILL TO BOX -->
      <div style="
        border: 1.5px solid #163827;
        border-radius: 12px;
        padding: 12px 18px 14px 18px;
        margin-bottom: 18px;
        position: relative;
        background: #FAF8F5;
      ">
        <!-- Pill Badge -->
        <div style="
          position: absolute;
          top: -12px;
          left: 18px;
          background: #163827;
          color: #FFFFFF;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 1.5px;
          padding: 3px 14px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span>👤</span> BILL TO
        </div>

        <table style="width: 100%; font-size: 11px; color: #1F2937; border-collapse: collapse; margin-top: 4px;">
          <tr>
            <td style="width: 75px; font-weight: 700; color: #163827; padding: 3px 0; vertical-align: top;">Name</td>
            <td style="padding: 3px 0; border-bottom: 1px solid #E2E8F0; font-weight: 700; color: #0F172A;">: ${order.customerName} ${order.companyName ? '(' + order.companyName + ')' : ''}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #163827; padding: 3px 0; vertical-align: top;">Address</td>
            <td style="padding: 3px 0; border-bottom: 1px solid #E2E8F0; color: #334155; line-height: 1.4;">: ${order.address || 'Mullakkadu, Thoothukudi, Tamil Nadu, India'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #163827; padding: 3px 0; vertical-align: top;">Phone</td>
            <td style="padding: 3px 0; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-weight: 700;">: ${order.phone}</td>
          </tr>
        </table>
      </div>

      <!-- PRODUCT ITEMS TABLE -->
      <div style="border: 1.5px solid #163827; border-radius: 12px; overflow: hidden; margin-bottom: 18px; background: #FFFFFF;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #163827; color: #FFFFFF; text-align: left; font-weight: 800; letter-spacing: 0.8px;">
              <th style="padding: 8px 10px; width: 50px; text-align: center; border-right: 1px solid #24523B;">S.NO.</th>
              <th style="padding: 8px 12px; border-right: 1px solid #24523B;">ITEM NAME</th>
              <th style="padding: 8px 10px; width: 90px; text-align: center; border-right: 1px solid #24523B;">SIZE</th>
              <th style="padding: 8px 10px; width: 80px; text-align: center; border-right: 1px solid #24523B;">QUANTITY</th>
              <th style="padding: 8px 12px; width: 130px; text-align: right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- BOTTOM SECTION: NOTES & SUMMARY TOTALS -->
      <div style="display: flex; gap: 16px; margin-bottom: 20px;">
        <!-- Notes Box -->
        <div style="
          flex: 1;
          border: 1.5px solid #163827;
          border-radius: 12px;
          padding: 12px 14px;
          background: #FAF8F5;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        ">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #163827; letter-spacing: 1px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              <span>🌿</span> NOTES
            </div>
            <div style="font-size: 10px; color: #475569; line-height: 1.5; border-top: 1px dashed #CBD5E1; padding-top: 6px;">
              <div><strong>Bank:</strong> ${settings.bankName || 'HDFC Bank'} | <strong>A/C:</strong> ${settings.accountNumber || '50200012345678'}</div>
              <div><strong>IFSC:</strong> ${settings.ifscCode || 'HDFC0001234'} | <strong>UPI:</strong> ${settings.upiId || '8270839507@upi'}</div>
              <div><strong>Payment Status:</strong> ${order.paymentStatus} | <strong>Balance Due:</strong> ₹${order.balanceAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div style="font-family: Georgia, serif; font-style: italic; font-size: 15px; font-weight: 700; color: #163827; margin-top: 14px; text-align: center;">
            Thank you for your business! 🌿
          </div>
        </div>

        <!-- Totals Table Box -->
        <div style="width: 290px; border: 1.5px solid #163827; border-radius: 12px; overflow: hidden; background: #FFFFFF;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 8px 12px; font-weight: 700; color: #334155;">SUBTOTAL</td>
              <td style="padding: 8px 12px; text-align: right; font-weight: 700; color: #0F172A;">₹ ${order.subtotal.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 8px 12px; font-weight: 700; color: #334155;">DELIVERY CHARGES</td>
              <td style="padding: 8px 12px; text-align: right; font-weight: 700; color: #0F172A;">₹ ${(order.transportCharge || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="background: #163827; color: #FFFFFF;">
              <td style="padding: 10px 12px; font-weight: 900; font-size: 12px; letter-spacing: 0.5px;">GRAND TOTAL</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: 900; font-size: 14px;">₹ ${order.grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- FOOTER CONTACT BAR (4 PILLS) -->
      <div style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 14px;
      ">
        <!-- WhatsApp -->
        <div style="border: 1.2px solid #163827; border-radius: 20px; padding: 6px 10px; display: flex; align-items: center; gap: 8px; background: #FAF8F5;">
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #163827; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; shrink: 0;">💬</div>
          <div>
            <div style="font-size: 7.5px; font-weight: 800; color: #163827; letter-spacing: 0.5px;">WHATSAPP</div>
            <div style="font-size: 9px; font-weight: 700; color: #334155;">${settings.whatsapp || '82708 39507'}</div>
          </div>
        </div>

        <!-- Instagram -->
        <div style="border: 1.2px solid #163827; border-radius: 20px; padding: 6px 10px; display: flex; align-items: center; gap: 8px; background: #FAF8F5;">
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #163827; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; shrink: 0;">📸</div>
          <div>
            <div style="font-size: 7.5px; font-weight: 800; color: #163827; letter-spacing: 0.5px;">INSTAGRAM</div>
            <div style="font-size: 9px; font-weight: 700; color: #334155;">@sharmila_leafware</div>
          </div>
        </div>

        <!-- Website -->
        <div style="border: 1.2px solid #163827; border-radius: 20px; padding: 6px 10px; display: flex; align-items: center; gap: 8px; background: #FAF8F5;">
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #163827; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; shrink: 0;">🌐</div>
          <div>
            <div style="font-size: 7.5px; font-weight: 800; color: #163827; letter-spacing: 0.5px;">WEBSITE</div>
            <div style="font-size: 9px; font-weight: 700; color: #334155;">sharmilaleafware.in</div>
          </div>
        </div>

        <!-- Email -->
        <div style="border: 1.2px solid #163827; border-radius: 20px; padding: 6px 10px; display: flex; align-items: center; gap: 8px; background: #FAF8F5;">
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #163827; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; shrink: 0;">✉️</div>
          <div>
            <div style="font-size: 7.5px; font-weight: 800; color: #163827; letter-spacing: 0.5px;">EMAIL</div>
            <div style="font-size: 8px; font-weight: 700; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${settings.email || 'sharmilaleafware@gmail.com'}</div>
          </div>
        </div>
      </div>

      <!-- BOTTOM THOOTHUKUDI LOCATION -->
      <div style="text-align: center; margin-top: 6px;">
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 900;
          color: #163827;
          letter-spacing: 2px;
          text-transform: uppercase;
        ">
          <span>📍</span> THOOTHUKUDI
        </div>
        <div style="font-size: 10px; margin-top: 2px;">🍃</div>
      </div>
    </div>
  `;
}

export async function generateInvoicePDF(order: Order, settings: BusinessSettings): Promise<jsPDF> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px';
  container.style.zIndex = '-9999';

  container.innerHTML = buildInvoiceHtml(order, settings);
  document.body.appendChild(container);

  // Allow image loading
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
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

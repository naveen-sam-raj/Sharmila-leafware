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

  const totalRows = 10;
  const rowsHtmlArr: string[] = [];

  for (let i = 0; i < totalRows; i++) {
    const item = order.items[i];
    const bgStyle = i % 2 === 0 ? 'background: #FFFFFF;' : 'background: #F7FAF7;';

    if (item) {
      rowsHtmlArr.push(`
        <tr style="height: 32px; border-bottom: 1px solid #E0EAE2; ${bgStyle} font-size: 11px; color: #1B4317;">
          <td style="padding: 0 8px; text-align: center; font-weight: 700; border-right: 1px solid #C8D6C9; width: 50px;">${i + 1}</td>
          <td style="padding: 0 12px; font-weight: 700; border-right: 1px solid #C8D6C9; color: #112A0E;">${item.productName}</td>
          <td style="padding: 0 8px; text-align: center; border-right: 1px solid #C8D6C9; font-weight: 600; color: #2D5E35; width: 90px;">${item.size || '-'}</td>
          <td style="padding: 0 8px; text-align: center; font-weight: 700; border-right: 1px solid #C8D6C9; color: #112A0E; width: 80px;">${item.quantity}</td>
          <td style="padding: 0 12px; text-align: right; font-weight: 800; color: #112A0E; width: 130px;">₹ ${item.total.toLocaleString('en-IN')}</td>
        </tr>
      `);
    } else {
      rowsHtmlArr.push(`
        <tr style="height: 32px; border-bottom: 1px solid #E0EAE2; ${bgStyle} font-size: 11px; color: #1B4317;">
          <td style="padding: 0 8px; text-align: center; font-weight: 700; border-right: 1px solid #C8D6C9; color: #A0B8A4; width: 50px;">${i + 1}</td>
          <td style="padding: 0 12px; border-right: 1px solid #C8D6C9;">&nbsp;</td>
          <td style="padding: 0 8px; border-right: 1px solid #C8D6C9; width: 90px;">&nbsp;</td>
          <td style="padding: 0 8px; border-right: 1px solid #C8D6C9; width: 80px;">&nbsp;</td>
          <td style="padding: 0 12px; text-align: right; color: #88A68D; font-weight: 600; width: 130px;">₹</td>
        </tr>
      `);
    }
  }

  const tableRowsHtml = rowsHtmlArr.join('');

  return `
    <div style="
      width: 794px;
      height: 1123px;
      background: #FFFFFF;
      box-sizing: border-box;
      padding: 30px 38px 24px 38px;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1B4317;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    ">
      <!-- Top Right Corner Decorative Leaf Vine SVG -->
      <div style="position: absolute; top: 0; right: 0; width: 190px; height: 190px; pointer-events: none; opacity: 0.85; z-index: 1;">
        <svg viewBox="0 0 200 200" width="190" height="190" fill="none">
          <path d="M200 0 C 140 20, 90 70, 110 190" stroke="#1B4317" stroke-width="2.5" fill="none" opacity="0.35"/>
          <path d="M200 0 C 170 50, 130 90, 70 130" stroke="#2D6A37" stroke-width="1.8" fill="none" opacity="0.25"/>
          <!-- Leaf accents -->
          <path d="M165 25 C 185 15, 195 35, 175 45 C 155 55, 145 35, 165 25 Z" fill="#1B4317" opacity="0.5"/>
          <path d="M135 55 C 155 45, 165 65, 145 75 C 125 85, 115 65, 135 55 Z" fill="#2D6A37" opacity="0.45"/>
          <path d="M105 95 C 125 85, 135 105, 115 115 C 95 125, 85 105, 105 95 Z" fill="#3B7A45" opacity="0.4"/>
          <path d="M180 65 C 195 55, 200 75, 185 83 C 170 90, 165 75, 180 65 Z" fill="#1B4317" opacity="0.45"/>
          <path d="M150 100 C 165 90, 170 110, 155 118 C 140 125, 135 110, 150 100 Z" fill="#2D6A37" opacity="0.4"/>
        </svg>
      </div>

      <!-- Top Left Header Leaf Arch SVG -->
      <div style="position: absolute; top: 0; left: 0; width: 140px; height: 140px; pointer-events: none; opacity: 0.6; z-index: 1;">
        <svg viewBox="0 0 150 150" width="140" height="140" fill="none">
          <path d="M0 0 C 40 20, 80 50, 120 0" stroke="#1B4317" stroke-width="2" fill="none" opacity="0.4"/>
          <path d="M25 15 C 35 5, 45 20, 32 25 Z" fill="#1B4317" opacity="0.5"/>
          <path d="M60 30 C 70 20, 80 35, 67 40 Z" fill="#2D6A37" opacity="0.45"/>
          <path d="M95 20 C 105 10, 115 25, 102 30 Z" fill="#1B4317" opacity="0.4"/>
        </svg>
      </div>

      <!-- MAIN CONTENT TOP WRAPPER -->
      <div style="position: relative; z-index: 2;">

        <!-- HEADER SECTION -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <!-- Left: Brand Logo & Title -->
          <div style="width: 350px;">
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 6px;">
              <div style="
                width: 68px;
                height: 68px;
                border-radius: 50%;
                border: 2px solid #1B4317;
                background: #FFFFFF;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
                box-sizing: border-box;
                box-shadow: 0 2px 8px rgba(27, 67, 23, 0.12);
              ">
                <img src="${logoUrl}" style="max-height: 54px; max-width: 54px; object-fit: contain;" onError="this.style.display='none'" />
              </div>
              <div>
                <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 30px; font-weight: 900; color: #1B4317; letter-spacing: 2px; line-height: 1;">
                  SHARMILA
                </h1>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                  <div style="height: 1.5px; width: 16px; background: #1B4317;"></div>
                  <span style="font-size: 13px; font-weight: 800; color: #1B4317; letter-spacing: 4px;">LEAFWARE</span>
                  <div style="height: 1.5px; width: 16px; background: #1B4317;"></div>
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 8.5px; font-weight: 800; color: #1B4317; letter-spacing: 1.8px; text-transform: uppercase; margin-top: 6px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#1B4317"><path d="M17 8C8 10 5.9 16.17 3.83 12 2c-5.17-2.83-9.17-3.83-11-2.83-2.83 0-5.17 1-7 2.83-1.83 1.83-2.83 4.17-2.83 7 0 7 4.17 11 9.17 12 5.17 0 9.17-4 9.17-9 0-2.83-1-5.17-2.83-7z"/></svg>
              <span>NATURAL • SUSTAINABLE • BETTER FUTURE</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#1B4317"><path d="M17 8C8 10 5.9 16.17 3.83 12 2c-5.17-2.83-9.17-3.83-11-2.83-2.83 0-5.17 1-7 2.83-1.83 1.83-2.83 4.17-2.83 7 0 7 4.17 11 9.17 12 5.17 0 9.17-4 9.17-9 0-2.83-1-5.17-2.83-7z"/></svg>
            </div>
          </div>

          <!-- Right: INVOICE Title & Numbers Table -->
          <div style="text-align: right; width: 330px;">
            <h2 style="margin: 0 0 2px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 42px; font-weight: 900; color: #1B4317; letter-spacing: 5px; text-transform: uppercase; line-height: 1;">
              INVOICE
            </h2>
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin: 4px 0 10px 0;">
              <div style="height: 1px; width: 90px; background: #1B4317; opacity: 0.4;"></div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#1B4317"><path d="M17 8C8 10 5.9 16.17 3.83 12 2c-5.17-2.83-9.17-3.83-11-2.83-2.83 0-5.17 1-7 2.83-1.83 1.83-2.83 4.17-2.83 7 0 7 4.17 11 9.17 12 5.17 0 9.17-4 9.17-9 0-2.83-1-5.17-2.83-7z"/></svg>
              <div style="height: 1px; width: 90px; background: #1B4317; opacity: 0.4;"></div>
            </div>

            <table style="width: 100%; font-size: 11px; color: #1B4317; border-collapse: collapse;">
              <tr>
                <td style="text-align: left; padding: 3px 4px; font-weight: 700; color: #1B4317; width: 100px;">Invoice No.</td>
                <td style="text-align: center; padding: 3px 0; font-weight: 700; width: 15px;">:</td>
                <td style="text-align: left; padding: 3px 0 3px 6px; border-bottom: 1px solid #CDDCCF; font-weight: 700; color: #112A0E;">${invoiceNo}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 3px 4px; font-weight: 700; color: #1B4317;">Invoice Date</td>
                <td style="text-align: center; padding: 3px 0; font-weight: 700;">:</td>
                <td style="text-align: left; padding: 3px 0 3px 6px; border-bottom: 1px solid #CDDCCF; color: #112A0E; font-weight: 600;">${dateStr}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 3px 4px; font-weight: 700; color: #1B4317;">Order No.</td>
                <td style="text-align: center; padding: 3px 0; font-weight: 700;">:</td>
                <td style="text-align: left; padding: 3px 0 3px 6px; border-bottom: 1px solid #CDDCCF; font-weight: 700; color: #112A0E;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="text-align: left; padding: 3px 4px; font-weight: 700; color: #1B4317;">Order Date</td>
                <td style="text-align: center; padding: 3px 0; font-weight: 700;">:</td>
                <td style="text-align: left; padding: 3px 0 3px 6px; border-bottom: 1px solid #CDDCCF; color: #112A0E; font-weight: 600;">${dateStr}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- BILL TO BOX -->
        <div style="
          border: 1.5px solid #1B4317;
          border-radius: 12px;
          padding: 14px 20px 12px 20px;
          margin-bottom: 16px;
          position: relative;
          background: #FFFFFF;
        ">
          <!-- Pill Badge -->
          <div style="
            position: absolute;
            top: -13px;
            left: 20px;
            background: #1B4317;
            color: #FFFFFF;
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 1.5px;
            padding: 3px 16px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 2px 4px rgba(27, 67, 23, 0.2);
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span>BILL TO</span>
          </div>

          <!-- Decorative Leaf Inside BILL TO Box (Right Side) -->
          <div style="position: absolute; bottom: 6px; right: 12px; opacity: 0.35; pointer-events: none;">
            <svg width="65" height="65" viewBox="0 0 100 100" fill="none">
              <path d="M80 100 C 60 70, 40 40, 10 10" stroke="#1B4317" stroke-width="2" fill="none"/>
              <path d="M60 75 C 75 60, 85 80, 70 88 Z" fill="#1B4317"/>
              <path d="M40 50 C 55 35, 65 55, 50 63 Z" fill="#2D6A37"/>
              <path d="M20 25 C 32 15, 40 32, 28 38 Z" fill="#3B7A45"/>
            </svg>
          </div>

          <table style="width: 100%; font-size: 11.5px; color: #1B4317; border-collapse: collapse; margin-top: 4px;">
            <tr>
              <td style="width: 80px; font-weight: 700; color: #1B4317; padding: 4px 0; vertical-align: top;">Name</td>
              <td style="width: 15px; font-weight: 700; padding: 4px 0; text-align: center;">:</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #E0EAE2; font-weight: 800; color: #112A0E;">${order.customerName} ${order.companyName ? '(' + order.companyName + ')' : ''}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #1B4317; padding: 4px 0; vertical-align: top;">Address</td>
              <td style="font-weight: 700; padding: 4px 0; text-align: center; vertical-align: top;">:</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #E0EAE2; color: #2D5E35; font-weight: 600; line-height: 1.4;">${order.address || 'Mullakkadu, Thoothukudi, Tamil Nadu, India'}</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #1B4317; padding: 4px 0; vertical-align: top;">&nbsp;</td>
              <td style="font-weight: 700; padding: 4px 0; text-align: center;">&nbsp;</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #E0EAE2;">&nbsp;</td>
            </tr>
            <tr>
              <td style="font-weight: 700; color: #1B4317; padding: 4px 0; vertical-align: top;">Phone</td>
              <td style="font-weight: 700; padding: 4px 0; text-align: center;">:</td>
              <td style="padding: 4px 0; border-bottom: 1px solid #E0EAE2; color: #112A0E; font-weight: 800;">${order.phone}</td>
            </tr>
          </table>
        </div>

        <!-- PRODUCT ITEMS TABLE -->
        <div style="border: 1.5px solid #1B4317; border-radius: 12px; overflow: hidden; margin-bottom: 16px; background: #FFFFFF;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #1B4317; color: #FFFFFF; text-align: left; font-weight: 800; letter-spacing: 0.8px; height: 34px;">
                <th style="padding: 0 8px; width: 50px; text-align: center; border-right: 1px solid #2D6A37;">S.NO.</th>
                <th style="padding: 0 12px; border-right: 1px solid #2D6A37;">ITEM NAME</th>
                <th style="padding: 0 8px; width: 90px; text-align: center; border-right: 1px solid #2D6A37;">SIZE</th>
                <th style="padding: 0 8px; width: 80px; text-align: center; border-right: 1px solid #2D6A37;">QUANTITY</th>
                <th style="padding: 0 12px; width: 130px; text-align: right;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- BOTTOM SECTION: NOTES & SUMMARY TOTALS -->
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
          <!-- Notes Box -->
          <div style="
            flex: 1;
            border: 1.5px solid #1B4317;
            border-radius: 12px;
            padding: 12px 16px;
            background: #FFFFFF;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          ">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #1B4317; letter-spacing: 1px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#1B4317"><path d="M17 8C8 10 5.9 16.17 3.83 12 2c-5.17-2.83-9.17-3.83-11-2.83-2.83 0-5.17 1-7 2.83-1.83 1.83-2.83 4.17-2.83 7 0 7 4.17 11 9.17 12 5.17 0 9.17-4 9.17-9 0-2.83-1-5.17-2.83-7z"/></svg>
                <span>NOTES</span>
              </div>
              <div style="font-size: 10px; color: #2D5E35; line-height: 1.6;">
                <div style="border-bottom: 1px dotted #C8D6C9; padding-bottom: 3px;">
                  <strong>Bank:</strong> ${settings.bankName || 'Tamilnadu Mercantile Bank'} &nbsp;|&nbsp; <strong>A/C:</strong> ${settings.accountNumber || '50200012345678'}
                </div>
                <div style="border-bottom: 1px dotted #C8D6C9; padding: 3px 0;">
                  <strong>IFSC:</strong> ${settings.ifscCode || 'HDFC0001234'} &nbsp;|&nbsp; <strong>UPI:</strong> ${settings.upiId || 'sharmilaleafware@upl'}
                </div>
                <div style="border-bottom: 1px dotted #C8D6C9; padding-top: 3px;">
                  <strong>Status:</strong> ${order.paymentStatus} &nbsp;|&nbsp; <strong>Balance Due:</strong> ₹${order.balanceAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <div style="font-family: 'Brush Script MT', 'Dancing Script', Georgia, cursive, serif; font-size: 18px; font-weight: 700; color: #1B4317; margin-top: 10px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>Thank you for your business!</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1B4317"><path d="M17 8C8 10 5.9 16.17 3.83 12 2c-5.17-2.83-9.17-3.83-11-2.83-2.83 0-5.17 1-7 2.83-1.83 1.83-2.83 4.17-2.83 7 0 7 4.17 11 9.17 12 5.17 0 9.17-4 9.17-9 0-2.83-1-5.17-2.83-7z"/></svg>
            </div>
          </div>

          <!-- Totals Table Box -->
          <div style="width: 290px; border: 1.5px solid #1B4317; border-radius: 12px; overflow: hidden; background: #FFFFFF;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <tr style="border-bottom: 1px solid #E0EAE2; height: 34px;">
                <td style="padding: 0 14px; font-weight: 700; color: #1B4317;">SUBTOTAL</td>
                <td style="padding: 0 14px; text-align: right; font-weight: 800; color: #112A0E;">₹ ${order.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E0EAE2; height: 34px;">
                <td style="padding: 0 14px; font-weight: 700; color: #1B4317;">DELIVERY CHARGES</td>
                <td style="padding: 0 14px; text-align: right; font-weight: 800; color: #112A0E;">₹ ${(order.transportCharge || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr style="background: #1B4317; color: #FFFFFF; height: 38px;">
                <td style="padding: 0 14px; font-weight: 900; font-size: 12px; letter-spacing: 0.5px;">GRAND TOTAL</td>
                <td style="padding: 0 14px; text-align: right; font-weight: 900; font-size: 14px;">₹ ${order.grandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
        </div>

      </div> <!-- END MAIN CONTENT WRAPPER -->

      <!-- FOOTER CONTAINER (PILLS + LOCATION) -->
      <div style="position: relative; z-index: 2;">
        <!-- FOOTER CONTACT BAR (4 PILLS IN SINGLE LINE) -->
        <div style="
          display: flex;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 10px;
        ">
          <!-- WhatsApp -->
          <div style="border: 1.5px solid #1B4317; border-radius: 20px; padding: 4px 8px; display: flex; align-items: center; gap: 6px; background: #FFFFFF; flex: 1; min-width: 0; box-sizing: border-box;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #1B4317; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.161 5.282-1.385c1.458.796 3.091 1.215 4.787 1.216h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.177-2.925-7.063a9.925 9.925 0 0 0-7.059-2.931z"/></svg>
            </div>
            <div style="overflow: hidden;">
              <div style="font-size: 7.5px; font-weight: 800; color: #1B4317; letter-spacing: 0.5px; line-height: 1;">WHATSAPP</div>
              <div style="font-size: 9px; font-weight: 700; color: #2D5E35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${settings.whatsapp || '82708 39507'}</div>
            </div>
          </div>

          <!-- Instagram -->
          <div style="border: 1.5px solid #1B4317; border-radius: 20px; padding: 4px 8px; display: flex; align-items: center; gap: 6px; background: #FFFFFF; flex: 1; min-width: 0; box-sizing: border-box;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #1B4317; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </div>
            <div style="overflow: hidden;">
              <div style="font-size: 7.5px; font-weight: 800; color: #1B4317; letter-spacing: 0.5px; line-height: 1;">INSTAGRAM</div>
              <div style="font-size: 9px; font-weight: 700; color: #2D5E35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">@sharmila_leafware</div>
            </div>
          </div>

          <!-- Website -->
          <div style="border: 1.5px solid #1B4317; border-radius: 20px; padding: 4px 8px; display: flex; align-items: center; gap: 6px; background: #FFFFFF; flex: 1; min-width: 0; box-sizing: border-box;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #1B4317; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div style="overflow: hidden;">
              <div style="font-size: 7.5px; font-weight: 800; color: #1B4317; letter-spacing: 0.5px; line-height: 1;">WEBSITE</div>
              <div style="font-size: 9px; font-weight: 700; color: #2D5E35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">sharmilaleafware.in</div>
            </div>
          </div>

          <!-- Email -->
          <div style="border: 1.5px solid #1B4317; border-radius: 20px; padding: 4px 8px; display: flex; align-items: center; gap: 6px; background: #FFFFFF; flex: 1; min-width: 0; box-sizing: border-box;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #1B4317; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div style="overflow: hidden;">
              <div style="font-size: 7.5px; font-weight: 800; color: #1B4317; letter-spacing: 0.5px; line-height: 1;">EMAIL</div>
              <div style="font-size: 8px; font-weight: 700; color: #2D5E35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${settings.email || 'sharmilaleafware@gmail.com'}</div>
            </div>
          </div>
        </div>

        <!-- BOTTOM THOOTHUKUDI LOCATION -->
        <div style="text-align: center; margin-top: 4px;">
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 900;
            color: #1B4317;
            letter-spacing: 3px;
            text-transform: uppercase;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#1B4317"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>THOOTHUKUDI</span>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 2px;">
            <div style="height: 1px; width: 40px; background: #1B4317; opacity: 0.3;"></div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#1B4317"><path d="M17 8C8 10 5.9 16.17 3.83 12 2c-5.17-2.83-9.17-3.83-11-2.83-2.83 0-5.17 1-7 2.83-1.83 1.83-2.83 4.17-2.83 7 0 7 4.17 11 9.17 12 5.17 0 9.17-4 9.17-9 0-2.83-1-5.17-2.83-7z"/></svg>
            <div style="height: 1px; width: 40px; background: #1B4317; opacity: 0.3;"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Corner Leaf Vine Background SVG -->
      <div style="position: absolute; bottom: 0; right: 0; width: 140px; height: 140px; pointer-events: none; opacity: 0.5; z-index: 1;">
        <svg viewBox="0 0 150 150" width="140" height="140" fill="none">
          <path d="M150 150 C 100 130, 60 90, 80 0" stroke="#1B4317" stroke-width="2" fill="none" opacity="0.4"/>
          <path d="M120 130 C 100 120, 90 140, 110 145 Z" fill="#1B4317" opacity="0.45"/>
          <path d="M90 100 C 70 90, 60 110, 80 115 Z" fill="#2D6A37" opacity="0.4"/>
        </svg>
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
  container.style.height = '1123px';
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

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Order, BusinessSettings } from '@/types';
import { numberToWordsIndian, formatIndianCurrency } from './numberToWords';

export async function generateInvoicePDF(order: Order, settings: BusinessSettings): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Helper to load image as Base64 data URL
  const loadImageBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg'));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // 1. Header Banner & Logo
  const logoData = await loadImageBase64(settings.logoUrl || '/sharmila-logo.jpg');
  let yPos = 14;

  if (logoData) {
    // Add official logo on left
    doc.addImage(logoData, 'JPEG', margin, yPos, 40, 22);
  }

  // Company Title & Info on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(31, 77, 54); // Forest Green #1F4D36
  doc.text((settings.businessName || 'SHARMILA LEAFWARE').toUpperCase(), pageWidth - margin, yPos + 5, {
    align: 'right',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(settings.tagline || 'Natural • Sustainable • Better Future', pageWidth - margin, yPos + 10, {
    align: 'right',
  });

  doc.text(
    `GSTIN: ${settings.gstNumber || '33AAAAA0000A1Z5'} | PAN: ${settings.panNumber || 'AAAAA0000A'}`,
    pageWidth - margin,
    yPos + 14,
    { align: 'right' }
  );
  doc.text(
    `Phone: ${settings.phone} | Email: ${settings.email}`,
    pageWidth - margin,
    yPos + 18,
    { align: 'right' }
  );

  yPos += 26;

  // Divider Line
  doc.setDrawColor(200, 164, 93); // Gold #C8A45D
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  // 2. INVOICE TITLE & DETAILS BAR
  doc.setFillColor(250, 243, 232); // #FAF3E8
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 22, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(31, 77, 54);
  doc.text('TAX INVOICE', margin + 6, yPos + 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No: ${order.invoiceNumber || 'INV-2026-0001'}`, pageWidth - margin - 6, yPos + 8, {
    align: 'right',
  });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Order ID: ${order.orderId}`, pageWidth - margin - 6, yPos + 13, { align: 'right' });
  doc.text(
    `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`,
    pageWidth - margin - 6,
    yPos + 18,
    { align: 'right' }
  );

  yPos += 28;

  // 3. BILL TO (CUSTOMER INFORMATION)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(31, 77, 54);
  doc.text('BILL TO:', margin, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(order.customerName, margin, yPos);
  yPos += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  if (order.companyName) {
    doc.text(order.companyName, margin, yPos);
    yPos += 4;
  }
  doc.text(`Phone: ${order.phone}${order.email ? ' | Email: ' + order.email : ''}`, margin, yPos);
  yPos += 4;

  if (order.address) {
    const splitAddress = doc.splitTextToSize(`Address: ${order.address}`, pageWidth / 2 - margin);
    doc.text(splitAddress, margin, yPos);
    yPos += splitAddress.length * 4;
  }
  if (order.gstNumber) {
    doc.text(`GSTIN: ${order.gstNumber}`, margin, yPos);
    yPos += 4;
  }

  yPos += 4;

  // 4. PRODUCT ITEMS TABLE
  const tableHead = [['S.No', 'Product Description', 'Size', 'Qty', 'Unit Price', 'Total Amount']];
  const tableBody = order.items.map((item, idx) => [
    idx + 1,
    item.productName,
    item.size || '-',
    item.quantity,
    `₹${item.unitPrice.toLocaleString('en-IN')}`,
    `₹${item.total.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [31, 77, 54],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 30 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;
  yPos = finalY;

  // 5. AMOUNT IN WORDS & FINANCIAL SUMMARY
  const summaryX = pageWidth - margin - 70;

  // Financial Box
  doc.setFillColor(250, 243, 232);
  doc.roundedRect(summaryX - 5, yPos, 75, 42, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text('Subtotal:', summaryX, yPos + 6);
  doc.text(`₹${order.subtotal.toLocaleString('en-IN')}`, pageWidth - margin, yPos + 6, { align: 'right' });

  if (order.discount > 0) {
    doc.text('Discount:', summaryX, yPos + 11);
    doc.text(`- ₹${order.discount.toLocaleString('en-IN')}`, pageWidth - margin, yPos + 11, { align: 'right' });
  }

  if (order.transportCharge > 0) {
    doc.text('Transport / Courier:', summaryX, yPos + 16);
    doc.text(`+ ₹${order.transportCharge.toLocaleString('en-IN')}`, pageWidth - margin, yPos + 16, {
      align: 'right',
    });
  }

  // Grand Total Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(31, 77, 54);
  doc.text('Grand Total:', summaryX, yPos + 24);
  doc.text(`₹${order.grandTotal.toLocaleString('en-IN')}`, pageWidth - margin, yPos + 24, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Paid Amount:', summaryX, yPos + 30);
  doc.text(`₹${order.paidAmount.toLocaleString('en-IN')}`, pageWidth - margin, yPos + 30, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(order.balanceAmount > 0 ? 180 : 31, order.balanceAmount > 0 ? 40 : 77, 54);
  doc.text('Balance Due:', summaryX, yPos + 36);
  doc.text(`₹${order.balanceAmount.toLocaleString('en-IN')}`, pageWidth - margin, yPos + 36, { align: 'right' });

  // Amount in Words on Left
  const wordsBoxWidth = summaryX - margin - 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(31, 77, 54);
  doc.text('Amount in Words:', margin, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const amountWords = numberToWordsIndian(order.grandTotal);
  const splitWords = doc.splitTextToSize(amountWords, wordsBoxWidth);
  doc.text(splitWords, margin, yPos + 11);

  // Bank & Payment Details Box
  const bankY = yPos + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(31, 77, 54);
  doc.text('Bank & Payment Details:', margin, bankY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Bank Name: ${settings.bankName || 'HDFC Bank'}`, margin, bankY + 4);
  doc.text(`Account Name: ${settings.accountName || 'Sharmila Leafware'}`, margin, bankY + 8);
  doc.text(
    `A/C No: ${settings.accountNumber} | IFSC: ${settings.ifscCode}`,
    margin,
    bankY + 12
  );
  doc.text(`UPI ID: ${settings.upiId || 'sharmilaleafware@upi'}`, margin, bankY + 16);

  yPos += 48;

  // 6. TERMS & CONDITIONS FOOTER
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 77, 54);
  doc.text('Terms & Conditions:', margin, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const tcText =
    settings.termsAndConditions ||
    '1. Payment due within 7 days.\n2. Goods once sold will not be returned unless damaged during transit.';
  const splitTC = doc.splitTextToSize(tcText, pageWidth - margin * 2);
  doc.text(splitTC, margin, yPos);

  // Page Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(31, 77, 54);
  doc.text('Thank you for choosing Sharmila Leafware — Eco-Friendly Tableware!', pageWidth / 2, pageHeight - 8, {
    align: 'center',
  });

  return doc;
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

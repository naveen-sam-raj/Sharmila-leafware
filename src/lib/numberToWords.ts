/**
 * Converts numbers into Indian Currency Words.
 * Example: 10300 -> "Rupees Ten Thousand Three Hundred Only"
 * Example: 125500.50 -> "Rupees One Lakh Twenty Five Thousand Five Hundred and Fifty Paise Only"
 */

const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teenDigits = [
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const tensDigits = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertTwoDigits(num: number): string {
  if (num === 0) return '';
  if (num < 10) return singleDigits[num];
  if (num >= 10 && num < 20) return teenDigits[num - 10];
  const tens = Math.floor(num / 10);
  const remainder = num % 10;
  return `${tensDigits[tens]}${remainder > 0 ? ' ' + singleDigits[remainder] : ''}`;
}

function convertThreeDigits(num: number): string {
  if (num === 0) return '';
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let str = '';
  if (hundred > 0) {
    str += `${singleDigits[hundred]} Hundred`;
  }
  if (remainder > 0) {
    str += `${str ? ' ' : ''}${convertTwoDigits(remainder)}`;
  }
  return str;
}

export function numberToWordsIndian(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return 'Rupees Zero Only';

  const absoluteNum = Math.abs(num);
  const integerPart = Math.floor(absoluteNum);
  const decimalPart = Math.round((absoluteNum - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Rupees Zero Only';
  }

  let words = '';

  // Break down according to Indian numbering system: Crores (10^7), Lakhs (10^5), Thousands (10^3), Hundreds
  const crores = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakhs = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousands = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundreds = remainder;

  if (crores > 0) {
    words += `${convertTwoDigits(crores)} Crore `;
  }
  if (lakhs > 0) {
    words += `${convertTwoDigits(lakhs)} Lakh `;
  }
  if (thousands > 0) {
    words += `${convertTwoDigits(thousands)} Thousand `;
  }
  if (hundreds > 0) {
    words += `${convertThreeDigits(hundreds)} `;
  }

  words = words.trim();
  let result = words ? `Rupees ${words}` : '';

  if (decimalPart > 0) {
    const paiseWords = convertTwoDigits(decimalPart);
    result += `${result ? ' and ' : 'Paise '}${paiseWords} Paise`;
  }

  return `${result || 'Rupees Zero'} Only`;
}

export function formatIndianCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

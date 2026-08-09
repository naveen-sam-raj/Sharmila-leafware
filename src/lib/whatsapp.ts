export const WHATSAPP_NUMBER = '918270839507';
export const WHATSAPP_MESSAGE = `Hi, I am interested in Sharmila Leafware eco-friendly products. Please share more details.`;

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function whatsappProductLink(productName: string): string {
  const msg = `Hi, I am interested in ${productName}. Please share more details.`;
  return whatsappLink(msg);
}

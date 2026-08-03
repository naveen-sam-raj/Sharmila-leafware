export const WHATSAPP_NUMBER = '918270839507';
export const WHATSAPP_MESSAGE = `Hello Sharmila Leafware,

I would like to know more about your Areca Leaf Products.

Please share your catalogue and pricing.

Thank you.`;

export function whatsappLink(message?: string): string {
  const text = encodeURIComponent(message ?? WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function whatsappProductLink(productName: string): string {
  const msg = `Hello Sharmila Leafware,

I am interested in your "${productName}".

Please share pricing, sizes, and catalogue details.

Thank you.`;
  return whatsappLink(msg);
}

import { createClient } from '@supabase/supabase-js';

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  !envUrl.includes('placeholder') &&
  !envUrl.includes('dummy') &&
  envUrl.startsWith('http')
);

const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://sharmilaleafware-dummy.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isSupabaseConfigured,
    autoRefreshToken: isSupabaseConfigured,
  },
});

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

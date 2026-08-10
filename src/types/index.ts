export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string | null;
  icon?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  category?: Category | string | null;
  category_id?: string | null;
  subCategory?: string;
  size: string;
  sizes?: string[];
  shape?: string;
  price?: number;
  moq?: string;
  description: string;
  images?: string[];
  front_image?: string;
  angle_45_image?: string;
  top_image?: string;
  thumbnail?: string;
  image_url?: string | null;
  gallery_urls?: string[];
  cloudinaryPublicIds?: string[];
  features?: string[];
  domestic_quality?: string | null;
  export_quality?: string | null;
  sort_order?: number;
  status: 'active' | 'inactive';
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type GalleryCategoryEnum =
  | 'MANUFACTURING'
  | 'RAW_MATERIALS'
  | 'FINISHED_PRODUCTS'
  | 'PACKING'
  | 'WAREHOUSE'
  | 'EXPORT_CONTAINERS';

export interface GalleryItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category: GalleryCategoryEnum | string;
  imageUrl?: string;
  image_url?: string;
  cloudinaryPublicId?: string;
  displayOrder?: number;
  sort_order?: number;
  status?: 'active' | 'inactive';
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  _id?: string;
  product?: string | Product;
  productId?: string;
  productName: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentStatusEnum = 'PAID' | 'PARTIALLY_PAID' | 'PENDING';
export type OrderStatusEnum =
  | 'NEW'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  _id?: string;
  id?: string;
  orderId: string;
  invoiceNumber?: string;
  customerName: string;
  companyName?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  transportCharge: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: PaymentStatusEnum;
  orderStatus: OrderStatusEnum;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id?: string;
  id?: string;
  paymentId: string;
  order?: string;
  orderId: string;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseCategoryEnum =
  | 'Transport'
  | 'Courier'
  | 'Packaging'
  | 'Raw Materials'
  | 'Labour'
  | 'Electricity'
  | 'Marketing'
  | 'Office'
  | 'Other';

export interface Expense {
  _id?: string;
  id?: string;
  expenseDate: string;
  category: ExpenseCategoryEnum;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessSettings {
  _id?: string;
  businessName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  invoicePrefix: string;
  orderPrefix: string;
  termsAndConditions: string;
  updatedAt?: string;
}

export interface DashboardStats {
  range: string;
  totalOrders: number;
  totalOrderValue: number;
  totalPaid: number;
  totalPending: number;
  totalExpenses: number;
  netAmount: number;
  recentOrders: Order[];
  recentPayments: Payment[];
  chartExpensesByCategory: Array<{ category: string; amount: number }>;
  chartSales: Array<{ date: string; amount: number }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

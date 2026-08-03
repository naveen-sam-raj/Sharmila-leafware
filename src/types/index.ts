export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[];
  sizes: string[];
  features: string[];
  domestic_quality: string | null;
  export_quality: string | null;
  sort_order: number;
  created_at: string;
  category?: Category | null;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export const GALLERY_CATEGORIES = [
  'Manufacturing',
  'Raw Materials',
  'Finished Products',
  'Packing',
  'Warehouse',
  'Export Containers',
] as const;

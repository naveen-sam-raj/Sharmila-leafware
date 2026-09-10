import type { Category, Product, GalleryItem } from '@/types';

export const MOCK_CATEGORIES: Category[] = [];

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Fallen Areca Leaf Selection',
    category: 'Raw Materials',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-2',
    title: 'High Pressure Thermo-Forming',
    category: 'Manufacturing',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-3',
    title: 'Sterilized Finished Tableware',
    category: 'Finished Products',
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-4',
    title: 'Export Container Loading',
    category: 'Export Containers',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    sort_order: 4,
    created_at: new Date().toISOString(),
  }
];

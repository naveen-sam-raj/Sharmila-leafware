import type { Category, Product, GalleryItem } from '@/types';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_GALLERY } from '@/data/mockData';

export async function fetchCategories(): Promise<Category[]> {
  return MOCK_CATEGORIES;
}

export async function fetchProducts(): Promise<Product[]> {
  return MOCK_PRODUCTS;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? MOCK_PRODUCTS[0];
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  return MOCK_GALLERY;
}

// ---- Admin mutations ----

export async function createProduct(product: Partial<Product>): Promise<Product> {
  return { id: String(Date.now()), ...product } as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  return { id, ...updates } as Product;
}

export async function deleteProduct(_id: string): Promise<void> {
  return;
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  return { id: String(Date.now()), ...category } as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  return { id, ...updates } as Category;
}

export async function deleteCategory(_id: string): Promise<void> {
  return;
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> {
  return { id: String(Date.now()), created_at: new Date().toISOString(), ...item } as GalleryItem;
}

export async function deleteGalleryItem(_id: string): Promise<void> {
  return;
}

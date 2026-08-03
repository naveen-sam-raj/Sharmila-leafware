import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Category, Product, GalleryItem } from '@/types';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_GALLERY } from '@/data/mockData';

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return MOCK_CATEGORIES;
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return MOCK_CATEGORIES;
    return data;
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return MOCK_PRODUCTS;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return MOCK_PRODUCTS;
    return data;
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? MOCK_PRODUCTS[0];
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) {
      return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? MOCK_PRODUCTS[0];
    }
    return data;
  } catch {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? MOCK_PRODUCTS[0];
  }
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured) return MOCK_GALLERY;
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return MOCK_GALLERY;
    return data;
  } catch {
    return MOCK_GALLERY;
  }
}

// ---- Admin mutations ----

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> {
  const { data, error } = await supabase.from('gallery').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
}

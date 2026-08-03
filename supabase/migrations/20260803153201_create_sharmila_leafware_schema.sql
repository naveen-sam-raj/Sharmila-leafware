/*
# Sharmila Leafware - Database Schema

## Overview
Creates the complete database schema for Sharmila Leafware, a B2B manufacturer
of Areca Palm Leaf disposable tableware. The website is a marketing/catalogue
site (no ecommerce). The only conversion goal is WhatsApp enquiry.

## New Tables

### categories
- `id` (uuid, primary key)
- `name` (text, not null) — e.g. "Round Plates"
- `slug` (text, unique, not null) — URL-friendly identifier
- `description` (text) — short description
- `icon` (text) — lucide icon name for the category
- `sort_order` (int, default 0) — display ordering
- `created_at` (timestamptz)

### products
- `id` (uuid, primary key)
- `category_id` (uuid, FK -> categories, ON DELETE SET NULL)
- `name` (text, not null)
- `slug` (text, unique, not null)
- `description` (text)
- `image_url` (text) — main product image
- `gallery_urls` (text[]) — additional images
- `sizes` (text[]) — available sizes e.g. ["4 inch", "6 inch"]
- `features` (text[]) — key features
- `domestic_quality` (text) — domestic quality description
- `export_quality` (text) — export quality description
- `sort_order` (int, default 0)
- `created_at` (timestamptz)

### gallery
- `id` (uuid, primary key)
- `title` (text, not null)
- `category` (text) — "Manufacturing", "Raw Materials", "Finished Products", "Packing", "Warehouse", "Export Containers"
- `image_url` (text, not null)
- `sort_order` (int, default 0)
- `created_at` (timestamptz)

## Security (RLS)
- All three tables: public read access (anon + authenticated) since the catalogue
  is intentionally public for international buyers.
- Write access (INSERT/UPDATE/DELETE) restricted to authenticated users (admin).
- Admin authentication uses Supabase Auth (auth.users). The admin signs in via
  the admin panel; no public sign-up.

## Seed Data
- 6 categories (Round, Square, Rectangle, Compartment, Bowls, Trays)
- 6 products (one per category) with sizes, features, and image URLs
- 12 gallery images across all gallery categories
*/

-- ===== CATEGORIES =====
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text DEFAULT 'CircleDot',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ===== PRODUCTS =====
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  gallery_urls text[] DEFAULT '{}',
  sizes text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  domestic_quality text,
  export_quality text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ===== GALLERY =====
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON gallery;
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery;
CREATE POLICY "admin_insert_gallery" ON gallery FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_gallery" ON gallery;
CREATE POLICY "admin_update_gallery" ON gallery FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery;
CREATE POLICY "admin_delete_gallery" ON gallery FOR DELETE
  TO authenticated USING (true);

-- ===== SEED DATA =====

-- Categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Round Plates', 'round-plates', 'Classic round areca leaf plates for everyday dining and events.', 'Circle', 1),
('Square Plates', 'square-plates', 'Modern square-shaped plates with clean edges.', 'Square', 2),
('Rectangle Plates', 'rectangle-plates', 'Elegant rectangular plates for plating and serving.', 'RectangleHorizontal', 3),
('Compartment Plates', 'compartment-plates', 'Multi-compartment plates for meals that need separation.',('Columns3'), 4),
('Bowls', 'bowls', 'Natural leaf bowls for soups, snacks, and desserts.', 'Soup', 5),
('Trays', 'trays', 'Sturdy serving trays for catering and hospitality.',('Grid2x2'), 6)
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (category_id, name, slug, description, image_url, gallery_urls, sizes, features, domestic_quality, export_quality, sort_order) VALUES
(
  (SELECT id FROM categories WHERE slug = 'round-plates'),
  'Round Areca Leaf Plates',
  'round-areca-leaf-plates',
  'Crafted from naturally fallen areca palm leaves, these round plates are perfect for weddings, parties, restaurants, and everyday use. No chemicals, no coating — just pure nature.',
  'https://images.pexels.com/photos/8251873/pexels-photo-8251873.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ARRAY[
    'https://images.pexels.com/photos/8251873/pexels-photo-8251873.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/29068733/pexels-photo-29068733.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/36694543/pexels-photo-36694543.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ],
  ARRAY['4 inch','5 inch','6 inch','7 inch','8 inch','9 inch','10 inch','12 inch'],
  ARRAY['100% Natural','Chemical Free','Food Safe','Biodegradable','Compostable','Leak Proof'],
  'Premium quality plates for domestic catering, events, and retail. Uniform thickness with smooth edges.',
  'Export-grade plates with strict quality control, moisture-controlled packing, and FDA-compliant food safety standards.',
  1
),
(
  (SELECT id FROM categories WHERE slug = 'square-plates'),
  'Square Areca Leaf Plates',
  'square-areca-leaf-plates',
  'Contemporary square plates that bring a modern aesthetic to natural dining. Ideal for premium restaurants and boutique catering.',
  'https://images.pexels.com/photos/19856926/pexels-photo-19856926.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ARRAY[
    'https://images.pexels.com/photos/19856926/pexels-photo-19856926.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/28548857/pexels-photo-28548857.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/7675061/pexels-photo-7675061.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ],
  ARRAY['4 inch','6 inch','8 inch','10 inch'],
  ARRAY['100% Natural','Chemical Free','Food Safe','Biodegradable','Sturdy & Durable'],
  'Clean edges and consistent thickness for domestic hospitality and retail.',
  'Export-grade with enhanced structural integrity, ideal for international food service standards.',
  2
),
(
  (SELECT id FROM categories WHERE slug = 'rectangle-plates'),
  'Rectangle Areca Leaf Plates',
  'rectangle-areca-leaf-plates',
  'Sleek rectangular plates designed for elegant plating and buffet service. A favourite for premium catering and fine dining.',
  'https://images.pexels.com/photos/28319639/pexels-photo-28319639.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ARRAY[
    'https://images.pexels.com/photos/28319639/pexels-photo-28319639.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/29068735/pexels-photo-29068735.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/25020309/pexels-photo-25020309.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ],
  ARRAY['5x3 inch','7x4 inch','9x6 inch','12x8 inch'],
  ARRAY['100% Natural','Chemical Free','Food Safe','Biodegradable','Heat Resistant'],
  'Reliable rectangular plates for domestic catering and event management.',
  'Export-grade with reinforced edges and export-standard packing for long-distance shipping.',
  3
),
(
  (SELECT id FROM categories WHERE slug = 'compartment-plates'),
  'Compartment Areca Leaf Plates',
  'compartment-areca-leaf-plates',
  'Multi-compartment plates that keep curries, rice, and sides perfectly separated. Perfect for meals, thalis, and food festivals.',
  'https://images.pexels.com/photos/28548857/pexels-photo-28548857.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ARRAY[
    'https://images.pexels.com/photos/28548857/pexels-photo-28548857.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/25020309/pexels-photo-25020309.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/36694543/pexels-photo-36694543.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ],
  ARRAY['3 Compartment','4 Compartment','5 Compartment'],
  ARRAY['100% Natural','Chemical Free','Food Safe','Biodegradable','Leak Proof'],
  'Popular for domestic events, temple feasts, and catering services.',
  'Export-grade compartment plates meeting international food safety and packaging standards.',
  4
),
(
  (SELECT id FROM categories WHERE slug = 'bowls'),
  'Areca Leaf Bowls',
  'areca-leaf-bowls',
  'Natural leaf bowls for serving soups, snacks, desserts, and salads. Sturdy, leak-proof, and fully biodegradable.',
  'https://images.pexels.com/photos/10921430/pexels-photo-10921430.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ARRAY[
    'https://images.pexels.com/photos/10921430/pexels-photo-10921430.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6962764/pexels-photo-6962764.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/8251778/pexels-photo-8251778.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ],
  ARRAY['2 oz','4 oz','6 oz','8 oz','12 oz','16 oz'],
  ARRAY['100% Natural','Chemical Free','Food Safe','Biodegradable','Leak Proof'],
  'Everyday bowls for domestic retail and food service.',
  'Export-grade bowls with uniform wall thickness and export-quality moisture packing.',
  5
),
(
  (SELECT id FROM categories WHERE slug = 'trays'),
  'Areca Leaf Trays',
  'areca-leaf-trays',
  'Sturdy serving trays for catering, hospitality, and bulk food service. Built to hold weight without bending.',
  'https://images.pexels.com/photos/7675061/pexels-photo-7675061.jpeg?auto=compress&cs=tinysrgb&w=1200',
  ARRAY[
    'https://images.pexels.com/photos/7675061/pexels-photo-7675061.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6962742/pexels-photo-6962742.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/12915899/pexels-photo-12915899.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ],
  ARRAY['Small','Medium','Large','Extra Large'],
  ARRAY['100% Natural','Chemical Free','Food Safe','Biodegradable','Heavy Duty'],
  'Reliable trays for domestic catering and hotel service.',
  'Export-grade trays with reinforced base, ideal for international airline and hospitality catering.',
  6
)
ON CONFLICT (slug) DO NOTHING;

-- Gallery
INSERT INTO gallery (title, category, image_url, sort_order) VALUES
('Areca Palm Leaves', 'Raw Materials', 'https://images.pexels.com/photos/12017155/pexels-photo-12017155.jpeg?auto=compress&cs=tinysrgb&w=1200', 1),
('Tropical Palm Fronds', 'Raw Materials', 'https://images.pexels.com/photos/27249164/pexels-photo-27249164.jpeg?auto=compress&cs=tinysrgb&w=1200', 2),
('Green Palm Texture', 'Raw Materials', 'https://images.pexels.com/photos/15769346/pexels-photo-15769346.jpeg?auto=compress&cs=tinysrgb&w=1200', 3),
('Heat Pressing', 'Manufacturing', 'https://images.pexels.com/photos/34221997/pexels-photo-34221997.jpeg?auto=compress&cs=tinysrgb&w=1200', 4),
('Production Line', 'Manufacturing', 'https://images.pexels.com/photos/5532664/pexels-photo-5532664.jpeg?auto=compress&cs=tinysrgb&w=1200', 5),
('Quality Control', 'Manufacturing', 'https://images.pexels.com/photos/14804687/pexels-photo-14804687.jpeg?auto=compress&cs=tinysrgb&w=1200', 6),
('Round Plates', 'Finished Products', 'https://images.pexels.com/photos/8251873/pexels-photo-8251873.jpeg?auto=compress&cs=tinysrgb&w=1200', 7),
('Square Plates', 'Finished Products', 'https://images.pexels.com/photos/19856926/pexels-photo-19856926.jpeg?auto=compress&cs=tinysrgb&w=1200', 8),
('Natural Bowls', 'Finished Products', 'https://images.pexels.com/photos/10921430/pexels-photo-10921430.jpeg?auto=compress&cs=tinysrgb&w=1200', 9),
('Packed & Ready', 'Packing', 'https://images.pexels.com/photos/6990568/pexels-photo-6990568.jpeg?auto=compress&cs=tinysrgb&w=1200', 10),
('Warehouse Storage', 'Warehouse', 'https://images.pexels.com/photos/2760286/pexels-photo-2760286.jpeg?auto=compress&cs=tinysrgb&w=1200', 11),
('Export Containers', 'Export Containers', 'https://images.pexels.com/photos/14020705/pexels-photo-14020705.jpeg?auto=compress&cs=tinysrgb&w=1200', 12),
('Cargo Shipping', 'Export Containers', 'https://images.pexels.com/photos/262353/pexels-photo-262353.jpeg?auto=compress&cs=tinysrgb&w=1200', 13),
('Port Dispatch', 'Export Containers', 'https://images.pexels.com/photos/1211787/pexels-photo-1211787.jpeg?auto=compress&cs=tinysrgb&w=1200', 14)
ON CONFLICT DO NOTHING;

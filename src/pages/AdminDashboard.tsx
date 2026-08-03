import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, FolderTree, Image, LogOut, Plus, Edit3, Trash2, X, Leaf, TrendingUp, Grid, Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchProducts, fetchCategories, fetchGallery,
  createProduct, updateProduct, deleteProduct,
  createCategory, updateCategory, deleteCategory,
  createGalleryItem, deleteGalleryItem,
} from '@/lib/api';
import type { Product, Category, GalleryItem } from '@/types';
import { GALLERY_CATEGORIES } from '@/types';

type Tab = 'overview' | 'products' | 'categories' | 'gallery';

export default function AdminDashboard() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate('/admin');
  }, [loading, session, navigate]);

  const loadAll = async () => {
    try {
      const [p, c, g] = await Promise.all([fetchProducts(), fetchCategories(), fetchGallery()]);
      setProducts(p);
      setCategories(c);
      setGallery(g);
    } catch {
      // ignore
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadAll();
  }, [session]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-luxury-gold/30 border-t-luxury-gold animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const stats = [
    { icon: Package, label: 'Products', value: products.length },
    { icon: FolderTree, label: 'Categories', value: categories.length },
    { icon: Image, label: 'Gallery Images', value: gallery.length },
  ];

  return (
    <div className="min-h-screen bg-luxury-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-luxury-surface border-r border-luxury-green/15 flex flex-col fixed h-full z-30">
        <div className="p-6 flex items-center gap-3 border-b border-luxury-gold/15">
          <div className="w-10 h-10 rounded-full green-border flex items-center justify-center">
            <Leaf className="w-5 h-5 text-luxury-green" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg text-luxury-ink">Sharmila</span>
            <span className="font-sans text-[9px] tracking-[0.3em] text-luxury-gold uppercase">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {([
            { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'categories', icon: FolderTree, label: 'Categories' },
            { id: 'gallery', icon: Image, label: 'Gallery' },
          ] as { id: Tab; icon: typeof LayoutDashboard; label: string }[]).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm transition-all duration-300 ${
                tab === item.id
                  ? 'bg-luxury-green/10 text-luxury-green border border-luxury-green/20'
                  : 'text-luxury-ink-muted hover:bg-white/[0.03]'
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-luxury-gold/15">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-luxury-ink capitalize">{tab}</h1>
            <p className="font-sans text-sm text-luxury-ink-muted/70 mt-1">
              {tab === 'overview' && 'Welcome back to your dashboard.'}
              {tab === 'products' && 'Manage your product catalogue.'}
              {tab === 'categories' && 'Organise your product categories.'}
              {tab === 'gallery' && 'Upload and manage gallery images.'}
            </p>
          </div>
          {(tab === 'products' || tab === 'categories' || tab === 'gallery') && (
            <button
              onClick={() => {
                if (tab === 'products') { setEditingProduct(null); setShowProductModal(true); }
                if (tab === 'categories') { setEditingCategory(null); setShowCategoryModal(true); }
                if (tab === 'gallery') setShowGalleryModal(true);
              }}
              className="btn-gold"
            >
              <Plus className="w-4 h-4" />
              {tab === 'products' ? 'Add Product' : tab === 'categories' ? 'Add Category' : 'Add Image'}
            </button>
          )}
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-luxury-gold/30 border-t-luxury-gold animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {stats.map((s) => (
                    <div key={s.label} className="p-6 rounded-2xl glass-gold">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl green-border flex items-center justify-center">
                          <s.icon className="w-6 h-6 text-luxury-green" strokeWidth={1.5} />
                        </div>
                        <TrendingUp className="w-5 h-5 text-luxury-green/60" />
                      </div>
                      <p className="font-serif text-4xl text-luxury-ink">{s.value}</p>
                      <p className="font-sans text-sm text-luxury-ink-muted/70 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl glass">
                  <h3 className="font-serif text-xl text-luxury-ink mb-4">Recent Products</h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl glass hover:gold-border transition-all">
                        <img src={p.image_url ?? ''} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-sans text-sm text-luxury-ink">{p.name}</p>
                          <p className="font-sans text-xs text-luxury-ink-muted/70">{p.sizes.length} sizes</p>
                        </div>
                        <span className="font-sans text-xs text-luxury-green/60">{p.category?.name ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRODUCTS */}
            {tab === 'products' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="group rounded-2xl glass-gold overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={p.image_url ?? ''} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg text-luxury-ink mb-1">{p.name}</h3>
                      <p className="font-sans text-xs text-luxury-gold/60 mb-3">{p.category?.name ?? 'Uncategorised'}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg glass text-luxury-gold text-xs hover:gold-border transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${p.name}"?`)) {
                              await deleteProduct(p.id);
                              loadAll();
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg glass text-red-400/70 text-xs hover:border-red-400/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CATEGORIES */}
            {tab === 'categories' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((c) => (
                  <div key={c.id} className="p-6 rounded-2xl glass-gold">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl gold-border flex items-center justify-center">
                        <Grid className="w-5 h-5 text-luxury-gold" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-serif text-lg text-luxury-ink">{c.name}</h3>
                    </div>
                    <p className="font-sans text-sm text-luxury-ink-muted mb-4">{c.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingCategory(c); setShowCategoryModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg glass text-luxury-gold text-xs hover:gold-border transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete category "${c.name}"?`)) {
                            await deleteCategory(c.id);
                            loadAll();
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg glass text-red-400/70 text-xs hover:border-red-400/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GALLERY */}
            {tab === 'gallery' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((g) => (
                  <div key={g.id} className="group relative rounded-2xl glass-gold overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <p className="font-sans text-sm text-luxury-ink truncate">{g.title}</p>
                      <p className="font-sans text-[10px] text-luxury-gold/60 uppercase tracking-wide">{g.category}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete "${g.title}"?`)) {
                          await deleteGalleryItem(g.id);
                          loadAll();
                        }
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 border border-red-400/30 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowProductModal(false)}
          onSaved={() => { setShowProductModal(false); loadAll(); }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowCategoryModal(false)}
          onSaved={() => { setShowCategoryModal(false); loadAll(); }}
        />
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <GalleryModal
          onClose={() => setShowGalleryModal(false)}
          onSaved={() => { setShowGalleryModal(false); loadAll(); }}
        />
      )}
    </div>
  );
}

// ===== Product Modal =====
function ProductModal({ product, categories, onClose, onSaved }: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    category_id: product?.category_id ?? categories[0]?.id ?? '',
    description: product?.description ?? '',
    image_url: product?.image_url ?? '',
    gallery_urls: (product?.gallery_urls ?? []).join('\n'),
    sizes: (product?.sizes ?? []).join(', '),
    features: (product?.features ?? []).join('\n'),
    domestic_quality: product?.domestic_quality ?? '',
    export_quality: product?.export_quality ?? '',
    sort_order: product?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        category_id: form.category_id || null,
        description: form.description,
        image_url: form.image_url,
        gallery_urls: form.gallery_urls.split('\n').map((s) => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
        domestic_quality: form.domestic_quality,
        export_quality: form.export_quality,
        sort_order: Number(form.sort_order) || 0,
      };
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={product ? 'Edit Product' : 'Add Product'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
        </div>

        <div>
          <label className="block font-sans text-xs tracking-wide text-luxury-gold/70 uppercase mb-2">Category</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-luxury-gold/20 text-luxury-ink font-sans text-sm focus:border-luxury-gold/50 focus:outline-none"
          >
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />

        <Field label="Main Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />

        <Field label="Gallery URLs (one per line)" value={form.gallery_urls} onChange={(v) => setForm({ ...form, gallery_urls: v })} textarea />

        <Field label="Sizes (comma separated)" value={form.sizes} onChange={(v) => setForm({ ...form, sizes: v })} />

        <Field label="Features (one per line)" value={form.features} onChange={(v) => setForm({ ...form, features: v })} textarea />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Domestic Quality" value={form.domestic_quality} onChange={(v) => setForm({ ...form, domestic_quality: v })} textarea />
          <Field label="Export Quality" value={form.export_quality} onChange={(v) => setForm({ ...form, export_quality: v })} textarea />
        </div>

        <Field label="Sort Order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} type="number" />

        {error && <p className="font-sans text-sm text-red-400/80">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl glass text-luxury-ink-muted font-sans text-sm hover:gold-border transition-all">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-gold disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ===== Category Modal =====
function CategoryModal({ category, onClose, onSaved }: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    icon: category?.icon ?? 'CircleDot',
    sort_order: category?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        icon: form.icon,
        sort_order: Number(form.sort_order) || 0,
      };
      if (category) {
        await updateCategory(category.id, payload);
      } else {
        await createCategory(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={category ? 'Edit Category' : 'Add Category'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
        <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Icon (lucide name)" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
          <Field label="Sort Order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} type="number" />
        </div>

        {error && <p className="font-sans text-sm text-red-400/80">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl glass text-luxury-ink-muted font-sans text-sm hover:gold-border transition-all">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-gold disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ===== Gallery Modal =====
function GalleryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: '',
    category: GALLERY_CATEGORIES[0] as string,
    image_url: '',
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createGalleryItem({
        title: form.title,
        category: form.category,
        image_url: form.image_url,
        sort_order: Number(form.sort_order) || 0,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add Gallery Image" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <div>
          <label className="block font-sans text-xs tracking-wide text-luxury-gold/70 uppercase mb-2">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-luxury-gold/20 text-luxury-ink font-sans text-sm focus:border-luxury-gold/50 focus:outline-none"
          >
            {GALLERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <Field label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} required />
        <Field label="Sort Order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) })} type="number" />

        {error && <p className="font-sans text-sm text-red-400/80">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl glass text-luxury-ink-muted font-sans text-sm hover:gold-border transition-all">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 btn-gold disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ===== Shared Modal =====
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl glass-gold"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-luxury-ink">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass flex items-center justify-center text-luxury-ink-muted hover:text-luxury-gold transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ===== Shared Field =====
function Field({ label, value, onChange, required, placeholder, textarea, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block font-sans text-xs tracking-wide text-luxury-gold/70 uppercase mb-2">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/50 border border-luxury-gold/20 text-luxury-ink font-sans text-sm focus:border-luxury-gold/50 focus:outline-none focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-white/50 border border-luxury-gold/20 text-luxury-ink font-sans text-sm focus:border-luxury-gold/50 focus:outline-none focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all"
        />
      )}
    </div>
  );
}

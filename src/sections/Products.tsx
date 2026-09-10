import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, fetchCategories } from '@/lib/api';
import type { Product, Category } from '@/types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catsRes] = await Promise.all([
          fetchProducts({ status: 'active', limit: 100 }),
          fetchCategories(false),
        ]);
        setProducts(prodRes.products || []);
        setCategories(catsRes || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCatId === 'all') return true;
    const pCatId =
      typeof p.category === 'object' && p.category ? p.category._id || p.category.id : (p.category as string) || p.category_id;
    return pCatId === selectedCatId;
  });

  return (
    <section id="products" className="relative py-24 lg:py-32 overflow-hidden bg-[#FAF3E8]">
      {/* Ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E9D5A1]/30 blur-[140px] rounded-full pointer-events-none" />

      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Our Collection"
          title={<>Premium Areca Leaf <span className="gold-text">Products</span></>}
          subtitle="Each piece is heat-pressed from a single fallen areca palm leaf — no chemicals, no binders, no coatings. Just nature, shaped into tableware worthy of the world's finest tables."
        />

        {/* Category Tabs */}
        {!loading && !error && categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10 mb-6">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedCatId === 'all'
                  ? 'bg-[#1F4D36] text-white shadow-md border border-[#C8A45D]'
                  : 'bg-white/80 text-[#1F4D36] border border-[#1F4D36]/20 hover:bg-[#F5E6C8] hover:border-[#C8A45D]'
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((cat) => {
              const id = cat._id || cat.id || '';
              const isSelected = selectedCatId === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCatId(id)}
                  className={`px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#1F4D36] text-white shadow-md border border-[#C8A45D]'
                      : 'bg-white/80 text-[#1F4D36] border border-[#1F4D36]/20 hover:bg-[#F5E6C8] hover:border-[#C8A45D]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mt-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[20px] bg-white border border-[#1F4D36]/10 animate-pulse shadow-sm" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-16 flex flex-col items-center gap-4 py-16">
            <AlertCircle className="w-12 h-12 text-[#C8A45D]" />
            <p className="font-sans text-sm text-[#475569]">Unable to load products from server. Please try again later.</p>
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mt-10">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product._id || product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-12 text-center py-16 px-6 bg-white/90 backdrop-blur-md rounded-3xl border border-[#C8A45D]/30 shadow-md max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FAF3E8] border border-[#C8A45D]/40 text-[#1F4D36] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-[#C8A45D]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1F4D36] mb-2">No Products Uploaded Yet</h3>
            <p className="font-sans text-sm text-[#52665A] mb-6 max-w-md mx-auto">
              The product catalogue is clean and ready. Login to the Admin Dashboard to add your export products, or contact us directly on WhatsApp for full catalogue details.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/admin"
                className="px-6 py-3 rounded-full bg-[#1F4D36] text-white font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#163827] transition-all"
              >
                Go to Admin Dashboard
              </a>
              <a
                href="https://wa.me/918270839507?text=Hello%20Sharmila%20Leafware,%20I%20want%20to%20inquire%20about%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-[#25D366] text-white font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#20ba5a] transition-all flex items-center gap-2"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

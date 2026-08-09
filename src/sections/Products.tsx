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
          <div className="flex flex-wrap items-center justify-center gap-2 mt-10 mb-6">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-5 py-2.5 rounded-full font-sans text-xs font-semibold transition-all shadow-xs ${
                selectedCatId === 'all'
                  ? 'bg-[#1F4D36] text-white shadow-md'
                  : 'bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:bg-[#F5E6C8]'
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
                  className={`px-5 py-2.5 rounded-full font-sans text-xs font-semibold transition-all shadow-xs ${
                    isSelected
                      ? 'bg-[#1F4D36] text-white shadow-md'
                      : 'bg-white text-[#1F4D36] border border-[#1F4D36]/15 hover:bg-[#F5E6C8]'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product._id || product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mt-12 text-center py-16 bg-white rounded-3xl border border-[#1F4D36]/15">
            <p className="font-sans text-sm text-[#64748B]">No products currently available in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}

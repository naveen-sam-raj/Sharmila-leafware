import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import ProductCard from '@/components/ProductCard';
import { fetchProducts } from '@/lib/api';
import type { Product } from '@/types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

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

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[20px] bg-white border border-[#1F4D36]/10 animate-pulse shadow-sm" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-16 flex flex-col items-center gap-4 py-16">
            <AlertCircle className="w-12 h-12 text-[#C8A45D]" />
            <p className="font-sans text-sm text-[#475569]">Unable to load products. Please try again later.</p>
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


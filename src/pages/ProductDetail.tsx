import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Package, Tag, ShieldCheck } from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '@/lib/api';
import type { Product } from '@/types';
import { whatsappProductLink } from '@/lib/whatsapp';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImage(0);
    fetchProductBySlug(slug)
      .then((data) => {
        if (!data) {
          setError(true);
          return;
        }
        setProduct(data);
        // Fetch related products
        fetchProducts({ limit: 4 }).then((res) => {
          setRelated((res.products || []).filter((p) => p.slug !== slug).slice(0, 3));
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-[#FAF3E8]">
        <div className="w-12 h-12 rounded-full border-2 border-[#1F4D36]/20 border-t-[#1F4D36] animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-24 bg-[#FAF3E8]">
        <p className="font-serif text-3xl text-[#1F4D36]">Product not found</p>
        <Link to="/#products" className="px-6 py-3 rounded-full font-sans text-xs font-semibold uppercase text-white bg-[#1F4D36] inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  // Combine thumbnail & images array safely
  const mainImg = product.thumbnail || product.image_url || '';
  const addlImgs = product.images || product.gallery_urls || [];
  const gallery = [mainImg, ...addlImgs].filter((url, idx, arr) => url && arr.indexOf(url) === idx);

  const categoryName =
    typeof product.category === 'object' && product.category
      ? product.category.name
      : 'Areca Leaf Product';

  const sizeText = product.size || (product.sizes ? product.sizes.join(', ') : '');

  return (
    <div className="pt-20 bg-[#FAF3E8] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="section-padding py-6 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 font-sans text-xs text-[#475569]">
          <Link to="/" className="hover:text-[#1F4D36] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#1F4D36]/40" />
          <Link to="/#products" className="hover:text-[#1F4D36] transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3 text-[#1F4D36]/40" />
          <span className="text-[#1F4D36] font-semibold">{product.name}</span>
        </nav>
      </div>

      {/* Main product detail section */}
      <section className="section-padding pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Gallery Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Large Main image */}
            <div className="relative aspect-square rounded-[24px] overflow-hidden bg-white border border-[#1F4D36]/15 shadow-md mb-4">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={gallery[activeImage] || mainImg}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square rounded-[16px] overflow-hidden transition-all duration-300 ${
                      activeImage === i
                        ? 'border-2 border-[#1F4D36] shadow-md scale-105'
                        : 'bg-white border border-[#1F4D36]/15 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="p-8 rounded-[24px] bg-white border border-[#1F4D36]/15 shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#1F4D36]/40" />
              <span className="font-sans text-xs tracking-[0.3em] text-[#C8A45D] uppercase font-bold">
                {categoryName}
              </span>
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl text-[#1F4D36] font-medium mb-4">{product.name}</h1>


            <p className="font-sans text-base font-light text-[#475569] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-4 rounded-2xl bg-[#FAF3E8]/50 border border-[#1F4D36]/10">
              {sizeText && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#1F4D36]/20 flex items-center justify-center text-[#1F4D36]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider block">Dimensions / Size</span>
                    <span className="font-sans text-sm font-semibold text-[#1F4D36]">{sizeText}</span>
                  </div>
                </div>
              )}

              {product.shape && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#1F4D36]/20 flex items-center justify-center text-[#1F4D36]">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] text-[#64748B] uppercase tracking-wider block">Shape</span>
                    <span className="font-sans text-sm font-semibold text-[#1F4D36]">{product.shape}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Features checklist if present */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-sans text-xs tracking-[0.2em] text-[#1F4D36] uppercase font-bold mb-4">Key Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#1F4D36]/10 border border-[#1F4D36]/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#1F4D36]" strokeWidth={2.5} />
                      </div>
                      <span className="font-sans text-sm font-light text-[#334155]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantee Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>100% Fallen Areca Leaf • Heat Pressed • Chemical & Plastic-Free • Export Grade Quality</span>
            </div>

            {/* WhatsApp Enquiry Button */}
            <a 
              href={whatsappProductLink(product.name)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary-forest w-full inline-flex items-center justify-center gap-3 text-sm py-4 shadow-lg hover:shadow-xl"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enquire About This Product
            </a>
          </motion.div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="section-padding py-16 bg-[#FAF3E8] border-t border-[#1F4D36]/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center gap-3 justify-center mb-4">
                <span className="h-px w-8 bg-[#1F4D36]/40" />
                <span className="font-sans text-xs tracking-[0.3em] text-[#1F4D36] uppercase font-semibold">Explore More</span>
                <span className="h-px w-8 bg-[#1F4D36]/40" />
              </div>
              <h2 className="font-serif text-4xl text-[#1F4D36] font-medium">Related Products</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <ProductCard key={p._id || p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Sparkles,
  Globe,
  Droplets,
  Ruler,
  Package,
  Check,
  MessageCircle,
  RotateCcw,
  ZoomIn,
  Award,
  Star,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { fetchProductBySlug, fetchProducts } from '@/lib/api';
import type { Product } from '@/types';
import { whatsappProductLink } from '@/lib/whatsapp';
import ProductCard from '@/components/ProductCard';

/* ─── Tiny Fullscreen Lightbox ─────────────────────────────────────── */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center justify-center text-lg font-light"
        aria-label="Close lightbox"
      >
        ✕
      </button>
    </motion.div>
  );
}

/* ─── Premium Image Viewer ──────────────────────────────────────────── */
function ProductImageViewer({ product }: { product: Product }) {
  const mainImg = product.thumbnail || product.image_url || '';
  const allImages = product.images && product.images.length > 0 ? product.images : [mainImg];

  const viewFront = product.front_image || allImages[0] || mainImg;
  const viewAngle = product.angle_45_image || (allImages[1] !== viewFront ? allImages[1] : undefined);
  const viewTop = product.top_image || (allImages[2] !== viewFront && allImages[2] !== viewAngle ? allImages[2] : undefined);

  const rawViews = [
    { label: 'Front View', code: 'FRONT', url: viewFront },
    { label: '45° Angle', code: '45°', url: viewAngle },
    { label: 'Top View', code: 'TOP', url: viewTop },
  ].filter((item): item is { label: string; code: string; url: string } => Boolean(item.url));

  const views = rawViews.filter((item, index, self) => index === self.findIndex((t) => t.url === item.url));

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const startXRef = useRef<number | null>(null);

  const activeView = views[activeIndex] || views[0];

  const prevView = () => setActiveIndex((p) => (p - 1 + views.length) % views.length);
  const nextView = () => setActiveIndex((p) => (p + 1) % views.length);

  const handleDragStart = (x: number) => {
    if (views.length <= 1) return;
    startXRef.current = x;
    setIsDragging(true);
  };
  const handleDragMove = (x: number, e?: React.TouchEvent) => {
    if (!isDragging || startXRef.current === null) return;
    const diff = x - startXRef.current;
    if (Math.abs(diff) > 40) {
      if (e?.cancelable) e.preventDefault();
      diff < 0 ? nextView() : prevView();
      startXRef.current = x;
    }
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    startXRef.current = null;
  };

  return (
    <div className="space-y-4 select-none max-w-md mx-auto lg:max-w-none">
      {/* Main Stage */}
      <div
        className={`relative rounded-[28px] overflow-hidden bg-[#FAF3E8] border border-[#C8A45D]/40 shadow-lg cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e)}
        onTouchEnd={handleDragEnd}
      >
        {/* 360 Badge */}
        {views.length > 1 && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E291C]/85 backdrop-blur-md border border-[#C8A45D]/40 shadow-sm text-[#F5C842]">
            <RotateCcw className="w-3.5 h-3.5 text-[#F5C842] animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase">360° View</span>
          </div>
        )}

        {/* Zoom button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#0E291C]/80 backdrop-blur-md border border-[#C8A45D]/40 shadow-sm flex items-center justify-center text-[#F5C842] hover:bg-[#C8A45D] hover:text-[#0E291C] transition-all"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Image Container - Zero white padding & curved corners */}
        <div className="w-full aspect-square max-h-[460px] overflow-hidden rounded-[28px] bg-slate-900/5">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: isDragging ? 1.04 : 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              src={activeView?.url || mainImg}
              alt={`${product.name} — ${activeView?.label || 'View'}`}
              className="w-full h-full object-cover rounded-[28px] transition-transform duration-500 md:hover:scale-[1.03]"
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* Arrows */}
        {views.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevView(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-[#174B38]/15 text-[#174B38] flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
              aria-label="Previous view"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextView(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-[#174B38]/15 text-[#174B38] flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
              aria-label="Next view"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Angle counter pill */}
        {views.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-[#174B38]/15 font-sans text-[11px] font-bold text-[#1E2924] tracking-wider">
            {activeView?.code} · {activeIndex + 1}/{views.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {views.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          {views.map((v, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveIndex(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                activeIndex === i
                  ? 'border-[#C8A45D] shadow-[0_4px_16px_rgba(200,164,93,0.3)] scale-105'
                  : 'border-[#C8A45D]/20 opacity-70 hover:opacity-100 hover:border-[#C8A45D]/60'
              }`}
              style={{ width: 64, height: 64 }}
            >
              <img
                src={v.url}
                alt={v.label}
                className="w-full h-full object-contain bg-[#FAF6EE] p-1"
                draggable={false}
              />
              {activeIndex === i && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C8A45D]" />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Drag hint */}
      {views.length > 1 && (
        <p className="text-center font-sans text-[10px] text-[#52665A] tracking-wider">
          ← Drag or tap thumbnails to rotate view →
        </p>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            src={activeView?.url || mainImg}
            alt={`${product.name} — ${activeView?.label}`}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 30]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((data) => {
        if (!data) { setError(true); return; }
        setProduct(data);
        fetchProducts({ limit: 5 }).then((res) => {
          setRelated((res.products || []).filter((p) => p.slug !== slug).slice(0, 3));
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-[#F8F5ED]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-[#174B38]/10 border-t-[#174B38] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#C7A66A]/30 border-t-[#C7A66A] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <span className="font-sans text-[11px] text-[#6D7C58] tracking-[0.3em] uppercase font-medium">
            Loading Details
          </span>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-24 bg-[#F8F5ED]">
        <div className="w-16 h-16 rounded-full bg-[#174B38]/10 flex items-center justify-center">
          <Package className="w-7 h-7 text-[#174B38]" />
        </div>
        <h1 className="font-serif text-3xl text-[#1E2924]">Product Not Found</h1>
        <p className="font-sans text-sm font-light text-[#6D7C58] max-w-md text-center">
          The requested product could not be located in our catalogue.
        </p>
        <Link
          to="/#products"
          className="px-8 py-3 rounded-full font-sans text-xs font-semibold uppercase tracking-widest text-white bg-[#174B38] hover:bg-[#123B2C] transition-colors inline-flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const mainImg = product.thumbnail || product.image_url || '';
  const categoryName =
    typeof product.category === 'object' && product.category
      ? product.category.name
      : 'Areca Leaf Tableware';
  const sizeText = product.size || (product.sizes ? product.sizes.join(', ') : '');

  const qualityBadges = [
    { title: '100% Fallen Leaf', desc: 'Natural Palm Material', icon: Leaf, color: '#2D7A55' },
    { title: 'Chemical Free', desc: 'Safe & Pure Process', icon: Sparkles, color: '#C7A66A' },
    { title: 'Plastic Free', desc: 'Eco-Friendly Choice', icon: Droplets, color: '#2D7A55' },
    { title: 'Food Safe Grade', desc: 'Food Service Ready', icon: ShieldCheck, color: '#C7A66A' },
    { title: 'Export Quality', desc: 'Premium Manufacturing', icon: Globe, color: '#2D7A55' },
  ];

  const specDetails = [
    { label: 'Product Name', value: product.name },
    { label: 'Category', value: categoryName },
    { label: 'Sub-Category', value: product.subCategory },
    { label: 'Dimensions / Size', value: sizeText },
    { label: 'Shape', value: product.shape },
    { label: 'Material', value: '100% Naturally Fallen Areca Palm Leaf' },
    { label: 'Quality Grade', value: product.export_quality || product.domestic_quality || 'Export Grade Premium Quality' },
    { label: 'Suitability', value: 'Hot & Cold Liquids · Microwavable · Oven Safe 45 min · 100% Compostable' },
  ].filter((item) => Boolean(item.value));

  const seoTitle = `${product.name} | Sharmila Leafware`;
  const seoDescription = `${product.name} — ${product.description || '100% natural, biodegradable Areca palm leaf tableware manufactured and supplied by Sharmila Leafware.'}`;
  const canonicalUrl = `https://www.sharmilaleafware.in/products/${product.slug}`;
  const gallery = [mainImg, ...(product.images || product.gallery_urls || [])].filter((url, idx, arr) => url && arr.indexOf(url) === idx);
  const productJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: gallery.length > 0 ? gallery : [mainImg],
      brand: { '@type': 'Brand', name: 'Sharmila Leafware' },
      category: categoryName,
      material: '100% Natural Areca Palm Leaf',
      offers: { '@type': 'AggregateOffer', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.sharmilaleafware.in/' },
        { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.sharmilaleafware.in/products' },
        { '@type': 'ListItem', position: 3, name: product.name, item: canonicalUrl },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF3E8] text-[#1F4D36]">
      <SEO title={seoTitle} description={seoDescription} canonicalUrl={canonicalUrl} ogImage={mainImg} ogType="product" jsonLd={productJsonLd} />

      {/* ── Subtle top ambient glow ── */}
      <div className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none z-0 opacity-35"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,164,93,0.2) 0%, transparent 70%)' }} />

      <div className="relative z-10 pt-24 pb-32">
        {/* ── Breadcrumb ── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 py-5">
          <nav className="flex items-center gap-2 font-sans text-xs tracking-wider text-[#6D7C58]">
            <Link to="/" className="hover:text-[#C8A45D] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <Link to="/#products" className="hover:text-[#C8A45D] transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-[#1F4D36] font-bold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </nav>
        </div>

        {/* ══════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════ */}
        <section ref={heroRef} className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            {/* Left: Image Viewer */}
            <motion.div
              style={{ opacity: heroOpacity, y: heroY }}
              className="lg:col-span-6 lg:sticky lg:top-28"
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <ProductImageViewer product={product} />
              </motion.div>
            </motion.div>

            {/* Right: Editorial Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="lg:col-span-6 flex flex-col gap-7"
            >
              {/* Brand eyebrow */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C8A45D]/60 to-transparent max-w-[60px]" />
                <span className="font-sans text-[11px] font-bold tracking-[0.35em] text-[#C8A45D] uppercase">
                  Sharmila Leafware
                </span>
                <div className="h-px w-5 bg-[#C8A45D]/60" />
              </div>

              {/* Category chip */}
              <div className="-mt-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1F4D36]/10 border border-[#1F4D36]/20 font-sans text-[11px] font-bold tracking-widest text-[#1F4D36] uppercase">
                  <Leaf className="w-3.5 h-3.5 text-[#17A589]" />
                  {categoryName}
                </span>
              </div>

              {/* Title */}
              <div className="-mt-2">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[3.25rem] text-[#1F4D36] font-bold leading-[1.15] tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-3 -mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C8A45D] text-[#C8A45D]" />
                  ))}
                </div>
                <span className="font-sans text-xs text-[#52665A] font-semibold">Export Grade · Premium Quality</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A45D]" />
                <span className="inline-flex items-center gap-1 font-sans text-xs text-[#1F4D36] font-bold">
                  <Award className="w-3.5 h-3.5 text-[#17A589]" /> Verified Pure
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="font-sans text-[15px] font-normal text-[#4A6052] leading-relaxed border-l-2 border-[#C8A45D] pl-4">
                  {product.description}
                </p>
              )}

              {/* Spec chips */}
              {(sizeText || product.shape || product.subCategory) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sizeText && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFDF9] border border-[#C8A45D]/30 shadow-xs hover:shadow-md hover:border-[#C8A45D] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#1F4D36]/10 flex items-center justify-center text-[#1F4D36] shrink-0">
                        <Ruler className="w-4.5 h-4.5 text-[#17A589]" />
                      </div>
                      <div>
                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C8A45D] font-bold block">Dimensions</span>
                        <span className="font-sans text-sm font-bold text-[#1F4D36]">{sizeText}</span>
                      </div>
                    </div>
                  )}
                  {product.shape && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFDF9] border border-[#C8A45D]/30 shadow-xs hover:shadow-md hover:border-[#C8A45D] transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#1F4D36]/10 flex items-center justify-center text-[#1F4D36] shrink-0">
                        <Package className="w-4.5 h-4.5 text-[#17A589]" />
                      </div>
                      <div>
                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C8A45D] font-bold block">Shape</span>
                        <span className="font-sans text-sm font-bold text-[#1F4D36]">{product.shape}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-[#C8A45D]">Key Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.features.map((feat) => (
                      <motion.div
                        key={feat}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#1F4D36]/15 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-[#1F4D36]" strokeWidth={2.5} />
                        </div>
                        <span className="font-sans text-[13px] text-[#2C4235] font-medium">{feat}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#C8A45D]/40 to-transparent" />

              {/* CTA Card */}
              <div className="p-6 sm:p-7 rounded-[24px] bg-[#FFFDF9] border border-[#C8A45D]/40 shadow-[0_10px_35px_rgba(31,77,54,0.08)] space-y-5">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1F4D36]">Interested in this product?</h3>
                  <p className="font-sans text-[13px] font-normal text-[#52665A] mt-1 leading-relaxed">
                    Connect with us directly on WhatsApp for product details, bulk pricing, and custom export enquiries.
                  </p>
                </div>

                <a
                  href={whatsappProductLink(product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="whatsapp-enquiry-btn"
                  className="group w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-full font-sans text-xs tracking-widest uppercase font-bold text-white bg-[#1F4D36] hover:bg-[#C8A45D] hover:text-[#1F4D36] border border-[#1F4D36] transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle className="w-4.5 h-4.5 transition-transform group-hover:rotate-12" />
                  <span>Enquire on WhatsApp</span>
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">→</span>
                </a>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  {['🌿 Eco-Certified', '📦 Bulk Orders', '🌍 Export Ready'].map((tag) => (
                    <span key={tag} className="font-sans text-[11px] text-[#52665A] font-semibold">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            QUALITY BADGES BAR
        ══════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 py-12">
          <div className="relative p-8 rounded-[28px] overflow-hidden bg-[#FFFDF9] border border-[#C8A45D]/30 shadow-md">
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {qualityBadges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -3 }}
                    className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-[#FAF6EE] border border-[#E4D9C5] shadow-xs hover:border-[#C8A45D] transition-all cursor-default"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#1F4D36]/10 border border-[#1F4D36]/20 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 text-[#1F4D36]" />
                    </div>
                    <div>
                      <h4 className="font-sans text-xs font-bold text-[#1F4D36] leading-tight">{b.title}</h4>
                      <span className="font-sans text-[10px] text-[#52665A] font-medium block mt-0.5">{b.desc}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            PRODUCT SPECIFICATIONS
        ══════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 py-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="rounded-[28px] overflow-hidden bg-[#FFFDF9] border border-[#C8A45D]/30 shadow-[0_6px_30px_rgba(31,77,54,0.06)]"
          >
            {/* Header */}
            <div className="px-8 sm:px-10 py-7 bg-[#1F4D36] border-b border-[#C8A45D]/30">
              <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#F5C842] uppercase block mb-1">
                Technical Specifications
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold">Product Details</h2>
            </div>

            {/* Spec rows */}
            <div className="divide-y divide-[#C8A45D]/20">
              {specDetails.map((spec, i) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex items-start justify-between gap-6 px-8 sm:px-10 py-5 hover:bg-[#FAF6EE]/80 transition-colors"
                >
                  <span className="font-sans text-xs uppercase tracking-wider text-[#C8A45D] font-bold w-1/3 shrink-0 pt-0.5">
                    {spec.label}
                  </span>
                  <span className="font-sans text-sm text-[#1F4D36] font-semibold text-right flex-1">
                    {spec.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════
            CRAFTED BY NATURE — Brand Story CTA
        ══════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(31,77,54,0.2)] bg-[#0E291C] border border-[#C8A45D]/40"
          >
            {/* Decorative rings */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />
            {/* Gold shimmer stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8A45D] to-transparent" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-14">
              {/* Text */}
              <div className="lg:col-span-7 space-y-5">
                <span className="font-sans text-[11px] tracking-[0.35em] text-[#C8A45D] uppercase font-bold">
                  Sustainable Excellence
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
                  Crafted by<br />
                  <span className="text-[#F5C842]">Nature</span>
                </h2>
                <p className="font-sans text-[15px] font-normal text-white/85 leading-relaxed max-w-xl">
                  Thoughtfully made from naturally fallen areca leaves — every plate is heat-pressed without synthetic glues, plastics, or chemical coatings. Pure nature, refined by craft.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <a
                    href={whatsappProductLink(product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-sans text-xs tracking-widest uppercase font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg bg-[#C8A45D] hover:bg-[#F5C842] text-[#0E291C]"
                  >
                    Request Bulk Quote
                  </a>
                  <a
                    href={whatsappProductLink(product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-sans text-xs tracking-widest uppercase font-bold text-white bg-[#1F4D36] hover:bg-[#C8A45D] hover:text-[#1F4D36] border border-[#1F4D36] transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Us
                  </a>
                </div>
              </div>

              {/* Image frame */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[260px] aspect-square">
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-[#C8A45D]/20 blur-2xl scale-110 pointer-events-none" />
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden border border-[#C8A45D]/40 p-3 shadow-2xl bg-black/30 backdrop-blur-md">
                    <img
                      src={mainImg}
                      alt={`${product.name} — Natural Areca Leafware`}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-3 -right-3 px-3.5 py-1.5 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase shadow-lg bg-[#C8A45D] text-[#0E291C]">
                    100% Natural
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════
            RELATED PRODUCTS
        ══════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#C8A45D] uppercase block mb-2">
                Explore Catalogue
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1F4D36] font-bold">You May Also Like</h2>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C8A45D]/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C8A45D]" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C8A45D]/60" />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <ProductCard key={p._id || p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Mobile Sticky CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#FAF3E8]/98 backdrop-blur-xl border-t border-[#C8A45D]/30 shadow-[0_-8px_24px_rgba(31,77,54,0.15)]">
        <a
          href={whatsappProductLink(product.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-full font-sans text-xs tracking-widest uppercase font-bold text-white bg-[#1F4D36] hover:bg-[#C8A45D] hover:text-[#1F4D36] border border-[#1F4D36] shadow-md transition-all active:scale-[0.97]"
        >
          <MessageCircle className="w-4.5 h-4.5 text-white" />
          <span>Enquire on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import SEO from '@/components/SEO';
import Product360Viewer from '@/components/Product360Viewer';
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
        fetchProducts({ limit: 4 }).then((res) => {
          setRelated((res.products || []).filter((p) => p.slug !== slug).slice(0, 3));
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-[#F8F5ED]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#174B38]/20 border-t-[#174B38] animate-spin" />
          <span className="font-sans text-xs text-[#6D7C58] tracking-widest uppercase font-medium">
            Loading Details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-24 bg-[#F8F5ED]">
        <h1 className="font-serif text-3xl text-[#1E2924]">Product Not Found</h1>
        <p className="font-sans text-sm font-light text-[#6D7C58] max-w-md text-center">
          The requested product specification could not be located in our catalogue.
        </p>
        <Link
          to="/#products"
          className="px-6 py-3 rounded-full font-sans text-xs font-semibold uppercase tracking-wider text-white bg-[#174B38] hover:bg-[#123B2C] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Catalogue
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
      : 'Areca Leaf Tableware';

  const sizeText = product.size || (product.sizes ? product.sizes.join(', ') : '');

  // Quality Badges
  const qualityBadges = [
    {
      title: '100% Fallen Leaf',
      desc: 'Natural Palm Material',
      icon: Leaf,
    },
    {
      title: 'Chemical Free',
      desc: 'Safe & Pure Process',
      icon: Sparkles,
    },
    {
      title: 'Plastic Free',
      desc: 'Eco-Friendly Choice',
      icon: Droplets,
    },
    {
      title: 'Food Safe Grade',
      desc: 'Suitable for Food Service',
      icon: ShieldCheck,
    },
    {
      title: 'Export Quality',
      desc: 'Premium Manufacturing',
      icon: Globe,
    },
  ];

  // Spec rows for Details section
  const specDetails = [
    { label: 'Product Name', value: product.name },
    { label: 'Category', value: categoryName },
    { label: 'Sub-Category', value: product.subCategory },
    { label: 'Dimensions / Size', value: sizeText },
    { label: 'Shape', value: product.shape },
    { label: 'Material', value: '100% Naturally Fallen Areca Palm Leaf' },
    {
      label: 'Quality Grade',
      value: product.export_quality || product.domestic_quality || 'Export Grade Premium Quality',
    },
    {
      label: 'Suitability',
      value: 'Hot & Cold Liquids, Microwavable, Oven Safe up to 45 mins, 100% Compostable',
    },
  ].filter((item) => Boolean(item.value));

  // Dynamic SEO metadata for Product
  const seoTitle = `${product.name} | Sharmila Leafware`;
  const seoDescription = `${product.name} — ${
    product.description ||
    '100% natural, biodegradable Areca palm leaf tableware manufactured and exported from India by Sharmila Leafware.'
  }`;
  const canonicalUrl = `https://sharmilaleafware.com/products/${product.slug}`;
  const productJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: gallery.length > 0 ? gallery : [mainImg],
      brand: {
        '@type': 'Brand',
        name: 'Sharmila Leafware',
      },
      category: categoryName,
      material: '100% Natural Areca Palm Leaf',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://sharmilaleafware.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: 'https://sharmilaleafware.com/products',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return (
    <div className="pt-24 pb-24 lg:pb-20 bg-[#F8F5ED] min-h-screen text-[#1E2924]">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        ogImage={mainImg}
        ogType="product"
        jsonLd={productJsonLd}
      />
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <nav className="flex items-center gap-2 font-sans text-xs tracking-wider text-[#6D7C58]">
          <Link to="/" className="hover:text-[#174B38] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <Link to="/#products" className="hover:text-[#174B38] transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-[#174B38] font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Interactive 360° Style Product Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <Product360Viewer product={product} />
          </motion.div>

          {/* Right Column: Editorial Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 flex flex-col justify-between space-y-8"
          >
            <div>
              {/* Eyebrow & Category */}
              <div className="space-y-1 mb-4">
                <span className="block font-sans text-[11px] font-bold tracking-[0.25em] text-[#C7A66A] uppercase">
                  SHARMILA LEAFWARE
                </span>
                <span className="block font-sans text-xs tracking-widest text-[#6D7C58] uppercase font-medium">
                  {categoryName}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1E2924] font-normal leading-tight mb-6">
                {product.name}
              </h1>

              {/* Refined Description */}
              <p className="font-sans text-base font-light text-[#1E2924]/80 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Product Specifications Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/80 border border-[#174B38]/10 mb-8 shadow-xs">
                {sizeText && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F5ED] border border-[#174B38]/15 flex items-center justify-center text-[#174B38]">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#6D7C58] font-semibold block">
                        DIMENSIONS / SIZE
                      </span>
                      <span className="font-sans text-xs font-semibold text-[#1E2924]">
                        {sizeText}
                      </span>
                    </div>
                  </div>
                )}

                {product.shape && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F5ED] border border-[#174B38]/15 flex items-center justify-center text-[#174B38]">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#6D7C58] font-semibold block">
                        SHAPE
                      </span>
                      <span className="font-sans text-xs font-semibold text-[#1E2924]">
                        {product.shape}
                      </span>
                    </div>
                  </div>
                )}

                {product.subCategory && (
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F5ED] border border-[#174B38]/15 flex items-center justify-center text-[#174B38]">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#6D7C58] font-semibold block">
                        CATEGORY
                      </span>
                      <span className="font-sans text-xs font-semibold text-[#1E2924]">
                        {product.subCategory}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Features List if present */}
              {product.features && product.features.length > 0 && (
                <div className="mb-8 space-y-3">
                  <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-[#174B38]">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#174B38]/10 text-[#174B38] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </div>
                        <span className="font-sans text-xs text-[#1E2924]/90 font-light">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Enquiry Card CTA */}
            <div className="p-6 rounded-2xl bg-white border border-[#174B38]/15 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E2924]">
                  Interested in this product?
                </h3>
                <p className="font-sans text-xs font-light text-[#6D7C58] mt-0.5">
                  Connect with Sharmila Leafware for product details and enquiries.
                </p>
              </div>

              <a
                href={whatsappProductLink(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full font-sans text-xs tracking-widest uppercase font-semibold text-white bg-[#174B38] hover:bg-[#123B2C] transition-all duration-300 shadow-md hover:shadow-lg group"
              >
                <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                ENQUIRE ABOUT THIS PRODUCT
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quality Badges Bar */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {qualityBadges.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-4 rounded-2xl bg-white/70 border border-[#174B38]/10 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F8F5ED] text-[#174B38] border border-[#174B38]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-semibold text-[#1E2924] leading-snug">
                    {b.title}
                  </h4>
                  <span className="font-sans text-[10px] text-[#6D7C58] font-light block">
                    {b.desc}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Product Details Table Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-10 rounded-[24px] bg-white border border-[#174B38]/10 shadow-xs space-y-8"
        >
          <div className="border-b border-[#174B38]/10 pb-4">
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#C7A66A] uppercase block mb-1">
              SPECIFICATIONS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1E2924] font-normal">
              Product Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-sans text-xs">
            {specDetails.map((spec) => (
              <div
                key={spec.label}
                className="flex items-start justify-between py-3 border-b border-slate-100"
              >
                <span className="text-[#6D7C58] font-medium w-1/3 shrink-0">{spec.label}</span>
                <span className="text-[#1E2924] font-normal text-right w-2/3">{spec.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Brand Story Section: Crafted by Nature */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-[24px] bg-[#174B38] text-white overflow-hidden relative shadow-lg"
        >
          <div className="lg:col-span-7 space-y-4 relative z-10">
            <span className="font-sans text-xs tracking-[0.25em] text-[#C7A66A] uppercase font-bold">
              SUSTAINABLE EXCELLENCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
              Crafted by Nature
            </h2>
            <p className="font-sans text-sm font-light text-white/85 leading-relaxed max-w-xl">
              Thoughtfully crafted from naturally fallen areca leaves, our tableware brings together
              sustainability, functionality and refined natural beauty. Every plate is heat-pressed
              without synthetic glues, plastics, or chemical coatings.
            </p>
            <div className="pt-4">
              <a
                href={whatsappProductLink(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans text-xs tracking-wider uppercase font-semibold text-[#174B38] bg-[#F8F5ED] hover:bg-white transition-colors"
              >
                Request Custom Bulk Quote
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative z-10 flex justify-center">
            <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden bg-white/10 border border-white/20 p-2 shadow-inner">
              <img
                src={mainImg}
                alt="Crafted by nature Areca leafware"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="text-center mb-10">
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#C7A66A] uppercase block mb-1">
              EXPLORE CATALOGUE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1E2924] font-normal">
              Related Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((p, i) => (
              <ProductCard key={p._id || p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky WhatsApp CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-[#174B38]/15 shadow-lg">
        <a
          href={whatsappProductLink(product.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-sans text-xs tracking-wider uppercase font-semibold text-white bg-[#174B38] active:bg-[#123B2C] shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          ENQUIRE ABOUT THIS PRODUCT
        </a>
      </div>
    </div>
  );
}

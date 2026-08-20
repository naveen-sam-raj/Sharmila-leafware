import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, MessageCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import type { Product } from '@/types';
import { whatsappProductLink } from '@/lib/whatsapp';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const catName =
    typeof product.category === 'object' && product.category
      ? product.category.name
      : 'Areca Tableware';
  const imgSrc = product.thumbnail || product.image_url || '';
  const displaySize = product.size || (product.sizes ? product.sizes.join(', ') : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="group relative h-full flex flex-col"
    >
      {/* Modern Minimalist Card Shell */}
      <div className="h-full relative overflow-hidden bg-[#FAF6EE] border border-[#E4D9C5] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_16px_40px_rgba(31,77,54,0.12)] group-hover:border-[#C8A45D] flex flex-col justify-between p-3.5 sm:p-4">
        
        {/* Inner Image Showcase Frame */}
        <Link
          to={`/products/${product.slug}`}
          className="block relative h-[240px] sm:h-[270px] w-full overflow-hidden rounded-[18px] bg-[#F2EADB] border border-[#E4D9C5]/80 group/img"
        >
          <img
            src={imgSrc}
            alt={`${product.name} - Areca Leaf Tableware by Sharmila Leafware`}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover/img:scale-105"
          />

          {/* Floating Category Badge (Top-Left) */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-sans font-bold tracking-wider text-[#F5C842] bg-[#0E291C]/90 backdrop-blur-md border border-[#C8A45D]/40 uppercase flex items-center gap-1.5 shadow-sm">
            <Leaf className="w-3 h-3 text-[#F5C842]" />
            {catName}
          </div>

          {/* Floating 100% Eco Badge (Top-Right) */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wider text-[#1F4D36] bg-white/95 backdrop-blur-md border border-[#C8A45D]/40 uppercase flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#C8A45D]" />
            100% Eco
          </div>

          {/* Quick View Hover Icon (Bottom-Right of Image) */}
          <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#0E291C]/80 backdrop-blur-md border border-[#C8A45D]/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 shadow-md">
            <ArrowUpRight className="w-4 h-4 text-[#F5C842]" />
          </div>
        </Link>

        {/* Card Content & Actions */}
        <div className="pt-4 px-1 pb-1 flex flex-col flex-1 justify-between">
          <div>
            {/* Category Eyebrow */}
            <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-[#C8A45D] uppercase mb-1 block">
              {catName}
            </span>

            {/* Product Title */}
            <Link
              to={`/products/${product.slug}`}
              className="block group/title mb-1.5"
            >
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F4D36] leading-snug line-clamp-1 transition-colors duration-300 group-hover/title:text-[#C8A45D]">
                {product.name}
              </h3>
            </Link>

            {/* Short Description */}
            <p className="font-sans text-xs text-[#52665A] leading-relaxed mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Size Badge */}
            {displaySize && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D36]/8 text-[#1F4D36] border border-[#1F4D36]/12 font-sans text-[11px] font-medium">
                  <Leaf className="w-3 h-3 text-[#17A589]" />
                  Size: <strong className="font-semibold">{displaySize}</strong>
                </span>
              </div>
            )}
          </div>

          {/* WhatsApp Enquiry Button */}
          <div className="pt-2">
            <a
              href={whatsappProductLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full font-sans text-xs font-bold uppercase tracking-wider text-white bg-[#1F4D36] hover:bg-[#C8A45D] hover:text-[#1F4D36] transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 border border-[#1F4D36] group/btn"
            >
              <MessageCircle className="w-4 h-4 text-white group-hover/btn:text-[#1F4D36] group-hover/btn:rotate-12 transition-transform" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

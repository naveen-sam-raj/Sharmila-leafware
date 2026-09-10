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
      <div className="h-full relative overflow-hidden bg-[#FAF6EE] border border-[#E4D9C5] rounded-[20px] sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_16px_40px_rgba(31,77,54,0.12)] group-hover:border-[#C8A45D] flex flex-col justify-between p-2.5 sm:p-4">
        
        {/* Inner Image Showcase Frame */}
        <Link
          to={`/products/${product.slug}`}
          className="block relative h-[150px] xs:h-[180px] sm:h-[240px] md:h-[270px] w-full overflow-hidden rounded-[14px] sm:rounded-[18px] bg-[#F2EADB] border border-[#E4D9C5]/80 group/img"
        >
          <img
            src={imgSrc}
            alt={`${product.name} - Areca Leaf Tableware by Sharmila Leafware`}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover/img:scale-105"
          />

          {/* Floating Category Badge (Top-Left) */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-sans font-bold tracking-wider text-[#F5C842] bg-[#0E291C]/90 backdrop-blur-md border border-[#C8A45D]/40 uppercase flex items-center gap-1 sm:gap-1.5 shadow-sm max-w-[80%] truncate">
            <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F5C842] shrink-0" />
            <span className="truncate">{catName}</span>
          </div>

          {/* Floating 100% Eco Badge (Top-Right) */}
          <div className="hidden sm:flex absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wider text-[#1F4D36] bg-white/95 backdrop-blur-md border border-[#C8A45D]/40 uppercase items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#C8A45D]" />
            100% Eco
          </div>

          {/* Quick View Hover Icon (Bottom-Right of Image) */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#0E291C]/80 backdrop-blur-md border border-[#C8A45D]/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 shadow-md">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C842]" />
          </div>
        </Link>

        {/* Card Content & Actions */}
        <div className="pt-2.5 sm:pt-4 px-0.5 pb-0.5 flex flex-col flex-1 justify-between">
          <div>
            {/* Category Eyebrow */}
            <span className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-[#C8A45D] uppercase mb-0.5 sm:mb-1 block truncate">
              {catName}
            </span>

            {/* Product Title */}
            <Link
              to={`/products/${product.slug}`}
              className="block group/title mb-1 sm:mb-1.5"
            >
              <h3 className="font-serif text-sm sm:text-lg md:text-xl font-bold text-[#1F4D36] leading-snug line-clamp-1 transition-colors duration-300 group-hover/title:text-[#C8A45D]">
                {product.name}
              </h3>
            </Link>

            {/* Short Description */}
            <p className="font-sans text-[11px] sm:text-xs text-[#52665A] leading-relaxed mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
              {product.description}
            </p>

            {/* Size Badge */}
            {displaySize && (
              <div className="mb-2 sm:mb-4">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#1F4D36]/8 text-[#1F4D36] border border-[#1F4D36]/12 font-sans text-[10px] sm:text-[11px] font-medium max-w-full truncate">
                  <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#17A589] shrink-0" />
                  <span className="truncate">Size: <strong className="font-semibold">{displaySize}</strong></span>
                </span>
              </div>
            )}
          </div>

          {/* WhatsApp Enquiry Button */}
          <div className="pt-1 sm:pt-2">
            <a
              href={whatsappProductLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-11 rounded-full font-sans text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white bg-[#1F4D36] hover:bg-[#C8A45D] hover:text-[#1F4D36] transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95 border border-[#1F4D36] group/btn px-2 sm:px-4"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover/btn:text-[#1F4D36] group-hover/btn:rotate-12 transition-transform shrink-0" />
              <span className="hidden sm:inline">Inquire on WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

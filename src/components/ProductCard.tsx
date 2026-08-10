import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, MessageCircle } from 'lucide-react';
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative h-full flex flex-col"
    >
      <div className="h-full relative overflow-hidden bg-[#FFFDF8] border border-[#E7E0D2] rounded-[22px] shadow-[0_8px_25px_rgba(23,75,56,0.06)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_14px_35px_rgba(23,75,56,0.12)] group-hover:border-[#174B38]/30 flex flex-col justify-between">
        
        {/* Link Wrapper for Image Area (Upper ~50% of card) */}
        <Link
          to={`/products/${product.slug}`}
          className="block relative h-[220px] sm:h-[240px] w-full overflow-hidden bg-[#F8F5ED] rounded-t-[22px]"
        >
          <img
            src={imgSrc}
            alt={`${product.name} - Areca Leaf Tableware by Sharmila Leafware`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          {/* Category Badge on Image */}
          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium tracking-wider text-[#174B38] bg-[#FFFDF8]/92 backdrop-blur-md border border-[#174B38]/15 uppercase flex items-center gap-1.5 shadow-xs">
            <Leaf className="w-3 h-3 text-[#174B38]" />
            {catName}
          </div>
        </Link>

        {/* Card Content Area (Lower ~50% of card) */}
        <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
          <div>
            {/* Category Eyebrow */}
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#C7A66A] uppercase mb-1.5 block">
              {catName}
            </span>

            {/* Product Name */}
            <Link
              to={`/products/${product.slug}`}
              className="block group/title transition-colors mb-2"
            >
              <h3 className="font-serif text-xl sm:text-[22px] text-[#174B38] font-medium leading-snug line-clamp-2 transition-colors group-hover/title:text-[#C7A66A]">
                {product.name}
              </h3>
            </Link>

            {/* Product Short Description */}
            <p className="font-sans text-xs sm:text-sm font-light text-[#6D7C58] leading-relaxed mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Size / Dimension Pill */}
            {displaySize && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F0E6] text-[#174B38] font-sans text-xs font-medium">
                  <Leaf className="w-3 h-3 text-[#174B38]" />
                  Size: {displaySize}
                </span>
              </div>
            )}
          </div>

          {/* Action Area: Single Full-Width WhatsApp Enquiry Button */}
          <div className="pt-4 border-t border-[#174B38]/10 mt-auto">
            <a
              href={whatsappProductLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 h-12 rounded-full font-sans text-xs font-semibold uppercase tracking-widest text-white bg-[#174B38] hover:bg-[#123B2C] transition-all duration-300 shadow-xs hover:shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              WHATSAPP ENQUIRY
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

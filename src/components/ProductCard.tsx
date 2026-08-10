import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { whatsappProductLink } from '@/lib/whatsapp';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const catName =
    typeof product.category === 'object' && product.category ? product.category.name : 'Areca Tableware';
  const imgSrc = product.thumbnail || product.image_url || '';
  const displaySize = product.size || (product.sizes ? product.sizes.join(', ') : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative h-full flex flex-col"
    >
      <div className="h-full relative overflow-hidden bg-white border border-[#1F4D36]/15 rounded-[20px] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#C8A45D]/60 hover:shadow-xl flex flex-col justify-between">
        {/* Link Wrapper for Image */}
        <Link to={`/products/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-[#FAF3E8]">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Category Tag */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wider text-[#1F4D36] bg-[#F5E6C8]/90 backdrop-blur-md border border-[#1F4D36]/15 uppercase flex items-center gap-1.5 shadow-sm">
            <Leaf className="w-3 h-3 text-[#1F4D36]" />
            {catName}
          </div>
        </Link>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 justify-between">
          <div>
            <Link to={`/products/${product.slug}`} className="block group-hover:text-[#C8A45D] transition-colors">
              <h3 className="font-serif text-2xl text-[#1F4D36] mb-2 font-medium">{product.name}</h3>
            </Link>

            <p className="font-sans text-sm font-light text-[#475569] leading-relaxed mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Specifications: Size */}
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-sans">
              {displaySize && (
                <span className="px-3 py-1 rounded-full text-[#1F4D36] border border-[#1F4D36]/15 bg-[#FAF3E8] font-medium">
                  Size: {displaySize}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: View Product & WhatsApp Enquiry */}
          <div className="flex items-center gap-2.5 pt-3 border-t border-[#1F4D36]/10">
            {/* View Product Link */}
            <Link
              to={`/products/${product.slug}`}
              className="px-3.5 py-2.5 rounded-full font-sans text-xs font-semibold text-[#1F4D36] border border-[#1F4D36]/25 hover:bg-[#FAF3E8] transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </Link>

            {/* WhatsApp Enquiry Button */}
            <a
              href={whatsappProductLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider text-white bg-[#1F4D36] transition-all duration-300 hover:bg-[#C8A45D] hover:text-[#1F4D36] shadow-sm hover:shadow-md"
            >
              WhatsApp Enquiry
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

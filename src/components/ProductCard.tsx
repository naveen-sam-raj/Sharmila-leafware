import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';
import type { Product } from '@/types';
import { whatsappProductLink } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative"
    >
      <Link to={`/products/${product.slug}`} className="block h-full">
        <div className="h-full relative overflow-hidden bg-white border border-[#1F4D36]/15 rounded-[20px] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#C8A45D]/60 hover:shadow-xl flex flex-col justify-between">
          
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF3E8]">
            <img
              src={product.image_url ?? ''}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            
            {/* Export Quality Tag */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-sans font-semibold tracking-wider text-[#1F4D36] bg-[#F5E6C8]/90 backdrop-blur-md border border-[#1F4D36]/15 uppercase flex items-center gap-1.5 shadow-sm">
              <Leaf className="w-3 h-3 text-[#1F4D36]" />
              Export Quality
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1 justify-between">
            <div>
              <h3 className="font-serif text-2xl text-[#1F4D36] mb-2 group-hover:text-[#C8A45D] transition-colors font-medium">
                {product.name}
              </h3>
              <p className="font-sans text-sm font-light text-[#475569] leading-relaxed mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Sizes */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.sizes.slice(0, 4).map((size) => (
                  <span key={size} className="px-3 py-1 rounded-full text-xs font-sans text-[#1F4D36] border border-[#1F4D36]/15 bg-[#FAF3E8]">
                    {size}
                  </span>
                ))}
                {product.sizes.length > 4 && (
                  <span className="px-3 py-1 rounded-full text-xs font-sans text-[#64748B] bg-slate-100">
                    +{product.sizes.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#1F4D36]/10">
              <a
                href={whatsappProductLink(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-sans text-xs font-semibold uppercase tracking-wider text-white bg-[#1F4D36] transition-all duration-300 hover:bg-[#C8A45D] hover:text-[#1F4D36] shadow-sm hover:shadow-md"
              >
                Enquire
              </a>
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#1F4D36]/25 text-[#1F4D36] group-hover:bg-[#1F4D36] group-hover:text-white transition-all duration-300 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


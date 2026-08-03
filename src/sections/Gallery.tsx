import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { fetchGallery } from '@/lib/api';
import type { GalleryItem } from '@/types';

const GALLERY_CATEGORIES = ['All', 'Manufacturing', 'Raw Materials', 'Finished Products', 'Packing', 'Warehouse', 'Export Containers'] as const;

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [active, setActive] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchGallery()
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === 'All' ? items : items.filter((i) => i.category === active);

  // Masonry: distribute items across columns
  const columns: GalleryItem[][] = [[], [], [], []];
  filtered.forEach((item, i) => columns[i % 4].push(item));

  return (
    <section id="gallery" className="relative py-24 lg:py-32 overflow-hidden bg-[#F5E6C8]">
      <div className="section-padding relative z-10 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Gallery"
          title={<>From Leaf to <span className="gold-text">Legacy</span></>}
          subtitle="A glimpse into our world — from the areca palm groves of Tamil Nadu to the shipping containers that carry our tableware to the world."
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-12 mb-12">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2.5 rounded-full font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 ${
                active === cat
                  ? 'bg-[#1F4D36] text-white shadow-md'
                  : 'bg-white/80 text-[#1F4D36] border border-[#1F4D36]/15 hover:border-[#C8A45D] hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[20px] bg-white animate-pulse border border-[#1F4D36]/10" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-16">
            <AlertCircle className="w-12 h-12 text-[#C8A45D]" />
            <p className="font-sans text-sm text-[#475569]">Unable to load gallery. Please try again later.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-4">
                {col.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group relative overflow-hidden rounded-[20px] bg-white border border-[#1F4D36]/15 shadow-sm hover:border-[#C8A45D] hover:shadow-xl transition-all duration-500"
                  >
                    <div className={`relative overflow-hidden ${ci % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1F4D36]/90 via-[#1F4D36]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="font-sans text-[10px] tracking-[0.2em] text-[#C8A45D] font-bold uppercase">{item.category}</span>
                        <h4 className="font-serif text-xl text-white font-medium">{item.title}</h4>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


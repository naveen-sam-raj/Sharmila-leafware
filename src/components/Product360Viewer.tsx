import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { Product } from '@/types';

interface Product360ViewerProps {
  product: Product;
}

export default function Product360Viewer({ product }: Product360ViewerProps) {
  const mainImg = product.thumbnail || product.image_url || '';
  const allImages = product.images && product.images.length > 0 ? product.images : [mainImg];

  // Resolve 3 distinct views from product data or fallback gallery
  const viewFront = product.front_image || allImages[0] || mainImg;
  const viewAngle = product.angle_45_image || (allImages[1] !== viewFront ? allImages[1] : undefined);
  const viewTop = product.top_image || (allImages[2] !== viewFront && allImages[2] !== viewAngle ? allImages[2] : undefined);

  // Construct view items array
  const rawViews = [
    { label: 'Front View', code: 'FRONT', url: viewFront },
    { label: '45° View', code: '45°', url: viewAngle },
    { label: 'Top View', code: 'TOP', url: viewTop },
  ].filter((item): item is { label: string; code: string; url: string } => Boolean(item.url));

  // Deduplicate URLs
  const views = rawViews.filter((item, index, self) => index === self.findIndex((t) => t.url === item.url));

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const startXRef = useRef<number | null>(null);
  const currentXRef = useRef<number | null>(null);

  const prevView = () => {
    if (views.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + views.length) % views.length);
  };

  const nextView = () => {
    if (views.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % views.length);
  };

  // Mouse / Touch Drag Handlers
  const handleDragStart = (clientX: number) => {
    if (views.length <= 1) return;
    startXRef.current = clientX;
    currentXRef.current = clientX;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number, e?: React.TouchEvent) => {
    if (!isDragging || startXRef.current === null) return;
    currentXRef.current = clientX;

    const diff = clientX - startXRef.current;
    if (Math.abs(diff) > 40) {
      if (e && e.cancelable) e.preventDefault();
      if (diff < 0) {
        nextView();
      } else {
        prevView();
      }
      startXRef.current = clientX;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startXRef.current = null;
    currentXRef.current = null;
  };

  const activeView = views[activeIndex] || views[0];

  return (
    <div className="space-y-4 select-none">
      {/* Cardless Editorial Product Image Stage (No White Card, No Box Border) */}
      <div
        className={`relative aspect-[4/3] sm:aspect-square group cursor-grab ${
          isDragging ? 'cursor-grabbing scale-[1.01]' : ''
        } transition-transform duration-300 flex items-center justify-center`}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e)}
        onTouchEnd={handleDragEnd}
      >
        {/* 360° Style Interactive View Badge */}
        {views.length > 1 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-3 py-1 rounded-full bg-[#F8F5ED]/90 backdrop-blur-md border border-[#174B38]/15 text-[#174B38] font-sans text-[11px] font-semibold tracking-wider flex items-center gap-1.5 shadow-xs z-10">
            <RotateCcw className="w-3.5 h-3.5 text-[#174B38] animate-pulse" />
            Interactive 360° Style View
          </div>
        )}

        {/* Product View Image Stage (Sits directly on #F8F5ED page background) */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: isDragging ? 1.03 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            src={activeView?.url || mainImg}
            alt={`${product.name} - ${activeView?.label || 'View'}`}
            className="w-full h-full object-contain drop-shadow-[0_12px_25px_rgba(23,75,56,0.08)] relative z-0 transition-transform duration-500 ease-out md:group-hover:scale-[1.03]"
            draggable={false}
          />
        </AnimatePresence>

        {/* Navigation Arrows (Only if multiple views exist) */}
        {views.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevView();
              }}
              aria-label="Previous view angle"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F8F5ED]/90 backdrop-blur-md border border-[#174B38]/15 text-[#174B38] flex items-center justify-center shadow-xs opacity-90 hover:opacity-100 hover:bg-[#F3EFE3] hover:scale-105 active:scale-95 transition-all duration-200 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextView();
              }}
              aria-label="Next view angle"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F8F5ED]/90 backdrop-blur-md border border-[#174B38]/15 text-[#174B38] flex items-center justify-center shadow-xs opacity-90 hover:opacity-100 hover:bg-[#F3EFE3] hover:scale-105 active:scale-95 transition-all duration-200 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Floating Active Angle Tag */}
        {views.length > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-3 py-1 rounded-full bg-[#F8F5ED]/90 backdrop-blur-md border border-[#174B38]/15 font-sans text-[11px] font-semibold text-[#1E2924] tracking-wider shadow-xs z-10">
            {activeView?.code} ({activeIndex + 1}/{views.length})
          </div>
        )}
      </div>

      {/* View Angle Pill Selectors (FRONT / 45° / TOP) */}
      {views.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          {views.map((v, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                activeIndex === i
                  ? 'bg-[#174B38] text-white shadow-xs scale-105'
                  : 'bg-[#F8F5ED] border border-[#174B38]/15 text-[#6D7C58] hover:text-[#174B38] hover:bg-[#F3EFE3]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeIndex === i ? 'bg-white' : 'bg-[#174B38]/40'}`} />
              {v.code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  center?: boolean;
  dark?: boolean;
}

export default function SectionHeading({ eyebrow, title, subtitle, center = true, dark = false }: SectionHeadingProps) {
  return (
    <div className={`${center ? 'text-center mx-auto' : 'text-left'} max-w-3xl`}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className={`flex items-center gap-3 ${center ? 'justify-center' : ''} mb-4`}
        >
          <span className={`h-px w-8 ${dark ? 'bg-[#C8A45D]' : 'bg-[#1F4D36]/40'}`} />
          <span className={`font-sans text-xs tracking-[0.3em] uppercase font-semibold ${dark ? 'text-[#C8A45D]' : 'text-[#1F4D36]'}`}>
            {eyebrow}
          </span>
          <span className={`h-px w-8 ${dark ? 'bg-[#C8A45D]' : 'bg-[#1F4D36]/40'}`} />
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className={`font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.15] text-balance ${
          dark ? 'text-white' : 'text-[#1F4D36]'
        }`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`font-sans text-base md:text-lg font-light mt-6 leading-relaxed ${center ? 'mx-auto' : ''} max-w-2xl ${
            dark ? 'text-white/85' : 'text-[#475569]'
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}


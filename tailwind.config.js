/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sandal: {
          DEFAULT: '#F5E6C8', // Sandal Cream
          light: '#FAF3E8',   // Light Warm Cream
          warm: '#FAF3E8',    // Alternate Light Cream
          accent: '#E9D5A1',  // Warm Sandal Accent
          deep: '#D8C394',
        },
        forest: {
          DEFAULT: '#1F4D36',  // Forest Green
          dark: '#0E291C',     // Dark Forest Green for Footer/CTA
          light: '#2E674B',    // Soft Forest Green
          deep: '#091A12',     // Deepest Forest
        },
        emerald: {
          DEFAULT: '#2E7D32',  // Emerald Green
          light: '#4CAF50',
        },
        olive: {
          DEFAULT: '#6B8E23',  // Olive Green
        },
        gold: {
          DEFAULT: '#C8A45D',  // Gold Accent
          light: '#E2C485',    // Soft Gold
          dark: '#A6843E',     // Deep Gold
        },
        luxury: {
          bg: '#F5E6C8',        // Soft Sandalwood Cream
          surface: '#FAF3E8',   // Warm Cream Surface
          card: '#FFFFFF',      // White Product Card
          sandal: '#E9D5A1',
          'sandal-light': '#FAF3E8',
          gold: '#C8A45D',
          green: '#1F4D36',
          'green-dark': '#0E291C',
          'green-light': '#2E674B',
          ink: '#1F4D36',       // Headings in Forest Green
          body: '#334155',      // Body text in slate/charcoal
          'ink-muted': '#475569',
          border: 'rgba(31, 77, 54, 0.15)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', '"Poppins"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', '"Poppins"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'slow-zoom': 'slowZoom 25s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C8A45D 0%, #E2C485 50%, #C8A45D 100%)',
        'forest-gradient': 'linear-gradient(135deg, #1F4D36 0%, #0E291C 100%)',
        'sandal-gradient': 'linear-gradient(180deg, #F5E6C8 0%, #FAF3E8 50%, #F5E6C8 100%)',
      },
    },
  },
  plugins: [],
};

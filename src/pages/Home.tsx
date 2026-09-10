import SEO from '@/components/SEO';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import WhySharmila from '@/sections/WhySharmila';
import Products from '@/sections/Products';
import Quality from '@/sections/Quality';
import Gallery from '@/sections/Gallery';
import Process from '@/sections/Process';
import Export from '@/sections/Export';
import FAQ from '@/sections/FAQ';
import Contact from '@/sections/Contact';

export default function Home() {
  return (
    <>
      <SEO
        title="Sharmila Leafware | Premium Areca Leaf Plates Manufacturer & Supplier"
        description="Sharmila Leafware manufactures and supplies natural, biodegradable areca leaf plates and eco-friendly disposable tableware for customers in India and international markets."
        canonicalUrl="https://sharmilaleafware.in/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sharmilaleafware.in/#webpage',
          'url': 'https://sharmilaleafware.in/',
          'name': 'Sharmila Leafware | Premium Areca Leaf Plates Manufacturer & Supplier',
          'description': 'Sharmila Leafware manufactures and supplies natural, biodegradable areca leaf plates and eco-friendly disposable tableware for customers in India and international markets.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Sharmila Leafware',
            'url': 'https://sharmilaleafware.in/'
          }
        }}
      />
      <Hero />
      <About />
      <WhySharmila />
      <Products />
      <Quality />
      <Gallery />
      <Process />
      <Export />
      <FAQ />
      <Contact />
    </>
  );
}

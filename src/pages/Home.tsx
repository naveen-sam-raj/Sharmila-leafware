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
        title="Sharmila Leafware | Premium Areca Leaf Plates Manufacturer & Exporter"
        description="Sharmila Leafware manufactures and exports premium natural areca leaf plates, bowls, trays and eco-friendly tableware from India. 100% natural, biodegradable and chemical-free."
        canonicalUrl="https://sharmilaleafware.com"
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

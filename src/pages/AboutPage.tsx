import SEO from '@/components/SEO';
import About from '@/sections/About';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Sharmila Leafware | Natural Areca Leaf Tableware Manufacturer"
        description="Learn about Sharmila Leafware, a leading Indian manufacturer of eco-friendly Areca palm leaf tableware. Discover our sustainable manufacturing process and commitment to zero plastic."
        canonicalUrl="https://sharmilaleafware.com/about"
      />
      <div className="pt-8">
        <About />
      </div>
    </>
  );
}

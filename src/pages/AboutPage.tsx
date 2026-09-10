import SEO from '@/components/SEO';
import About from '@/sections/About';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Sharmila Leafware | Areca Leaf Plates Manufacturer & Supplier"
        description="Learn about Sharmila Leafware, a premier manufacturer and supplier of 100% natural, biodegradable Areca palm leaf plates and eco-friendly disposable tableware."
        canonicalUrl="https://sharmilaleafware.in/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': 'https://sharmilaleafware.in/about#webpage',
          'url': 'https://sharmilaleafware.in/about',
          'name': 'About Sharmila Leafware | Areca Leaf Plates Manufacturer & Supplier',
          'description': 'Learn about Sharmila Leafware, a premier manufacturer and supplier of 100% natural, biodegradable Areca palm leaf plates and eco-friendly disposable tableware.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Sharmila Leafware',
            'url': 'https://sharmilaleafware.in/'
          }
        }}
      />
      <div className="pt-8">
        <About />
      </div>
    </>
  );
}

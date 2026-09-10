import SEO from '@/components/SEO';
import WhySharmila from '@/sections/WhySharmila';

export default function WhyUsPage() {
  return (
    <>
      <SEO
        title="Why Choose Sharmila Leafware | Eco-Friendly Areca Leaf Products"
        description="Discover why wholesale buyers, distributors, and exporters choose Sharmila Leafware for heat-pressed, durable, heat-resistant natural Areca palm leaf tableware."
        canonicalUrl="https://sharmilaleafware.in/why-us"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sharmilaleafware.in/why-us#webpage',
          'url': 'https://sharmilaleafware.in/why-us',
          'name': 'Why Choose Sharmila Leafware | Eco-Friendly Areca Leaf Products',
          'description': 'Discover why wholesale buyers, distributors, and exporters choose Sharmila Leafware for heat-pressed, durable, heat-resistant natural Areca palm leaf tableware.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Sharmila Leafware',
            'url': 'https://sharmilaleafware.in/'
          }
        }}
      />
      <div className="pt-8">
        <WhySharmila />
      </div>
    </>
  );
}

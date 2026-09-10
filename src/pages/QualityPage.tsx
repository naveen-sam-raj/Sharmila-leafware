import SEO from '@/components/SEO';
import Quality from '@/sections/Quality';

export default function QualityPage() {
  return (
    <>
      <SEO
        title="Areca Leaf Tableware Quality Control & Safety | Sharmila Leafware"
        description="Our multi-stage quality assurance process guarantees hygienic, leak-proof, microwave-safe, chemical-free Areca leaf plates and bowls for export."
        canonicalUrl="https://sharmilaleafware.in/quality"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sharmilaleafware.in/quality#webpage',
          'url': 'https://sharmilaleafware.in/quality',
          'name': 'Areca Leaf Tableware Quality Control & Safety | Sharmila Leafware',
          'description': 'Our multi-stage quality assurance process guarantees hygienic, leak-proof, microwave-safe, chemical-free Areca leaf plates and bowls for export.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Sharmila Leafware',
            'url': 'https://sharmilaleafware.in/'
          }
        }}
      />
      <div className="pt-8">
        <Quality />
      </div>
    </>
  );
}

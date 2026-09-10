import SEO from '@/components/SEO';
import Export from '@/sections/Export';

export default function ExportPage() {
  return (
    <>
      <SEO
        title="Global Areca Leaf Plates Exporter & Wholesale Supplier | Sharmila Leafware"
        description="Sharmila Leafware exports natural areca leaf plates worldwide. Contact us for bulk wholesale orders, custom packaging, and international container shipments."
        canonicalUrl="https://sharmilaleafware.in/export"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://sharmilaleafware.in/export#webpage',
          'url': 'https://sharmilaleafware.in/export',
          'name': 'Global Areca Leaf Plates Exporter & Wholesale Supplier | Sharmila Leafware',
          'description': 'Sharmila Leafware exports natural areca leaf plates worldwide. Contact us for bulk wholesale orders, custom packaging, and international container shipments.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Sharmila Leafware',
            'url': 'https://sharmilaleafware.in/'
          }
        }}
      />
      <div className="pt-8">
        <Export />
      </div>
    </>
  );
}

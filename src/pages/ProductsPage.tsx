import SEO from '@/components/SEO';
import Products from '@/sections/Products';

export default function ProductsPage() {
  return (
    <>
      <SEO
        title="Areca Leaf Plates & Disposable Tableware Catalogue | Sharmila Leafware"
        description="Browse our catalogue of natural Areca leaf plates, round dinner plates, square plates, bowls, and compartment trays. 100% biodegradable and chemical-free."
        canonicalUrl="https://www.sharmilaleafware.in/products"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://www.sharmilaleafware.in/products#webpage',
          'url': 'https://www.sharmilaleafware.in/products',
          'name': 'Areca Leaf Plates & Disposable Tableware Catalogue | Sharmila Leafware',
          'description': 'Browse our catalogue of natural Areca leaf plates, round dinner plates, square plates, bowls, and compartment trays. 100% biodegradable and chemical-free.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Sharmila Leafware',
            'url': 'https://www.sharmilaleafware.in/'
          }
        }}
      />
      <div className="pt-8">
        <Products />
      </div>
    </>
  );
}

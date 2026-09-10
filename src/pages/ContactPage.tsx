import SEO from '@/components/SEO';
import Contact from '@/sections/Contact';

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contact Sharmila Leafware | Areca Leaf Plates Wholesale & Export Inquiries"
        description="Get in touch with Sharmila Leafware for wholesale inquiries, custom orders, bulk quotes, and global export partnerships for natural Areca leaf tableware."
        canonicalUrl="https://www.sharmilaleafware.in/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          '@id': 'https://www.sharmilaleafware.in/contact#webpage',
          'url': 'https://www.sharmilaleafware.in/contact',
          'name': 'Contact Sharmila Leafware | Areca Leaf Plates Wholesale & Export Inquiries',
          'description': 'Get in touch with Sharmila Leafware for wholesale inquiries, custom orders, bulk quotes, and global export partnerships for natural Areca leaf tableware.',
          'publisher': {
            '@type': 'Organization',
            'name': 'Sharmila Leafware',
            'url': 'https://www.sharmilaleafware.in/'
          }
        }}
      />
      <div className="pt-8">
        <Contact />
      </div>
    </>
  );
}

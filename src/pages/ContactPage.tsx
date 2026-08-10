import SEO from '@/components/SEO';
import Contact from '@/sections/Contact';

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contact Sharmila Leafware | Areca Leaf Tableware Manufacturer"
        description="Get in touch with Sharmila Leafware for wholesale inquiries, custom orders, and global export quotes for natural Areca palm leaf tableware."
        canonicalUrl="https://sharmilaleafware.com/contact"
      />
      <div className="pt-8">
        <Contact />
      </div>
    </>
  );
}

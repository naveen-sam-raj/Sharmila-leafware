import SEO from '@/components/SEO';
import Products from '@/sections/Products';

export default function ProductsPage() {
  return (
    <>
      <SEO
        title="Areca Leaf Plates & Tableware | Sharmila Leafware"
        description="Browse our export-quality Areca leaf tableware catalogue including round plates, square plates, bowls, and compartment trays. 100% compostable and microwave safe."
        canonicalUrl="https://sharmilaleafware.com/products"
      />
      <div className="pt-8">
        <Products />
      </div>
    </>
  );
}

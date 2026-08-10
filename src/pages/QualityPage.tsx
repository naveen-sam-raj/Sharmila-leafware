import SEO from '@/components/SEO';
import Quality from '@/sections/Quality';

export default function QualityPage() {
  return (
    <>
      <SEO
        title="Areca Leaf Tableware Quality | Sharmila Leafware"
        description="Our multi-stage quality control process ensures hygienic, leak-proof, chemical-free, and heat-resistant Areca palm leaf tableware for global markets."
        canonicalUrl="https://sharmilaleafware.com/quality"
      />
      <div className="pt-8">
        <Quality />
      </div>
    </>
  );
}

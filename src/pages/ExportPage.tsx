import SEO from '@/components/SEO';
import Export from '@/sections/Export';

export default function ExportPage() {
  return (
    <>
      <SEO
        title="Areca Leaf Plate Exporter from India | Sharmila Leafware"
        description="Global exporter of Areca palm leaf disposable tableware. Shipping bulk container orders to North America, Europe, Middle East, and Australia."
        canonicalUrl="https://sharmilaleafware.com/export"
      />
      <div className="pt-8">
        <Export />
      </div>
    </>
  );
}

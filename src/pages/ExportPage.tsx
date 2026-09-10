import SEO from '@/components/SEO';
import Export from '@/sections/Export';

export default function ExportPage() {
  return (
    <>
      <SEO
        title="Global Export & Bulk Supply | Areca Leaf Tableware | Sharmila Leafware India"
        description="Sharmila Leafware is an India-based wholesale supplier of natural areca leaf tableware. Open to international bulk enquiries, importer partnerships & custom OEM private label export orders."
        canonicalUrl="https://sharmilaleafware.com/export"
      />
      <div className="pt-8">
        <Export />
      </div>
    </>
  );
}

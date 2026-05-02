import SectionHeader from "../../components/public/SectionHeader";
import ServiceCard from "../../components/public/ServiceCard";
import { useSiteData } from "../../contexts/SiteDataContext";

function ServicesPage() {
  const { services } = useSiteData();
  const activeServices = services.filter((service) => service.isActive !== false);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services"
          title="Seed quality testing services for dependable laboratory evaluation"
          description="Choose the test required for your lot and review the sample quantity and expected testing time before sending the material to the lab."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activeServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesPage;

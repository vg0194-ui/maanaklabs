import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

function AboutPage() {
  const { settings } = useSiteData();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About Maanak Labs"
          title="A modern seed testing laboratory experience designed for confidence"
          description="Premium in presentation, simple in use, and grounded in scientific workflow."
        />
        <div className="panel mt-10 p-8">
          <div className="space-y-6 text-base leading-8 text-slate-600">
            <p>{settings?.aboutContent}</p>
            <p>
              Our platform is built to help farmers, dealers, distributors, and seed companies submit testing requests
              online, understand exactly how to pack samples, and track progress from submission through reporting.
            </p>
            <p>
              The laboratory follows scientific seed testing procedures and quality systems. NABL and ISO/IEC 17025
              information is shown only as placeholder status until official accreditation details are available.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;


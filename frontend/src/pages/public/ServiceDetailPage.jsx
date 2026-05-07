import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Seo from "../../components/Seo";
import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

function ServiceDetailPage() {
  const { slug } = useParams();
  const { services } = useSiteData();
  const service = useMemo(() => services.find((item) => item.slug === slug), [services, slug]);

  if (!service) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="panel p-8">Service not found.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <Seo
        title={service.name}
        description={service.description || `${service.name} at Maanak Labs with sample quantity guidance and expected testing timelines.`}
        canonicalPath={`/services/${service.slug}`}
        image="/images/maanak-germination-tray-2.jpeg"
        keywords={`${service.name}, seed testing service, ${service.crop || "seed lab testing"}`}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr,360px] lg:px-8">
        <div className="panel p-8">
          <SectionHeader eyebrow="Service detail" title={service.name} description={service.description} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Required sample quantity</p>
              <p className="mt-2 text-lg font-bold">{service.sampleQuantity}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Estimated testing time</p>
              <p className="mt-2 text-lg font-bold">{service.estimatedTestingTime}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Testing scope</p>
              <p className="mt-2 text-lg font-bold">Professional seed quality evaluation</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Suitable for</p>
              <p className="mt-2 text-lg font-bold">Seed companies, growers, dealers, and distributors</p>
            </div>
          </div>
          <div className="mt-8 rounded-3xl border border-slate-200 p-5">
            <h3 className="text-xl font-bold">Terms and conditions</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{service.termsAndConditions}</p>
          </div>
        </div>
        <aside className="panel p-8">
          <h3 className="text-xl font-bold">Need this test?</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Start an online request, select this service, complete payment, and download the branded sample documents.
          </p>
          <Link to="/dashboard/new-request" className="btn-primary mt-6">
            Start request
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default ServiceDetailPage;

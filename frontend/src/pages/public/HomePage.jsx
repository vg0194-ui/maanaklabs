import { CheckCircle2, FileText, FlaskConical, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "../../components/public/HeroSection";
import SectionHeader from "../../components/public/SectionHeader";
import ServiceCard from "../../components/public/ServiceCard";
import SampleGuideSection from "../../components/public/SampleGuideSection";
import { useSiteData } from "../../contexts/SiteDataContext";

const processSteps = [
  "Create an online request with crop, variety, lot, and test details.",
  "Complete payment and download the request PDF pack.",
  "Pack each sample properly and dispatch to the laboratory.",
  "Track request status until report generation and completion.",
];

function HomePage() {
  const { services, settings, blogs } = useSiteData();

  return (
    <>
      <HeroSection />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our services"
            title="Seed quality testing built around clarity and trust"
            description="Each service card includes sample requirement, estimated testing time, and base rate. Admin can update active services and rates anytime."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.slice(0, 8).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
          <div className="panel p-8">
            <SectionHeader
              eyebrow="Why Maanak Labs"
              title="A premium, farmer-friendly experience without unnecessary complexity"
              description="The platform stays simple for non-technical users while still supporting traceability, payment-ready workflows, and admin control."
            />
            <div className="mt-8 grid gap-4">
              {[
                { icon: ShieldCheck, title: "Compliance-aware copy", text: settings?.compliance?.accreditationStatus },
                { icon: FlaskConical, title: "Scientific workflow", text: settings?.compliance?.scientificProceduresNote },
                { icon: FileText, title: "Branded PDF kit", text: "Request letter, bag slips, dispatch guide, and address label in one download." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-slate-200 p-5">
                    <Icon className="h-5 w-5 text-brand-blue" />
                    <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel bg-brand-green p-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-100">Testing process</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Simple online to lab dispatch flow</h2>
            <div className="mt-8 space-y-4">
              {processSteps.map((step, index) => (
                <div key={step} className="rounded-3xl border border-white/15 bg-white/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-green font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-white">{step}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/testing-process" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-green">
              View complete process
            </Link>
          </div>
        </div>
      </section>

      <SampleGuideSection />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Knowledge center"
            title="Helpful seed quality guidance"
            description="Use blogs to educate customers on representative sampling, test selection, and dispatch readiness."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {blogs.slice(0, 2).map((blog) => (
              <article key={blog._id} className="panel overflow-hidden">
                <img src={blog.coverImage} alt={blog.title} className="h-56 w-full object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{blog.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{blog.excerpt}</p>
                  <Link to={`/blogs/${blog.slug}`} className="mt-6 inline-flex text-sm font-semibold text-brand-blue">
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;


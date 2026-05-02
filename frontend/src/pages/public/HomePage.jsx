import { CheckCircle2, FileText, FlaskConical, ShieldCheck, Sprout, Target } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "../../components/public/HeroSection";
import SectionHeader from "../../components/public/SectionHeader";
import ServiceCard from "../../components/public/ServiceCard";
import SampleGuideSection from "../../components/public/SampleGuideSection";
import { useSiteData } from "../../contexts/SiteDataContext";

const processSteps = [
  {
    title: "Create request",
    text: "Submit crop, variety, lot number, lot quantity, seed type, and required tests through the online form.",
  },
  {
    title: "Laboratory review and payment",
    text: "The system applies service-wise rates and GST so the request is financially clear before sample dispatch.",
  },
  {
    title: "Pack and dispatch samples",
    text: "Download request documents, prepare representative samples carefully, and send them to the lab with proper labeling.",
  },
  {
    title: "Track testing progress",
    text: "Follow each request from sample receipt to under testing, report generation, and final completion.",
  },
];

const assuranceCards = [
  {
    icon: ShieldCheck,
    title: "Quality policy",
    text: "At Maanak Labs, we are committed to precision and excellence in seed testing services and to continuous improvement of laboratory operations.",
  },
  {
    icon: Target,
    title: "Lab mission",
    text: "Assuring the quality of seed lots for seed trade through disciplined, scientific, and dependable testing support.",
  },
  {
    icon: FileText,
    title: "Scientific quality systems",
    text: "The lab follows scientific seed testing procedures and quality systems, with accreditation information shown only as placeholder status until officially updated.",
  },
];

const purposeCards = [
  {
    icon: FlaskConical,
    title: "World-class testing methods",
    text: "Provide world-class seed testing services according to ISTA standard methods with professional reporting and practical dispatch guidance.",
  },
  {
    icon: Sprout,
    title: "Research platform for seed life",
    text: "Use the laboratory as a research platform to enquire into and improve seed life inside and outside seed cold storage.",
  },
];

function HomePage() {
  const { services, settings } = useSiteData();

  return (
    <>
      <HeroSection />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our services"
            title="Seed testing services presented in a clear, professional format"
            description="Explore core laboratory services with sample requirements and expected testing timelines, designed for seed companies, distributors, dealers, and growers."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.slice(0, 8).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Laboratory assurance"
            title="Professional laboratory values presented with clarity"
            description="The website experience now reflects the same confidence, structure, and trust expected from a modern seed testing laboratory."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="grid gap-6">
              {assuranceCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="panel p-7">
                    <Icon className="h-6 w-6 text-brand-blue" />
                    <h3 className="mt-4 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1400&q=80"
                alt="Seed laboratory analysis team"
                className="h-80 w-full object-cover"
              />
              <div className="p-7">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-blue">Compliance note</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {settings?.compliance?.scientificProceduresNote}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{settings?.compliance?.accreditationStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Laboratory purpose"
            title="Built for both dependable testing and practical seed research"
            description="The platform should feel trustworthy to commercial clients while still reflecting scientific curiosity and long-term seed quality improvement."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {purposeCards.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="panel overflow-hidden p-0">
                  <img
                    src={
                      item.title === "World-class testing methods"
                        ? "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=1400&q=80"
                        : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
                    }
                    alt={item.title}
                    className="h-60 w-full object-cover"
                  />
                  <div className="p-7">
                    <Icon className="h-6 w-6 text-brand-green" />
                    <h3 className="mt-4 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
          <div className="panel bg-brand-green p-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-100">Process flow</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Simple request to report journey</h2>
            <div className="mt-8 space-y-4">
              {processSteps.map((step, index) => (
                <div key={step.title} className="rounded-3xl border border-white/15 bg-white/10 p-5">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-bold text-brand-green">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-emerald-50">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/testing-process"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-green"
            >
              View complete process
            </Link>
          </div>

          <div className="panel p-8">
            <SectionHeader
              eyebrow="Why this flow works"
              title="A farmer-friendly experience without losing laboratory discipline"
              description="The site keeps the steps understandable for non-technical users while preserving traceability, documentation, and testing control for the laboratory."
            />
            <div className="mt-8 grid gap-4">
              {[
                {
                  icon: CheckCircle2,
                  title: "Clear document flow",
                  text: "Users get request letters, sample slips, and address labels in a predictable format after payment.",
                },
                {
                  icon: ShieldCheck,
                  title: "Controlled status tracking",
                  text: "Sample awaited, sample received, under testing, and reporting stages are visible in one place.",
                },
                {
                  icon: FileText,
                  title: "Professional communication",
                  text: "The language, page structure, and sample guidance are designed to reassure seed companies and trade partners.",
                },
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
        </div>
      </section>

      <SampleGuideSection />
    </>
  );
}

export default HomePage;

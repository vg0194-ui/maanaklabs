import { CheckCircle2, FileText, FlaskConical, ShieldCheck, Sprout, Target } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "../../components/public/HeroSection";
import Seo from "../../components/Seo";
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
    title: "Accurate and scientific testing",
    text: "Every sample is handled with precision using scientific seed testing methods for dependable decision-making.",
  },
  {
    icon: Target,
    title: "Fast turnaround time",
    text: "Quick and reliable testing support helps seed industries plan dispatch, storage, and sales without unnecessary delay.",
  },
  {
    icon: FileText,
    title: "Clear and structured reports",
    text: "Results are presented in an organized format so seed companies and trade partners can act on them confidently.",
  },
];

const whoWeServe = [
  "Seed Companies",
  "Seed Producers and Processors",
  "Distributors and Dealers",
  "Exporters",
  "Institutional Buyers",
];

const objectives = [
  "Test seed lots before dispatch",
  "Plan storage efficiently",
  "Maintain quality consistency",
  "Reduce risk in the market",
];

function HomePage() {
  const { services } = useSiteData();
  const activeServices = services.filter((service) => service.isActive !== false);

  return (
    <>
      <Seo
        title="Seed Testing Laboratory"
        description="Maanak Labs provides seed testing services for germination, purity, moisture, vigour, seed health, and lot quality decisions for seed companies and agricultural stakeholders."
        canonicalPath="/"
        image="/images/maanak-lab-interior.jpeg"
        keywords="seed testing laboratory, germination test, purity test, moisture test, seed vigour test, seed health test, Jaipur seed lab, Rajasthan seed testing"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Maanak Labs",
              url: "https://maanaklabs.com",
              logo: "https://maanaklabs.com/images/maanak-labs-logo.png",
              email: "info@maanaklabs.com",
              telephone: "+91 98765 43210",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Entorno Greens Campus, Akhepura, Delhi-Jaipur 200ft Bypass, VKI",
                addressLocality: "Jaipur",
                addressRegion: "Rajasthan",
                postalCode: "302013",
                addressCountry: "IN",
              },
            },
            {
              "@type": "WebSite",
              name: "Maanak Labs",
              url: "https://maanaklabs.com",
            },
          ],
        }}
      />
      <HeroSection />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our services"
            title="Seed testing services for routine lot release, storage decisions, and quality assurance"
            description="We provide testing support for germination, physical purity, moisture, vigour, seed health, and related seed quality checks required for lot planning."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {activeServices.slice(0, 8).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Laboratory assurance"
            title="Why Maanak Labs"
            description="We focus on accuracy, speed, transparency, and ease so the testing process stays smooth and practical for the seed industry."
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
                src="/images/maanak-germination-tray-2.jpeg"
                alt="Seed germination evaluation at Maanak Labs"
                className="h-80 w-full object-cover"
              />
              <div className="p-7">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-blue">Quality policy</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  At Maanak Labs, we are committed to precision and excellence in seed testing services.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Continuous improvement of our laboratory operations remains part of our working approach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Laboratory purpose"
            title="Built to support better seed decisions before lots reach the market"
            description="Our goal is simple: help you make confident decisions about your seed lots before they move into dispatch, storage, or sale."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="panel overflow-hidden p-0">
              <img
                src="/images/maanak-lab-interior.jpeg"
                alt="Maanak Labs laboratory setup"
                className="h-60 w-full object-cover"
              />
              <div className="p-7">
                <FlaskConical className="h-6 w-6 text-brand-green" />
                <h3 className="mt-4 text-2xl font-bold">Who We Serve</h3>
                <div className="mt-4 grid gap-3">
                  {whoWeServe.map((item) => (
                    <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel overflow-hidden p-0">
              <img
                src="/images/maanak-seed-vigor.jpg"
                alt="Seed vigor comparison samples"
                className="h-60 w-full object-cover"
              />
              <div className="p-7">
                <Sprout className="h-6 w-6 text-brand-green" />
                <h3 className="mt-4 text-2xl font-bold">Our Objective</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">To help industries:</p>
                <div className="mt-4 grid gap-3">
                  {objectives.map((item) => (
                    <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </article>
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
              title="Simple for users, useful for real laboratory operations"
              description="The process is designed for seed companies and trade partners who need clarity, speed, and traceability from request creation to report delivery."
            />
            <div className="mt-8 grid gap-4">
              {[
                {
                  icon: CheckCircle2,
                  title: "Easy online request system",
                  text: "Lot details, selected tests, payment, and document downloads are all kept in one structured workflow.",
                },
                {
                  icon: ShieldCheck,
                  title: "Designed for seed industry needs",
                  text: "The process supports lot testing before dispatch so industries can plan storage and supply decisions properly.",
                },
                {
                  icon: FileText,
                  title: "Traceable status updates",
                  text: "Sample awaited, sample received, under testing, report generated, and completed stages remain visible throughout the request cycle.",
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

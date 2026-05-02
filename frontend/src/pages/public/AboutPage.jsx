import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

const profileCards = [
  {
    title: "Vision",
    text: "To be a trusted seed testing laboratory known for scientific accuracy, practical service, and confidence-building support for seed trade stakeholders.",
  },
  {
    title: "Mission",
    text: "To assure the quality of seed lots for seed trade through disciplined testing systems, dependable reporting, and farmer-friendly sample handling guidance.",
  },
];

const valueCards = [
  "Precision and excellence in seed testing services.",
  "Continuous improvement of laboratory operations and quality systems.",
  "Professional communication that remains simple for farmers, dealers, and seed companies.",
];

function AboutPage() {
  const { settings } = useSiteData();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About Maanak Labs"
          title="A professional seed testing laboratory platform designed for confidence"
          description="Built to look credible to seed trade partners while staying understandable for growers, distributors, and other non-technical users."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="panel overflow-hidden p-0">
            <img
              src="https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1400&q=80"
              alt="Seed laboratory planning and documentation"
              className="h-72 w-full object-cover"
            />
            <div className="p-8">
              <div className="space-y-6 text-base leading-8 text-slate-600">
                <p>{settings?.aboutContent}</p>
                <p>
                  Our platform is built to help farmers, dealers, distributors, and seed companies submit testing
                  requests online, understand how to withdraw and pack representative samples, and track progress from
                  submission through reporting.
                </p>
                <p>
                  The laboratory follows scientific seed testing procedures and quality systems. NABL and ISO/IEC 17025
                  information is shown only as placeholder status until official accreditation details are available.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {profileCards.map((card) => (
              <article key={card.title} className="panel p-7">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-blue">{card.title}</p>
                <p className="mt-4 text-lg leading-8 text-slate-700">{card.text}</p>
              </article>
            ))}

            <article className="panel bg-brand-green p-7 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-100">Core values</p>
              <div className="mt-5 space-y-4">
                {valueCards.map((value) => (
                  <div key={value} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-7 text-emerald-50">
                    {value}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;

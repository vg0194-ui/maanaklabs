import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

const profileCards = [
  {
    title: "Vision",
    text: "To become a trusted and benchmark seed testing laboratory known for precision in testing, speed in reporting, simplicity in process, and reliability in results.",
  },
  {
    title: "Mission",
    text: "To provide accurate, fast, and hassle-free seed testing services that help seed companies and agricultural stakeholders maintain quality, optimize operations, and deliver reliable seeds to the market.",
  },
];

const valueCards = [
  "Accuracy First - Every test result matters",
  "Speed with Reliability - Fast reports without compromise",
  "Transparency - Clear processes and traceable results",
  "Customer Simplicity - Easy for farmers and industries alike",
  "Scientific Integrity - Following standard testing protocols",
];

function AboutPage() {
  const { settings } = useSiteData();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="About Maanak Labs"
          title="Dedicated seed testing support for confident lot decisions"
          description="Maanak Labs is a dedicated seed testing laboratory committed to delivering accurate, reliable, and timely seed quality analysis."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="panel overflow-hidden p-0">
            <img
              src="/images/maanak-lab-setup.jpeg"
              alt="Complete Maanak Labs setup"
              className="h-72 w-full object-cover"
            />
            <div className="p-8">
              <div className="space-y-6 text-base leading-8 text-slate-600">
                <p>{settings?.aboutContent}</p>
                <p>
                  Operating as a unit of Entorno Greens Seeds Private Limited, we are built on strong industry expertise
                  and a deep understanding of seed production, processing, and distribution challenges.
                </p>
                <p>
                  We support seed companies, producers and processors, distributors and dealers, and institutional
                  buyers. Our goal is simple: help you make confident decisions about your seed lots before they reach
                  the market.
                </p>
                <p>
                  At Maanak Labs, every sample is handled with precision using scientific testing methods, ensuring
                  dependable results for germination, purity, moisture, vigour, and seed health.
                </p>
                <p>
                  We focus on speed, transparency, and ease so your testing process remains smooth and hassle-free.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <article className="panel overflow-hidden p-0">
              <img
                src="/images/maanak-germination-tray-2.jpeg"
                alt="Germination test seedlings"
                className="h-56 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-blue">Laboratory testing</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Our testing workflow is built for accurate germination, purity, moisture, vigour, and seed health
                  evaluation with practical reporting for seed trade decisions.
                </p>
              </div>
            </article>

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

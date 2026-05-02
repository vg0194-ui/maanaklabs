import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

const profileCards = [
  {
    title: "Vision",
    text: "To be a trusted seed testing laboratory that helps the seed industry release better lots to the market with confidence.",
  },
  {
    title: "Mission",
    text: "To provide accurate, hassle-free, and fast testing service so seed industries can plan dispatch and storage properly and maintain quality supply to the market.",
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
          title="A seed testing laboratory focused on practical industry use"
          description="Maanak Labs is built to help seed businesses make timely decisions on lot release, storage planning, and market supply based on dependable test results."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="panel overflow-hidden p-0">
            <img
              src="https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1400&q=80"
              alt="Seed sample records and laboratory planning"
              className="h-72 w-full object-cover"
            />
            <div className="p-8">
              <div className="space-y-6 text-base leading-8 text-slate-600">
                <p>{settings?.aboutContent}</p>
                <p>
                  The main objective of this laboratory is to provide accurate, hassle-free, and fast testing service
                  for seed industries so they can have their lots tested and plan dispatch and storage accordingly.
                </p>
                <p>
                  By doing this, seed industries are better placed to supply high-quality seeds to the market. The
                  laboratory follows scientific seed testing procedures and quality systems, while sample submission and
                  dispatch guidance remain simple for users.
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

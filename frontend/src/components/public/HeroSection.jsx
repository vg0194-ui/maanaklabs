import { ArrowRight, BadgeCheck, Microscope, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteData } from "../../contexts/SiteDataContext";
import BrandLogo from "./BrandLogo";

const heroStats = [
  { label: "Scientific workflow", icon: ShieldCheck },
  { label: "Reliable testing support", icon: BadgeCheck },
  { label: "Research-oriented lab culture", icon: Microscope },
];

function HeroSection() {
  const { settings } = useSiteData();

  return (
    <section className="overflow-hidden bg-[linear-gradient(135deg,#edf5f2_0%,#f8fbff_40%,#ffffff_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr,0.95fr] lg:px-8 lg:py-20">
        <div>
          <BrandLogo
            className="mb-6"
            siteName={settings?.siteName || "Maanak Labs"}
            tagline={settings?.siteTagline || "A Unit of Entorno Greens Seeds Private Limited"}
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-semibold text-brand-green shadow-sm">
            <BadgeCheck className="h-4 w-4" />
            Precision and excellence in seed testing services
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight sm:text-6xl">
            A professional seed testing laboratory website built around trust, quality, and scientific clarity.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {settings?.homeIntro ||
              "Maanak Labs supports seed companies, traders, distributors, and growers with a clean online request flow, clear sample dispatch guidance, and a modern lab-focused digital experience."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard/new-request" className="btn-primary gap-2">
              Request Seed Testing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn About the Lab
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {heroStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-soft">
                  <Icon className="h-5 w-5 text-brand-blue" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
              alt="Seed laboratory workspace"
              className="h-72 w-full object-cover"
            />
            <div className="grid gap-4 p-6 md:grid-cols-[1.1fr,0.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Laboratory quality</p>
                <h2 className="mt-3 text-2xl font-bold">Quality Policy</h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  <p>At Maanak Labs, we are committed to precision and excellence in seed testing services.</p>
                  <p>We are committed to continuous improvement of our laboratory operations.</p>
                </div>
              </div>
              <div className="rounded-3xl bg-brand-green p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">Lab Mission</p>
                <p className="mt-3 text-xl font-bold">Assuring the quality of seed lots for seed trade.</p>
                <p className="mt-4 text-sm leading-7 text-emerald-50">
                  The lab works as both a quality-assurance center and a research platform to better understand seed
                  life inside and outside seed cold storage.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80"
                alt="Seed testing instruments"
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">World class service</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  To provide world class seed testing services according to ISTA standard methods.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80"
                alt="Laboratory research analysis"
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Research platform</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  We use the lab as a research platform to enquire and improve the life of seed inside and outside cold
                  storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

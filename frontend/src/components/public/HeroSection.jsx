import { ArrowRight, BadgeCheck, Microscope, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteData } from "../../contexts/SiteDataContext";
import BrandLogo from "./BrandLogo";

const heroStats = [
  { label: "Simple process", icon: ShieldCheck },
  { label: "Fast reports", icon: BadgeCheck },
  { label: "Trusted results", icon: Microscope },
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
            Accurate, hassle-free, and fast testing service for seed industries
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight sm:text-6xl">
            Accurate Seed Testing. Faster Decisions. Better Quality Seeds.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {settings?.homeIntro ||
              "Maanak Labs helps you test your seed lots quickly and reliably so you can plan dispatch, storage, and sales with confidence."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard/new-request" className="btn-primary gap-2">
              Start Testing Request
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="btn-secondary">
              View Services
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
              src="/images/maanak-lab-interior.jpeg"
              alt="Maanak Labs laboratory setup"
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
                src="/images/maanak-germination-tray-1.jpeg"
                alt="Seed germination testing samples"
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
                src="/images/maanak-seed-vigor.jpg"
                alt="Low and high seed vigor samples"
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

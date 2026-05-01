import { ArrowRight, BadgeCheck, Microscope, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteData } from "../../contexts/SiteDataContext";
import BrandLogo from "./BrandLogo";

function HeroSection() {
  const { settings } = useSiteData();

  return (
    <section className="bg-hero-gradient">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 lg:py-24">
        <div>
          <BrandLogo
            className="mb-6"
            siteName={settings?.siteName || "Maanak Labs"}
            tagline={settings?.siteTagline || "A Unit of Entorno Greens Seeds Private Limited"}
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-semibold text-brand-green shadow-sm">
            <BadgeCheck className="h-4 w-4" />
            Scientific seed testing procedures with quality systems
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight sm:text-6xl">
            Premium seed testing support built for trust, speed, and traceability.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {settings?.homeIntro ||
              "Maanak Labs brings together a modern public website, online request workflow, payment-ready forms, and report tracking for seed companies, dealers, distributors, and farmers."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard/new-request" className="btn-primary gap-2">
              Request Seed Testing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/sample-guidelines" className="btn-secondary">
              How to Send Your Sample
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Request Tracking", icon: ShieldCheck },
              { label: "Payment-ready Flow", icon: BadgeCheck },
              { label: "Lab-style Reports", icon: Microscope },
            ].map((item) => {
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

        <div className="panel overflow-hidden">
          <div className="bg-brand-green px-6 py-5 text-white">
            <div className="rounded-2xl bg-white/95 p-3">
              <BrandLogo
                showTagline={false}
                siteName={settings?.siteName || "Maanak Labs"}
                tagline={settings?.siteTagline || "A Unit of Entorno Greens Seeds Private Limited"}
              />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-white">A clean, modern agri-lab experience</h2>
          </div>
          <div className="grid gap-4 p-6">
            {[
              "Online seed testing request system with multi-sample forms",
              "Payment workflow with Razorpay-ready placeholder integration",
              "PDF pack: request letter, sample slips, packing guide, and address label",
              "Admin panel for services, rates, content, requests, and reports",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              NABL / ISO/IEC 17025 accreditation section is intentionally shown as "Accreditation in process / to be
              updated" until formal approval details are available.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

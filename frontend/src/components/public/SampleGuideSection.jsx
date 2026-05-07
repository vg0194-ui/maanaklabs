import { Download, TriangleAlert } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { sampleGuideSteps, sampleGuideWarning } from "../../data/sampleGuide";
import { API_URL } from "../../api/client";

function SampleGuideSection({ compact = false, showTitle = true }) {
  return (
    <section className={compact ? "" : "py-16"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showTitle ? (
          <SectionHeader
            eyebrow="Farmer-friendly guidance"
            title="How to Withdraw, Pack & Send Seed Samples"
            description="Simple steps for farmers, dealers, seed companies, and distributors. Follow the same flow on mobile or desktop to avoid delays in testing."
          />
        ) : null}

        <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-1 h-5 w-5 text-amber-700" />
            <p className="text-sm font-medium leading-7 text-amber-900">{sampleGuideWarning}</p>
          </div>
          <a
            href={`${API_URL}/public/sample-packing-guide.pdf`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary gap-2 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Sample Packing Guide PDF
          </a>
        </div>

        <div className={`mt-10 grid gap-6 ${compact ? "lg:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4"}`}>
          {sampleGuideSteps.map((step) => (
            <article key={step.number} className="panel overflow-hidden border border-slate-200 bg-white">
              <div className="bg-slate-50 p-3">
                <img src={step.image} alt={step.title} className="h-auto w-full rounded-[1.25rem] border border-slate-100 object-contain shadow-soft" />
              </div>
              <div className="p-6">
                <div className="inline-flex rounded-full bg-brand-mist px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-green">
                  Step {step.number}
                </div>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  {step.english.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  <span className="font-semibold text-brand-green">Hindi helper:</span> {step.hindi}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SampleGuideSection;

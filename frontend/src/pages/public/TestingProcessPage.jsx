import SectionHeader from "../../components/public/SectionHeader";

const steps = [
  ["Create Request", "Register or login, enter sample details, and select required tests."],
  ["Amount Calculation", "The system calculates request value using active service and rate data."],
  ["Payment", "Proceed through the placeholder Razorpay-ready flow and confirm payment."],
  ["PDF Generation", "Download request letter, sample slips, packing guide, and lab address label."],
  ["Dispatch Sample", "Pack carefully and send the sample to Maanak Labs."],
  ["Track Progress", "Monitor request status from Sample Awaited to Completed."],
  ["Report Delivery", "Admin uploads the final report PDF for user download."],
];

function TestingProcessPage() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Testing process"
          title="A clear step-by-step journey from request to final report"
          description="Built to stay understandable for non-technical users while still giving the laboratory control over status, pricing, and reporting."
        />
        <div className="mt-10 space-y-4">
          {steps.map(([title, text], index) => (
            <div key={title} className="panel flex gap-5 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green text-lg font-bold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestingProcessPage;


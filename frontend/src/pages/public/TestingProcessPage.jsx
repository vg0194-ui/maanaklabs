import SectionHeader from "../../components/public/SectionHeader";
import Seo from "../../components/Seo";

const steps = [
  ["Create Request", "Register or login, enter crop, variety, lot details, sample quantity, and the tests required for each sample."],
  ["Rate and GST Calculation", "The system applies active testing rates and GST so the amount remains transparent before payment."],
  ["Payment Confirmation", "Proceed through Razorpay checkout and confirm payment using server-side verification and controlled status updates."],
  ["Download Dispatch Documents", "Download the request letter, sample slips, and address label needed for proper packing and dispatch."],
  ["Pack Representative Samples", "Withdraw a representative sample carefully, check sample weight guidance, place slips inside pouches, and seal them securely."],
  ["Send to the Laboratory", "Place all sample pouches in one master bag, insert the request letter, paste the address label, and dispatch safely."],
  ["Track Testing Progress", "Monitor status from Sample Awaited to Sample Received, Under Testing, Report Generated, and Completed."],
  ["Receive Reports", "Admin uploads final reports and invoices when ready so users can download them from the dashboard."],
];

function TestingProcessPage() {
  return (
    <section className="py-16">
      <Seo
        title="Testing Process"
        description="See the Maanak Labs seed testing process from online request and payment through sample dispatch, laboratory testing, status tracking, and final reporting."
        canonicalPath="/testing-process"
        image="/images/maanak-lab-interior.jpeg"
        keywords="seed testing process, sample dispatch process, laboratory workflow, request to report process"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Testing process"
          title="A structured laboratory process from request creation to final reporting"
          description="The flow is written to stay easy for farmers and seed companies to follow while preserving disciplined laboratory handling and documentation."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {steps.map(([title, text], index) => (
            <div key={title} className="panel p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green text-lg font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestingProcessPage;

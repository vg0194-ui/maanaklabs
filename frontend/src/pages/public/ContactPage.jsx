import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

function ContactPage() {
  const { settings } = useSiteData();

  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr,1fr] lg:px-8">
        <div>
          <SectionHeader
            eyebrow="Contact us"
            title="Talk to Maanak Labs"
            description="Share testing requirements, dispatch questions, or operational queries. Lab address and contact details are editable from admin settings."
          />
          <div className="panel mt-10 p-8 text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-800">Address</p>
            <p className="mt-2">{settings?.contactDetails?.address}</p>
            <p className="mt-6 font-semibold text-slate-800">Phone</p>
            <p className="mt-2">{settings?.contactDetails?.mobile}</p>
            <p className="mt-6 font-semibold text-slate-800">Email</p>
            <p className="mt-2">{settings?.contactDetails?.email}</p>
          </div>
        </div>
        <div className="panel p-8">
          <h3 className="text-2xl font-bold">Quick enquiry</h3>
          <div className="mt-6 grid gap-4">
            <input className="field" placeholder="Your name" />
            <input className="field" placeholder="Mobile number" />
            <input className="field" placeholder="Email address" />
            <textarea className="field min-h-40" placeholder="How can we help?" />
            <button type="button" className="btn-primary">
              Send enquiry
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;


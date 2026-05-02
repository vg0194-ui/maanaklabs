import { useMemo, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

const DEFAULT_LAB_ADDRESS =
  "Maanak Labs, Entorno Greens Campus, Akhepura, Delhi-Jaipur 200ft Bypass, VKI, Jaipur 302013, Rajasthan";
const DEFAULT_LAB_MOBILE = "+91 98765 43210";
const DEFAULT_LAB_EMAIL = "info@maanaklabs.com";

function createCaptcha() {
  const first = Math.floor(Math.random() * 6) + 2;
  const second = Math.floor(Math.random() * 7) + 1;

  return {
    first,
    second,
    question: `${first} + ${second}`,
    answer: String(first + second),
  };
}

function ContactPage() {
  const { settings } = useSiteData();
  const initialCaptcha = useMemo(() => createCaptcha(), []);
  const [captcha, setCaptcha] = useState(initialCaptcha);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
    captchaAnswer: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const contactDetails = {
    address: settings?.contactDetails?.address || DEFAULT_LAB_ADDRESS,
    mobile: settings?.contactDetails?.mobile || DEFAULT_LAB_MOBILE,
    email: settings?.contactDetails?.email || DEFAULT_LAB_EMAIL,
  };

  function refreshCaptcha() {
    setCaptcha(createCaptcha());
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.website.trim()) {
      setError("Spam check failed. Please try again.");
      refreshCaptcha();
      return;
    }

    if (!form.name.trim() || !form.mobile.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please complete all enquiry fields before sending.");
      return;
    }

    if (form.captchaAnswer.trim() !== captcha.answer) {
      setError("Captcha answer is incorrect. Please solve it again.");
      refreshCaptcha();
      setForm((current) => ({ ...current, captchaAnswer: "" }));
      return;
    }

    const subject = encodeURIComponent(`Maanak Labs enquiry from ${form.name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${form.name.trim()}\nMobile: ${form.mobile.trim()}\nEmail: ${form.email.trim()}\n\nMessage:\n${form.message.trim()}`
    );

    window.location.href = `mailto:${contactDetails.email}?subject=${subject}&body=${body}`;
    setSuccess("Your enquiry details are ready. Your email app should open now.");
    setForm({
      name: "",
      mobile: "",
      email: "",
      message: "",
      captchaAnswer: "",
      website: "",
    });
    refreshCaptcha();
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Contact us"
          title="Contact Maanak Labs for sample dispatch and testing support"
          description="Use the contact details below for sample dispatch, operational coordination, and testing-related enquiries."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="grid gap-6">
            {[
              {
                icon: MapPin,
                title: "Lab address",
                value: contactDetails.address,
              },
              {
                icon: Phone,
                title: "Contact number",
                value: contactDetails.mobile,
              },
              {
                icon: Mail,
                title: "Email",
                value: contactDetails.email,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="panel p-7">
                  <Icon className="h-6 w-6 text-brand-blue" />
                  <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">{item.title}</p>
                  <p className="mt-3 text-base leading-8 text-slate-700">{item.value}</p>
                </article>
              );
            })}

            <article className="panel bg-brand-green p-7 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-100">Before you dispatch</p>
              <p className="mt-4 text-sm leading-7 text-emerald-50">
                Mention the request number on communication, keep the sample slips inside the sample pouches, and use
                the downloaded address label on the master bag so the shipment reaches the correct laboratory desk.
              </p>
            </article>
          </div>

          <div className="panel p-8">
            <h3 className="text-2xl font-bold">Quick enquiry</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Fill in your details and complete the captcha check before sending your enquiry.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <input
                className="field"
                placeholder="Your name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
              <input
                className="field"
                placeholder="Mobile number"
                value={form.mobile}
                onChange={(event) => updateField("mobile", event.target.value)}
              />
              <input
                className="field"
                placeholder="Email address"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <textarea
                className="field min-h-40"
                placeholder="How can we help?"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
              />

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => updateField("website", event.target.value)}
                className="hidden"
                aria-hidden="true"
              />

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Captcha check</p>
                    <p className="mt-1 text-sm text-slate-600">Please solve: {captcha.question}</p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-sm font-semibold text-brand-blue"
                  >
                    Refresh
                  </button>
                </div>
                <input
                  className="field mt-4"
                  placeholder="Enter the answer"
                  value={form.captchaAnswer}
                  onChange={(event) => updateField("captchaAnswer", event.target.value)}
                />
              </div>

              {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
              {success ? <p className="text-sm font-semibold text-emerald-700">{success}</p> : null}

              <button type="submit" className="btn-primary">
                Send enquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;

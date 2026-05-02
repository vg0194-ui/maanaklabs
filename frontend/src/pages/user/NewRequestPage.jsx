import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus, Trash2 } from "lucide-react";
import { apiFetch, API_URL } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteData } from "../../contexts/SiteDataContext";
import { formatCurrency } from "../../utils/formatters";

const blankSample = {
  crop: "",
  variety: "",
  lotNumber: "",
  lotQuantity: "",
  seedClass: "Certified",
  stage: "Cleaned",
  numberOfSamples: 1,
  selectedTests: [],
  remarks: "",
};

function getCurrentRate(rates, serviceId, crop) {
  const normalizedCrop = (crop || "").trim().toLowerCase();
  const matches = rates.filter((rate) => String(rate.service?._id || rate.service) === String(serviceId));
  const cropRate = matches.find((rate) => (rate.crop || "").trim().toLowerCase() === normalizedCrop);
  const genericRate = matches.find((rate) => !(rate.crop || "").trim());
  return cropRate || genericRate || null;
}

function normalizeUserForm(user) {
  return {
    companyName: user?.companyName || "",
    contactName: user?.name || "",
    contactEmail: user?.email || "",
    contactMobile: user?.mobile || "",
    gstNumber: user?.gstNumber || "",
    billingAddress: {
      line1: user?.billingAddress?.line1 || "",
      line2: user?.billingAddress?.line2 || "",
      city: user?.billingAddress?.city || "",
      state: user?.billingAddress?.state || "",
      postalCode: user?.billingAddress?.postalCode || "",
      country: user?.billingAddress?.country || "India",
    },
  };
}

function NewRequestPage() {
  const { token, user } = useAuth();
  const { services, rates } = useSiteData();
  const navigate = useNavigate();
  const [samples, setSamples] = useState([blankSample]);
  const [requestDetails, setRequestDetails] = useState(() => normalizeUserForm(user));
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const activeServices = useMemo(() => services.filter((service) => service.isActive), [services]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setRequestDetails((current) => {
      if (current.contactName || current.contactEmail || current.contactMobile) {
        return current;
      }

      return normalizeUserForm(user);
    });
  }, [user]);

  const estimate = useMemo(() => {
    return samples.reduce(
      (summary, sample) => {
        (sample.selectedTests || []).forEach((testId) => {
          const rate = getCurrentRate(rates, testId, sample.crop);
          if (!rate) {
            return;
          }

          const base = Number(rate.amount || 0);
          const gst = (base * Number(rate.gstPercentage || 0)) / 100;
          summary.subtotal += base;
          summary.gst += gst;
        });

        return summary;
      },
      { subtotal: 0, gst: 0 }
    );
  }, [rates, samples]);

  const totals = {
    subtotal: Number(estimate.subtotal.toFixed(2)),
    gst: Number(estimate.gst.toFixed(2)),
    total: Number((estimate.subtotal + estimate.gst).toFixed(2)),
  };

  const updateSample = (index, field, value) => {
    setSamples((current) =>
      current.map((sample, sampleIndex) => (sampleIndex === index ? { ...sample, [field]: value } : sample))
    );
  };

  const updateAddress = (field, value) => {
    setRequestDetails((current) => ({
      ...current,
      billingAddress: {
        ...current.billingAddress,
        [field]: value,
      },
    }));
  };

  const toggleTest = (index, testId) => {
    setSamples((current) =>
      current.map((sample, sampleIndex) =>
        sampleIndex === index
          ? {
              ...sample,
              selectedTests: sample.selectedTests.includes(testId)
                ? sample.selectedTests.filter((item) => item !== testId)
                : [...sample.selectedTests, testId],
            }
          : sample
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/requests", {
        method: "POST",
        token,
        body: {
          ...requestDetails,
          samples,
          remarks,
        },
      });

      navigate(`/dashboard/payment-success/${response.request._id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <h1 className="text-3xl font-extrabold">Create Sample Testing Request</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Follow the guided flow: add client details, billing details, sample details, and then review payment with GST
          before proceeding to Razorpay.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Step 1</p>
              <h2 className="mt-2 text-2xl font-bold">Basic and Billing Information</h2>
            </div>
            <a href={`${API_URL}/public/sample-size-guide.pdf`} target="_blank" rel="noreferrer" className="btn-secondary gap-2">
              <Download className="h-4 w-4" />
              Crop-wise Sample Size PDF
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input className="field" placeholder="Name" value={requestDetails.contactName} onChange={(event) => setRequestDetails({ ...requestDetails, contactName: event.target.value })} />
            <input className="field" placeholder="Company" value={requestDetails.companyName} onChange={(event) => setRequestDetails({ ...requestDetails, companyName: event.target.value })} />
            <input className="field" placeholder="Email" value={requestDetails.contactEmail} onChange={(event) => setRequestDetails({ ...requestDetails, contactEmail: event.target.value })} />
            <input className="field" placeholder="Mobile" value={requestDetails.contactMobile} onChange={(event) => setRequestDetails({ ...requestDetails, contactMobile: event.target.value })} />
            <input className="field" placeholder="GST (optional)" value={requestDetails.gstNumber} onChange={(event) => setRequestDetails({ ...requestDetails, gstNumber: event.target.value })} />
            <input className="field" placeholder="Country" value={requestDetails.billingAddress.country} onChange={(event) => updateAddress("country", event.target.value)} />
            <input className="field md:col-span-2 xl:col-span-2" placeholder="Address line 1" value={requestDetails.billingAddress.line1} onChange={(event) => updateAddress("line1", event.target.value)} />
            <input className="field" placeholder="Address line 2" value={requestDetails.billingAddress.line2} onChange={(event) => updateAddress("line2", event.target.value)} />
            <input className="field" placeholder="City" value={requestDetails.billingAddress.city} onChange={(event) => updateAddress("city", event.target.value)} />
            <input className="field" placeholder="State" value={requestDetails.billingAddress.state} onChange={(event) => updateAddress("state", event.target.value)} />
            <input className="field" placeholder="Pincode" value={requestDetails.billingAddress.postalCode} onChange={(event) => updateAddress("postalCode", event.target.value)} />
          </div>
        </div>

        <div className="space-y-6">
          {samples.map((sample, index) => (
            <div key={`sample-${index}`} className="panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Step 2</p>
                  <h2 className="mt-2 text-2xl font-bold">Sample Detail {index + 1}</h2>
                </div>
                {samples.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setSamples((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                    className="rounded-full border border-rose-200 p-3 text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <input className="field" placeholder="Crop" value={sample.crop} onChange={(event) => updateSample(index, "crop", event.target.value)} />
                <input className="field" placeholder="Variety" value={sample.variety} onChange={(event) => updateSample(index, "variety", event.target.value)} />
                <input className="field" placeholder="Lot Number" value={sample.lotNumber} onChange={(event) => updateSample(index, "lotNumber", event.target.value)} />
                <input className="field" placeholder="Lot Quantity (Kgs)" value={sample.lotQuantity} onChange={(event) => updateSample(index, "lotQuantity", event.target.value)} />
                <select className="field" value={sample.seedClass} onChange={(event) => updateSample(index, "seedClass", event.target.value)}>
                  {["Breeder", "Foundation", "Certified", "Truthful", "Research"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <select className="field" value={sample.stage} onChange={(event) => updateSample(index, "stage", event.target.value)}>
                  {["Raw", "Cleaned", "Treated"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="field"
                  placeholder="Number of samples"
                  value={sample.numberOfSamples}
                  onChange={(event) => updateSample(index, "numberOfSamples", Number(event.target.value))}
                />
                <textarea className="field md:col-span-2 xl:col-span-2 min-h-24" placeholder="Sample remarks" value={sample.remarks} onChange={(event) => updateSample(index, "remarks", event.target.value)} />
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-700">Test Required</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {activeServices.map((service) => {
                    const currentRate = getCurrentRate(rates, service._id, sample.crop);
                    const amount = Number(currentRate?.amount ?? service.rate ?? 0);
                    const gstPercentage = Number(currentRate?.gstPercentage ?? service.gstPercentage ?? 0);
                    const total = amount + (amount * gstPercentage) / 100;

                    return (
                      <label key={service._id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={sample.selectedTests.includes(service._id)}
                          onChange={() => toggleTest(index, service._id)}
                        />
                        <span>
                          <span className="block font-semibold">{service.name}</span>
                          <span className="mt-1 block text-slate-500">{service.sampleQuantity}</span>
                          <span className="mt-1 block text-slate-500">
                            Base {formatCurrency(amount)} + GST {gstPercentage}% = {formatCurrency(total)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => setSamples((current) => [...current, { ...blankSample }])} className="btn-secondary gap-2">
          <Plus className="h-4 w-4" />
          Add another sample
        </button>

        <div className="panel p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Step 3</p>
          <h2 className="mt-2 text-2xl font-bold">Payment Section</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Payment is calculated service-wise with GST based on the currently active lab rate list.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr,0.8fr]">
            <textarea className="field min-h-24" placeholder="Overall request remarks (optional)" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>GST</span>
                <span>{formatCurrency(totals.gst)}</span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-lg font-bold text-brand-green">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
          <button type="submit" className="btn-primary mt-6" disabled={loading}>
            {loading ? "Creating request..." : "Create request and proceed to payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewRequestPage;

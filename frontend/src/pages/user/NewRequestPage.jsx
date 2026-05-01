import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteData } from "../../contexts/SiteDataContext";
import { formatCurrency } from "../../utils/formatters";

const blankSample = {
  crop: "",
  variety: "",
  lotNumber: "",
  lotQuantity: "",
  seedClass: "Certified",
  stage: "Packed",
  numberOfSamples: 1,
  selectedTests: [],
  remarks: "",
};

function NewRequestPage() {
  const { token } = useAuth();
  const { services } = useSiteData();
  const navigate = useNavigate();
  const [samples, setSamples] = useState([blankSample]);
  const [billingAddressText, setBillingAddressText] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const estimatedTotal = useMemo(() => {
    return samples.reduce((total, sample) => {
      const serviceValue = (sample.selectedTests || []).reduce((sum, testId) => {
        const service = services.find((item) => item._id === testId);
        return sum + Number(service?.rate || 0);
      }, 0);
      return total + serviceValue;
    }, 0);
  }, [samples, services]);

  const updateSample = (index, field, value) => {
    setSamples((current) =>
      current.map((sample, sampleIndex) => (sampleIndex === index ? { ...sample, [field]: value } : sample))
    );
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
          samples,
          remarks,
          billingAddressText,
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
        <h1 className="text-3xl font-extrabold">Create new seed testing request</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Add one or more samples, select tests, and proceed to payment. Request number and sample IDs are generated automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {samples.map((sample, index) => (
          <div key={`sample-${index}`} className="panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Sample {index + 1}</h2>
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
              <input className="field" placeholder="Lot number" value={sample.lotNumber} onChange={(event) => updateSample(index, "lotNumber", event.target.value)} />
              <input className="field" placeholder="Lot quantity" value={sample.lotQuantity} onChange={(event) => updateSample(index, "lotQuantity", event.target.value)} />
              <select className="field" value={sample.seedClass} onChange={(event) => updateSample(index, "seedClass", event.target.value)}>
                {["Breeder", "Foundation", "Certified", "Truthful", "Research"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <select className="field" value={sample.stage} onChange={(event) => updateSample(index, "stage", event.target.value)}>
                {["Raw", "Processed", "Packed"].map((option) => (
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
              <textarea className="field md:col-span-2 xl:col-span-2 min-h-28" placeholder="Remarks" value={sample.remarks} onChange={(event) => updateSample(index, "remarks", event.target.value)} />
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">Selected tests</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {services.filter((service) => service.isActive).map((service) => (
                  <label key={service._id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={sample.selectedTests.includes(service._id)}
                      onChange={() => toggleTest(index, service._id)}
                    />
                    <span>
                      <span className="block font-semibold">{service.name}</span>
                      <span className="block text-slate-500">{formatCurrency(service.rate)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={() => setSamples((current) => [...current, { ...blankSample }])} className="btn-secondary gap-2">
          <Plus className="h-4 w-4" />
          Add another sample
        </button>

        <div className="panel p-6">
          <div className="grid gap-4">
            <textarea
              className="field min-h-32"
              placeholder="Billing address for this request"
              value={billingAddressText}
              onChange={(event) => setBillingAddressText(event.target.value)}
            />
            <textarea className="field min-h-24" placeholder="Overall request remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">Estimated amount before updated rate logic</p>
              <p className="mt-2 text-3xl font-extrabold text-brand-green">{formatCurrency(estimatedTotal)}</p>
            </div>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating request..." : "Create request and proceed"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NewRequestPage;


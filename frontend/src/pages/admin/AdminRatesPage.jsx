import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency, formatDate } from "../../utils/formatters";

const initialRate = {
  service: "",
  crop: "",
  amount: "",
  gstPercentage: "",
  effectiveDate: "",
  isActive: true,
};

function AdminRatesPage() {
  const { token } = useAuth();
  const [rates, setRates] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialRate);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const activeServices = useMemo(() => services.filter((service) => service.isActive), [services]);

  const fetchData = async () => {
    const [rateResponse, serviceResponse] = await Promise.all([
      apiFetch("/admin/rates", { token }),
      apiFetch("/admin/services", { token }),
    ]);
    setRates(rateResponse.rates);
    setServices(serviceResponse.services);
  };

  useEffect(() => {
    fetchData().catch(() => {
      setRates([]);
      setServices([]);
    });
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount),
      gstPercentage: Number(form.gstPercentage || 0),
    };

    if (editingId) {
      await apiFetch(`/admin/rates/${editingId}`, {
        method: "PATCH",
        token,
        body: payload,
      });
      setMessage("Rate updated.");
    } else {
      await apiFetch("/admin/rates", {
        method: "POST",
        token,
        body: payload,
      });
      setMessage("Rate added.");
    }

    setEditingId("");
    setForm(initialRate);
    fetchData();
  };

  const startEdit = (rate) => {
    setEditingId(rate._id);
    setForm({
      service: rate.service?._id || "",
      crop: rate.crop || "",
      amount: String(rate.amount || ""),
      gstPercentage: String(rate.gstPercentage || ""),
      effectiveDate: rate.effectiveDate ? new Date(rate.effectiveDate).toISOString().slice(0, 10) : "",
      isActive: rate.isActive !== false,
    });
  };

  const visibleRates = rates.filter((rate) => rate.service?.isActive !== false);

  return (
    <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
      <div className="panel p-6">
        <h1 className="text-3xl font-extrabold">Manage rates</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Create service-wise or crop-wise rates with GST and effective date. Deactivated services are excluded from
          the new-rate dropdown and the request form.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <select className="field" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
            <option value="">Select active service</option>
            {activeServices.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
          <input className="field" placeholder="Crop (optional)" value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} />
          <input className="field" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          <input className="field" placeholder="GST percentage" value={form.gstPercentage} onChange={(event) => setForm({ ...form, gstPercentage: event.target.value })} />
          <input type="date" className="field" value={form.effectiveDate} onChange={(event) => setForm({ ...form, effectiveDate: event.target.value })} />
          <button type="submit" className="btn-primary w-full">
            {editingId ? "Update rate" : "Add rate"}
          </button>
          {editingId ? (
            <button type="button" className="btn-secondary w-full" onClick={() => { setEditingId(""); setForm(initialRate); }}>
              Cancel edit
            </button>
          ) : null}
        </form>
      </div>
      <div className="panel overflow-x-auto p-6">
        {message ? <p className="mb-4 text-sm font-medium text-emerald-700">{message}</p> : null}
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Service</th>
              <th className="pb-3">Crop</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">GST</th>
              <th className="pb-3">Effective</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRates.map((rate) => (
              <tr key={rate._id} className="border-t border-slate-100">
                <td className="py-4 font-semibold text-slate-800">{rate.service?.name}</td>
                <td className="py-4">{rate.crop || "All crops"}</td>
                <td className="py-4">{formatCurrency(rate.amount)}</td>
                <td className="py-4">{rate.gstPercentage}%</td>
                <td className="py-4">{formatDate(rate.effectiveDate)}</td>
                <td className="py-4">
                  <button type="button" className="text-sm font-semibold text-brand-blue" onClick={() => startEdit(rate)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminRatesPage;

import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { formatDate } from "../../utils/formatters";

function AdminRatesPage() {
  const { token } = useAuth();
  const [rates, setRates] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    service: "",
    crop: "",
    amount: "",
    gstPercentage: "",
    effectiveDate: "",
    isActive: true,
  });

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
    await apiFetch("/admin/rates", {
      method: "POST",
      token,
      body: {
        ...form,
        amount: Number(form.amount),
        gstPercentage: Number(form.gstPercentage || 0),
      },
    });
    setForm({ service: "", crop: "", amount: "", gstPercentage: "", effectiveDate: "", isActive: true });
    fetchData();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
      <div className="panel p-6">
        <h1 className="text-3xl font-extrabold">Manage rates</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <select className="field" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
            <option value="">Select service</option>
            {services.map((service) => (
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
            Add rate
          </button>
        </form>
      </div>
      <div className="panel overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Service</th>
              <th className="pb-3">Crop</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">GST</th>
              <th className="pb-3">Effective</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate._id} className="border-t border-slate-100">
                <td className="py-4 font-semibold text-slate-800">{rate.service?.name}</td>
                <td className="py-4">{rate.crop || "All crops"}</td>
                <td className="py-4">{rate.amount}</td>
                <td className="py-4">{rate.gstPercentage}%</td>
                <td className="py-4">{formatDate(rate.effectiveDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminRatesPage;


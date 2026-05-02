import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/formatters";

const initialService = {
  name: "",
  description: "",
  sampleQuantity: "",
  estimatedTestingTime: "",
  rate: "",
  gstPercentage: "",
  isActive: true,
  termsAndConditions: "",
};

function AdminServicesPage() {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialService);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const fetchServices = async () => {
    const response = await apiFetch("/admin/services", { token });
    setServices(response.services);
  };

  useEffect(() => {
    fetchServices().catch(() => setServices([]));
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      rate: Number(form.rate || 0),
      gstPercentage: Number(form.gstPercentage || 0),
    };

    if (editingId) {
      await apiFetch(`/admin/services/${editingId}`, {
        method: "PATCH",
        token,
        body: payload,
      });
      setMessage("Service updated.");
    } else {
      await apiFetch("/admin/services", {
        method: "POST",
        token,
        body: payload,
      });
      setMessage("Service added.");
    }

    setEditingId("");
    setForm(initialService);
    fetchServices();
  };

  const toggleService = async (service) => {
    await apiFetch(`/admin/services/${service._id}`, {
      method: "PATCH",
      token,
      body: { isActive: !service.isActive },
    });
    setMessage(`Service ${service.isActive ? "deactivated" : "activated"}.`);
    fetchServices();
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name,
      description: service.description,
      sampleQuantity: service.sampleQuantity,
      estimatedTestingTime: service.estimatedTestingTime,
      rate: String(service.currentRate ?? service.rate ?? ""),
      gstPercentage: String(service.currentGstPercentage ?? 0),
      isActive: service.isActive,
      termsAndConditions: service.termsAndConditions,
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
      <div className="panel p-6">
        <h1 className="text-3xl font-extrabold">Manage services</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Deactivated services will not appear in the request-generation section. Base rate and GST update the active
          lab pricing used for new requests.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input className="field" placeholder="Service name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <textarea className="field min-h-28" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input className="field" placeholder="Required sample quantity" value={form.sampleQuantity} onChange={(event) => setForm({ ...form, sampleQuantity: event.target.value })} />
          <input className="field" placeholder="Estimated testing time" value={form.estimatedTestingTime} onChange={(event) => setForm({ ...form, estimatedTestingTime: event.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="field" placeholder="Base rate" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} />
            <input className="field" placeholder="GST %" value={form.gstPercentage} onChange={(event) => setForm({ ...form, gstPercentage: event.target.value })} />
          </div>
          <textarea className="field min-h-24" placeholder="Terms and conditions" value={form.termsAndConditions} onChange={(event) => setForm({ ...form, termsAndConditions: event.target.value })} />
          <button type="submit" className="btn-primary w-full">
            {editingId ? "Update service" : "Add service"}
          </button>
          {editingId ? (
            <button type="button" className="btn-secondary w-full" onClick={() => { setEditingId(""); setForm(initialService); }}>
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
              <th className="pb-3">Base rate</th>
              <th className="pb-3">GST</th>
              <th className="pb-3">Time</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id} className="border-t border-slate-100">
                <td className="py-4">
                  <div className="font-semibold text-slate-800">{service.name}</div>
                  <div className="text-slate-500">{service.sampleQuantity}</div>
                </td>
                <td className="py-4">{formatCurrency(service.currentRate ?? service.rate ?? 0)}</td>
                <td className="py-4">{service.currentGstPercentage ?? 0}%</td>
                <td className="py-4">{service.estimatedTestingTime}</td>
                <td className="py-4">{service.isActive ? "Active" : "Inactive"}</td>
                <td className="py-4">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => startEdit(service)} className="text-sm font-semibold text-brand-blue">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleService(service)} className="text-sm font-semibold text-brand-blue">
                      {service.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminServicesPage;

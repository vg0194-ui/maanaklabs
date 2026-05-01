import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

const initialService = {
  name: "",
  description: "",
  sampleQuantity: "",
  estimatedTestingTime: "",
  rate: "",
  isActive: true,
  termsAndConditions: "",
};

function AdminServicesPage() {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialService);

  const fetchServices = async () => {
    const response = await apiFetch("/admin/services", { token });
    setServices(response.services);
  };

  useEffect(() => {
    fetchServices().catch(() => setServices([]));
  }, [token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    await apiFetch("/admin/services", {
      method: "POST",
      token,
      body: { ...form, rate: Number(form.rate) },
    });
    setForm(initialService);
    fetchServices();
  };

  const toggleService = async (service) => {
    await apiFetch(`/admin/services/${service._id}`, {
      method: "PATCH",
      token,
      body: { isActive: !service.isActive },
    });
    fetchServices();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
      <div className="panel p-6">
        <h1 className="text-3xl font-extrabold">Manage services</h1>
        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <input className="field" placeholder="Service name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <textarea className="field min-h-28" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input className="field" placeholder="Required sample quantity" value={form.sampleQuantity} onChange={(event) => setForm({ ...form, sampleQuantity: event.target.value })} />
          <input className="field" placeholder="Estimated testing time" value={form.estimatedTestingTime} onChange={(event) => setForm({ ...form, estimatedTestingTime: event.target.value })} />
          <input className="field" placeholder="Rate" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} />
          <textarea className="field min-h-24" placeholder="Terms and conditions" value={form.termsAndConditions} onChange={(event) => setForm({ ...form, termsAndConditions: event.target.value })} />
          <button type="submit" className="btn-primary w-full">
            Add service
          </button>
        </form>
      </div>
      <div className="panel overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Service</th>
              <th className="pb-3">Rate</th>
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
                <td className="py-4">{service.rate}</td>
                <td className="py-4">{service.estimatedTestingTime}</td>
                <td className="py-4">{service.isActive ? "Active" : "Inactive"}</td>
                <td className="py-4">
                  <button type="button" onClick={() => toggleService(service)} className="text-sm font-semibold text-brand-blue">
                    {service.isActive ? "Deactivate" : "Activate"}
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

export default AdminServicesPage;


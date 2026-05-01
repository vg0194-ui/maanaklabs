import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import BrandLogo from "../../components/public/BrandLogo";

const initialForm = {
  name: "",
  companyName: "",
  mobile: "",
  email: "",
  gstNumber: "",
  billingAddress: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
  password: "",
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddressChange = (field, value) => {
    setForm((current) => ({
      ...current,
      billingAddress: { ...current.billingAddress, [field]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="panel p-8">
          <div className="mb-6 flex justify-center">
            <BrandLogo stacked className="items-center text-center" />
          </div>
          <h1 className="text-3xl font-extrabold">Register</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Create your account to submit online seed testing requests and track report progress.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
            <input className="field" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input className="field" placeholder="Company name" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
            <input className="field" placeholder="Mobile number" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
            <input className="field" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <input className="field" placeholder="GST number (optional)" value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} />
            <input type="password" className="field" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <input className="field sm:col-span-2" placeholder="Billing address line 1" value={form.billingAddress.line1} onChange={(event) => handleAddressChange("line1", event.target.value)} />
            <input className="field sm:col-span-2" placeholder="Billing address line 2" value={form.billingAddress.line2} onChange={(event) => handleAddressChange("line2", event.target.value)} />
            <input className="field" placeholder="City" value={form.billingAddress.city} onChange={(event) => handleAddressChange("city", event.target.value)} />
            <input className="field" placeholder="State" value={form.billingAddress.state} onChange={(event) => handleAddressChange("state", event.target.value)} />
            <input className="field" placeholder="Postal code" value={form.billingAddress.postalCode} onChange={(event) => handleAddressChange("postalCode", event.target.value)} />
            <input className="field" placeholder="Country" value={form.billingAddress.country} onChange={(event) => handleAddressChange("country", event.target.value)} />
            {error ? <p className="sm:col-span-2 text-sm font-medium text-rose-600">{error}</p> : null}
            <button type="submit" className="btn-primary sm:col-span-2" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;

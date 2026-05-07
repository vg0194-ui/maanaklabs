import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Seo from "../../components/Seo";
import BrandLogo from "../../components/public/BrandLogo";

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "", admin: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(form);
      const destination = response.user.role === "admin" ? "/admin" : location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <Seo
        title="Login"
        description="Login to Maanak Labs to create seed testing requests, track reports, and manage laboratory workflows."
        canonicalPath="/login"
        noindex
      />
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div className="panel p-8">
          <div className="mb-6 flex justify-center">
            <BrandLogo stacked className="items-center text-center" />
          </div>
          <h1 className="text-3xl font-extrabold">Login</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Login with email or mobile for user access, or switch on admin login for the admin panel.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              className="field"
              placeholder={form.admin ? "Admin email" : "Email or mobile"}
              value={form.identifier}
              onChange={(event) => setForm({ ...form, identifier: event.target.value })}
            />
            <input
              type="password"
              className="field"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.admin}
                onChange={(event) => setForm({ ...form, admin: event.target.checked })}
              />
              Login as admin
            </label>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-600">
            New user?{" "}
            <Link to="/register" className="font-semibold text-brand-blue">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;

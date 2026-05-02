import { NavLink, Outlet } from "react-router-dom";
import { Menu, PhoneCall, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteData } from "../../contexts/SiteDataContext";
import BrandLogo from "../public/BrandLogo";

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Testing Process", "/testing-process"],
  ["Rate List", "/rate-list"],
  ["Contact", "/contact"],
];

function SiteLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useSiteData();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <BrandLogo
              showTagline={Boolean(settings?.siteTagline)}
              siteName={settings?.siteName || "Maanak Labs"}
              tagline={settings?.siteTagline || "A Unit of Entorno Greens Seeds Private Limited"}
            />
          </NavLink>

          <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex">
            {navItems.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `text-base font-medium whitespace-nowrap ${
                    isActive ? "text-brand-green" : "text-slate-600 hover:text-brand-blue"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <a href="tel:+919876543210" className="btn-secondary gap-2">
              <PhoneCall className="h-4 w-4" />
              Contact
            </a>
            {user ? (
              <>
                <NavLink
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="btn-primary"
                >
                  {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                </NavLink>
                <button type="button" onClick={logout} className="text-sm font-semibold text-slate-500">
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="btn-primary">
                Login / Register
              </NavLink>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-2xl border border-slate-200 p-3 xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 xl:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map(([label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  {label}
                </NavLink>
              ))}
              <NavLink to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} className="btn-primary">
                {user ? "Open Dashboard" : "Login / Register"}
              </NavLink>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr,1fr,1fr] lg:px-8">
          <div>
            <BrandLogo
              stacked
              className="items-start"
              showTagline={false}
              siteName={settings?.siteName || "Maanak Labs"}
              tagline={settings?.siteTagline || "A Unit of Entorno Greens Seeds Private Limited"}
            />
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Accurate, scientific, reliable, and farmer-friendly seed testing support with online request tracking,
              clear packing instructions, and status visibility from submission to final report.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Compliance Note</h4>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The laboratory follows scientific seed testing procedures and quality systems. NABL / ISO/IEC 17025
              status is displayed as in process until formally confirmed.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Contact</h4>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {settings?.contactDetails?.address || "Lab address to be updated by admin"}
            </p>
            <p className="text-sm text-slate-600">{settings?.contactDetails?.mobile || "+91 98765 43210"}</p>
            <p className="text-sm text-slate-600">{settings?.contactDetails?.email || "info@maanaklabs.com"}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;

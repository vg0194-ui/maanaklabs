import { NavLink, Outlet } from "react-router-dom";
import { FileText, FlaskConical, LayoutDashboard, LogOut, Mail, ReceiptIndianRupee, Settings, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import BrandLogo from "../public/BrandLogo";

const userLinks = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "New Request", to: "/dashboard/new-request", icon: FlaskConical },
  { label: "My Requests", to: "/dashboard/requests", icon: FileText },
];

const adminLinks = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Requests", to: "/admin/requests", icon: FileText },
  { label: "Services", to: "/admin/services", icon: FlaskConical },
  { label: "Rates", to: "/admin/rates", icon: ReceiptIndianRupee },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Enquiries", to: "/admin/enquiries", icon: Mail },
  { label: "Settings", to: "/admin/settings", icon: Settings },
  { label: "Blogs", to: "/admin/blogs", icon: FileText },
];

function DashboardShell({ variant }) {
  const { user, logout } = useAuth();
  const links = variant === "admin" ? adminLinks : userLinks;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="panel w-full shrink-0 p-5 lg:w-72">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{variant} panel</p>
            <BrandLogo className="mt-3" showTagline={false} />
            <p className="mt-2 text-sm text-slate-600">{user?.name}</p>
          </div>
          <nav className="mt-8 flex flex-col gap-2">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === (variant === "admin" ? "/admin" : "/dashboard")}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      isActive ? "bg-brand-green text-white" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <button type="button" onClick={logout} className="mt-6 flex items-center gap-3 text-sm font-semibold text-slate-500">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default DashboardShell;

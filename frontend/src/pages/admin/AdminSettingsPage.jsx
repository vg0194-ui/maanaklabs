import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

function AdminSettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/admin/settings", { token })
      .then((response) => setSettings(response.settings))
      .catch(() => setSettings(null));
  }, [token]);

  const handleSave = async (event) => {
    event.preventDefault();
    await apiFetch("/admin/settings", {
      method: "PATCH",
      token,
      body: settings,
    });
    setMessage("Website settings updated.");
  };

  if (!settings) {
    return <div className="panel p-8">Loading settings...</div>;
  }

  return (
    <div className="panel p-6">
      <h1 className="text-3xl font-extrabold">Website content and contact settings</h1>
      <form onSubmit={handleSave} className="mt-6 grid gap-4">
        <input className="field" value={settings.siteName} onChange={(event) => setSettings({ ...settings, siteName: event.target.value })} />
        <input className="field" value={settings.siteTagline} onChange={(event) => setSettings({ ...settings, siteTagline: event.target.value })} />
        <textarea className="field min-h-28" value={settings.homeIntro || ""} onChange={(event) => setSettings({ ...settings, homeIntro: event.target.value })} />
        <textarea className="field min-h-32" value={settings.aboutContent || ""} onChange={(event) => setSettings({ ...settings, aboutContent: event.target.value })} />
        <textarea
          className="field min-h-28"
          value={settings.contactDetails?.address || ""}
          onChange={(event) =>
            setSettings({
              ...settings,
              contactDetails: { ...settings.contactDetails, address: event.target.value },
            })
          }
        />
        <input
          className="field"
          value={settings.contactDetails?.mobile || ""}
          onChange={(event) =>
            setSettings({
              ...settings,
              contactDetails: { ...settings.contactDetails, mobile: event.target.value },
            })
          }
        />
        <input
          className="field"
          value={settings.contactDetails?.email || ""}
          onChange={(event) =>
            setSettings({
              ...settings,
              contactDetails: { ...settings.contactDetails, email: event.target.value },
            })
          }
        />
        <textarea className="field min-h-24" value={settings.termsAndConditions || ""} onChange={(event) => setSettings({ ...settings, termsAndConditions: event.target.value })} />
        <input
          className="field"
          value={settings.compliance?.accreditationStatus || ""}
          onChange={(event) =>
            setSettings({
              ...settings,
              compliance: { ...settings.compliance, accreditationStatus: event.target.value },
            })
          }
        />
        <textarea
          className="field min-h-24"
          value={settings.compliance?.scientificProceduresNote || ""}
          onChange={(event) =>
            setSettings({
              ...settings,
              compliance: { ...settings.compliance, scientificProceduresNote: event.target.value },
            })
          }
        />
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        <button type="submit" className="btn-primary">
          Save settings
        </button>
      </form>
    </div>
  );
}

export default AdminSettingsPage;


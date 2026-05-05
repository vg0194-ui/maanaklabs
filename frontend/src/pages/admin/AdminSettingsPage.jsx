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

  const updateIdentifierField = (type, field, value) => {
    setSettings((current) => ({
      ...current,
      identifierConfig: {
        ...current.identifierConfig,
        [type]: {
          ...current.identifierConfig?.[type],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const response = await apiFetch("/admin/settings", {
      method: "PATCH",
      token,
      body: settings,
    });
    setSettings(response.settings);
    setMessage("Website settings updated.");
  };

  if (!settings) {
    return <div className="panel p-8">Loading settings...</div>;
  }

  return (
    <div className="panel p-6">
      <h1 className="text-3xl font-extrabold">Website content and contact settings</h1>
      <form onSubmit={handleSave} className="mt-6 grid gap-6">
        <section className="grid gap-4">
          <h2 className="text-lg font-bold">Brand and page content</h2>
          <input className="field" value={settings.siteName} onChange={(event) => setSettings({ ...settings, siteName: event.target.value })} />
          <input className="field" value={settings.siteTagline} onChange={(event) => setSettings({ ...settings, siteTagline: event.target.value })} />
          <textarea className="field min-h-28" value={settings.homeIntro || ""} onChange={(event) => setSettings({ ...settings, homeIntro: event.target.value })} />
          <textarea className="field min-h-32" value={settings.aboutContent || ""} onChange={(event) => setSettings({ ...settings, aboutContent: event.target.value })} />
          <textarea className="field min-h-24" value={settings.termsAndConditions || ""} onChange={(event) => setSettings({ ...settings, termsAndConditions: event.target.value })} />
        </section>

        <section className="grid gap-4">
          <h2 className="text-lg font-bold">Contact details</h2>
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
        </section>

        <section className="grid gap-4">
          <h2 className="text-lg font-bold">ID format settings</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-5">
              <h3 className="text-base font-bold">Request ID format</h3>
              <p className="mt-2 text-sm text-slate-600">Example: `PREFIX-0526-0001-SUFFIX`</p>
              <div className="mt-4 grid gap-3">
                <input
                  className="field"
                  placeholder="Request prefix"
                  value={settings.identifierConfig?.request?.prefix || ""}
                  onChange={(event) => updateIdentifierField("request", "prefix", event.target.value)}
                />
                <input
                  className="field"
                  placeholder="Request suffix"
                  value={settings.identifierConfig?.request?.suffix || ""}
                  onChange={(event) => updateIdentifierField("request", "suffix", event.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  className="field"
                  placeholder="Next request series"
                  value={settings.identifierConfig?.request?.nextSeries || 1}
                  onChange={(event) => updateIdentifierField("request", "nextSeries", event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 p-5">
              <h3 className="text-base font-bold">Sample ID format</h3>
              <p className="mt-2 text-sm text-slate-600">Example: `PREFIX-0526-0001-A-SUFFIX`</p>
              <div className="mt-4 grid gap-3">
                <input
                  className="field"
                  placeholder="Sample prefix"
                  value={settings.identifierConfig?.sample?.prefix || ""}
                  onChange={(event) => updateIdentifierField("sample", "prefix", event.target.value)}
                />
                <input
                  className="field"
                  placeholder="Sample suffix"
                  value={settings.identifierConfig?.sample?.suffix || ""}
                  onChange={(event) => updateIdentifierField("sample", "suffix", event.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  className="field"
                  placeholder="Next sample series"
                  value={settings.identifierConfig?.sample?.nextSeries || 1}
                  onChange={(event) => updateIdentifierField("sample", "nextSeries", event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-lg font-bold">Compliance notes</h2>
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
        </section>

        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        <button type="submit" className="btn-primary">
          Save settings
        </button>
      </form>
    </div>
  );
}

export default AdminSettingsPage;

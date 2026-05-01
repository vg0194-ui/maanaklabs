import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [content, setContent] = useState({
    services: [],
    rates: [],
    settings: null,
    blogs: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/public/content");
      setContent(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ ...content, loading, refresh }), [content, loading]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used within SiteDataProvider");
  }
  return context;
}


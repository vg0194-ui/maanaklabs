import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "maanak-labs-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: "", user: null };
  });
  const [loading, setLoading] = useState(Boolean(authState.token));

  useEffect(() => {
    if (!authState.token) {
      setLoading(false);
      return;
    }

    apiFetch("/auth/me", { token: authState.token })
      .then((response) => {
        setAuthState((current) => ({ ...current, user: response.user }));
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState({ token: "", user: null });
      })
      .finally(() => setLoading(false));
  }, [authState.token]);

  const setSession = (payload) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuthState(payload);
  };

  const login = async ({ identifier, password, admin = false }) => {
    const endpoint = admin ? "/auth/admin/login" : "/auth/login";
    const requestBody = admin ? { email: identifier, password } : { identifier, password };
    const response = await apiFetch(endpoint, { method: "POST", body: requestBody });
    setSession({ token: response.token, user: response.user });
    return response;
  };

  const register = async (payload) => {
    const response = await apiFetch("/auth/register", { method: "POST", body: payload });
    setSession({ token: response.token, user: response.user });
    return response;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({ token: "", user: null });
  };

  const value = useMemo(
    () => ({
      ...authState,
      loading,
      login,
      register,
      logout,
      setSession,
    }),
    [authState, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}


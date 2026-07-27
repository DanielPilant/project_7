import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  registerUser,
  loginUser,
  logout as doLogout,
  ensureSeedAdmin,
} from "./auth.js";

// Small context so the navbar + pages re-render when the user logs in/out.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

  // Seed the default admin once on startup.
  useEffect(() => {
    ensureSeedAdmin().then(() => setUser(getCurrentUser()));
  }, []);

  const value = {
    user,
    register: async (data) => {
      const u = await registerUser(data);
      setUser(u);
      return u;
    },
    login: async (email, password) => {
      const u = await loginUser(email, password);
      setUser(u);
      return u;
    },
    logout: () => {
      doLogout();
      setUser(null);
    },
    refresh: () => setUser(getCurrentUser()),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

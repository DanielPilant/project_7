import { createContext, useContext, useState } from "react";
import {
  getCurrentUser,
  register as doRegister,
  login as doLogin,
  logout as doLogout,
} from "./auth.js";

// Small context so the navbar + pages re-render when the user logs in/out.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

  const value = {
    user,
    // register does NOT log in — no setUser here.
    register: (form) => doRegister(form),
    login: async (username, password) => {
      const u = await doLogin(username, password);
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

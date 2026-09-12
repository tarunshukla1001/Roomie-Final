import { createContext, useContext, useMemo, useState } from "react";
import {
  login as apiLogin,
  register as apiRegister,
} from "../services/api";

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(
      localStorage.getItem("roomie_user") || "null"
    );
  } catch {
    return null;
  }
}

function readToken() {
  return localStorage.getItem("roomie_token");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(readToken);

  const value = useMemo(
    () => ({
      user,
      token,

      isAuthenticated: !!token,

      async login(payload) {
        const result = await apiLogin(payload);

        // Save authentication data in React state
        setUser(result.user);
        setToken(result.token);

        // IMPORTANT:
        // Persist authentication across page refreshes
        localStorage.setItem(
          "roomie_user",
          JSON.stringify(result.user)
        );

        localStorage.setItem(
          "roomie_token",
          result.token
        );

        return result;
      },

      async register(payload) {
        const result = await apiRegister(payload);

        setUser(result.user);
        setToken(result.token);

        localStorage.setItem(
          "roomie_user",
          JSON.stringify(result.user)
        );

        localStorage.setItem(
          "roomie_token",
          result.token
        );

        return result;
      },

      logout() {
        localStorage.removeItem("roomie_token");
        localStorage.removeItem("roomie_user");

        setUser(null);
        setToken(null);
      },
    }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return (
    useContext(AuthContext) || {
      user: null,
      token: null,
      isAuthenticated: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
    }
  );
}

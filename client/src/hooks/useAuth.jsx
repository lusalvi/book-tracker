/* eslint-disable react-refresh/only-export-components */
// client/src/hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from "react";
import {
  apiLogin,
  apiRegister,
  apiLoginWithGoogle,
} from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("book_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error leyendo book_user de localStorage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  async function login({ email, password }) {
    const data = await apiLogin({ email, password });
    setUser(data.user);
    localStorage.setItem("book_user", JSON.stringify(data.user));
    return data.user;
  }

  async function loginWithGoogle(id_token) {
    const user = await apiLoginWithGoogle(id_token);
    setUser(user);
    return user;
  }

  async function register({ email, password, nombre, apellido }) {
    const data = await apiRegister({ email, password, nombre, apellido });
    return data;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("book_user");
    localStorage.removeItem("book_token");
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}

import React, { createContext, useContext, useEffect, useState } from "react";

const KEY = "tourzen_auth_v2";
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  }, [user]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // --- LOGIN email/password ---
  async function login({ email, password }) {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        const u = { ...data.user, token: data.token };
        setUser(u);
        return { success: true, user: u };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: "Lỗi server" };
    }
  }

  // --- REGISTER ---
  async function register({ name, email, password }) {
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        const u = { ...data.user, token: data.token };
        setUser(u);
        return { success: true, user: u };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: "Lỗi server" };
    }
  }

  // --- LOGIN FACEBOOK ---
  async function loginWithFacebook(accessToken) {
    try {
      const res = await fetch(`${API_BASE}/api/login/facebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      if (data.success) {
        const u = { ...data.user, token: data.token };
        setUser(u);
        return { success: true, user: u };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: "Lỗi server" };
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loginWithFacebook }}>
      {children}
    </AuthContext.Provider>
  );
}

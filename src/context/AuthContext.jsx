// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const KEY = "tourzen_auth_v1";
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
    localStorage.setItem(KEY, JSON.stringify(user));
  }, [user]);

  function login({ email, password }) {
    // fake: accept any email/password; if email contains "admin" give admin
    const isAdmin = email && email.includes("admin");
    const token = "fake-jwt-" + Math.random().toString(36).slice(2, 9);
    const u = { id: "U" + Date.now(), name: email.split("@")[0] || "Khách", email, isAdmin, token };
    setUser(u);
    return u;
  }

  function logout() {
    setUser(null);
  }

  function register({ name, email, phone, address, password }) {
    // for demo, just log user in after register
    const u = { id: "U" + Date.now(), name: name || email, email, phone, address, isAdmin: false, token: "fake-jwt-" + Math.random().toString(36).slice(2, 9) };
    setUser(u);
    return u;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

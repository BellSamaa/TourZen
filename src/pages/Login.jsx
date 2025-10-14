// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  function submit(e) {
    e.preventDefault();
    const u = login(form);
    if (u) navigate("/");
  }

  return (
    <main className="container">
      <h2>Đăng nhập</h2>
      <form onSubmit={submit} style={{ maxWidth: 480 }}>
        <label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
        <label>Mật khẩu<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
        <div style={{ marginTop: 12 }}>
          <button className="btn">Đăng nhập</button>
        </div>
      </form>
    </main>
  );
}

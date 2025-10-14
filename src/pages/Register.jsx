// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "" });

  function submit(e) {
    e.preventDefault();
    const u = register(form);
    if (u) navigate("/");
  }

  return (
    <main className="container">
      <h2>Đăng ký</h2>
      <form onSubmit={submit} style={{ maxWidth: 520 }}>
        <label>Họ & tên<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
        <label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
        <label>Số điện thoại<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></label>
        <label>Địa chỉ<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></label>
        <label>Mật khẩu<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
        <div style={{ marginTop: 12 }}>
          <button className="btn">Tạo tài khoản</button>
        </div>
      </form>
    </main>
  );
}

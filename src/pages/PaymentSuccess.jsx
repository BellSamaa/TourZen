// src/pages/PaymentSuccess.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PaymentSuccess() {
  const loc = useLocation();
  const p = new URLSearchParams(loc.search);
  const bid = p.get("bid");
  return (
    <main className="container" style={{ textAlign: "center", padding: 40 }}>
      <h2 style={{ color: "#059669" }}>Thanh toán thành công 🎉</h2>
      <div>Mã đặt chỗ: <strong>{bid}</strong></div>
      <div style={{ marginTop: 12 }}>
        <Link to="/admin">Xem quản trị</Link> • <Link to="/tours">Tiếp tục xem tour</Link>
      </div>
    </main>
  );
}

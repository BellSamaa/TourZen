// src/utils/vnpay.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VnPayRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    // simulate 1.5s redirect to VNPay, then back to success with query
    const params = new URLSearchParams(window.location.search);
    const bid = params.get("bid");
    const t = setTimeout(() => {
      // mark booking as PAID
      const key = "tourzen_bookings_v1";
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex(b => b.id === bid);
      if (idx !== -1) {
        arr[idx].status = "PAID";
        arr[idx].paidAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(arr));
      }
      navigate(`/payment/success?bid=${encodeURIComponent(bid)}`);
    }, 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h3>Đang chuyển tới VNPay Sandbox...</h3>
      <p>Giả lập thanh toán — sẽ tự động quay về trang hoàn tất.</p>
    </div>
  );
}

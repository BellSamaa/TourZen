// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { TOURS } from "../data/tours";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  useEffect(()=> {
    const raw = localStorage.getItem("tourzen_bookings_v1");
    setBookings(raw ? JSON.parse(raw) : []);
  }, []);

  return (
    <main className="container">
      <h2>Admin Dashboard</h2>
      <section style={{ marginTop: 12 }}>
        <h3>Bookings</h3>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>STT</th><th>ID</th><th>Tour</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {bookings.map((b,i)=>(
              <tr key={b.id}><td>{i+1}</td><td>{b.id}</td><td>{b.tourTitle}</td><td>{b.customer?.name || '-'}</td><td>{new Intl.NumberFormat('vi-VN').format(b.total)}đ</td><td>{b.status}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Danh sách Tours (Quick)</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12 }}>
          {TOURS.map(t=>(
            <div key={t.id} className="card" style={{ padding:12 }}>
              <div style={{ fontWeight:800 }}>{t.title}</div>
              <div className="small">{t.region} • {t.days} ngày</div>
              <div style={{ fontWeight:900 }}>{new Intl.NumberFormat('vi-VN').format(t.price)}đ</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

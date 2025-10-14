// src/pages/ManageTours.jsx
import React, { useState } from "react";
import { TOURS } from "../data/tours";
import { formatPrice } from "../utils/format";

export default function ManageTours() {
  const [tours, setTours] = useState(TOURS);
  const [filter, setFilter] = useState("");

  const filtered = tours.filter(t =>
    t.title.toLowerCase().includes(filter.toLowerCase())
  );

  function removeTour(id) {
    setTours(tours.filter(t => t.id !== id));
  }

  return (
    <main className="container">
      <h2>Quản lý Tour</h2>
      <input
        placeholder="Tìm tour..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ padding: "8px", marginBottom: "12px", width: "100%" }}
      />
      <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Tour</th>
            <th>Giá</th>
            <th>Thời lượng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td>{t.title}</td>
              <td>{formatPrice(t.price)}</td>
              <td>{t.days} ngày</td>
              <td>
                <button className="btn-outline" onClick={() => removeTour(t.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

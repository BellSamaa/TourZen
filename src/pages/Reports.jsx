// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "../utils/format";

export default function Reports() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("tourzen_bookings_v1");
    const bookings = raw ? JSON.parse(raw) : [];
    const grouped = {};

    bookings.forEach(b => {
      const month = new Date(b.createdAt).getMonth() + 1;
      if (!grouped[month]) grouped[month] = 0;
      grouped[month] += b.total;
    });

    const chart = Array.from({ length: 12 }, (_, i) => ({
      name: `T${i + 1}`,
      value: grouped[i + 1] || 0,
    }));
    setData(chart);
  }, []);

  return (
    <main className="container">
      <h2>Báo cáo doanh thu theo tháng</h2>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => formatPrice(v)} />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

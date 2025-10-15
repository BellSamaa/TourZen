// src/pages/TourList.jsx

import React, { useState, useMemo } from "react";
import { TOURS } from "../data/tours_updated";
import TourCard from "../components/TourCard.jsx";
import { motion } from "framer-motion";

export default function TourList() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");
  const [region, setRegion] = useState("");

  const regions = ["Miền Bắc", "Miền Trung", "Miền Nam"];

  const filtered = useMemo(() => {
    let arr = [...TOURS];

    // 1. Lọc theo từ khóa
    if (q) {
      arr = arr.filter((t) =>
        t.title.toLowerCase().includes(q.toLowerCase())
      );
    }
    // 2. Lọc theo vùng
    if (region) {
      arr = arr.filter((t) => t.region === region);
    }
    // 3. Sắp xếp
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    if (sort === "popular") arr.sort((a, b) => b.sold - a.sold);

    return arr;
  }, [q, sort, region]);

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Tất Cả Tour Du Lịch
          </h1>
        </div>

        {/* BỘ LỌC */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-12 flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:flex-grow">
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="Tìm kiếm tour..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <select
              className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Tất cả vùng</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Sắp xếp</option>
              <option value="popular">Phổ biến</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
            </select>
          </div>
        </div>

        {/* DANH SÁCH TOUR */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((tour, i) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <TourCard tour={tour} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">
              Không tìm thấy tour nào phù hợp.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
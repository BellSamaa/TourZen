import React, { useState, useMemo } from "react";
import { TOURS } from "../data/tours";
import TourCard from "../components/TourCard.jsx";
import { motion } from "framer-motion";

export default function TourList() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");
  const [region, setRegion] = useState("");

  const regions = [...new Set(TOURS.map((t) => t.region))];

  const filtered = useMemo(() => {
    let arr = TOURS.filter((t) =>
      q ? t.title.toLowerCase().includes(q.toLowerCase()) : true
    );
    if (region) arr = arr.filter((t) => t.region === region);
    if (sort === "price-asc") arr = arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr = arr.sort((a, b) => b.price - a.price);
    if (sort === "popular") arr = arr.sort((a, b) => b.sold - a.sold);
    return arr;
  }, [q, sort, region]);

  return (
    <motion.main
      className="container dark:bg-gray-900 dark:text-gray-100 min-h-screen px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-center mb-8">Tất cả tour</h2>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Tìm kiếm tour..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
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
          className="border rounded px-3 py-2"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sắp xếp</option>
          <option value="price-asc">Giá: thấp → cao</option>
          <option value="price-desc">Giá: cao → thấp</option>
          <option value="popular">Bán chạy</option>
        </select>
      </div>

      {/* Danh sách Tour */}
      <div className="grid md:grid-cols-3 gap-8">
        {filtered.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
          >
            <TourCard tour={t} />
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}

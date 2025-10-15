// src/pages/TourList.jsx (ĐÃ CẬP NHẬT)

import React, { useState, useMemo } from "react";
import { TOURS } from "../data/tours";
import TourCard from "../components/TourCard.jsx";
import { motion } from "framer-motion";
import { Search, Map, Filter } from "lucide-react";

export default function TourList() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");
  const [region, setRegion] = useState("");

  // ✅ THAY ĐỔI 1: Hardcode các vùng để lọc
  const regions = ["Miền Bắc", "Miền Trung", "Miền Nam"];

  const filtered = useMemo(() => {
    let arr = [...TOURS]; // Tạo bản sao để không bị sort chồng chéo

    // Lọc theo từ khóa
    if (q) {
      arr = arr.filter((t) =>
        t.title.toLowerCase().includes(q.toLowerCase())
      );
    }
    // Lọc theo vùng
    if (region) {
      arr = arr.filter((t) => t.region === region);
    }
    // Sắp xếp
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    if (sort === "popular") arr.sort((a, b) => b.sold - a.sold);

    return arr;
  }, [q, sort, region]);

  return (
    <motion.main
      className="bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ✅ THAY ĐỔI 2: Cải thiện bố cục và giao diện tổng thể */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">
            Khám Phá Hành Trình Của Bạn
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tìm kiếm và lựa chọn những tour du lịch tuyệt vời nhất trên khắp mọi
            miền đất nước.
          </p>
        </div>

        {/* BỘ LỌC CHUYÊN NGHIỆP HƠN */}
        <div className="sticky top-2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-md mb-12 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="Nhập tên tour bạn muốn tìm..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <select
              className="w-full md:w-48 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
              className="w-full md:w-48 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Sắp xếp theo</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
            </select>
          </div>
        </div>

        {/* DANH SÁCH TOUR */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <TourCard tour={t} />
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
    </motion.main>
  );
}
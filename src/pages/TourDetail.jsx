// src/pages/TourDetail.jsx

import React from "react";
import { useParams, Link } from "react-router-dom";
import { TOURS } from "../data/tours_updated";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function TourDetail() {
  // 1. Lấy `id` từ URL
  const { id } = useParams();

  // 2. Tìm tour tương ứng trong mảng TOURS
  const tour = TOURS.find((t) => t.id === parseInt(id));

  // 3. Trường hợp không tìm thấy tour
  if (!tour) {
    return (
      <div className="container text-center py-20">
        <h2 className="text-3xl font-bold mb-4">404 - Không tìm thấy tour</h2>
        <Link
          to="/tours"
          className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // 4. Nếu tìm thấy, hiển thị thông tin
  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container mx-auto px-4 py-10">
        <Link
          to="/tours"
          className="inline-flex items-center gap-2 text-sky-600 hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Trở về danh sách
        </Link>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <img
            src={tour.image}
            alt={tour.title}
            className="w-full h-96 object-cover"
          />
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {tour.title}
            </h1>
            <p className="text-gray-600 mb-6">{tour.description}</p>
            {/* Thêm các thông tin chi tiết khác của tour ở đây */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
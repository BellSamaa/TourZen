// src/components/TourCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

const formatCurrency = (number) => {
    if (typeof number !== "number") return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

export default function TourCard({ tour }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={tour.image || "/images/default.jpg"}
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 flex items-center">
                <MapPin size={14} className="inline mr-1" />
                {tour.location}
            </p>
            <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} />
                <span className="text-xs font-medium">{tour.rating || "4.5"}</span>
            </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 flex-grow">
          {tour.title}
        </h3>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-sky-700">
            {formatCurrency(tour.price)}
          </span>
          <Link
            to={`/tour/${tour.id}`} // Quan trọng: Tạo link đúng với ID
            className="text-center bg-sky-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-sky-700 transition-all"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
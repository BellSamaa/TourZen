// src/components/TourCard.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, MapPin, Star, PlaneTakeoff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

const formatCurrency = (number) => {
    if (typeof number !== "number") return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

export default function TourCard({ tour }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);

  const handleAddToCart = () => {
    addToCart({ tour, adults: 1, children: 0 });
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleBookNow = () => {
    addToCart({ tour, adults: 1, children: 0 });
    
    // ✅ ĐÃ SỬA: Chuyển thẳng đến trang /payment
    navigate("/payment");
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-transparent hover:border-sky-500 transition-colors duration-300"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Link to={`/tour/${tour.id}`}>
          <img
            src={tour.image || "/images/default.jpg"}
            alt={tour.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </Link>
        <div className="absolute top-3 right-3 bg-sky-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          {tour.duration}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <MapPin size={14} className="inline mr-1" />
                {tour.location}
            </p>
            <div className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{tour.rating || "4.5"}</span>
            </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 mb-2 flex-grow hover:text-sky-600 transition-colors">
          <Link to={`/tour/${tour.id}`}>{tour.title}</Link>
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {tour.description}
        </p>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-sky-700 dark:text-sky-400">
              {formatCurrency(tour.price)}
            </span>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/tour/${tour.id}`}
              className="flex-1 text-center border border-sky-500 text-sky-600 dark:text-sky-400 font-semibold py-2 rounded-lg hover:bg-sky-500 hover:text-white dark:hover:text-white transition-all"
            >
              Xem chi tiết
            </Link>
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-lg bg-gray-200 dark:bg-neutral-700 hover:bg-sky-500 text-gray-600 dark:text-gray-300 hover:text-white transition-all"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
          <motion.button
            onClick={handleBookNow}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <PlaneTakeoff size={18} />
            Thanh toán ngay
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
          >
            Đã thêm vào giỏ hàng!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
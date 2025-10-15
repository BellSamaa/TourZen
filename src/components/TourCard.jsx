import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, MapPin, Star, PlaneTakeoff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function TourCard({ tour }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);

  const handleBookNow = () => {
    addToCart(tour);
    navigate("/payment");
  };

  const handleAddToCart = () => {
    addToCart(tour);
    setToast(true);
    setTimeout(() => setToast(false), 1500); // tự ẩn sau 1.5 giây
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl border border-gray-200 transition-all duration-300"
    >
      {/* ẢNH TOUR */}
      <div className="relative h-60 w-full overflow-hidden">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-sky-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          {tour.category || "Tour nổi bật"}
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          <MapPin size={14} className="inline mr-1 text-yellow-300" />
          {tour.location}
        </div>
      </div>

      {/* NỘI DUNG */}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 hover:text-sky-600 transition-colors">
          {tour.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{tour.description}</p>

        {/* XẾP HẠNG + GIÁ */}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={16} />
            <span className="text-sm font-medium">{tour.rating || "4.8"}</span>
          </div>
          <span className="text-lg font-bold text-sky-700">
            {tour.price.toLocaleString()}₫
          </span>
        </div>

        {/* CÁC NÚT HÀNH ĐỘNG */}
        <div className="mt-5 flex gap-3">
          <Link
            to={`/tour/${tour.id}`}
            className="flex-1 text-center border border-sky-500 text-sky-600 font-semibold py-2 rounded-full hover:bg-sky-500 hover:text-white transition-all"
          >
            Xem chi tiết
          </Link>

          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-all"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* 🔥 NÚT ĐẶT TOUR NGAY */}
        <motion.button
          onClick={handleBookNow}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <PlaneTakeoff size={18} />
          Đặt tour ngay
        </motion.button>
      </div>

      {/* TOAST THÔNG BÁO */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
          >
            Đã thêm vào giỏ hàng!
          </motion.div>
        )}
      </AnimatePresence>

      {/* HIỆU ỨNG ÁNH SÁNG */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/0 via-white/10 to-transparent opacity-0 hover:opacity-100 transition-all duration-700"></div>
    </motion.div>
  );
}

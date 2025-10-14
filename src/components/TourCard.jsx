import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext"; // ✅ đúng

export default function TourCard({ tour }) {
  const { addToCart } = useCart(); // ✅ đúng

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="relative h-60 w-full overflow-hidden">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          {tour.category || "Tour nổi bật"}
        </div>
      </div>

      <div className="p-5 space-y-2">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{tour.name}</h3>
        <p className="flex items-center text-sm text-gray-500">
          <MapPin size={16} className="mr-1 text-sky-500" /> {tour.location}
        </p>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={16} />
            <span className="text-sm font-medium">{tour.rating || "4.8"}</span>
          </div>
          <span className="text-lg font-bold text-sky-600">
            {tour.price.toLocaleString()}₫
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/tour/${tour.id}`}
            className="flex-1 text-center border border-sky-500 text-sky-600 font-semibold py-2 rounded-full hover:bg-sky-500 hover:text-white transition-all"
          >
            Xem chi tiết
          </Link>
          <button
            onClick={() => addToCart(tour)}
            className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-all"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

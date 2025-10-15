// src/components/PromotionCard.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Tag } from "lucide-react";

export default function PromotionCard({ promo, onClaim }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all duration-300"
      onClick={() => onClaim(promo)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 250 }}
    >
      {/* Image */}
      <img
        src={promo.image}
        alt={promo.title}
        className="w-full h-56 object-cover transition-transform duration-500 ease-in-out hover:scale-105"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      {/* Tag */}
      <div className="absolute top-4 left-4">
        <span className="bg-gradient-to-r from-blue-500 to-sky-400 text-white px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1.5 shadow-md">
          <Tag size={14} /> {promo.tag}
        </span>
      </div>
      {/* Info */}
      <div className="absolute bottom-0 left-0 p-5 text-white w-full">
        <h2 className="text-2xl font-bold">{promo.title}</h2>
        <p className="text-sm mt-1">{promo.description}</p>
        <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
            <Clock size={14} /> {promo.timeLimit}
          </div>
          {promo.quantityLimit && (
            <span className="bg-red-600/70 px-2 py-1 rounded-full text-white font-bold animate-pulse">
              Số lượng có hạn!
            </span>
          )}
        </div>
      </div>

      {/* Hover preview */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 right-4 w-64 bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl text-black dark:text-white z-20 border border-gray-200"
          >
            <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
            <p className="text-sm mb-1">
              Giảm ngay: <span className="font-semibold text-red-600">{promo.discountPercent}%</span>
            </p>
            <p className="text-xs mb-1 flex items-center gap-1">
              <Clock size={14} /> {promo.timeLimit}
            </p>
            {promo.quantityLimit && (
              <p className="text-xs font-bold text-red-500 animate-pulse">Số lượng có hạn!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

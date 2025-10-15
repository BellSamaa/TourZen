// src/components/PromotionCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Tag } from 'lucide-react';

export default function PromotionCard({ promo, onClaim }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer border border-transparent transition-all duration-300 hover:scale-105"
      onClick={() => onClaim(promo)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={promo.image}
        alt={promo.title}
        className="w-full h-56 object-cover transition-transform duration-500 ease-in-out hover:scale-105"
      />
      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-400 to-sky-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
        <Tag size={14} />
        {promo.tag}
      </div>
      <div className="absolute top-4 right-4 bg-white/70 text-blue-600 font-semibold px-2 py-1 rounded-md text-xs shadow-sm">
        -{promo.discountPercent}%
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-blue-800 mb-2">{promo.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{promo.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">{promo.timeLimit}</span>
          <button
            className="bg-gradient-to-r from-green-400 to-teal-400 text-white px-5 py-2 rounded-full font-semibold text-sm shadow hover:scale-105 transition-transform duration-300"
          >
            Săn Voucher
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// src/components/PromotionCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Tag } from 'lucide-react';

export default function PromotionCard({ promo, onClaim }) {
  return (
    <motion.div
      className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
      onClick={() => onClaim(promo)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Ảnh và hiệu ứng zoom */}
      <img
        src={promo.image}
        alt={promo.title}
        className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Gradient overlay để text nổi bật */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

      {/* Tag */}
      <div className="absolute top-4 left-4">
        <span className="bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1.5 shadow-md">
          <Tag size={14} /> {promo.tag}
        </span>
      </div>

      {/* Thông tin voucher */}
      <div className="absolute bottom-0 left-0 p-8 text-white">
        <h2
          className="text-4xl font-extrabold drop-shadow-lg"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
        >
          {promo.title}
        </h2>
        <p
          className="mt-2 text-lg text-neutral-200 drop-shadow-md"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          {promo.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm font-semibold text-yellow-300">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
            <Clock size={14} /> <span>{promo.timeLimit}</span>
          </div>
          {promo.quantityLimit && (
            <span className="text-red-400 font-bold bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
              Số lượng có hạn!
            </span>
          )}
        </div>
      </div>

      {/* Nút hover "Săn ngay" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white font-bold px-8 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
        Săn ngay
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag } from 'lucide-react';

export default function PromotionCard({ promo, onClaim }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all duration-300"
      onClick={() => onClaim(promo)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 250 }}
    >
      <img
        src={promo.image}
        alt={promo.title}
        className="w-full h-96 object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

      <div className="absolute top-4 left-4">
        <span className="bg-gradient-to-r from-blue-500 to-sky-400 text-white px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1.5 shadow-md">
          <Tag size={14} />
          {promo.tag}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
        <h2 className="text-4xl font-extrabold leading-tight" style={{ textShadow: '0 3px 6px rgba(0,0,0,0.6)' }}>
          {promo.title}
        </h2>
        <p className="mt-2 text-lg text-neutral-200 leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {promo.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
            <Clock size={14} />
            <span>{promo.timeLimit}</span>
          </div>
          {promo.quantityLimit && (
            <span className="bg-red-600/70 px-2 py-1 rounded-full text-white font-bold animate-pulse">
              Số lượng có hạn!
            </span>
          )}
        </div>
      </div>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-sky-400 text-white font-bold px-8 py-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover:scale-105 hover:shadow-2xl z-10"
        whileHover={{ scale: 1.08 }}
      >
        Săn ngay
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 right-4 w-64 bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl text-black dark:text-white z-20 border border-gray-200"
          >
            <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
            <p className="text-sm mb-1">Giảm ngay: <span className="font-semibold text-red-600">{promo.discountPercent}%</span></p>
            <p className="text-xs mb-1 flex items-center gap-1"><Clock size={14} /> {promo.timeLimit}</p>
            {promo.quantityLimit && (
              <p className="text-xs font-bold text-red-500 animate-pulse">Số lượng có hạn!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

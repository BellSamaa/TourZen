// src/pages/Cart.jsx
// (Sửa lỗi cú pháp + Nút Thanh toán dùng useNavigate)
import React, { useState } from "react";
// SỬA: Thêm useNavigate
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaChild, FaBaby } from "react-icons/fa";
import toast from 'react-hot-toast';

// --- SỬA Ở ĐÂY: Khôi phục hàm formatCurrency ---
const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";
// --- KẾT THÚC SỬA ---

// --- SỬA Ở ĐÂY: Khôi phục CartQuantityInput ---
const CartQuantityInput = ({ label, icon: Icon, value, onDecrease, onIncrease, min = 0 }) => (
    <div className="flex items-center justify-between py-1">
        <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <Icon size={12} className="text-gray-500" />
            {label}
        </label>
        <div className="flex items-center gap-1.5">
            <button type="button" onClick={onDecrease} disabled={value <= min} className="p-1 rounded-full bg-gray-200 dark:bg-neutral-600 hover:bg-gray-300 disabled:opacity-50">
                <Minus size={10} />
            </button>
            <span className="w-6 text-center text-sm font-medium dark:text-white">{value}</span>
            <button type="button" onClick={onIncrease} className="p-1 rounded-full bg-gray-200 dark:bg-neutral-600 hover:bg-gray-300">
                <Plus size={10} />
            </button>
        </div>
    </div>
);
// --- KẾT THÚC SỬA ---


export default function CartPage() { // Hoặc Cart
  const navigate = useNavigate(); // <-- Hook useNavigate
  const { items, removeFromCart, clearCart, total, updateQty } = useCart();
  const [notification, setNotification] = useState("");

  // Phần Giỏ hàng trống (Giữ nguyên)
  if (!items || items.length === 0) return ( /* ... JSX Giỏ hàng trống ... */ );

  const calculateItemTotal = (item) => /* ... Giữ nguyên ... */;
  const handleQtyChange = (key, type, delta) => { /* ... Giữ nguyên ... */ };
  const handleCheckout = () => { navigate('/payment'); }; // <-- Hàm cho nút

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* ... Tiêu đề ... */}
      <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl overflow-hidden">
        <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.key} /* ... motion props ... */ className="flex flex-col md:flex-row ...">
                {/* ... Thông tin tour ... */}
                {/* ... Chọn số lượng ... */}
                {/* ... Nút xóa ... */}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Tổng cộng & nút thanh toán */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
          <button onClick={() => { /* ... clear cart ... */ }} className="text-red-500 font-semibold hover:text-red-700">
            🗑 Xóa tất cả
          </button>
          <div className="text-right">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Tổng cộng:</p>
              <p className="text-3xl font-bold text-sky-600">{formatCurrency(total)}</p>
              {/* --- Dùng button thay vì Link --- */}
              <button
                onClick={handleCheckout} // Gọi hàm xử lý
                className="mt-4 inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
              >
                Thanh toán
              </button>
              {/* --- Kết thúc sửa --- */}
          </div>
      </div>

      {/* Thông báo */}
       {notification && ( <motion.div /* ... */ >{notification}</motion.div> )}
    </div>
  );
}
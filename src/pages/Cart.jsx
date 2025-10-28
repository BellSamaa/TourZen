// src/pages/Cart.jsx
// (Sửa nút Thanh toán dùng useNavigate)
import React, { useState } from "react";
// SỬA: Thêm useNavigate
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaChild, FaBaby } from "react-icons/fa";
import toast from 'react-hot-toast';

const formatCurrency = (number) => /* ... */;
const CartQuantityInput = ({ /* ... */ }) => ( /* ... */ );

export default function CartPage() { // Hoặc Cart
  const navigate = useNavigate(); // <-- THÊM hook
  const { items, removeFromCart, clearCart, total, updateQty } = useCart();
  const [notification, setNotification] = useState("");

  if (!items || items.length === 0) return ( /* ... JSX Giỏ hàng trống ... */ );

  const calculateItemTotal = (item) => /* ... */;
  const handleQtyChange = (key, type, delta) => { /* ... */ };

  // <-- THÊM hàm xử lý cho nút -->
  const handleCheckout = () => {
    // Có thể thêm kiểm tra items.length > 0 nếu cần
    navigate('/payment'); // Dùng navigate để chuyển trang
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">🧳 Giỏ hàng của bạn</h2>

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
              {/* --- SỬA Ở ĐÂY: Dùng button thay vì Link --- */}
              <button
                onClick={handleCheckout} // Gọi hàm xử lý
                className="mt-4 inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
              >
                Thanh toán
              </button>
              {/* --- KẾT THÚC SỬA --- */}
          </div>
      </div>

      {/* Thông báo */}
       {notification && ( <motion.div /* ... */ >{notification}</motion.div> )}
    </div>
  );
}
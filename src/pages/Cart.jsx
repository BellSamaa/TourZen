// src/pages/Cart.jsx
// (Sửa nút Thanh toán dùng useNavigate thay vì Link)
import React, { useState } from "react";
// SỬA: Bỏ Link, thêm useNavigate
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaChild, FaBaby } from "react-icons/fa";
import toast from 'react-hot-toast';
import { Link } from "react-router-dom"; // Giữ Link cho nút "Xem tour ngay"

const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

const CartQuantityInput = ({ label, icon: Icon, value, onDecrease, onIncrease, min = 0 }) => (
    <div className="flex items-center justify-between py-1">
        {/* ... JSX CartQuantityInput giữ nguyên ... */}
    </div>
);


export default function CartPage() { // Hoặc Cart
  const navigate = useNavigate(); // <-- THÊM hook useNavigate
  const { items, removeFromCart, clearCart, total, updateQty } = useCart();
  const [notification, setNotification] = useState("");

  // Phần Giỏ hàng trống
  if (!items || items.length === 0)
    return (
        <div className="text-center py-20">
             <ShoppingBag size={80} className="mx-auto text-neutral-300 dark:text-neutral-600" />
             <h2 className="mt-6 text-2xl font-bold text-neutral-700 dark:text-neutral-300">Giỏ hàng của bạn đang trống</h2>
             <p className="mt-2 text-neutral-500">Hãy cùng khám phá các tour du lịch tuyệt vời nhé!</p>
             <Link to="/tours" className="mt-6 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105">
                 Xem tour ngay
             </Link>
        </div>
    );

  const calculateItemTotal = (item) => /* ... giữ nguyên ... */;
  const handleQtyChange = (key, type, delta) => { /* ... giữ nguyên ... */ };

  // <-- THÊM hàm xử lý cho nút -->
  const handleCheckout = () => {
    // Chỉ chuyển trang nếu giỏ hàng không trống
    if (items && items.length > 0) {
        console.log("Navigating from Cart.jsx using navigate..."); // Thêm log
        navigate('/payment'); // Dùng navigate để chuyển trang
    } else {
        toast.error("Giỏ hàng đang trống!"); // Thông báo nếu giỏ hàng trống
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">🧳 Giỏ hàng của bạn</h2>

      <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl overflow-hidden">
        <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.key || item.id} /* ... motion props ... */ className="flex flex-col md:flex-row ...">
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
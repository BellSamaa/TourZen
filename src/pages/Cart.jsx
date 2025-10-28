// src/pages/Cart.jsx
// (ĐÃ XÓA PHẦN CHỌN SỐ LƯỢNG)
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react"; // Giữ lại icon cần thiết
import { useCart } from "../context/CartContext";
// FaPlus, FaMinus đã được xóa vì không dùng nữa
import { motion } from "framer-motion";

// Helper định dạng tiền tệ (Giữ nguyên)
const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

export default function CartPage() { // Tên component có thể là CartPage hoặc Cart, giữ nguyên tên file gốc
  const { items, removeFromCart, clearCart, total } = useCart();
  const [notification, setNotification] = useState("");

  // --- Phần Giỏ hàng trống (Giữ nguyên) ---
  if (!items || items.length === 0)
    return (
      <div className="text-center py-20">
        {/* ... JSX Giỏ hàng trống ... */}
         <ShoppingBag size={80} className="mx-auto text-neutral-300 dark:text-neutral-600" />
         <h2 className="mt-6 text-2xl font-bold text-neutral-700 dark:text-neutral-300">Giỏ hàng của bạn đang trống</h2>
         <p className="mt-2 text-neutral-500">Hãy cùng khám phá các tour du lịch tuyệt vời nhé!</p>
         <Link to="/tours" className="mt-6 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105">
             Xem tour ngay
         </Link>
      </div>
    );

  // Hàm tính tổng tiền mỗi item (Giữ nguyên)
  const calculateItemTotal = (item) =>
    (item.adults || 0) * (item.priceAdult || 0) +
    (item.children || 0) * (item.priceChild || 0) +
    (item.infants || 0) * (item.priceInfant || 0) +
    (item.singleSupplement || 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center">🧳 Giỏ hàng của bạn</h2>

      <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl overflow-hidden">
        {items.map((item) => (
          <motion.div // Thêm motion.div để giữ animation
            key={item.key}
            layout // Giữ layout animation
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
            className="flex flex-col sm:flex-row items-center justify-between border-b dark:border-neutral-700 p-4 gap-4"
          >
            {/* Thông tin tour và giá */}
            <div className="flex items-center gap-4 flex-grow min-w-0">
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-lg dark:text-white truncate">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{item.location}</p>
                {/* Hiển thị số lượng đã lưu */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Số lượng: {item.adults || 0} NL, {item.children || 0} TE, {item.infants || 0} EB
                </p>
                <p className="font-bold text-sky-600 mt-1">
                  {formatCurrency(calculateItemTotal(item))}
                </p>
              </div>
            </div>

            {/* --- ĐÃ XÓA PHẦN CHỌN SỐ LƯỢNG --- */}

            {/* Nút xóa */}
            <div className="flex-shrink-0 ml-4">
                 <button
                    className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={() => removeFromCart(item.key)}
                    title="Xóa tour này"
                 >
                    <Trash2 size={20} />
                 </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tổng cộng & nút thanh toán (Giữ nguyên) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
          <button
            onClick={() => {
              clearCart();
              setNotification("Đã xóa tất cả tour trong giỏ!");
              setTimeout(() => setNotification(""), 3000);
            }}
            className="text-red-500 font-semibold hover:text-red-700"
          >
            🗑 Xóa tất cả
          </button>
          <div className="text-right">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Tổng cộng:</p>
              <p className="text-3xl font-bold text-sky-600">{formatCurrency(total)}</p>
              <Link
                to="/payment" // Nút này vẫn trỏ đến trang Payment
                className="mt-4 inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
              >
                Thanh toán
              </Link>
          </div>
      </div>

      {/* Thông báo (Giữ nguyên) */}
      {/* ... JSX thông báo ... */}
       {notification && (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
         >
           {notification}
         </motion.div>
       )}
    </div>
  );
}
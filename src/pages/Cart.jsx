// src/pages/Cart.jsx
// (KHÔI PHỤC HOÀN TOÀN PHẦN CHỌN SỐ LƯỢNG)
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react"; // Khôi phục Plus, Minus
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion"; // Thêm AnimatePresence nếu cần
import { FaUser, FaChild, FaBaby } from "react-icons/fa";
import toast from 'react-hot-toast'; // Thêm toast

// Helper định dạng tiền tệ (Giữ nguyên)
const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

// Component con chọn số lượng (Khôi phục)
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


export default function CartPage() { // Hoặc Cart
  const { items, removeFromCart, clearCart, total, updateQty } = useCart(); // Thêm updateQty
  const [notification, setNotification] = useState("");

  // Phần Giỏ hàng trống (Giữ nguyên)
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

  // Hàm tính tổng tiền mỗi item (Giữ nguyên)
  const calculateItemTotal = (item) =>
    (item.adults || 0) * (item.priceAdult || 0) +
    (item.children || 0) * (item.priceChild || 0) +
    (item.infants || 0) * (item.priceInfant || 0) +
    (item.singleSupplement || 0);

  // Hàm xử lý cập nhật số lượng (Khôi phục)
  const handleQtyChange = (key, type, delta) => {
      const item = items.find(i => i.key === key);
      if (!item) return;

      let newAdults = item.adults || 0;
      let newChildren = item.children || 0;
      let newInfants = item.infants || 0;

      if (type === 'adult') newAdults = Math.max(0, newAdults + delta);
      if (type === 'child') newChildren = Math.max(0, newChildren + delta);
      if (type === 'infant') newInfants = Math.max(0, newInfants + delta);

      // Bắt buộc có ít nhất 1 người lớn nếu có trẻ em/nhỏ
      if (newAdults === 0 && (newChildren > 0 || newInfants > 0)) {
         toast.error("Phải có ít nhất 1 người lớn đi kèm.");
         return; // Không cập nhật
      }
      // Hoặc bắt buộc có ít nhất 1 khách hàng
      if (newAdults === 0 && newChildren === 0 && newInfants === 0) {
         toast.error("Phải chọn ít nhất 1 khách.");
         return; // Không cập nhật
      }


      updateQty(key, newAdults, newChildren, newInfants);
  };


  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">🧳 Giỏ hàng của bạn</h2>

      <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl overflow-hidden">
        <AnimatePresence> {/* Thêm AnimatePresence bao quanh map */}
            {items.map((item) => (
              <motion.div
                key={item.key}
                layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                className="flex flex-col md:flex-row items-stretch justify-between border-b dark:border-neutral-700 p-4 gap-4"
              >
                {/* Thông tin tour và giá */}
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  <img src={item.image} alt={item.title} className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg flex-shrink-0"/>
                  <div className="min-w-0 flex flex-col justify-between self-stretch py-1">
                    <div>
                        <h3 className="font-semibold text-lg dark:text-white truncate">{item.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{item.location}</p>
                        {/* Hiển thị tháng/ngày đi nếu có */}
                        {item.departure_date ? (
                            <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mt-1">Ngày đi: {item.departure_date}</p>
                        ) : item.month ? (
                             <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mt-1">Tháng: {item.month}</p>
                        ): null}
                    </div>
                    <p className="font-bold text-sky-600 text-lg mt-1">
                      {formatCurrency(calculateItemTotal(item))}
                    </p>
                  </div>
                </div>

                {/* --- KHÔI PHỤC PHẦN CHỌN SỐ LƯỢNG --- */}
                <div className="flex-shrink-0 w-full md:w-40 border-t md:border-t-0 md:border-l dark:border-neutral-700 pt-4 md:pt-0 md:pl-4 space-y-2 self-center">
                     <CartQuantityInput
                        label="Người lớn" icon={FaUser} value={item.adults || 0}
                        onDecrease={() => handleQtyChange(item.key, 'adult', -1)}
                        onIncrease={() => handleQtyChange(item.key, 'adult', 1)}
                        min={0} // Cho phép về 0 tạm thời, kiểm tra khi checkout
                     />
                     <CartQuantityInput
                        label="Trẻ em" icon={FaChild} value={item.children || 0}
                        onDecrease={() => handleQtyChange(item.key, 'child', -1)}
                        onIncrease={() => handleQtyChange(item.key, 'child', 1)}
                     />
                     <CartQuantityInput
                        label="Trẻ nhỏ" icon={FaBaby} value={item.infants || 0}
                        onDecrease={() => handleQtyChange(item.key, 'infant', -1)}
                        onIncrease={() => handleQtyChange(item.key, 'infant', 1)}
                     />
                </div>
                {/* --- KẾT THÚC KHÔI PHỤC --- */}

                {/* Nút xóa */}
                <div className="flex-shrink-0 md:ml-4 flex items-center justify-end md:justify-center self-center">
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
        </AnimatePresence>
      </div>

      {/* Tổng cộng & nút thanh toán (Giữ nguyên) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
          <button onClick={() => { /* ... clear cart ... */ }} className="text-red-500 font-semibold hover:text-red-700">
            🗑 Xóa tất cả
          </button>
          <div className="text-right">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Tổng cộng:</p>
              <p className="text-3xl font-bold text-sky-600">{formatCurrency(total)}</p>
              <Link
                to="/payment" // Vẫn trỏ đến trang Payment
                className="mt-4 inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
              >
                Thanh toán
              </Link>
          </div>
      </div>

      {/* Thông báo (Giữ nguyên) */}
       {notification && (
         <motion.div /* ... JSX thông báo ... */>
           {notification}
         </motion.div>
       )}
    </div>
  );
}
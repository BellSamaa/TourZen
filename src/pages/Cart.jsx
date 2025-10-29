// src/pages/Cart.jsx
// (Sửa: Cập nhật hàm total và qty cho 'elders', kiểm tra ngày khởi hành)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { Trash2, ShoppingBag, Plus, Minus, User as UserIcon, Smile, ShieldCheck } from "lucide-react"; // (SỬA) Thêm icon
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaChild, FaBaby } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa"; // (MỚI) Icon người già
import toast from 'react-hot-toast';

// --- Hàm formatCurrency ---
const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";
// --- Kết thúc ---

// --- CartQuantityInput ---
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
// --- Kết thúc ---


export default function CartPage() { // Hoặc Cart
  const navigate = useNavigate(); // <-- Hook useNavigate
  const { items, removeFromCart, clearCart, total, updateQty } = useCart();
  const [notification, setNotification] = useState("");

  // --- JSX giỏ hàng trống ---
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
  // --- Kết thúc ---

  // --- SỬA: Cập nhật hàm calculateItemTotal (Thêm 'elders') ---
  const calculateItemTotal = (item) =>
    (item.adults || 0) * (item.priceAdult || 0) +
    (item.children || 0) * (item.priceChild || 0) +
    (item.infants || 0) * (item.priceInfant || 0) +
    (item.elders || 0) * (item.priceElder || item.priceAdult || 0) + // <-- THÊM
    (item.singleSupplement || 0);
  // --- KẾT THÚC SỬA ---

  // --- SỬA: Cập nhật hàm handleQtyChange (Thêm 'elders') ---
  const handleQtyChange = (key, type, delta) => {
      const item = items.find(i => i.key === key);
      if (!item) return;

      let newAdults = Number(item.adults) || 0;
      let newChildren = Number(item.children) || 0;
      let newInfants = Number(item.infants) || 0;
      let newElders = Number(item.elders) || 0; // <-- THÊM

      if (type === 'adult') newAdults = Math.max(0, newAdults + delta);
      if (type === 'child') newChildren = Math.max(0, newChildren + delta);
      if (type === 'infant') newInfants = Math.max(0, newInfants + delta);
      if (type === 'elder') newElders = Math.max(0, newElders + delta); // <-- THÊM

      if ((newAdults + newElders) === 0 && (newChildren > 0 || newInfants > 0)) { // <-- SỬA
         toast.error("Phải có ít nhất 1 người lớn hoặc người già đi kèm.", { duration: 2000 });
         return;
      }
      if (newAdults === 0 && newChildren === 0 && newInfants === 0 && newElders === 0) { // <-- SỬA
         // Cho phép set = 0, nhưng sẽ không thể checkout
         // (Quyết định: Cho phép set = 0, nhưng hàm checkout sẽ chặn)
      }

      updateQty(key, newAdults, newChildren, newInfants, newElders); // <-- SỬA
  };
  // --- KẾT THÚC SỬA ---

  const handleCheckout = () => {
    if (items && items.length > 0) {
        // (SỬA) Kiểm tra xem tất cả item đã chọn lịch khởi hành VÀ có khách chưa
        const itemWithoutDeparture = items.find(item => !item.departure_id);
        if (itemWithoutDeparture) {
             toast.error(`Vui lòng chọn ngày khởi hành cho tour "${itemWithoutDeparture.title}" tại trang thanh toán.`, { duration: 3500 });
             navigate('/payment'); // Chuyển đến trang thanh toán để chọn
             return;
        }
        
        const itemWithoutGuests = items.find(item => (item.adults || 0) + (item.children || 0) + (item.elders || 0) + (item.infants || 0) === 0);
        if (itemWithoutGuests) {
            toast.error(`Vui lòng thêm khách cho tour "${itemWithoutGuests.title}".`, { duration: 3000 });
            return;
        }

        console.log("Navigating from Cart.jsx using navigate...");
        navigate('/payment');
    } else {
        toast.error("Giỏ hàng đang trống!");
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center dark:text-white">🧳 Giỏ hàng của bạn</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Danh sách tour */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 shadow-lg rounded-2xl overflow-hidden border dark:border-neutral-700">
            <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.key}
                    layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                    className="flex flex-col md:flex-row items-stretch justify-between border-b dark:border-neutral-700 p-4 gap-4"
                  >
                    {/* Thông tin tour và giá */}
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                      <img
                        src={item.image || '/images/default.jpg'} // Fallback image
                        alt={item.title || 'Tour Image'}
                        className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { e.target.onerror = null; e.target.src='/images/default.jpg'; }}
                      />
                      <div className="min-w-0 flex flex-col justify-between self-stretch py-1">
                        <div>
                            <h3 className="font-semibold text-lg dark:text-white truncate">{item.title || 'Tour không tên'}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{item.location || 'N/A'}</p>
                            {/* (SỬA) Hiển thị ngày đã chọn (nếu có) */}
                            {item.departure_id && item.departure_date ? (
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Ngày đi: {item.departure_date}</p>
                            ) : (
                                 <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1">Chưa chọn ngày đi</p>
                            )}
                        </div>
                        <p className="font-bold text-sky-600 text-lg mt-1">
                          {formatCurrency(calculateItemTotal(item))}
                        </p>
                      </div>
                    </div>

                    {/* --- (SỬA) Phần chọn số lượng (Thêm Người Già) --- */}
                    <div className="flex-shrink-0 w-full md:w-44 border-t md:border-t-0 md:border-l dark:border-neutral-700 pt-4 md:pt-0 md:pl-4 space-y-2 self-center">
                         <CartQuantityInput
                            label="Người lớn" icon={FaUser} value={item.adults || 0}
                            onDecrease={() => handleQtyChange(item.key, 'adult', -1)}
                            onIncrease={() => handleQtyChange(item.key, 'adult', 1)}
                            min={0}
                         />
                         <CartQuantityInput
                            label="Người già" icon={FaUserTie} value={item.elders || 0}
                            onDecrease={() => handleQtyChange(item.key, 'elder', -1)}
                            onIncrease={() => handleQtyChange(item.key, 'elder', 1)}
                         />
                         <CartQuantityInput
                            label="Trẻ em" icon={FaChild} value={item.children || 0}
                            onDecrease={() => handleQtyChange(item.key, 'child', -1)}
                            onIncrease={() => handleQtyChange(item.key, 'child', 1)}
                         />
                         <CartQuantityInput
                            label="Sơ sinh (<40cm)" icon={FaBaby} value={item.infants || 0}
                            onDecrease={() => handleQtyChange(item.key, 'infant', -1)}
                            onIncrease={() => handleQtyChange(item.key, 'infant', 1)}
                         />
                    </div>

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
            {/* Nút Xóa tất cả */}
            <div className="p-4 text-right">
                <button
                    onClick={() => {
                        toast((t) => (
                            <div>
                                <p className="mb-2">Xác nhận xóa tất cả tour?</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                        onClick={() => {
                                            clearCart();
                                            toast.dismiss(t.id);
                                            setNotification("Đã xóa tất cả tour trong giỏ!");
                                            setTimeout(() => setNotification(""), 3000);
                                        }}
                                    >Xóa</button>
                                    <button className="px-3 py-1 bg-gray-200 rounded text-sm" onClick={() => toast.dismiss(t.id)}>Hủy</button>
                                </div>
                            </div>
                        ), { icon: '🤔', duration: 10000 });
                    }}
                    className="text-red-500 font-semibold hover:text-red-700 text-sm"
                >
                    🗑 Xóa tất cả
                </button>
            </div>
        </div>

        {/* Cột phải: Tổng cộng & nút thanh toán */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-2xl border dark:border-neutral-700 p-6 sticky top-24">
                <h3 className="text-xl font-bold dark:text-white mb-4">Tóm tắt đơn hàng</h3>
                <div className="space-y-2 border-b dark:border-neutral-600 pb-4">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Tạm tính (Tour)</span>
                        <span className="font-medium">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Dịch vụ cộng thêm</span>
                        <span className="font-medium">0 ₫</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Giảm giá</span>
                        <span className="font-medium text-green-500">- 0 ₫</span>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-semibold dark:text-white">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-sky-600">{formatCurrency(total)}</span>
                </div>
                
                <button
                    onClick={handleCheckout} // Gọi hàm xử lý
                    className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold transition-all text-lg"
                >
                    Đến trang thanh toán
                </button>

                <div className="mt-6 space-y-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <UserIcon size={16} className="text-sky-500"/>
                        <span>Hỗ trợ khách hàng 24/7</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Smile size={16} className="text-sky-500"/>
                        <span>Hoàn tiền nếu không hài lòng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-sky-500"/>
                        <span>Thanh toán an toàn, bảo mật</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Thông báo */}
       {notification && (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50">
           {notification}
         </motion.div>
       )}
    </div>
  );
}
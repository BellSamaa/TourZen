// src/pages/VNPAYPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

export default function VNPAYPage() {
  const { items: cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  // Tính tổng tiền tất cả tour
  const total = cartItems.reduce(
    (sum, i) =>
      sum +
      (i.adults * i.priceAdult + i.children * i.priceChild + i.infants * i.priceInfant + i.singleSupplement),
    0
  );

  const handlePaymentComplete = () => {
    clearCart();
    navigate("/payment-success");
  };

  useEffect(() => {
    // Nếu giỏ hàng trống, quay về trang payment
    if (!cartItems || cartItems.length === 0) {
      navigate("/payment");
    }
  }, [cartItems, navigate]);

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 text-gray-800"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Thanh Toán VNPay</h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
        {cartItems.map((item) => (
          <div key={item.key} className="mb-3 border-b pb-2">
            <p className="font-semibold">{item.title}</p>
            <p>
              Tháng {item.month} - Người lớn: {item.adults}, Trẻ em: {item.children}, Trẻ nhỏ:{" "}
              {item.infants}
            </p>
            <p className="font-bold text-sky-600">Tổng: {formatCurrency(
              (item.adults * item.priceAdult || 0) +
              (item.children * item.priceChild || 0) +
              (item.infants * item.priceInfant || 0) +
              (item.singleSupplement || 0)
            )}</p>
          </div>
        ))}
        <p className="text-right font-bold text-lg mt-4">Tổng tất cả: {formatCurrency(total)}</p>
      </div>

      <div className="text-center">
        <p className="mb-4 text-gray-700">
          Đây là trang demo VNPay. Ở đây bạn sẽ redirect tới cổng thanh toán thực tế.
        </p>
        <button
          onClick={handlePaymentComplete}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 transition-all duration-300"
        >
          Hoàn tất thanh toán
        </button>
      </div>
    </motion.div>
  );
}

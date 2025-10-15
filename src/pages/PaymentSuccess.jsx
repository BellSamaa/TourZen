// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const [status, setStatus] = useState("Đang xử lý...");

  const orderId = searchParams.get("orderId");
  const responseCode = searchParams.get("vnp_ResponseCode"); // 00 = thành công

  useEffect(() => {
    if (!orderId) {
      setStatus("Đơn hàng không hợp lệ.");
      return;
    }

    if (responseCode === "00") {
      setStatus("Thanh toán thành công! ✅");

      // Gửi email xác nhận
      if (cartItems.length > 0) {
        const templateParams = {
          order_id: orderId,
          customer_email: "khachhang@example.com", // thay bằng email thực tế nếu có
          tour_list: cartItems.map(i => `${i.title} - Tháng ${i.month} x${i.adults + i.children + i.infants}`).join("\n"),
          total: cartItems.reduce((sum, i) => sum + (i.adults * i.priceAdult + i.children * i.priceChild + i.infants * i.priceInfant + i.singleSupplement), 0)
        };

        emailjs.send("service_8w8xy0f", "template_lph7t7t", templateParams, "mXugIgN4N-oD4WVZZ")
          .then(() => console.log("Email xác nhận đã gửi"))
          .catch(err => console.error("Lỗi gửi email:", err));
      }

      // Xóa giỏ hàng
      clearCart();
    } else {
      setStatus("Thanh toán thất bại. ❌");
    }
  }, [orderId, responseCode, cartItems, clearCart]);

  return (
    <motion.div
      className="text-center py-20 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-6">{status}</h1>
      {responseCode === "00" ? (
        <p className="text-gray-700 mb-6">
          Mã đơn hàng: <span className="font-semibold">{orderId}</span><br/>
          Email xác nhận đã được gửi. Hãy kiểm tra hộp thư của bạn.
        </p>
      ) : (
        <p className="text-gray-700 mb-6">
          Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.
        </p>
      )}
      <Link
        to="/tours"
        className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-all"
      >
        Quay lại trang tour
      </Link>
    </motion.div>
  );
};

export default PaymentSuccess;

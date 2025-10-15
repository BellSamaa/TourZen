// src/pages/Payment.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { FaGift, FaPlaneDeparture, FaCreditCard, FaPlus, FaMinus } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import emailjs from "@emailjs/browser";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

const Payment = () => {
  const navigate = useNavigate();
  const { items: cartItems, updateQty, clearCart } = useCart();
  const [notification, setNotification] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("Hà Nội");

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
  };

  const handleQuantityChange = (index, type, delta) => {
    const item = cartItems[index];
    if (!item) return;
    let newValue = (item[type] || 0) + delta;
    if (newValue < 0) newValue = 0;
    updateQty(
      item.key,
      type === "adults" ? newValue : item.adults,
      type === "children" ? newValue : item.children,
      type === "infants" ? newValue : item.infants
    );
  };

  const calculateTotal = (item) =>
    (item.adults || 0) * (item.priceAdult || 0) +
    (item.children || 0) * (item.priceChild || 0) +
    (item.infants || 0) * (item.priceInfant || 0) +
    (item.singleSupplement || 0);

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      setNotification("Giỏ hàng trống, không thể thanh toán.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    // Gửi email xác nhận đặt tour
    try {
      const templateParams = {
        customer_email: "khachhang@example.com", // thay bằng email thực tế
        branch: selectedBranch,
        tour_list: cartItems
          .map(
            (i) =>
              `${i.title} - Tháng ${i.month} x${i.adults + i.children + i.infants}`
          )
          .join("\n"),
        total: cartItems.reduce(
          (sum, i) =>
            sum +
            (i.adults * i.priceAdult +
              i.children * i.priceChild +
              i.infants * i.priceInfant +
              i.singleSupplement),
          0
        ),
      };

      await emailjs.send(
        "service_8w8xy0f",
        "template_lph7t7t",
        templateParams,
        "mXugIgN4N-oD4WVZZ"
      );

      // Xóa giỏ hàng
      clearCart();

      // Redirect sang trang thanh toán thành công
      navigate("/payment-success");
    } catch (err) {
      console.error("Lỗi gửi email:", err);
      setNotification("Có lỗi xảy ra khi gửi email. Vui lòng thử lại.");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <motion.div
        className="text-center text-xl py-20 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Giỏ hàng trống. Vui lòng chọn tour trước.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="text-gray-800 max-w-6xl mx-auto p-4 md:p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        Thanh Toán Tour
      </h1>

      {/* Chọn cơ sở */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold text-gray-700">Chọn cơ sở gần nhất:</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="Hà Nội">Số A, Đường B, Hà Nội</option>
          <option value="Hồ Chí Minh">Số X, Đường Y, Hồ Chí Minh</option>
        </select>
      </div>

      {cartItems.map((item, index) => (
        <motion.div
          key={item.key}
          className="mb-8 p-5 bg-white rounded-2xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Slider ảnh */}
          <Slider {...sliderSettings} className="mb-4">
            {[item.image || "/images/default.jpg"].map((src, i) => (
              <div key={i}>
                <img
                  src={src}
                  alt={`${item.title} - ảnh ${i + 1}`}
                  className="rounded-xl mx-auto shadow-lg h-[300px] md:h-[500px] object-cover w-full"
                />
              </div>
            ))}
          </Slider>

          <h2 className="text-xl font-bold mb-2">{item.title}</h2>
          <p className="mb-2 text-gray-700">Tháng khởi hành: {item.month}</p>

          {/* Giá và số lượng */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {["adults", "children", "infants"].map((type) => (
              <div key={type}>
                <p className="font-semibold text-gray-700">
                  {type === "adults"
                    ? "Người lớn"
                    : type === "children"
                    ? "Trẻ em"
                    : "Trẻ nhỏ"}
                </p>
                <div className="flex justify-center items-center mt-1 gap-2">
                  <button
                    onClick={() => handleQuantityChange(index, type, -1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    <FaMinus />
                  </button>
                  <span className="font-bold">{item[type] || 0}</span>
                  <button
                    onClick={() => handleQuantityChange(index, type, 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    <FaPlus />
                  </button>
                </div>
                <p className="text-red-600 font-bold mt-1">
                  {formatCurrency(
                    (type === "adults"
                      ? item.priceAdult
                      : type === "children"
                      ? item.priceChild
                      : item.priceInfant) * (item[type] || 0)
                  )}
                </p>
              </div>
            ))}
          </div>

          <p className="text-right font-bold text-lg mt-4">
            Tổng: {formatCurrency(calculateTotal(item))}
          </p>
        </motion.div>
      ))}

      {/* Thanh toán */}
      <div className="flex justify-center mt-6 mb-16">
        <motion.button
          onClick={handleCheckout}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 transition-all duration-300 flex items-center gap-3"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <FaCreditCard /> Thanh Toán Ngay
        </motion.button>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
        >
          {notification}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Payment;

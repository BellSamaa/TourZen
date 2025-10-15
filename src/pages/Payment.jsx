// src/pages/Payment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { FaGift, FaPlaneDeparture, FaCreditCard, FaPlus, FaMinus } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Helper định dạng tiền tệ
const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartItem } = useCart();
  const [notification, setNotification] = useState("");

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
    let newValue = item[type] + delta;
    if (newValue < 0) newValue = 0;
    updateCartItem(index, { ...item, [type]: newValue });
  };

  const calculateTotal = (item) => {
    const { adults, children, infants, monthData } = item;
    const prices = monthData.prices;
    let total =
      adults * prices.adult +
      children * prices.child +
      infants * prices.infant +
      prices.singleSupplement;
    return total;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setNotification("Giỏ hàng trống, không thể thanh toán.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }
    navigate("/checkout"); // giả định có trang checkout
  };

  if (cartItems.length === 0) {
    return (
      <motion.div className="text-center text-xl py-20 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Giỏ hàng trống. Vui lòng chọn tour trước.
      </motion.div>
    );
  }

  return (
    <motion.div className="text-gray-800 max-w-6xl mx-auto p-4 md:p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Thanh Toán Tour</h1>

      {/* Hiển thị từng tour trong giỏ */}
      {cartItems.map((item, index) => (
        <motion.div key={index} className="mb-8 p-5 bg-white rounded-2xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Slider */}
          <Slider {...sliderSettings} className="mb-4">
            {[item.tour.image, "/images/travel1.jpg", "/images/travel2.jpg"].map((src, i) => (
              <div key={i}>
                <img
                  src={src}
                  alt={`${item.tour.title} - ảnh ${i + 1}`}
                  className="rounded-xl mx-auto shadow-lg h-[300px] md:h-[500px] object-cover w-full"
                />
              </div>
            ))}
          </Slider>

          {/* Thông tin tour */}
          <h2 className="text-xl font-bold mb-2">{item.tour.title}</h2>
          <p className="mb-2 text-gray-700">Tháng khởi hành: {item.monthData.month}</p>

          {/* Giá và số lượng */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {["adults", "children", "infants"].map((type) => (
              <div key={type}>
                <p className="font-semibold text-gray-700">{type === "adults" ? "Người lớn" : type === "children" ? "Trẻ em" : "Trẻ nhỏ"}</p>
                <div className="flex justify-center items-center mt-1 gap-2">
                  <button onClick={() => handleQuantityChange(index, type, -1)} className="px-2 py-1 bg-gray-200 rounded"><FaMinus /></button>
                  <span className="font-bold">{item[type]}</span>
                  <button onClick={() => handleQuantityChange(index, type, 1)} className="px-2 py-1 bg-gray-200 rounded"><FaPlus /></button>
                </div>
                <p className="text-red-600 font-bold mt-1">{formatCurrency(item.monthData.prices[type] * item[type])}</p>
              </div>
            ))}
            <div>
              <p className="font-semibold text-gray-700">Phụ thu phòng đơn</p>
              <p className="text-red-600 font-bold mt-5">{formatCurrency(item.monthData.prices.singleSupplement)}</p>
            </div>
          </div>

          {/* Tổng tiền */}
          <p className="text-right font-bold text-lg mt-4">Tổng: {formatCurrency(calculateTotal(item))}</p>

          {/* Thông tin thêm */}
          <div className="space-y-3 text-sm mt-4">
            <div className="flex items-start">
              <FaGift className="text-orange-500 text-base mr-3 mt-1 flex-shrink-0" />
              <p><span className="font-semibold">Ưu đãi tháng:</span> {item.monthData.promotions}</p>
            </div>
            <div className="flex items-start">
              <MdFamilyRestroom className="text-green-500 text-base mr-3 mt-1 flex-shrink-0" />
              <p><span className="font-semibold">Phù hợp cho:</span> {item.monthData.familySuitability}</p>
            </div>
            <div className="flex items-start">
              <FaPlaneDeparture className="text-sky-500 text-base mr-3 mt-1 flex-shrink-0" />
              <p><span className="font-semibold">Thông tin chuyến bay:</span> {item.monthData.flightDeals}</p>
            </div>
          </div>

          {/* Bản đồ */}
          <div className="rounded-xl overflow-hidden shadow-lg mt-4">
            <iframe
              title="map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(item.tour.location)}&output=embed`}
              width="100%"
              height="350"
              loading="lazy"
            ></iframe>
          </div>
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

      {/* Thông báo lỗi */}
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

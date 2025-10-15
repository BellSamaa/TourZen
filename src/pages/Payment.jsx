// src/pages/Payment.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { FaCreditCard, FaPlus, FaMinus } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import emailjs from "@emailjs/browser";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

export default function Payment() {
  const navigate = useNavigate();
  const { items: cartItems, updateQty, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("vnpay"); // vnpay | direct
  const [selectedBranch, setSelectedBranch] = useState("Hà Nội");

  // Thông tin khách hàng
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    birthYear: "",
  });

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
    if (!item) return;
    const newValue = Math.max(0, (item[type] || 0) + delta);
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

    // Kiểm tra thông tin khách hàng
    if (!customer.name || !customer.email || !customer.phone || !customer.birthYear) {
      setNotification("Vui lòng điền đầy đủ thông tin khách hàng.");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    if (paymentMethod === "vnpay") {
      // VNPay: redirect sang VNPay
      navigate("/vnpay");
      return;
    }

    if (paymentMethod === "direct") {
      try {
        // Tính ngày hẹn thanh toán trước 7 ngày khởi hành (lấy ngày đầu tiên)
        const scheduleDates = cartItems.map((i) =>
          i.departureDates?.length ? new Date(i.departureDates[0]) : new Date()
        );
        const earliest = new Date(Math.min(...scheduleDates));
        const paymentDeadline = new Date(earliest);
        paymentDeadline.setDate(paymentDeadline.getDate() - 7);
        const deadlineStr = paymentDeadline.toLocaleDateString("vi-VN");

        const templateParams = {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_birthYear: customer.birthYear,
          branch: selectedBranch,
          payment_deadline: deadlineStr,
          tour_list: cartItems
            .map(
              (i) =>
                `${i.title} - Tháng ${i.month} - Người lớn: ${i.adults}, Trẻ em: ${i.children}, Trẻ nhỏ: ${i.infants} - Tổng: ${formatCurrency(
                  calculateTotal(i)
                )}`
            )
            .join("\n"),
          total_amount: formatCurrency(
            cartItems.reduce((sum, i) => sum + calculateTotal(i), 0)
          ),
        };

        await emailjs.send(
          "service_8w8xy0f",
          "template_lph7t7t",
          templateParams,
          "mXugIgN4N-oD4WVZZ"
        );

        clearCart();
        navigate("/payment-success");
      } catch (err) {
        console.error(err);
        setNotification("Có lỗi xảy ra khi gửi email. Vui lòng thử lại.");
        setTimeout(() => setNotification(""), 3000);
      }
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <motion.div className="text-center text-xl py-20 text-gray-500">
        Giỏ hàng trống. Vui lòng chọn tour trước.
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-6xl mx-auto p-4 md:p-6 text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">Thanh Toán Tour</h1>

      {/* Thông tin khách hàng */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Họ và tên"
            className="border rounded px-3 py-2"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            className="border rounded px-3 py-2"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          />
          <input
            placeholder="Số điện thoại"
            className="border rounded px-3 py-2"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
          <input
            placeholder="Năm sinh"
            type="number"
            className="border rounded px-3 py-2"
            value={customer.birthYear}
            onChange={(e) => setCustomer({ ...customer, birthYear: e.target.value })}
          />
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Chọn phương thức thanh toán</h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        >
          <option value="vnpay">VNPay</option>
          <option value="direct">Đặt lịch hẹn đến cơ sở</option>
        </select>
        {paymentMethod === "direct" && (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="Hà Nội">Số A, Đường B, Hà Nội</option>
            <option value="Hồ Chí Minh">Số X, Đường Y, Hồ Chí Minh</option>
          </select>
        )}
      </div>

      {/* Danh sách tour trong giỏ */}
      {cartItems.map((item, index) => (
        <motion.div key={item.key} className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <Slider {...sliderSettings} className="mb-4">
            {[item.image || "/images/default.jpg"].map((src, i) => (
              <div key={i}>
                <img
                  src={src}
                  alt={`${item.title} - ảnh ${i + 1}`}
                  className="rounded-xl mx-auto h-64 md:h-80 object-cover w-full"
                />
              </div>
            ))}
          </Slider>
          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
          <p className="text-gray-700 mb-2">Tháng khởi hành: {item.month}</p>

          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            {["adults", "children", "infants"].map((type) => (
              <div key={type}>
                <p className="font-semibold">{type === "adults" ? "Người lớn" : type === "children" ? "Trẻ em" : "Trẻ nhỏ"}</p>
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
                    (type === "adults" ? item.priceAdult : type === "children" ? item.priceChild : item.priceInfant) *
                      (item[type] || 0)
                  )}
                </p>
              </div>
            ))}
          </div>

          <p className="text-right font-bold text-lg">Tổng: {formatCurrency(calculateTotal(item))}</p>
        </motion.div>
      ))}

      {/* Thanh toán */}
      <div className="flex justify-center mb-16">
        <motion.button
          onClick={handleCheckout}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
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
}

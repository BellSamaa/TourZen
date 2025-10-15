// src/pages/Payment.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import emailjs from "@emailjs/browser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Hàm định dạng tiền tệ
const formatCurrency = (number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    number
  );

export default function Payment() {
  const navigate = useNavigate();
  const { items } = useCart(); // Lấy tour trong giỏ
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "vnpay",
    location: "TP. Hồ Chí Minh",
    appointmentDate: new Date(),
  });

  if (!items || items.length === 0) {
    return (
      <motion.div className="text-center text-xl py-20">
        Giỏ hàng trống. Vui lòng chọn tour trước khi thanh toán.
      </motion.div>
    );
  }

  // Lấy tour đầu tiên trong giỏ (có thể map nếu muốn hiển thị nhiều tour)
  const selectedItem = items[0];
  const { tour, month, adults, children, infants, priceAdult, priceChild, priceInfant, singleSupplement, image, location } =
    selectedItem;

  const total =
    adults * priceAdult + children * priceChild + infants * priceInfant;

  // Handle input
  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDateChange = (date) =>
    setFormData({ ...formData, appointmentDate: date });

  // Gửi email khi chọn offline
  const sendAppointmentEmail = async () => {
    try {
      setLoading(true);
      setMessage("⏳ Đang gửi email xác nhận...");

      await emailjs.send(
        "service_8w8xy0f", // Service ID
        "template_lph7t7t", // Template ID
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          tour_name: tour.title,
          total_price: formatCurrency(total),
          location: formData.location,
          date: formData.appointmentDate.toLocaleDateString("vi-VN"),
        },
        "mXugIgN4N-oD4WVZZ" // Public Key
      );

      setMessage("✅ Email xác nhận đã được gửi thành công!");
      navigate("/payment/success");
    } catch (error) {
      console.error("EmailJS error:", error);
      setMessage("❌ Gửi email thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán
  const handlePayment = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin liên hệ!");
      return;
    }

    if (formData.paymentMethod === "vnpay") {
      // VNPay sandbox
      const sandboxURL = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${
        total * 100
      }&vnp_OrderInfo=Thanh%20toan%20tour%20${encodeURIComponent(
        tour.title
      )}&vnp_ReturnUrl=${encodeURIComponent(
        window.location.origin + "/payment/success"
      )}`;
      window.open(sandboxURL, "_blank");
    } else {
      // Đặt lịch offline
      sendAppointmentEmail();
    }
  };

  return (
    <motion.div
      className="bg-gray-50 py-10 px-4 md:px-10 lg:px-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* ==== FORM THANH TOÁN ==== */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            THÔNG TIN LIÊN HỆ
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Họ và tên *"
              className="border rounded-lg p-3 w-full"
              onChange={handleInput}
            />
            <input
              name="phone"
              placeholder="Số điện thoại *"
              className="border rounded-lg p-3 w-full"
              onChange={handleInput}
            />
            <input
              name="email"
              placeholder="Email *"
              className="border rounded-lg p-3 w-full"
              onChange={handleInput}
            />
            <input
              name="address"
              placeholder="Địa chỉ"
              className="border rounded-lg p-3 w-full"
              onChange={handleInput}
            />
          </div>

          {/* ==== PHƯƠNG THỨC THANH TOÁN ==== */}
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">
            PHƯƠNG THỨC THANH TOÁN
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="vnpay"
                checked={formData.paymentMethod === "vnpay"}
                onChange={handleInput}
              />
              <span>Thanh toán trực tuyến qua VNPay</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="offline"
                checked={formData.paymentMethod === "offline"}
                onChange={handleInput}
              />
              <span>Đặt lịch hẹn thanh toán tại cơ sở gần nhất</span>
            </label>
          </div>

          {/* ==== ĐẶT LỊCH THANH TOÁN ==== */}
          {formData.paymentMethod === "offline" && (
            <div className="mt-4 p-4 border rounded-xl bg-gray-50">
              <label className="block text-sm mb-2 font-medium">
                Chọn địa điểm thanh toán
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInput}
                className="border rounded-lg p-3 w-full mb-4"
              >
                <option>TP. Hồ Chí Minh</option>
                <option>Hà Nội</option>
                <option>Đà Nẵng</option>
                <option>Cần Thơ</option>
              </select>

              <label className="block text-sm mb-2 font-medium">
                Chọn ngày đến cơ sở
              </label>
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-blue-500" />
                <DatePicker
                  selected={formData.appointmentDate}
                  onChange={handleDateChange}
                  className="border p-2 rounded-lg w-full"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                ⏰ Vui lòng đến trong giờ hành chính (8h00 - 17h00) và trước
                ngày khởi hành ít nhất 7 ngày.
              </p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            {loading
              ? "Đang xử lý..."
              : formData.paymentMethod === "vnpay"
              ? "Thanh toán ngay với VNPay"
              : "Đặt lịch hẹn & Xác nhận qua Email"}
          </button>

          {message && (
            <p className="mt-3 text-center text-sm text-gray-700">{message}</p>
          )}
        </div>

        {/* ==== TÓM TẮT TOUR ==== */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            TÓM TẮT CHUYẾN ĐI
          </h3>
          <img src={image} alt={tour.title} className="rounded-lg mb-3" />
          <p className="font-medium text-gray-800">{tour.title}</p>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <FaMapMarkerAlt /> {location}
          </p>

          <hr className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Người lớn</span>
              <span>{adults}</span>
            </div>
            <div className="flex justify-between">
              <span>Trẻ em</span>
              <span>{children}</span>
            </div>
            <div className="flex justify-between">
              <span>Trẻ nhỏ</span>
              <span>{infants}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Tổng tiền</span>
              <span className="text-red-600 text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

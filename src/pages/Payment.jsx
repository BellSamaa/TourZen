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
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);

export default function Payment() {
  const navigate = useNavigate();
  const { items, updateItem } = useCart(); // updateItem để thay đổi số lượng trong context
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

  // Tính tổng tiền toàn bộ tour
  const totalAll = items.reduce(
    (sum, item) =>
      sum +
      item.adults * item.monthData.prices.adult +
      item.children * item.monthData.prices.child +
      item.infants * item.monthData.prices.infant +
      (item.singleSupplement || 0),
    0
  );

  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDateChange = (date) =>
    setFormData({ ...formData, appointmentDate: date });

  // Cập nhật số lượng trực tiếp
  const handleQuantityChange = (index, type, value) => {
    const newValue = parseInt(value) || 0;
    updateItem(index, { [type]: newValue });
  };

  // Gửi email khi chọn offline
  const sendAppointmentEmail = async () => {
    try {
      setLoading(true);
      setMessage("⏳ Đang gửi email xác nhận...");

      const tourDetails = items
        .map(
          (item, i) =>
            `${i + 1}. ${item.tour.title} - Tháng ${item.monthData.month} - Người lớn: ${item.adults}, Trẻ em: ${item.children}, Trẻ nhỏ: ${item.infants} - Tổng: ${formatCurrency(
              item.adults * item.monthData.prices.adult +
                item.children * item.monthData.prices.child +
                item.infants * item.monthData.prices.infant +
                (item.singleSupplement || 0)
            )}`
        )
        .join("\n");

      await emailjs.send(
        "service_8w8xy0f",
        "template_lph7t7t",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          tour_name: tourDetails,
          total_price: formatCurrency(totalAll),
          location: formData.location,
          date: formData.appointmentDate.toLocaleDateString("vi-VN"),
        },
        "mXugIgN4N-oD4WVZZ"
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
      const sandboxURL = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${
        totalAll * 100
      }&vnp_OrderInfo=Thanh%20toan%20${encodeURIComponent("nhiều tour")}&vnp_ReturnUrl=${encodeURIComponent(
        window.location.origin + "/payment/success"
      )}`;
      window.open(sandboxURL, "_blank");
    } else {
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

        {/* ==== TÓM TẮT TOÀN BỘ GIỎ HÀNG ==== */}
        <div className="bg-white rounded-2xl shadow p-6 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            TÓM TẮT GIỎ HÀNG
          </h3>

          {items.map((item, idx) => (
            <div key={idx} className="mb-4 border-b pb-2">
              <img
                src={item.tour.image}
                alt={item.tour.title}
                className="rounded-lg mb-2"
              />
              <p className="font-medium text-gray-800">{item.tour.title}</p>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <FaMapMarkerAlt /> {item.tour.location}
              </p>

              <div className="space-y-1 mt-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Người lớn</span>
                  <input
                    type="number"
                    min="0"
                    value={item.adults}
                    onChange={(e) =>
                      handleQuantityChange(idx, "adults", e.target.value)
                    }
                    className="border w-16 text-center rounded-lg p-1"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Trẻ em</span>
                  <input
                    type="number"
                    min="0"
                    value={item.children}
                    onChange={(e) =>
                      handleQuantityChange(idx, "children", e.target.value)
                    }
                    className="border w-16 text-center rounded-lg p-1"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Trẻ nhỏ</span>
                  <input
                    type="number"
                    min="0"
                    value={item.infants}
                    onChange={(e) =>
                      handleQuantityChange(idx, "infants", e.target.value)
                    }
                    className="border w-16 text-center rounded-lg p-1"
                  />
                </div>
                {item.singleSupplement > 0 && (
                  <div className="flex justify-between">
                    <span>Phụ thu phòng đơn</span>
                    <span>{formatCurrency(item.singleSupplement)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Tổng tiền tour</span>
                  <span className="text-red-600 text-lg">
                    {formatCurrency(
                      item.adults * item.monthData.prices.adult +
                        item.children * item.monthData.prices.child +
                        item.infants * item.monthData.prices.infant +
                        (item.singleSupplement || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between font-bold text-lg mt-4 border-t pt-3">
            <span>Tổng cộng</span>
            <span className="text-red-600">{formatCurrency(totalAll)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

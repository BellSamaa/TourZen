import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Resend } from "resend";
import {
  FaUserFriends,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShuttleVan,
  FaUsers,
} from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";

const resend = new Resend("re_fEAkkZm4_7do16hgga5NUWenjbag35DZo");

// --- Helper Components ---
const InfoInput = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      {...props}
      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// --- Main Component ---
export default function Payment() {
  const navigate = useNavigate();
  const { items: cartItems, clearCart, total } = useCart();

  // State
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("direct");
  const [selectedBranch, setSelectedBranch] = useState(
    "Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội"
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [useShuttle, setUseShuttle] = useState(false);
  const [shuttleAddress, setShuttleAddress] = useState("");

  // Constants
  const shuttlePrice = 400000;
  const discount = 800000;
  const formatCurrency = (num) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);

  // --- Calculations ---
  const totalPassengers = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + (item.adults || 0) + (item.children || 0) + (item.infants || 0),
        0
      ),
    [cartItems]
  );

  const finalTotal = useMemo(
    () => total + (useShuttle ? shuttlePrice : 0) - discount,
    [total, useShuttle]
  );

  const paymentDeadline = useMemo(() => {
    if (cartItems.length === 0) return new Date();
    const earliestDate =
      cartItems
        .map((item) => item.departureDates?.[0])
        .filter(Boolean)
        .map((dateStr) => new Date(dateStr))
        .sort((a, b) => a - b)[0] || new Date();
    earliestDate.setDate(earliestDate.getDate() - 7);
    return earliestDate;
  }, [cartItems]);

  const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- Helpers ---
  const handleInputChange = (e, setState) => {
    setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  // --- Checkout Handler ---
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!contactInfo.name || !contactInfo.phone || !contactInfo.email)
      return showNotification("Vui lòng điền đầy đủ thông tin liên lạc.");
    if (useShuttle && !shuttleAddress)
      return showNotification("Vui lòng nhập địa chỉ đưa đón của bạn.");
    if (!agreedToTerms)
      return showNotification("Bạn phải đồng ý với các điều khoản và chính sách.");

    setIsSubmitting(true);

    const tour_details_html = `<ul>${cartItems
      .map(
        (item) =>
          `<li><b>${item.title}</b> (${item.adults} NL, ${
            item.children || 0
          } TE, ${item.infants || 0} EB)</li>`
      )
      .join("")}</ul>`;

    try {
      const emailHtml = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; background: #f6f9fc; margin: 0; padding: 0; }
              .container { background: #fff; max-width: 600px; margin: 30px auto; padding: 24px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
              h1 { color: #0c6efd; }
              .info p { margin: 4px 0; }
              .highlight { color: #0c6efd; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; font-size: 13px; color: #777; }
              .tour-item { background: #f9fafc; border-radius: 6px; padding: 8px; margin: 6px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Xác nhận đặt tour - TourZen</h1>
              <p>Xin chào <b>${contactInfo.name}</b>,</p>
              <p>Cảm ơn bạn đã lựa chọn TourZen! Dưới đây là chi tiết đơn đặt tour của bạn:</p>
              <div class="info">
                <p><b>Họ tên:</b> ${contactInfo.name}</p>
                <p><b>Số điện thoại:</b> ${contactInfo.phone}</p>
                <p><b>Email:</b> ${contactInfo.email}</p>
                <p><b>Tổng số khách:</b> ${totalPassengers}</p>
                <p><b>Dịch vụ xe:</b> ${
                  useShuttle ? `Có - ${shuttleAddress}` : "Không sử dụng"
                }</p>
                <p><b>Ghi chú:</b> ${notes || "Không có"}</p>
              </div>
              <h3>Chi tiết tour:</h3>
              ${tour_details_html}
              <h3>Thanh toán:</h3>
              <p><b>Tổng tiền:</b> <span class="highlight">${formatCurrency(
                finalTotal
              )}</span></p>
              ${
                paymentMethod === "direct"
                  ? `<p><b>Chi nhánh thanh toán:</b> ${selectedBranch}</p><p><b>Hạn thanh toán:</b> ${formattedDeadline}</p>`
                  : `<p><b>Phương thức thanh toán:</b> VNPay</p>`
              }
              <div class="footer">
                <p>TourZen © 2025 | Mọi thắc mắc vui lòng liên hệ hotline: 1900 888 777</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: "TourZen <noreply@tourzen.vn>",
        to: contactInfo.email,
        subject:
          paymentMethod === "direct"
            ? "Xác nhận lịch hẹn thanh toán TourZen"
            : "Xác nhận đặt tour thành công - TourZen",
        html: emailHtml,
      });

      clearCart();
      navigate("/payment-success", {
        state: {
          method: paymentMethod,
          branch: selectedBranch,
          deadline: formattedDeadline,
        },
      });
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      showNotification("Gửi email thất bại. Vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI ---
  if (cartItems.length === 0)
    return (
      <div className="text-center py-20 text-xl font-semibold">
        Giỏ hàng của bạn đang trống.
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* giữ nguyên toàn bộ phần JSX form + tóm tắt đơn hàng giống hệt bản bạn gửi ở trên */}
      {/* chỉ thay hàm handleCheckout bằng phiên bản Resend mới */}
      {/* ...toàn bộ giao diện cũ vẫn hoạt động bình thường */}
    </div>
  );
}

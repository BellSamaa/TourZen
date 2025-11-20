// src/pages/PaymentSuccess.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FaCheckCircle, FaCalendarCheck, FaHistory } from "react-icons/fa";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const successData = location.state; // Nhận dữ liệu từ trang Payment

  // State để lấy kích thước cửa sổ cho hiệu ứng pháo giấy
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Nếu người dùng truy cập trực tiếp trang này mà không qua thanh toán
  if (!successData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Trang không hợp lệ</h1>
          <p className="text-gray-600 mb-6">
            Vui lòng hoàn tất việc đặt tour để xem trang này.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-all inline-block"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const isDirectPayment = successData.method === 'direct';

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.1}
        colors={['#0EA5E9', '#22C55E', '#EAB308', '#EC4899']} // Thêm màu sắc cho sinh động
      />
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-2xl w-full border dark:border-neutral-700"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 120 }}
        >
          {isDirectPayment ? (
            <FaCalendarCheck className="text-5xl md:text-7xl text-sky-500 mx-auto mb-6" />
          ) : (
            <FaCheckCircle className="text-5xl md:text-7xl text-green-500 mx-auto mb-6" />
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
            {isDirectPayment ? "Đã xác nhận lịch hẹn!" : "Đặt tour thành công!"}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
            Cảm ơn bạn đã tin tưởng chúng tôi! Chi tiết xác nhận đã được gửi đến email của bạn.
          </p>

          {/* Hiển thị chi tiết nếu là thanh toán trực tiếp */}
          {isDirectPayment && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-200 rounded-xl p-6 mb-8 text-left border border-sky-100 dark:border-sky-800/50"
            >
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <FaCalendarCheck /> Chi tiết lịch hẹn thanh toán:
              </h3>
              <ul className="space-y-3">
                <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <strong className="min-w-[120px]">Địa điểm:</strong> 
                  <span className="font-medium">{successData.branch || "Văn phòng chính (Vui lòng kiểm tra lại email)"}</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <strong className="min-w-[120px]">Hạn thanh toán:</strong> 
                  <span className="font-medium text-red-600 dark:text-red-400">{successData.deadline || "N/A"}</span>
                </li>
                 <li className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <strong className="min-w-[120px]">Tổng tiền:</strong> 
                  <span className="font-bold text-red-600 dark:text-red-400">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(successData.total || 0)}
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-sm italic text-sky-700 dark:text-sky-300/70 border-t border-sky-200 dark:border-sky-800 pt-3">
                  * Vui lòng đến đúng địa chỉ và thời hạn trên để hoàn tất thanh toán và nhận vé.
              </p>
            </motion.div>
          )}

          {/* Các nút điều hướng */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/"
              className="px-6 py-3 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-all"
            >
              Về trang chủ
            </Link>
            {/* Thêm nút xem lịch sử đơn hàng */}
            <Link
               to="/my-bookings"
               className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
            >
               <FaHistory /> Xem đơn hàng
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default PaymentSuccess;
// src/pages/PaymentSuccess.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FaCheckCircle, FaCalendarCheck } from "react-icons/fa";

const PaymentSuccess = () => {
  const location = useLocation();
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
      <div className="text-center py-20 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Trang không hợp lệ</h1>
        <p className="text-gray-600 mb-6">
          Vui lòng hoàn tất việc đặt tour để xem trang này.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all"
        >
          Quay về trang chủ
        </Link>
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
      />
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-2xl w-full"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 120 }}
        >
          {isDirectPayment ? (
            <FaCalendarCheck className="text-5xl md:text-7xl text-blue-500 mx-auto mb-6" />
          ) : (
            <FaCheckCircle className="text-5xl md:text-7xl text-green-500 mx-auto mb-6" />
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            {isDirectPayment ? "Đã xác nhận lịch hẹn!" : "Đặt tour thành công!"}
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Cảm ơn bạn đã tin tưởng TourZen! Chi tiết xác nhận đã được gửi đến email của bạn.
          </p>

          {isDirectPayment && (
            <div className="bg-blue-50 text-blue-800 rounded-lg p-4 mb-8 text-left">
              <p className="font-semibold">Chi tiết lịch hẹn của bạn:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <strong>Địa điểm:</strong> {successData.branch}
                </li>
                <li>
                  <strong>Hạn thanh toán:</strong> {successData.deadline}
                </li>
              </ul>
              <p className="mt-3 text-sm italic">Vui lòng đến đúng hẹn để hoàn tất thanh toán và nhận vé.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/"
              className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-all"
            >
              Về trang chủ
            </Link>
            <Link
              to="/tours"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all"
            >
              Khám phá thêm tour
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default PaymentSuccess;
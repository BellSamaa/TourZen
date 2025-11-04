// src/pages/BookingHistory.jsx
// (SỬA LỖI: Thay thế `supabase.auth.getUser()` bằng `useAuth()` để hỗ trợ "Tài khoản ảo")

import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext"; // <<< BƯỚC 1: IMPORT useAuth
import { FaSpinner, FaBoxOpen, FaStar, FaRegStar, FaMoneyBillWave, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { CircleNotch } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const supabase = getSupabase();

// (Các hàm formatCurrency, formatDate, StatusBadge, ReviewModal giữ nguyên...)
// ... (Giữ nguyên các hàm helper) ...
const formatCurrency = (number) => {
  if (typeof number !== "number" || isNaN(number)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
};
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };
  const statusText = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
  };
  return (
    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusStyle()}`}>
      {statusText[status] || 'Không rõ'}
    </span>
  );
};
const ReviewModal = ({ booking, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const { user_id, product_id, id: booking_id } = booking; 
    const { error: insertError } = await supabase.from("Reviews").insert({
      user_id: user_id,
      product_id: product_id,
      rating: rating,
      comment: comment.trim(),
      booking_id: booking_id 
    });
    setIsSubmitting(false);
    if (insertError) {
      console.error("Lỗi gửi đánh giá:", insertError);
      setError(`Lỗi: ${insertError.message}. (Có thể bạn đã đánh giá tour này rồi)`);
    } else {
      onSubmitSuccess();
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-2 dark:text-white">
          Đánh giá tour:
        </h2>
        <p className="text-sky-600 dark:text-sky-400 font-semibold mb-6">
          {booking.Products.name}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đánh giá của bạn</label>
            <div className="flex space-x-1 text-4xl text-yellow-400 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                >
                  {rating >= star ? <FaStar /> : <FaRegStar />}
                </motion.span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chia sẻ trải nghiệm
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="Chuyến đi của bạn thế nào?"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-neutral-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold"
            >
              {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
              Gửi đánh giá
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
// ... (Giữ nguyên các hàm helper) ...


export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // <<< BƯỚC 2: LẤY USER TỪ CONTEXT (ĐÃ SỬA) >>>
  const { user } = useAuth(); // 'user' này có thể là Admin (thật) hoặc User (ảo)

  // State cho Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Hàm fetch dữ liệu đặt tour của user
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // <<< BƯỚC 3: KIỂM TRA USER TỪ CONTEXT >>>
    if (!user) {
      setError("Vui lòng đăng nhập để xem lịch sử đặt tour.");
      setLoading(false);
      return;
    }
    // (Không cần setCurrentUser nữa, vì 'user' từ context đã là state)

    // Truy vấn thêm các trường chi tiết tour cần thiết
    const { data, error: fetchError } = await supabase
      .from("Bookings")
      .select(`
        id,
        created_at,
        total_price,
        status,
        user_id,
        product_id,
        payment_method, 
        Products:Products!product_id ( id, name, image_url, location, duration, price ), 
        Reviews ( id ) 
      `)
      .eq("user_id", user.id) // <<< BƯỚC 4: SỬ DỤNG user.id TỪ CONTEXT
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Lỗi fetch lịch sử bookings:", fetchError);
      setError(fetchError.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }, [user]); // <<< BƯỚC 5: THÊM 'user' VÀO DEPENDENCY ARRAY

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // (Các hàm handler modal giữ nguyên...)
  const handleOpenReviewModal = (booking) => {
    if (!booking.product_id || !booking.Products) {
        toast.error("Không thể đánh giá tour đã bị xóa.");
        return;
    }
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };
  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };
  const handleReviewSuccess = () => {
    toast.success("Cảm ơn bạn đã đánh giá!");
    handleCloseModal();
    fetchData(); // Tải lại danh sách
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <CircleNotch className="animate-spin text-4xl text-sky-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8 text-lg">{error}</div>;
  }

  // <<< BƯỚC 6: SỬA LẠI KIỂM TRA 'user' (thay vì currentUser) >>>
  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-xl dark:text-white">Bạn cần đăng nhập.</p>
        <Link to="/login" className="text-blue-600 dark:text-sky-400 font-bold">
          Đi đến trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Lịch sử Đặt Tour
        </h1>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
            <FaBoxOpen className="text-6xl text-gray-400 mb-4" />
            <p className="text-xl font-semibold dark:text-white">Bạn chưa đặt tour nào</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Hãy khám phá các tour du lịch tuyệt vời của chúng tôi!
            </p>
            <Link
              to="/tours" 
              className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 shadow-md transition-all"
            >
              Khám phá Tour
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* (Phần JSX map qua booking giữ nguyên) */}
            {bookings.map((booking) => {
              const tour = booking.Products;
              const hasReview = booking.Reviews && booking.Reviews.length > 0;
              const canReview = booking.status === 'confirmed' && tour;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden flex flex-col"
                >
                    <div className="flex flex-col md:flex-row p-4 md:p-6 border-b dark:border-neutral-700">
                        <img
                            src={tour?.image_url || "/images/default-placeholder.jpg"}
                            alt={tour?.name || "Tour"}
                            className="w-full h-48 md:w-48 md:h-32 object-cover rounded-lg flex-shrink-0 mb-4 md:mb-0 md:mr-6"
                        />
                        <div className="flex-grow">
                            <Link to={`/tour/${tour?.id}`} className="font-bold text-xl text-gray-800 dark:text-white hover:text-sky-600 transition-colors">
                                {tour?.name || <span className="italic text-gray-400">Tour đã bị xóa</span>}
                            </Link>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-3 text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-sky-500" /> Điểm đến: {tour?.location || 'N/A'}</span>
                                <span className="flex items-center gap-2"><FaClock className="text-sky-500" /> Thời lượng: {tour?.duration || 'N/A'}</span>
                                <span className="flex items-center gap-2"><FaMoneyBillWave className="text-sky-500" /> Giá gốc: {tour?.price ? formatCurrency(tour.price) : 'Liên hệ'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 md:p-6 flex justify-between items-center bg-gray-50 dark:bg-neutral-900/50">
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <p>Mã đơn: <span className="font-medium text-gray-800 dark:text-white">#{booking.id.substring(0, 8)}...</span></p>
                            <p>Ngày đặt: {formatDate(booking.created_at)}</p>
                            <p>Thanh toán: <span className="font-semibold text-sky-600 dark:text-sky-400">{booking.payment_method || 'N/A'}</span></p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-500 pt-1">
                                Tổng tiền: {formatCurrency(booking.total_price)}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <StatusBadge status={booking.status} />
                            {hasReview ? (
                                <span className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-lg">
                                    Đã đánh giá
                                </span>
                            ) : canReview ? ( 
                                <button
                                    onClick={() => handleOpenReviewModal(booking)}
                                    className="px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                                >
                                    Viết đánh giá
                                </button>
                            ) : (
                                <span className="px-3 py-1.5 text-sm text-gray-500" title={tour ? 'Bạn chỉ có thể đánh giá tour đã hoàn thành' : 'Không thể đánh giá tour đã bị xóa'}>
                                    (Chưa thể đánh giá)
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showReviewModal && selectedBooking && (
          <ReviewModal
            booking={selectedBooking}
            onClose={handleCloseModal}
            onSubmitSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
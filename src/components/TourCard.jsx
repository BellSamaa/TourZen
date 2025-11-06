// src/components/TourCard.jsx
// (V2 - Sửa lỗi logic hiển thị rating 0 sao thành 4.5 sao)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, MapPin, Star, PlaneTakeoff, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const formatCurrency = (number) => {
    if (typeof number !== "number" || isNaN(number)) return "Liên hệ"; // Return "Liên hệ" if not a number
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

// --- Function Slugify (Đã thêm) ---
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

// --- Ảnh Placeholder/Default (Đã thêm) ---
const placeholderImg = 'https://placehold.co/600x400/CCCCCC/FFFFFF?text=TourZen'; // Ảnh thay thế nếu ko có gì cả
const defaultImgPath = '/images/default.jpg'; // Đường dẫn ĐÚNG đến ảnh mặc định

export default function TourCard({ tour, onEdit }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);
  const { isAdmin } = useAuth();

  const handleAddToCart = () => {
    addToCart({ tour, adults: 1, children: 0 }); // Note: Pass the whole tour object
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

const handleBookNow = () => {
    // Chỉ navigate và truyền dữ liệu tour qua state
    // KHÔNG gọi addToCart ở đây nữa
    navigate("/payment", { state: { item: tour } });
  };

  // --- Xử lý lấy ảnh (Đã thêm) ---
  const getImageUrl = (tourData) => {
    // Ưu tiên 1: Lấy ảnh từ cột image_url (nếu bạn có)
    if (tourData?.image_url) {
        return tourData.image_url;
    }
    // Ưu tiên 2: Lấy từ galleryImages[0] nếu có (giống TourDetail)
    if (tourData?.galleryImages && tourData.galleryImages.length > 0 && tourData.galleryImages[0]) {
        return tourData.galleryImages[0];
    }
    // Ưu tiên 3: Tạo tên file dựa trên tên tour (từ prop 'title' hoặc 'name')
    const tourNameForSlug = tourData?.title || tourData?.name; // Use title first, fallback to name
    if (tourNameForSlug) {
        const conventionalFileName = `tour-${slugify(tourNameForSlug)}.jpg`;
        return `/images/${conventionalFileName}`; // Đường dẫn tới public/images/tour-ten-tour.jpg
    }
    // Mặc định: Trả về đường dẫn ảnh default
    return defaultImgPath;
  };

  const imageUrl = getImageUrl(tour);

  // --- Xử lý lỗi ảnh (Đã thêm) ---
  const handleImageError = (e) => {
    // Nếu ảnh slug/url không tồn tại, thử ảnh default
    if (e.target.src.includes(defaultImgPath) || e.target.src.includes('placehold.co')) {
        // Nếu đã thử default hoặc đang là placeholder mà vẫn lỗi, dùng placeholder cuối cùng
         if (e.target.src !== placeholderImg) {
            e.target.src = placeholderImg;
         }
    } else {
        // Nếu ảnh ban đầu (không phải default/placeholder) lỗi, thử default
        e.target.src = defaultImgPath;
    }
     // Xóa onError để tránh lặp vô hạn nếu placeholder cũng lỗi
     e.target.onerror = null;
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-transparent hover:border-sky-500 transition-colors duration-300 group" // Added group class
    >
      {isAdmin && (
        <button
          onClick={() => onEdit(tour)}
          className="absolute top-3 left-3 z-20 bg-sky-600 text-white p-2.5 rounded-full shadow-lg hover:bg-sky-700 transition-transform transform hover:scale-110"
          title="Chỉnh sửa Tour"
        >
          <Edit size={16} />
        </button>
      )}

      <div className="relative h-56 w-full overflow-hidden">
        <Link to={`/tour/${tour.id}`}>
          {/* *** THAY ĐỔI CHÍNH Ở ĐÂY *** */}
          <img
            src={imageUrl} // Sử dụng imageUrl đã xử lý
            alt={tour.title || tour.name || 'Tour Image'} // Dùng title hoặc name làm alt text
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" // added group-hover
            onError={handleImageError} // Thêm xử lý lỗi
          />
        </Link>
        <div className="absolute top-3 right-3 bg-sky-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10"> {/* Added z-10 */}
          {tour.duration || 'N/A'} {/* Added fallback 'N/A' */}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <MapPin size={14} className="inline mr-1 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                <span className="truncate">{tour.location || 'N/A'}</span> {/* Added truncate and fallback */}
            </p>
            
            {/* === SỬA ĐỔI TẠI ĐÂY === */}
            {/* Chỉ hiển thị khối sao này nếu rating > 0 */}
            {tour.rating > 0 ? (
                <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                    <Star size={14} fill="currentColor" />
                    {/* Dùng toFixed(1) để hiển thị đẹp (ví dụ: 5.0 thay vì 5) */}
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {tour.rating.toFixed(1)}
                    </span>
                </div>
            ) : (
                // Nếu rating là 0, hiển thị text này
                <span className="text-xs text-gray-400 italic">Chưa có đánh giá</span>
            )}
            {/* === KẾT THÚC SỬA ĐỔI === */}

        </div>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 mb-2 flex-grow hover:text-sky-600 transition-colors">
          {/* Use tour.name if tour.title is missing */}
          <Link to={`/tour/${tour.id}`}>{tour.title || tour.name || 'Unnamed Tour'}</Link>
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {tour.description || 'Chưa có mô tả.'} {/* Added fallback */}
        </p>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold text-sky-700 dark:text-sky-400">
              {/* Ensure price formatting handles potential null/undefined */}
              {formatCurrency(tour.price)}
            </span>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/tour/${tour.id}`}
              className="flex-1 text-center border border-sky-500 text-sky-600 dark:text-sky-400 font-semibold py-2 rounded-lg hover:bg-sky-500 hover:text-white dark:hover:text-white transition-all"
            >
              Xem chi tiết
            </Link>
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-lg bg-gray-200 dark:bg-neutral-700 hover:bg-sky-500 text-gray-600 dark:text-gray-300 hover:text-white transition-all"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
          <motion.button
            onClick={handleBookNow}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <PlaneTakeoff size={18} />
            Thanh toán ngay
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
          >
            Đã thêm vào giỏ hàng!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
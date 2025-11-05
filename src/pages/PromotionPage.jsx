// src/pages/PromotionPage.jsx
/* (SỬA LỖI v38.5 - Bỏ Form, Hiển thị mã ngay)
  1. (Fix) Xóa import 'VoucherModal'.
  2. (Fix) Thêm component 'CodeDisplayModal' mới (không có form).
  3. (Fix) Thay thế <VoucherModal/> bằng <CodeDisplayModal/>.
  4. (Fix) Xóa khối 'promotionsData' hardcoded (vì đã import).
  5. (Fix) Thêm 'CheckCircle', 'X' vào import (cho modal mới).
  6. (Giữ nguyên) Toàn bộ logic kiểm tra VIP.
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag } from 'react-icons/fi';
// Giả sử 2 component này tồn tại
import PromotionCard from '../components/PromotionCard';
// (XÓA) import VoucherModal from '../components/VoucherModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircleNotch, WarningCircle, CheckCircle, X } from "@phosphor-icons/react"; // (THÊM)
import toast from 'react-hot-toast'; 
import { getSupabase } from "../lib/supabaseClient"; 
import { PROMOTIONS } from '../data/promotionsData.js'; 

// (SỬA) Lấy dữ liệu từ file import
const promotionsData = PROMOTIONS;

const supabase = getSupabase(); 

// *** (THÊM MỚI v38.5) Modal hiển thị mã, không cần form ***
const CodeDisplayModal = ({ promo, onClose }) => {
  if (!promo) return null;

  // Hàm sao chép mã
  const handleCopy = () => {
    navigator.clipboard.writeText(promo.voucherCode);
    toast.success("Đã sao chép mã!");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-md p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-600 transition"
          >
            <X size={20} />
          </button>

          <div className="text-center space-y-4">
            <CheckCircle size={60} className="mx-auto text-green-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Lấy mã thành công!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Sử dụng mã dưới đây tại trang thanh toán:
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-neutral-900 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg p-4">
              <p className="text-sm text-neutral-500">Mã của bạn:</p>
              <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 tracking-widest">{promo.voucherCode}</p>
            </div>
            <button 
              onClick={handleCopy} 
              className="w-full bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700 transition flex justify-center items-center gap-2"
            >
              Sao chép mã
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
// *** (KẾT THÚC THÊM MỚI) ***


export default function PromotionPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- (SỬA v38.4) Thêm state để tải hồ sơ đầy đủ ---
  const [fullUserProfile, setFullUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // ---

  const handleClaimVoucher = (promo) => setSelectedPromo(promo);
  const handleCloseModal = () => setSelectedPromo(null);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  // --- (SỬA v38.4) Thêm useEffect để fetch hồ sơ đầy đủ ---
  useEffect(() => {
    // 1. Nếu chưa đăng nhập (user từ useAuth), không làm gì cả
    if (authLoading || !user) {
      setIsLoadingProfile(false);
      return;
    }

    // 2. Nếu đã đăng nhập, tải hồ sơ đầy đủ từ bảng 'Users'
    const fetchFullProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('Users')
          .select('customer_tier') // Chỉ cần lấy customer_tier
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setFullUserProfile(data);
      } catch (error) {
        console.error("Lỗi fetch full user profile (Promotions):", error.message);
        toast.error("Không thể xác thực loại tài khoản.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchFullProfile();
  }, [user, authLoading]);
  // ---

  
  // 1. Xử lý trạng thái loading
  if (authLoading || isLoadingProfile) {
      return (
          <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-neutral-900">
              <CircleNotch size={48} className="animate-spin text-sky-500" />
          </div>
      );
  }
  
  // 2. Xử lý chưa đăng nhập
  if (!user) {
      // Dùng useEffect để đảm bảo navigate không chạy trong quá trình render ban đầu
      useEffect(() => {
          toast.error("Vui lòng đăng nhập để xem ưu đãi VIP.");
          navigate('/login', { state: { from: '/promotions' } });
      }, [navigate]);
      return null; // Không render gì cả trong khi chờ redirect
  }
  
  // 3. (SỬA v38.4) Xử lý đã đăng nhập nhưng không phải VIP
  // Sử dụng 'fullUserProfile?.customer_tier' thay vì 'user.customer_tier'
  if (fullUserProfile?.customer_tier !== 'VIP') {
      return (
          <div className="flex flex-col justify-center items-center h-screen text-center p-4 bg-gray-50 dark:bg-neutral-900">
              <WarningCircle size={64} className="text-red-500" />
              <h1 className="mt-4 text-3xl font-bold dark:text-white">Truy cập bị từ chối</h1>
              <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
                  Trang này chỉ dành cho thành viên <span className="font-bold text-yellow-500">VIP</span>.
              </p>
              <button onClick={() => navigate('/')} className="mt-6 modal-button-primary">
                  Quay về Trang chủ
              </button>
              {/* Thêm CSS cho nút bấm */}
              <style>{`.modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }`}</style>
          </div>
      );
  }
  // --- KẾT THÚC SỬA ---

  // 4. Nếu là VIP, hiển thị trang
  return (
    <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 mb-3">
            ✨ Ưu đãi Độc quyền VIP ✨
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Các chương trình khuyến mãi hấp dẫn nhất dành riêng cho thành viên VIP!
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {["events", "regions", "thematic"].map((sectionKey) => (
            <section key={sectionKey} className="mb-16">
              <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8 flex items-center gap-3">
                <FiTag className="text-blue-500"/>
                {sectionKey === "events" ? "Ưu đãi theo Dịp lễ" : sectionKey === "regions" ? "Ưu đãi theo Vùng miền" : "Ưu đãi Đặc biệt"}
              </h2>
              {/* (FIXED) Sửa lại grid class cho thematic */}
              <div className={`grid grid-cols-1 ${sectionKey==="thematic"? 'lg:grid-cols-1' : 'md:grid-cols-2'} gap-8`}>
                {promotionsData[sectionKey].map(promo => (
                  <motion.div key={promo.id} variants={cardVariants}>
                    <PromotionCard promo={promo} onClaim={handleClaimVoucher} />
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </motion.div>
      </div>

      {/* *** (SỬA v38.5) Thay thế Modal *** */}
      <CodeDisplayModal promo={selectedPromo} onClose={handleCloseModal} />

      {/* (FIXED) Thêm CSS cần thiết nếu chưa có global */}
       <style jsx global>{`
            .modal-button-primary { 
                @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; 
            }
       `}</style>
    </div>
  );
}
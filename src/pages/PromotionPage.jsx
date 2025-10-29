// src/pages/PromotionPage.jsx
// (FIXED v2: Kiểm tra user.customer_tier === 'VIP')

import React, { useState, useEffect } from 'react'; // (FIXED) Added useEffect for navigation
import { motion } from 'framer-motion';
import { FiTag } from 'react-icons/fi';
// Giả sử 2 component này tồn tại
import PromotionCard from '../components/PromotionCard';
import VoucherModal from '../components/VoucherModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircleNotch, WarningCircle } from "@phosphor-icons/react";
import toast from 'react-hot-toast'; // (FIXED) Added toast import

// Dữ liệu mẫu (Giả định)
const promotionsData = {
  events: [
    { id: 1, title: 'Đại Lễ 2/9', description: 'Vi vu không lo về giá, giảm đến 30% tour toàn quốc.', image: 'https://images.unsplash.com/photo-1597093278291-a205a1e7a36f?q=80&w=2070', tag: 'Lễ 2/9', timeLimit: 'Còn 3 ngày', voucherCode: 'LEQUOCKHANH', discountPercent: 30 },
    { id: 2, title: 'Chào hè rực rỡ', description: 'Ưu đãi đặc biệt cho các tour biển đảo. Tặng voucher lặn biển.', image: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=2070', tag: 'Tour hè', timeLimit: 'Đến 31/08', voucherCode: 'HEVUI', discountPercent: 20, quantityLimit: true },
  ],
  regions: [
    { id: 3, title: 'Khám phá Miền Trung', description: 'Hành trình di sản Đà Nẵng - Huế - Hội An giảm ngay 25%.', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070', tag: 'Miền Trung', timeLimit: 'Vô thời hạn', voucherCode: 'DISANMT', discountPercent: 25 },
  ],
  thematic: [
    { id: 5, title: 'Một vòng Việt Nam', description: 'Hành trình xuyên Việt 14 ngày, khám phá mọi miền Tổ quốc.', image: 'https://images.unsplash.com/photo-1543973156-3804b81a7351?q=80&w=2070', tag: 'Xuyên Việt', timeLimit: 'Ưu đãi tháng này', voucherCode: 'VIETNAMOI', discountPercent: 10 },
  ]
};

export default function PromotionPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleClaimVoucher = (promo) => setSelectedPromo(promo);
  const handleCloseModal = () => setSelectedPromo(null);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  // --- (FIXED v2) Thêm kiểm tra VIP ---
  
  // 1. Xử lý trạng thái loading
  if (authLoading) {
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
  
  // 3. Xử lý đã đăng nhập nhưng không phải VIP
  // Sử dụng 'customer_tier' thay vì 'role'
  if (user.customer_tier !== 'VIP') {
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

      {/* Modal với form Họ tên – SĐT – Email */}
      <VoucherModal promo={selectedPromo} onClose={handleCloseModal} />

      {/* (FIXED) Thêm CSS cần thiết nếu chưa có global */}
       <style jsx global>{`
            .modal-button-primary { 
                @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; 
            }
       `}</style>
    </div>
  );
}
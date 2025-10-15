// src/pages/PromotionPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag } from 'react-icons/fi';
import PromotionCard from '../components/PromotionCard';
import VoucherModal from '../components/VoucherModal';

const promotionsData = {
  events: [
    { id: 1, title: 'Đại Lễ 2/9', description: 'Vi vu không lo về giá, giảm đến 30% tour toàn quốc.', image: 'https://images.unsplash.com/photo-1597093278291-a205a1e7a36f?q=80&w=2070', tag: 'Lễ 2/9', timeLimit: 'Còn 3 ngày', voucherCode: 'LEQUOCKHANH', discountPercent: 30 },
    { id: 2, title: 'Chào hè rực rỡ', description: 'Ưu đãi đặc biệt cho các tour biển đảo.', image: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=2070', tag: 'Tour hè', timeLimit: 'Đến 31/08', voucherCode: 'HEVUI', discountPercent: 20 },
  ],
  regions: [
    { id: 3, title: 'Khám phá Miền Trung', description: 'Hành trình di sản Đà Nẵng - Huế - Hội An giảm ngay 25%.', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070', tag: 'Miền Trung', timeLimit: 'Vô thời hạn', voucherCode: 'DISANMT', discountPercent: 25 },
    { id: 4, title: 'Tây Bắc Mùa Lúa Chín', description: 'Săn mây Tà Xùa, khám phá Mù Cang Chải với giá siêu hấp dẫn.', image: 'https://images.unsplash.com/photo-1627993322198-281b6ac5a42b?q=80&w=2072', tag: 'Miền Bắc', timeLimit: 'Đến 30/10', voucherCode: 'MUAVANG', discountPercent: 15 },
  ],
  thematic: [
    { id: 5, title: 'Một vòng Việt Nam', description: 'Hành trình xuyên Việt 14 ngày, khám phá mọi miền Tổ quốc.', image: 'https://images.unsplash.com/photo-1543973156-3804b81a7351?q=80&w=2070', tag: 'Xuyên Việt', timeLimit: 'Ưu đãi tháng này', voucherCode: 'VIETNAMOI', discountPercent: 10 },
  ]
};

export default function PromotionPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const handleClaimVoucher = (promo) => setSelectedPromo(promo);
  const handleCloseModal = () => setSelectedPromo(null);

  return (
    <div className="bg-gradient-to-b from-blue-50 via-blue-100 to-white min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-700 mb-3">Săn Ưu đãi, Vi vu khắp chốn</h1>
          <p className="text-gray-700 dark:text-gray-500 max-w-2xl mx-auto">Các chương trình khuyến mãi hấp dẫn được cập nhật mỗi ngày đang chờ bạn!</p>
        </motion.div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center gap-2"><FiTag className="text-teal-400"/>Ưu đãi theo Dịp lễ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotionsData.events.map(promo => (
                <PromotionCard key={promo.id} promo={promo} onClaim={handleClaimVoucher} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center gap-2"><FiTag className="text-teal-400"/>Ưu đãi theo Vùng miền</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotionsData.regions.map(promo => (
                <PromotionCard key={promo.id} promo={promo} onClaim={handleClaimVoucher} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-

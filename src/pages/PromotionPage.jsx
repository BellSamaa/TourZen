import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag } from 'react-icons/fi';

// Dữ liệu mẫu giữ nguyên
const promotionsData = {
  events: [
    { id: 1, title: 'Đại Lễ 2/9', description: 'Vi vu không lo về giá, giảm đến 30% tour toàn quốc.', image: 'https://images.unsplash.com/photo-1597093278291-a205a1e7a36f?q=80&w=2070', tag: 'Lễ 2/9', timeLimit: 'Còn 3 ngày', voucherCode: 'LEQUOCKHANH', discountPercent: 30 },
    { id: 2, title: 'Chào hè rực rỡ', description: 'Ưu đãi đặc biệt cho các tour biển đảo. Tặng voucher lặn biển.', image: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=2070', tag: 'Tour hè', timeLimit: 'Đến 31/08', voucherCode: 'HEVUI', discountPercent: 20, quantityLimit: true },
  ],
  regions: [
    { id: 3, title: 'Khám phá Miền Trung', description: 'Hành trình di sản Đà Nẵng - Huế - Hội An giảm ngay 25%.', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070', tag: 'Miền Trung', timeLimit: 'Vô thời hạn', voucherCode: 'DISANMT', discountPercent: 25 },
    { id: 4, title: 'Tây Bắc Mùa Lúa Chín', description: 'Săn mây Tà Xùa, khám phá Mù Cang Chải với giá siêu hấp dẫn.', image: 'https://images.unsplash.com/photo-1627993322198-281b6ac5a42b?q=80&w=2072', tag: 'Miền Bắc', timeLimit: 'Đến 30/10', voucherCode: 'MUAVANG', discountPercent: 15, quantityLimit: true },
  ],
  thematic: [
    { id: 5, title: 'Một vòng Việt Nam', description: 'Hành trình xuyên Việt 14 ngày, khám phá mọi miền Tổ quốc.', image: 'https://images.unsplash.com/photo-1543973156-3804b81a7351?q=80&w=2070', tag: 'Xuyên Việt', timeLimit: 'Ưu đãi tháng này', voucherCode: 'VIETNAMOI', discountPercent: 10 },
  ]
};

// Component thẻ khuyến mãi
const PromotionCard = ({ promo, onClaim }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
    <div className="relative">
      <img src={promo.image} alt={promo.title} className="w-full h-56 object-cover" />
      <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{promo.tag}</div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{promo.title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">{promo.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-red-500">{promo.timeLimit}</span>
        <button onClick={() => onClaim(promo)} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
          Săn Voucher
        </button>
      </div>
    </div>
  </div>
);

// Modal voucher
const VoucherModal = ({ promo, onClose }) => {
  if (!promo) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-neutral-200 dark:border-neutral-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Săn Voucher Thành Công!</h2>
        <p className="mb-2 text-neutral-700 dark:text-neutral-300">
          Mã voucher của bạn cho ưu đãi <span className="font-semibold">{promo.title}</span> là:
        </p>
        <p className="font-mono text-xl bg-gray-100 dark:bg-neutral-700 p-3 rounded-lg my-4 text-neutral-800 dark:text-white tracking-widest">{promo.voucherCode}</p>
        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md">
          Đóng
        </button>
      </motion.div>
    </div>
  );
};

export default function PromotionPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);

  const handleClaimVoucher = (promo) => setSelectedPromo(promo);
  const handleCloseModal = () => setSelectedPromo(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 mb-3">Săn Ưu đãi, Vi vu khắp chốn</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Các chương trình khuyến mãi hấp dẫn nhất được cập nhật mỗi ngày đang chờ bạn!
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8 flex items-center gap-3">
              <FiTag className="text-blue-500"/>Ưu đãi theo Dịp lễ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promotionsData.events.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} onClaim={handleClaimVoucher} />
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8 flex items-center gap-3">
              <FiTag className="text-blue-500"/>Ưu đãi theo Vùng miền
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promotionsData.regions.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} onClaim={handleClaimVoucher} />
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8 flex items-center gap-3">
              <FiTag className="text-blue-500"/>Ưu đãi Đặc biệt
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              {promotionsData.thematic.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} onClaim={handleClaimVoucher} />
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>

      <VoucherModal promo={selectedPromo} onClose={handleCloseModal} />
    </div>
  );
}

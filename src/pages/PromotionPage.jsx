// src/components/PromotionPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag } from 'react-icons/fi';

// Fake data
const promotionsData = {
  events: [
    { id: 1, title: 'Đại Lễ 2/9', description: 'Vi vu không lo về giá, giảm đến 30% tour toàn quốc.', image: 'https://images.unsplash.com/photo-1597093278291-a205a1e7a36f?q=80&w=2070', tag: 'Lễ 2/9', timeLimit: 'Còn 3 ngày', voucherCode: 'LEQUOCKHANH', discountPercent: 30 },
    { id: 2, title: 'Chào hè rực rỡ', description: 'Ưu đãi đặc biệt cho các tour biển đảo.', image: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?q=80&w=2070', tag: 'Tour hè', timeLimit: 'Đến 31/08', voucherCode: 'HEVUI', discountPercent: 20, quantityLimit: true },
  ],
  regions: [
    { id: 3, title: 'Khám phá Miền Trung', description: 'Hành trình di sản Đà Nẵng - Huế - Hội An giảm ngay 25%.', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070', tag: 'Miền Trung', timeLimit: 'Vô thời hạn', voucherCode: 'DISANMT', discountPercent: 25 },
    { id: 4, title: 'Tây Bắc Mùa Lúa Chín', description: 'Săn mây Tà Xùa, khám phá Mù Cang Chải với giá siêu hấp dẫn.', image: 'https://images.unsplash.com/photo-1627993322198-281b6ac5a42b?q=80&w=2072', tag: 'Miền Bắc', timeLimit: 'Đến 30/10', voucherCode: 'MUAVANG', discountPercent: 15, quantityLimit: true },
  ],
  thematic: [
    { id: 5, title: 'Một vòng Việt Nam', description: 'Hành trình xuyên Việt 14 ngày, khám phá mọi miền Tổ quốc.', image: 'https://images.unsplash.com/photo-1543973156-3804b81a7351?q=80&w=2070', tag: 'Xuyên Việt', timeLimit: 'Ưu đãi tháng này', voucherCode: 'VIETNAMOI', discountPercent: 10 },
  ]
};

// Card promotion, gọi Resend API
const PromotionCard = ({ promo }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClaim = async () => {
    setIsLoading(true);
    setStatus('Đang gửi...');
    try {
      const res = await fetch('/api/send-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'khachhang@example.com', // thay bằng email người dùng
          promo 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('🎉 Gửi thành công! Kiểm tra mail của bạn.');
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      } else {
        setStatus('❌ Gửi thất bại: ' + (data.error || 'Thử lại sau'));
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Gửi thất bại, thử lại sau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-md border-2 transition-all duration-300 cursor-pointer
      ${isSuccess ? 'border-green-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'border-transparent'}
      ${isLoading ? 'opacity-70' : ''}
    `} onClick={handleClaim}>
      <img src={promo.image} alt={promo.title} className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105" />
      <div className="absolute top-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold">{promo.tag}</div>
      <div className="absolute top-4 right-4 bg-white/80 text-teal-700 px-2 py-1 rounded text-xs font-semibold">-{promo.discountPercent}%</div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-teal-700">{promo.title}</h3>
        <p className="text-sm text-gray-700">{promo.description}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs text-gray-500">{promo.timeLimit}</span>
          <button className={`bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-teal-600 transition-colors`}>
            {isLoading ? 'Đang gửi...' : 'Săn ngay'}
          </button>
        </div>
        {status && <p className={`mt-1 text-xs ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>{status}</p>}
      </div>
    </div>
  );
};

// Promotion page
export default function PromotionPage() {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

  return (
    <div className="bg-gradient-to-b from-blue-50 via-blue-100 to-white min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-700 mb-3">Săn Ưu đãi, Vi vu khắp chốn</h1>
          <p className="text-gray-700 max-w-2xl mx-auto">Các chương trình khuyến mãi hấp dẫn được cập nhật mỗi ngày đang chờ bạn!</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center gap-2"><FiTag className="text-teal-400"/>Ưu đãi theo Dịp lễ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotionsData.events.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} />
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center gap-2"><FiTag className="text-teal-400"/>Ưu đãi theo Vùng miền</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotionsData.regions.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} />
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center gap-2"><FiTag className="text-teal-400"/>Ưu đãi Đặc biệt</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {promotionsData.thematic.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} />
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

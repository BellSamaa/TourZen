import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag } from 'react-icons/fi';
import emailjs from '@emailjs/browser';

// Dữ liệu khuyến mãi
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

// Card khuyến mãi
const PromotionCard = ({ promo, onClaim }) => (
  <div className="bg-gradient-to-tr from-white via-blue-50 to-blue-100 rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-transform duration-300 border border-blue-200">
    <div className="relative overflow-hidden rounded-t-3xl">
      <img
        src={promo.image}
        alt={promo.title}
        className="w-full h-56 object-cover transition-transform duration-700 ease-in-out hover:scale-110"
      />
      <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        {promo.tag}
      </div>
      <div className="absolute top-4 right-4 bg-white/80 text-blue-600 font-semibold px-2 py-1 rounded-md text-xs shadow-md">
        -{promo.discountPercent}%
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-2xl font-extrabold text-blue-800 mb-2">{promo.title}</h3>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{promo.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-red-500">{promo.timeLimit}</span>
        <button
          onClick={() => onClaim(promo)}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300 animate-pulse"
        >
          Săn Voucher
        </button>
      </div>
    </div>
  </div>
);

// Modal hiển thị voucher & điền thông tin
const VoucherModal = ({ promo, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState('');

  if (!promo) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang gửi...');
    try {
      await emailjs.send(
        'service_8w8xy0f',
        'template_lph7t7t',
        {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          voucher_code: promo.voucherCode,
          promo_title: promo.title,
        },
        'mXugIgN4N-oD4WVZZ'
      );
      setStatus('Gửi thành công! Kiểm tra mail của bạn.');
    } catch (err) {
      console.error(err);
      setStatus('Gửi thất bại, thử lại sau.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-xl text-center max-w-sm w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Săn Voucher: {promo.title}</h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">Mã voucher: <span className="font-mono bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">{promo.voucherCode}</span></p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <input type="tel" name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-full font-bold hover:bg-blue-700 transition-colors">Gửi Voucher</button>
        </form>

        {status && <p className="mt-2 text-sm text-green-600">{status}</p>}

        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors">
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

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

  return (
    <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 mb-3">Săn Ưu đãi, Vi vu khắp chốn</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Các chương trình khuyến mãi hấp dẫn nhất được cập nhật mỗi ngày đang chờ bạn!</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
          {/* Section Dịp lễ */}
          <section>
            <h2 className="text-3xl font-bold text-blue-800 mb-8 flex items-center gap-3"><FiTag className="text-blue-500"/>Ưu đãi theo Dịp lễ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promotionsData.events.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} onClaim={handleClaimVoucher} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section Vùng miền */}
          <section>
            <h2 className="text-3xl font-bold text-blue-800 mb-8 flex items-center gap-3"><FiTag className="text-blue-500"/>Ưu đãi theo Vùng miền</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promotionsData.regions.map(promo => (
                <motion.div key={promo.id} variants={cardVariants}>
                  <PromotionCard promo={promo} onClaim={handleClaimVoucher} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section Đặc biệt */}
          <section>
            <h2 className="text-3xl font-bold text-blue-800 mb-8 flex items-center gap-3"><FiTag className="text-blue-500"/>Ưu đãi Đặc biệt</h2>
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

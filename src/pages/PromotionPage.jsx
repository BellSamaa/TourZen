import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag } from 'react-icons/fi';
import PromotionCard from './PromotionCard';
import { toast } from 'react-hot-toast';

const promotionsData = { /* ... dữ liệu promo ... */ };

const VoucherModal = ({ promo, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState('');

  if (!promo) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Đang gửi...');
    try {
      const res = await fetch('/api/send-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo, email: form.email, name: form.name, phone: form.phone })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('🎉 Gửi thành công! Kiểm tra mail của bạn.');
        toast.success('Email voucher đã được gửi!');
      } else {
        setStatus('❌ Gửi thất bại: ' + (data.error || 'Lỗi server'));
        toast.error('Gửi voucher thất bại');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Gửi thất bại, thử lại sau.');
      toast.error('Gửi voucher thất bại');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Săn Voucher: {promo.title}</h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">Mã voucher: <span className="font-mono bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">{promo.voucherCode}</span></p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <input type="tel" name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-full font-bold hover:bg-blue-700 transition-colors">
            Gửi Voucher
          </button>
        </form>

        {status && <p className="mt-2 text-sm text-green-600">{status}</p>}
        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors">Đóng</button>
      </motion.div>
    </div>
  );
};

export default function PromotionPage() {
  const [selectedPromo, setSelectedPromo] = useState(null);

  const handleClaimVoucher = (promo) => setSelectedPromo(promo);
  const handleCloseModal = () => setSelectedPromo(null);

  return (
    <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-700 mb-3">Săn Ưu đãi, Vi vu khắp chốn</h1>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Các chương trình khuyến mãi hấp dẫn đang chờ bạn!</p>
        </motion.div>

        <div className="space-y-12">
          {Object.keys(promotionsData).map(section => (
            <section key={section}>
              <h2 className="text-2xl font-bold text-teal-600 mb-6 flex items-center gap-2">
                <FiTag className="text-teal-400"/> {section === 'events' ? 'Dịp lễ' : section === 'regions' ? 'Vùng miền' : 'Đặc biệt'}
              </h2>
              <div className={`grid grid-cols-1 md:grid-cols-${section === 'thematic' ? 1 : 2} gap-6`}>
                {promotionsData[section].map(promo => (
                  <PromotionCard key={promo.id} promo={promo} onClaim={handleClaimVoucher} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <VoucherModal promo={selectedPromo} onClose={handleCloseModal} />
    </div>
  );
}

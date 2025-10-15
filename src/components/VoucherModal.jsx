// src/components/VoucherModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function VoucherModal({ promo, onClose }) {
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
        body: JSON.stringify({ email: form.email, promo, name: form.name, phone: form.phone })
      });
      const data = await res.json();
      if (res.ok) setStatus('🎉 Gửi thành công! Kiểm tra mail của bạn.');
      else setStatus('❌ Gửi thất bại: ' + (data.error || 'Thử lại sau.'));
    } catch (err) {
      console.error(err);
      setStatus('❌ Gửi thất bại, thử lại sau.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-lg text-center max-w-sm w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-3 text-teal-600">Săn Voucher: {promo.title}</h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">Mã voucher: <span className="font-mono bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">{promo.voucherCode}</span></p>

        <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Họ và tên" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <input type="tel" name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg" />
          <button type="submit" className="w-full bg-teal-500 text-white py-2 rounded-full font-semibold hover:bg-teal-600 transition-colors">Gửi Voucher</button>
        </form>

        {status && <p className="mt-2 text-sm text-green-600">{status}</p>}

        <button onClick={onClose} className="mt-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors">
          Đóng
        </button>
      </motion.div>
    </div>
  );
}

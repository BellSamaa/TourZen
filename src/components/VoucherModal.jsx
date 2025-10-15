// src/components/VoucherModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function VoucherModal({ promo, onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    if (promo) {
      setIsClaimed(false);
      setEmail('');
      setName('');
      setPhone('');
      setError('');
      setIsLoading(false);
    }
  }, [promo]);

  useEffect(() => {
    if (!promo) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [promo]);

  if (!promo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      setError('Vui lòng điền đầy đủ Họ tên, SĐT và Email.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer re_fEAkkZm4_7do16hgga5NUWenjbag35DZo`
        },
        body: JSON.stringify({
          from: 'noreply@yourdomain.com',
          to: [email],
          subject: `Voucher ${promo.voucherCode} cho ${promo.title}`,
          text: `Chào ${name},

Bạn vừa săn thành công voucher "${promo.voucherCode}" cho chương trình "${promo.title}" với ưu đãi giảm ${promo.discountPercent}%.
Số điện thoại của bạn: ${phone}

Voucher sẽ được sử dụng theo điều kiện áp dụng của chương trình.
Cảm ơn bạn đã tham gia!

- TourZen`,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi gửi mail. Vui lòng thử lại.');
      }

      setIsClaimed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <img src={promo.image} alt={promo.title} className="w-full h-48 object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60">
            <X size={20} />
          </button>
          
          <div className="p-8 text-center">
            {isClaimed ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <CheckCircle size={60} className="mx-auto text-green-500" />
                <h2 className="text-2xl font-bold mt-4">Săn Voucher Thành Công!</h2>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">Mã giảm giá đã được gửi đến email <span className="font-semibold text-primary">{email}</span></p>
                <div className="mt-6 bg-primary-50 dark:bg-neutral-700 border-2 border-dashed border-primary-200 dark:border-neutral-600 rounded-lg p-4">
                  <p className="text-sm text-neutral-500">Mã của bạn:</p>
                  <p className="text-3xl font-extrabold text-primary tracking-widest">{promo.voucherCode}</p>
                </div>
                <p className="mt-4 text-xs text-neutral-500">Lưu ý: Voucher có giới hạn về số lượng và thời gian sử dụng.</p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{promo.title}</h2>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">Giảm ngay <span className="font-bold text-secondary">{promo.discountPercent}%</span> cho các tour trong chương trình.</p>
                
                <div className="my-6 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 font-bold text-2xl py-2 rounded-lg">
                  Kết thúc sau: {formatTime(timeLeft)}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Họ tên"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:bg-neutral-700 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:bg-neutral-700 focus:ring-primary focus:border-primary"
                  />
                  <div className="flex">
                    <input 
                      type="email"
                      placeholder="Email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 dark:bg-neutral-700 focus:ring-primary focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary-dark text-white font-bold px-6 rounded-r-lg flex items-center justify-center w-36 disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Săn Voucher'}
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

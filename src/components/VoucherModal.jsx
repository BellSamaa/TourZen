// src/components/VoucherModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function VoucherModal({ promo, onClose }) {
  const [email, setEmail] = useState('');
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600);

  // ✅ FIX: Thêm useEffect để reset trạng thái khi voucher mới được chọn
  useEffect(() => {
    // Bất cứ khi nào component nhận một 'promo' mới (tức là bạn click vào 1 thẻ khác)
    // chúng ta sẽ reset lại toàn bộ trạng thái bên trong của nó.
    if (promo) {
      setIsClaimed(false);
      setEmail('');
      setError('');
      setIsLoading(false);
    }
  }, [promo]); // Mảng phụ thuộc [promo] đảm bảo effect này chỉ chạy khi promo thay đổi.


  useEffect(() => {
    if (!promo) return;
    // Đồng hồ đếm ngược
    const timer = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [promo]);

  if (!promo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/send-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, promo }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
      setIsClaimed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
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
          className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-lifted w-full max-w-lg overflow-hidden"
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
                
                <form onSubmit={handleSubmit}>
                  <p className="mb-2 text-sm font-semibold">Nhập email để nhận mã giảm giá!</p>
                  <div className="flex">
                    <div className="relative flex-grow">
                      <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        required 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-l-md border-neutral-300 dark:bg-neutral-700 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-primary hover:bg-primary-dark text-white font-bold px-6 rounded-r-md transition-colors flex items-center justify-center w-36 disabled:opacity-70"
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
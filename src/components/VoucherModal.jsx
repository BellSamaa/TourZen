import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function VoucherModal({ promo, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    if (promo) {
      setForm({ name: '', phone: '', email: '' });
      setIsClaimed(false);
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/send-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo, ...form }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
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

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const buttonHover = {
    scale: 1.05,
    boxShadow: '0 0 15px rgba(59,130,246,0.6)',
    transition: { type: 'spring', stiffness: 300 }
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
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">Mã giảm giá đã được gửi đến email <span className="font-semibold text-primary">{form.email}</span></p>
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

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-3 text-left"
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >
                  <motion.input
                    type="text"
                    name="name"
                    placeholder="Họ và tên"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg"
                    variants={inputVariants}
                  />
                  <motion.input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg"
                    variants={inputVariants}
                  />
                  <motion.div className="relative" variants={inputVariants}>
                    <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border"
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={buttonHover}
                    className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-bold py-2 rounded-lg flex justify-center items-center disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Săn Voucher'}
                  </motion.button>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </motion.form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

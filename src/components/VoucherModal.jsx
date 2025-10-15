import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Loader2, User, Phone } from 'lucide-react';

export default function VoucherModal({ promo, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (promo) {
      setIsClaimed(false);
      setName('');
      setPhone('');
      setEmail('');
      setError('');
      setIsLoading(false);
    }
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
        body: JSON.stringify({ name, phone, email, promo }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Có lỗi xảy ra');

      setIsClaimed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl w-full max-w-lg p-8"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 dark:bg-white/20 text-white dark:text-black p-2 rounded-full hover:bg-black/50 dark:hover:bg-white/40 transition"
          >
            <X size={20} />
          </button>

          {isClaimed ? (
            <div className="text-center space-y-4">
              <CheckCircle size={60} className="mx-auto text-green-500" />
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Săn Voucher Thành Công!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Mã giảm giá đã được gửi đến email <span className="font-semibold text-primary">{email}</span>
              </p>
              <div className="mt-4 bg-primary-50 dark:bg-neutral-800 border-2 border-dashed border-primary-300 dark:border-neutral-600 rounded-lg p-4">
                <p className="text-sm text-neutral-500">Mã của bạn:</p>
                <p className="text-3xl font-extrabold text-primary tracking-widest">{promo.voucherCode}</p>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white text-center">{promo.title}</h2>
              <div className="flex items-center gap-2">
                <User className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Họ tên"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-neutral-400" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition flex justify-center items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Săn Voucher'}
              </button>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

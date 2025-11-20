// src/components/IdentityPromptPopup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { IdentificationCard, WarningCircle, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IdentityPromptPopup() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra cờ (flag) được đặt từ trang Login
    const prompt = localStorage.getItem('show_identity_prompt');
    
    if (prompt === 'true') {
      setIsOpen(true);
      
      // Xóa cờ ngay sau khi đọc để nó không hiển thị lại
      // khi người dùng F5 trang.
      localStorage.removeItem('show_identity_prompt');
    }
  }, []); // Chạy 1 lần duy nhất khi component được tải

  const handleNavigate = () => {
    // Gửi user đến trang profile
    // (Profile.jsx của bạn sẽ tự động mở tab 'identity' nếu chưa xác thực)
    navigate('/profile'); 
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog 
          static
          open={isOpen} 
          onClose={handleClose} 
          className="relative z-50"
        >
          {/* Lớp nền mờ */}
          <motion.div
            className="fixed inset-0 bg-black/30"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Nội dung Popup */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
                <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <WarningCircle size={24} className="text-yellow-500" />
                  Bảo mật tài khoản
                </Dialog.Title>
                <p className="mt-3 text-sm text-slate-600">
                  Cảm ơn bạn đã đăng ký! Hãy <strong>xác thực CMND/CCCD</strong> để tăng cường bảo mật và hỗ trợ khôi phục tài khoản khi bạn quên mật khẩu.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Để sau
                  </button>
                  <button
                    type="button"
                    onClick={handleNavigate}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
                  >
                    <IdentificationCard size={18} />
                    Xác thực ngay
                  </button>
                </div>
                
                {/* Nút X để đóng */}
                <button 
                  onClick={handleClose} 
                  className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </Dialog.Panel>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
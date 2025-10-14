// src/pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Giả sử bạn dùng CartContext
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

// Hàm định dạng tiền tệ
const formatPrice = (num) => num.toLocaleString('vi-VN') + '₫';

// Component cho một sản phẩm trong giỏ hàng
function CartItem({ item, updateQuantity, removeItem }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      className="flex items-center gap-4 py-4 border-b border-neutral-200 dark:border-neutral-700"
    >
      <img src={item.image} alt={item.title} className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover shadow-sm" />
      <div className="flex-grow">
        <h3 className="font-bold text-neutral-800 dark:text-white">{item.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.location}</p>
        <p className="text-primary font-semibold mt-1">{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 disabled:opacity-50" disabled={item.quantity <= 1}>
          <Minus size={16} />
        </button>
        <span className="font-bold w-8 text-center">{item.quantity}</span>
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300">
          <Plus size={16} />
        </button>
      </div>
      <div className="text-right w-32 hidden md:block">
        <p className="font-bold text-lg text-primary">{formatPrice(item.price * item.quantity)}</p>
      </div>
      <button onClick={() => removeItem(item.id)} className="text-neutral-500 hover:text-red-500 transition-colors">
        <Trash2 size={20} />
      </button>
    </motion.div>
  );
}

// Component khi giỏ hàng trống
function EmptyCart() {
    return (
        <div className="text-center py-20">
            <ShoppingBag size={80} className="mx-auto text-neutral-300 dark:text-neutral-600" />
            <h2 className="mt-6 text-2xl font-bold text-neutral-700 dark:text-neutral-300">Giỏ hàng của bạn đang trống</h2>
            <p className="mt-2 text-neutral-500">Hãy cùng khám phá các tour du lịch tuyệt vời nhé!</p>
            <Link to="/tours" className="mt-6 inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105">
                Xem tất cả tour
            </Link>
        </div>
    )
}

// Trang giỏ hàng chính
export default function CartPage() {
  // Thay thế bằng logic context thật của bạn
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart() || { 
    cartItems: [
        { id: 3, title: "Phú Quốc – Thiên đường nghỉ dưỡng", location: "Kiên Giang", price: 5890000, quantity: 1, image: '/images/phuquoc.jpg' },
        { id: 5, title: "Đà Nẵng – Hội An – Cố đô Huế", location: "Miền Trung", price: 6590000, quantity: 2, image: '/images/danang.jpg' },
    ], 
    updateQuantity: (id, qty) => console.log(`Update ${id} to ${qty}`),
    removeItem: id => console.log(`Remove ${id}`),
    clearCart: () => console.log('Clear cart')
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // Giả sử thuế 8%
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-6 py-12">
      <AnimatePresence>
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-white">Giỏ hàng của bạn</h1>
              <p className="text-neutral-500 mt-2">Bạn đang có {cartItems.length} sản phẩm trong giỏ hàng.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cột danh sách sản phẩm */}
              <div className="w-full lg:w-2/3 bg-white dark:bg-neutral-800 rounded-xl shadow-soft p-6">
                <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-neutral-500 uppercase border-b pb-2">
                  <div className="flex-grow">Sản phẩm</div>
                  <div className="w-32 text-center">Số lượng</div>
                  <div className="w-32 text-right">Tạm tính</div>
                  <div className="w-10"></div>
                </div>
                <div>
                  <AnimatePresence>
                    {cartItems.map(item => (
                      <CartItem key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <Link to="/tours" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                        <ArrowLeft size={16} />
                        Tiếp tục mua sắm
                    </Link>
                    <button onClick={clearCart} className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
                        Xóa tất cả
                    </button>
                </div>
              </div>

              {/* Cột tóm tắt và thanh toán */}
              <aside className="w-full lg:w-1/3">
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft p-6 sticky top-28">
                  <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4 border-b pb-2">Tóm tắt đơn hàng</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                        <span>Tạm tính</span>
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                        <span>Thuế (VAT 8%)</span>
                        <span className="font-semibold">{formatPrice(tax)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg text-neutral-800 dark:text-white">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Mã giảm giá</p>
                    <div className="flex">
                      <input type="text" placeholder="Nhập mã ở đây" className="w-full rounded-l-md border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600 focus:ring-primary focus:border-primary"/>
                      <button className="bg-neutral-800 dark:bg-neutral-600 text-white px-4 rounded-r-md font-semibold hover:bg-black">Áp dụng</button>
                    </div>
                  </div>
                  <button className="mt-6 w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 text-lg shadow-lg">
                    Tiến hành thanh toán
                  </button>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
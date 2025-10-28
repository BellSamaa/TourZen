// src/pages/CartPage.jsx
// (SỬA LẠI NÚT THANH TOÁN)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

// Hàm định dạng tiền tệ
const formatPrice = (num) => typeof num === 'number' ? num.toLocaleString('vi-VN') + '₫' : '0₫'; // Added check for number type

// Component CartItem (Giữ nguyên)
function CartItem({ item, updateQuantity, removeItem }) {
  // Check if item and item.price exist before accessing properties
  const itemPrice = item && typeof item.price === 'number' ? item.price : 0;
  const itemQuantity = item && typeof item.quantity === 'number' ? item.quantity : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      className="flex items-center gap-4 py-4 border-b border-neutral-200 dark:border-neutral-700"
    >
      <img src={item?.image || '/images/default.jpg'} alt={item?.title || 'Tour image'} className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover shadow-sm flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src='/images/default.jpg'; }} />
      <div className="flex-grow min-w-0"> {/* Added min-w-0 */}
        <h3 className="font-bold text-neutral-800 dark:text-white truncate">{item?.title || 'Tour không tên'}</h3> {/* Added truncate */}
        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{item?.location || 'Chưa rõ'}</p> {/* Added truncate */}
        <p className="text-primary font-semibold mt-1">{formatPrice(itemPrice)}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0"> {/* Added flex-shrink-0 */}
        <button onClick={() => updateQuantity(item.id, itemQuantity - 1)} className="p-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 disabled:opacity-50" disabled={itemQuantity <= 1}>
          <Minus size={16} />
        </button>
        <span className="font-bold w-8 text-center">{itemQuantity}</span>
        <button onClick={() => updateQuantity(item.id, itemQuantity + 1)} className="p-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300">
          <Plus size={16} />
        </button>
      </div>
      <div className="text-right w-32 hidden md:block flex-shrink-0"> {/* Added flex-shrink-0 */}
        <p className="font-bold text-lg text-primary">{formatPrice(itemPrice * itemQuantity)}</p>
      </div>
      <button onClick={() => removeItem(item.id)} className="text-neutral-500 hover:text-red-500 transition-colors flex-shrink-0"> {/* Added flex-shrink-0 */}
        <Trash2 size={20} />
      </button>
    </motion.div>
  );
}

// Component EmptyCart (Giữ nguyên)
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
  const navigate = useNavigate(); // <-- Thêm hook useNavigate
  const { cartItems = [], updateQuantity, removeItem, clearCart } = useCart() || { // Default to empty array and provide defaults
    cartItems: [],
    updateQuantity: (id, qty) => console.log(`Update ${id} to ${qty}`),
    removeItem: id => console.log(`Remove ${id}`),
    clearCart: () => console.log('Clear cart')
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // <-- Thêm hàm xử lý khi bấm nút thanh toán -->
  const handleCheckout = () => {
      // Có thể thêm kiểm tra giỏ hàng có rỗng không ở đây nếu cần
      if (cartItems.length > 0) {
          navigate('/payment'); // Chuyển hướng đến trang Payment
      } else {
          // Thông báo cho người dùng nếu giỏ hàng trống (tùy chọn)
          alert("Giỏ hàng đang trống, không thể thanh toán.");
      }
  };

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
                       // Ensure item has a unique key, fallback to id if key is missing
                      <CartItem key={item.key || item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
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
                  {/* Mã giảm giá (Giữ nguyên) */}
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Mã giảm giá</p>
                    <div className="flex">
                      <input type="text" placeholder="Nhập mã ở đây" className="w-full rounded-l-md border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600 focus:ring-primary focus:border-primary"/>
                      <button className="bg-neutral-800 dark:bg-neutral-600 text-white px-4 rounded-r-md font-semibold hover:bg-black">Áp dụng</button>
                    </div>
                  </div>
                  {/* --- SỬA NÚT THANH TOÁN --- */}
                  <button
                    onClick={handleCheckout} // Gọi hàm xử lý khi bấm
                    className="mt-6 w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 text-lg shadow-lg"
                  >
                    Tiến hành thanh toán
                  </button>
                  {/* --- KẾT THÚC SỬA --- */}
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
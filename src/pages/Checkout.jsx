// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaRegStickyNote, FaCreditCard, FaSpinner } from 'react-icons/fa';

// 👇 THÊM 2 DÒNG NÀY 👇
import { getSupabase } from "../lib/supabaseClient";
const supabase = getSupabase();

// ... (Phần code còn lại của component giữ nguyên) ...

const InputField = ({ icon: Icon, ...props }) => (
    // ... (Component InputField giữ nguyên)
     <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="text-gray-400" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
      />
    </div>
);


export default function Checkout() {
    const { items: cartItems, total, clearCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy thông tin user đăng nhập (nếu có)
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true); // Thêm state loading user

    const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '', address: '' });
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('direct'); // Giả sử mặc định là trực tiếp
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const formatCurrency = (num) => { /* ... */ }; // Giữ nguyên hàm format

     // Lấy thông tin người dùng khi component mount
     useEffect(() => {
        async function getUserData() {
            setLoadingUser(true); // Bắt đầu loading
            // Giờ 'supabase' đã được định nghĩa
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error("Lỗi lấy auth user:", authError);
                // Có thể không cần báo lỗi ở đây, user có thể chưa đăng nhập
            } else if (user) {
                setCurrentUser(user);
                setContactInfo(prev => ({ ...prev, email: user.email }));

                const { data: userData, error: userError } = await supabase
                    .from('Users')
                    .select('full_name') // Chỉ lấy tên
                    .eq('id', user.id)
                    .single();

                 if (userError) {
                    console.error("Lỗi lấy user details:", userError);
                 } else if (userData) {
                    setContactInfo(prev => ({
                        ...prev,
                        name: userData.full_name || prev.name,
                    }));
                 }
            }
            setLoadingUser(false); // Kết thúc loading
        }
        getUserData();
     }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setError(''); // Reset lỗi
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
            setError("Vui lòng điền đầy đủ thông tin liên lạc (Họ tên, Điện thoại, Email)."); return;
        }
        if (!agreedToTerms) {
            setError("Bạn phải đồng ý với Điều khoản & Chính sách."); return;
        }
        if (!currentUser && !loadingUser) { // Chỉ kiểm tra nếu đã load xong user
             setError("Bạn cần đăng nhập để hoàn tất đặt tour.");
             navigate('/login', { state: { from: location } });
             return;
         }

        setIsSubmitting(true);

        const bookingPromises = cartItems.map((item) => {
            const quantity = (item.adults || 0) + (item.children || 0);
            const itemTotalPrice = (item.adults * item.priceAdult) + ((item.children || 0) * (item.priceChild || 0)) + (item.singleSupplement || 0);
            const departureDate = item.departureDates?.[0];

             if (!departureDate) {
                 console.error(`Tour "${item.title}" thiếu ngày khởi hành.`);
                 // Ném lỗi để Promise.all bắt được
                 throw new Error(`Tour "${item.title}" thiếu thông tin ngày khởi hành.`);
             }

            return supabase.from('Bookings').insert({
                user_id: currentUser.id,
                product_id: item.tourId,
                quantity: quantity,
                total_price: itemTotalPrice,
                status: 'pending',
                notes: notes,
                departure_date: departureDate,
                num_adults: item.adults,
                num_children: item.children || 0,
                num_infants: item.infants || 0,
                // Thêm các trường khác nếu cần
            });
        });

        try {
            const results = await Promise.all(bookingPromises);
            const anyError = results.some((result) => result.error);

            if (anyError) {
                const firstError = results.find(r => r.error)?.error;
                throw new Error(firstError?.message || "Lỗi khi tạo một hoặc nhiều đơn hàng.");
            }

            // Gửi email (Giữ nguyên logic của bạn nếu có)
            // ... await fetch('/api/sendEmail', {...}) ...

            clearCart();
            navigate('/payment-success'); // Hoặc trang thành công của bạn

        } catch (err) {
            console.error("Lỗi checkout:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- (Phần JSX của bạn giữ nguyên) ---
    // Đảm bảo JSX sử dụng đúng các state (contactInfo, notes, agreedToTerms, etc.)
    // và gọi đúng hàm handleCheckout khi submit form.
    return (
     <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Thanh Toán Đơn Hàng</h1>
            {loadingUser ? (
                 <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-3xl text-sky-500" />
                 </div>
            ) : (
             <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột trái: Thông tin & Thanh toán */}
                <div className="space-y-6">
                    {/* Thông tin liên lạc */}
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Thông Tin Liên Lạc</h2>
                        <div className="space-y-4">
                            <InputField icon={FaUser} name="name" placeholder="Họ và tên *" value={contactInfo.name} onChange={handleInputChange} required />
                            <InputField icon={FaPhone} name="phone" type="tel" placeholder="Số điện thoại *" value={contactInfo.phone} onChange={handleInputChange} required />
                            <InputField icon={FaEnvelope} name="email" type="email" placeholder="Email *" value={contactInfo.email} onChange={handleInputChange} required disabled={!!currentUser} />
                            <InputField icon={FaMapMarkerAlt} name="address" placeholder="Địa chỉ (không bắt buộc)" value={contactInfo.address} onChange={handleInputChange} />
                             {currentUser && <p className="text-xs text-green-600">Đặt hàng với tài khoản: {currentUser.email}</p>}
                             {!currentUser && <p className="text-xs text-blue-600">Bạn cần <Link to="/login" state={{ from: location }} className="underline font-medium">đăng nhập</Link> để tiếp tục.</p>}
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 dark:text-white">Ghi Chú Đơn Hàng</h2>
                        <textarea
                            name="notes"
                            placeholder="Yêu cầu đặc biệt (ví dụ: ăn chay, phòng tầng cao...)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                        ></textarea>
                    </div>

                     {/* Phương thức thanh toán (Giữ nguyên nếu bạn có logic này) */}
                     {/* <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow"> ... </div> */}

                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow sticky top-24 self-start"> {/* Thêm sticky */}
                    <h2 className="text-xl font-semibold mb-4 border-b pb-3 dark:text-white">Tóm Tắt Đơn Hàng</h2>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map((item) => {
                             const itemTotal = (item.adults * item.priceAdult) + ((item.children || 0) * item.priceChild) + (item.singleSupplement || 0);
                             return (
                                <div key={item.key} className="flex justify-between items-start text-sm border-b pb-2 last:border-0 dark:border-neutral-700">
                                    <div className="pr-2">
                                        <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.adults} NL, {item.children || 0} TE
                                        </p>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                        {formatCurrency(itemTotal)}
                                    </span>
                                </div>
                             );
                        })}
                    </div>
                    <div className="border-t pt-4 dark:border-neutral-700">
                        <div className="flex justify-between items-center text-xl font-bold dark:text-white">
                            <span>Tổng cộng:</span>
                            <span className="text-red-600">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Điều khoản */}
                    <div className="mt-6">
                        <label className="flex items-center text-sm">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 mr-2 accent-sky-600"/>
                            <span className="text-gray-600 dark:text-gray-300">Tôi đồng ý với <a href="#" className="text-sky-600 underline">Điều khoản & Chính sách</a>.</span>
                        </label>
                    </div>

                    {/* Thông báo lỗi */}
                     {error && (
                         <p className="text-sm text-red-600 mt-4">{error}</p>
                     )}

                    {/* Nút Đặt hàng */}
                    <button
                        type="submit"
                        disabled={isSubmitting || loadingUser || (!currentUser && !loadingUser) } // Disable nếu đang load user hoặc chưa đăng nhập
                        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <FaCreditCard />
                        )}
                        <span>
                            {isSubmitting ? "Đang xử lý..." : "Hoàn Tất Đặt Tour"}
                        </span>
                    </button>
                </div>
             </form>
            )}
        </div>
     </div>
    );
}
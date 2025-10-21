// src/pages/Payment.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaShuttleVan, FaUsers, FaSpinner } from "react-icons/fa"; // Thêm FaSpinner
import { IoIosMail, IoIosCall } from "react-icons/io";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();

const InfoInput = ({ icon: Icon, ...props }) => ( // Sửa lại Icon prop
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* Sử dụng Icon component */}
            {Icon && <Icon className="text-gray-400" />}
        </div>
        <input
            {...props}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" // Thêm dark mode styles
        />
    </div>
);


export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    // Sửa lại cách lấy total từ context nếu CartContext cung cấp total
    const { items: cartItemsFromContext, clearCart, total: totalFromContext } = useCart();

    const itemsFromState = location.state?.items;
    const cartItems = itemsFromState || cartItemsFromContext;

    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true); // Thêm state loading user

    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [useShuttle, setUseShuttle] = useState(false);
    const [shuttleAddress, setShuttleAddress] = useState("");

    const shuttlePrice = 400000;
    const discount = 800000;
    const formatCurrency = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
    };

    // Tính lại tổng tiền dựa trên cartItems thực tế (hoặc dùng total từ context nếu có)
    const total = useMemo(() => {
        // Nếu context đã cung cấp total và không phải trường hợp "Đặt Ngay", dùng total đó
        if (totalFromContext !== undefined && !itemsFromState) {
            return totalFromContext;
        }
        // Nếu không, tự tính lại từ cartItems hiện tại
        return cartItems.reduce((sum, item) => {
            const adultPrice = item.priceAdult || item.price || 0; // Thêm fallback cho item.price
            const childPrice = item.priceChild || 0;
            // Tính tổng cho item này (không tính infant)
            const itemTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
            return sum + itemTotal;
        }, 0);
    }, [cartItems, itemsFromState, totalFromContext]);


    const totalPassengers = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0) + (item.infants || 0), 0),
        [cartItems]
    );

    const finalTotal = useMemo(() => {
        const calculatedTotal = total + (useShuttle ? shuttlePrice : 0) - discount;
        return Math.max(0, calculatedTotal);
    }, [total, useShuttle, discount, shuttlePrice]);

    const paymentDeadline = useMemo(() => {
        // Logic tính deadline giữ nguyên
        if (!cartItems || cartItems.length === 0) return new Date();
         const earliestDate =
           cartItems
             .map((item) => item.departureDates?.[0]) // Vẫn lấy ngày đầu tiên nếu có
             .filter(Boolean)
             .map((dateStr) => new Date(dateStr))
             .sort((a, b) => a - b)[0] || new Date(); // Nếu ko có ngày nào thì dùng ngày hiện tại
         earliestDate.setDate(earliestDate.getDate() - 7);
         return earliestDate;
    }, [cartItems]);

    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    useEffect(() => {
        async function getUserData() {
            setLoadingUser(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            if (user) {
                setContactInfo(prev => ({ ...prev, email: user.email }));
                const { data: userData, error } = await supabase
                    .from('Users')
                    .select('full_name') // Chỉ lấy tên
                    .eq('id', user.id)
                    .single();
                if (userData) {
                    setContactInfo(prev => ({
                        ...prev,
                        name: userData.full_name || prev.name,
                    }));
                }
            }
            setLoadingUser(false);
        }
        getUserData();
    }, []);


    const handleInputChange = (e, setState) => setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const showNotification = (message, type = "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        // ... (các kiểm tra input giữ nguyên) ...
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
          showNotification("Vui lòng điền đầy đủ thông tin liên lạc."); return;
        }
        if (useShuttle && !shuttleAddress) {
          showNotification("Vui lòng nhập địa chỉ đưa đón của bạn."); return;
        }
        if (!agreedToTerms) {
          showNotification("Bạn phải đồng ý với các điều khoản và chính sách."); return;
        }

        setIsSubmitting(true);
        const orderId = `TOURZEN-${Date.now()}`;

        if (!currentUser && !loadingUser) { // Chỉ kiểm tra khi đã load xong user
            showNotification("Bạn cần đăng nhập để hoàn tất đặt tour.");
            setIsSubmitting(false);
            navigate('/login', { state: { from: location } });
            return;
        }
        // Đảm bảo currentUser có giá trị trước khi tiếp tục
        if (!currentUser) {
             showNotification("Đang tải thông tin người dùng, vui lòng đợi...");
             setIsSubmitting(false);
             return;
        }


        let bookingErrorOccurred = false;
        const bookingIds = [];

        for (const item of cartItems) {
            const quantity = (item.adults || 0) + (item.children || 0);
            // Lấy giá đúng từ item (priceAdult hoặc price)
            const adultPrice = item.priceAdult ?? item.price ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotalPrice = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);

            // 👇 BỎ HOẶC COMMENT LẠI KHỐI KIỂM TRA NGÀY KHỞI HÀNH 👇
            /*
            const departureDate = item.departureDates?.[0];
            if (!departureDate) {
                console.error(`Tour "${item.title}" thiếu ngày khởi hành.`);
                showNotification(`Tour "${item.title}" thiếu thông tin ngày khởi hành.`);
                bookingErrorOccurred = true;
                break;
            }
            */
            // ---------------------------------------------

            // Lấy tourId đúng cách (tourId hoặc id)
            const productId = item.tourId ?? item.id;
             if (!productId) {
                 console.error(`Item "${item.title}" thiếu ID sản phẩm.`);
                 showNotification(`Sản phẩm "${item.title}" trong giỏ hàng bị lỗi ID.`);
                 bookingErrorOccurred = true;
                 break;
             }

            const { data: bookingData, error: insertError } = await supabase
                .from('Bookings')
                .insert({
                    user_id: currentUser.id,
                    product_id: productId, // Dùng productId đã lấy
                    quantity: quantity,
                    total_price: itemTotalPrice,
                    status: 'pending',
                    notes: notes,
                    // departure_date: departureDate, // <-- Tạm thời bỏ cột này
                    num_adults: item.adults,
                    num_children: item.children || 0,
                    num_infants: item.infants || 0,
                    shuttle_address: useShuttle ? shuttleAddress : null,
                })
                .select('id')
                .single();

            if (insertError) {
                console.error(`Lỗi khi lưu booking cho sản phẩm ${productId}:`, insertError);
                showNotification(`Đã xảy ra lỗi khi lưu đặt chỗ cho "${item.title}". Vui lòng thử lại.`);
                bookingErrorOccurred = true;
                break;
            } else if (bookingData) {
                bookingIds.push(bookingData.id);
            }
        }

        if (bookingErrorOccurred) {
            setIsSubmitting(false);
            return;
        }
        // --- Kết thúc lưu vào Database ---

        // --- Gửi Email Xác Nhận ---
        // ... (Giữ nguyên logic gửi email của bạn) ...
         const tour_details_html = `<ul>${cartItems
           .map(item => `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE, ${item.infants || 0} EB)</li>`)
           .join("")}</ul>`;

         try {
           const response = await fetch("/api/sendEmail", { /* ... */ }); // Giữ nguyên fetch

           if (!response.ok) {
             console.error("Gửi email thất bại, nhưng booking đã được lưu.");
             showNotification("Đặt tour thành công nhưng không thể gửi email xác nhận.", "warning");
           } else {
             showNotification("Đặt tour thành công! Vui lòng kiểm tra email.", "success");
           }

           if (!itemsFromState) {
             clearCart();
           }

           navigate("/payment-success", { state: { /* ... */ } }); // Giữ nguyên navigate

         } catch (error) {
           console.error("Lỗi khi gửi email:", error);
           showNotification("Đặt tour thành công nhưng có lỗi khi gửi email xác nhận.", "warning");
           navigate("/payment-success", { state: { /* ... */ } });
         } finally {
           setIsSubmitting(false);
         }
    };

    if (!cartItems || cartItems.length === 0) {
        return <div className="text-center py-20 text-xl font-semibold dark:text-white">Giỏ hàng của bạn đang trống.</div>; // Thêm dark mode
    }

    return (
        <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8"> {/* Thêm dark mode */}
            {/* --- Phần JSX --- */}
            {/* Giữ nguyên cấu trúc JSX của bạn, nhưng đảm bảo thêm dark mode styles */}
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-800 dark:text-sky-400">XÁC NHẬN ĐẶT TOUR</h1> {/* Thêm dark mode */}
                </div>

                <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Cột trái --- */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông tin liên lạc */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md"> {/* Thêm dark mode */}
                            <h2 className="text-xl font-bold mb-4 dark:text-white">THÔNG TIN LIÊN LẠC</h2> {/* Thêm dark mode */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoInput icon={FaUserFriends} /* ... props ... */ />
                                <InfoInput icon={IoIosCall} /* ... props ... */ />
                                <InfoInput icon={IoIosMail} /* ... props ... */ />
                                <InfoInput icon={FaMapMarkerAlt} /* ... props ... */ />
                            </div>
                            {loadingUser ? (
                                <p className="text-sm text-gray-500 mt-2">Đang tải thông tin người dùng...</p>
                            ) : currentUser ? (
                                <p className="text-sm text-green-600 mt-2">Đang đặt hàng với tài khoản: {currentUser.email}</p>
                            ) : (
                                <p className="text-sm text-blue-600 mt-2">Bạn có muốn <Link to="/login" state={{ from: location }} className="font-bold underline">Đăng nhập</Link> để quản lý đơn hàng?</p>
                            )}
                        </div>

                        {/* Dịch vụ cộng thêm */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md"> {/* Thêm dark mode */}
                           {/* ... JSX Dịch vụ cộng thêm ... */}
                           <h2 className="text-xl font-bold flex items-center gap-2 mb-4 dark:text-white"> {/* Thêm dark mode */}
                               <FaShuttleVan className="text-blue-500" /> DỊCH VỤ CỘNG THÊM
                           </h2>
                           <div className="bg-blue-50 dark:bg-sky-900/30 p-4 rounded-lg"> {/* Thêm dark mode */}
                               <label className="flex items-center cursor-pointer">
                                   <input /* ... */ />
                                   <div className="ml-4 flex-1">
                                       <p className="font-semibold text-blue-800 dark:text-sky-300">TourZen Xpress - Xe đưa đón riêng</p> {/* Thêm dark mode */}
                                       <p className="text-sm text-gray-600 dark:text-gray-400">Tài xế riêng sẽ đón bạn tại nhà/sân bay.</p> {/* Thêm dark mode */}
                                   </div>
                                   <span className="font-bold text-blue-600 dark:text-sky-400">{formatCurrency(shuttlePrice)}</span> {/* Thêm dark mode */}
                               </label>
                               <AnimatePresence>
                                   {useShuttle && (
                                       <motion.div /* ... */ >
                                           <InfoInput icon={FaMapMarkerAlt} /* ... */ />
                                       </motion.div>
                                   )}
                               </AnimatePresence>
                           </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md"> {/* Thêm dark mode */}
                           <h2 className="text-xl font-bold mb-4 dark:text-white">GHI CHÚ</h2> {/* Thêm dark mode */}
                           <textarea /* ... */ className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"/> {/* Thêm dark mode */}
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md"> {/* Thêm dark mode */}
                           <h2 className="text-xl font-bold mb-4 dark:text-white">PHƯƠNG THỨC THANH TOÁN</h2> {/* Thêm dark mode */}
                            {/* ... JSX Phương thức thanh toán ... */}
                            <div className="space-y-4">
                                <label /* ... */ >
                                    <input /* ... */ />
                                    <div className="ml-4">
                                        <p className="font-semibold dark:text-white">Thanh toán trực tiếp</p> {/* Thêm dark mode */}
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Đặt lịch hẹn và thanh toán tại văn phòng.</p> {/* Thêm dark mode */}
                                    </div>
                                </label>
                                <AnimatePresence>
                                    {paymentMethod === "direct" && (
                                        <motion.div /* ... */ className="pl-8 space-y-2 dark:text-gray-300"> {/* Thêm dark mode */}
                                            {/* ... */}
                                            <select /* ... */ className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"/> {/* Thêm dark mode */}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <label /* ... */ >
                                    <input /* ... */ />
                                    <div className="ml-4 flex items-center">
                                        <p className="font-semibold mr-2 dark:text-white">Thanh toán qua VNPay</p> {/* Thêm dark mode */}
                                        {/* ... */}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* --- Cột phải: tóm tắt đơn --- */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md sticky top-8"> {/* Thêm dark mode */}
                           <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-neutral-700 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2> {/* Thêm dark mode */}
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
                                {cartItems.map((item) => (
                                    <div key={item.key || item.id} className="flex gap-4 border-b pb-2 last:border-0 dark:border-neutral-700"> {/* Thêm dark mode */}
                                        {/* ... JSX hình ảnh, tên tour ... */}
                                        <div>
                                           <p className="font-bold text-sm text-blue-800 dark:text-sky-400">{item.title}</p> {/* Thêm dark mode */}
                                           <p className="text-xs text-gray-500 dark:text-gray-400">{`${item.adults || 0} NL, ${ item.children || 0 } TE, ${item.infants || 0} EB`}</p> {/* Thêm dark mode */}
                                           <p className="text-sm font-semibold dark:text-white"> {/* Thêm dark mode */}
                                               {formatCurrency( (item.adults * (item.priceAdult ?? item.price ?? 0)) + ((item.children || 0) * (item.priceChild || 0)) )} {/* Sửa lại tính giá */}
                                           </p>
                                       </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 text-sm border-t pt-4 dark:border-neutral-700 dark:text-gray-300"> {/* Thêm dark mode */}
                               {/* ... JSX Tạm tính, Phí xe, Ưu đãi ... */}
                               <div className="flex justify-between font-semibold"> {/* ... */} </div>
                               <div className="flex justify-between"> {/* ... */} </div>
                               {useShuttle && ( <div className="flex justify-between"> {/* ... */} </div> )}
                               <div className="flex justify-between text-red-600"> {/* ... */} </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center dark:border-neutral-700"> {/* Thêm dark mode */}
                               <span className="text-lg font-bold dark:text-white">Tổng cộng</span> {/* Thêm dark mode */}
                                <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                            </div>

                            <div className="mt-6">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4"/>
                                    <span className="ml-2 text-sm dark:text-gray-300"> Tôi đã đọc và đồng ý với <a href="#" className="text-blue-600"> Chính sách </a> và <a href="#" className="text-blue-600"> Điều khoản </a> . </span> {/* Thêm dark mode */}
                                </label>
                            </div>

                            {/* Thông báo lỗi */}
                            {notification.message && (
                                <p className={`mt-4 text-sm ${notification.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{notification.message}</p>
                            )}

                            <button
                                type="submit"
                                // Cập nhật disable logic
                                disabled={isSubmitting || loadingUser || (!currentUser && !loadingUser)}
                                className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2" // Thêm disabled:cursor-not-allowed
                            >
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCreditCard />} {/* Dùng FaSpinner */}
                                {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"}
                            </button>
                        </div>
                    </aside>
                </form>
            </div>

            {/* Thông báo AnimatePresence giữ nguyên */}
            <AnimatePresence>
                {notification.message && (
                    <motion.div /* ... */ >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
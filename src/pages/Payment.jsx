// src/pages/Payment.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Thêm Link
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

    const { items: cartItemsFromContext, clearCart, total: totalFromContext } = useCart();

    // *** *** *** BẮT ĐẦU SỬA LỖI "ĐẶT NGAY" *** *** ***

    // 1. Kiểm tra xem đây có phải là "Đặt Ngay" không
    const buyNowItem = location.state?.item; // Lấy item SỐ ÍT từ TourDetail
    const isBuyNow = !!buyNowItem; // true nếu là "Đặt Ngay", false nếu là giỏ hàng

    // 2. Tạo mảng cartItems dựa trên ngữ cảnh
    const cartItems = useMemo(() => {
        if (isBuyNow) {
            // Nếu là "Đặt Ngay", tạo một mảng chứa 1 item
            // và chuẩn hóa cấu trúc của nó để giống 1 item trong giỏ hàng
            return [
                {
                    ...buyNowItem, // Chứa (id, name, price, ...)
                    key: `buy-now-${buyNowItem.id}`, // Key duy nhất
                    title: buyNowItem.name,         // Ánh xạ 'name' sang 'title'
                    image: buyNowItem.image_url || (buyNowItem.galleryImages && buyNowItem.galleryImages[0]) || "/images/default.jpg",
                    priceAdult: buyNowItem.price,     // Giá người lớn
                    price: buyNowItem.price,          // Giá gốc
                    adults: 1,                        // Mặc định 1 người lớn cho "Đặt Ngay"
                    children: 0,
                    infants: 0,
                    singleSupplement: 0
                }
            ];
        }
        // Nếu không, dùng giỏ hàng từ context
        return cartItemsFromContext;
    }, [isBuyNow, buyNowItem, cartItemsFromContext]);

    // *** *** *** KẾT THÚC SỬA LỖI "ĐẶT NGAY" *** *** ***

    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true); // Thêm state loading user

    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" }); // Sửa lại thành object
    const [useShuttle, setUseShuttle] = useState(false);
    const [shuttleAddress, setShuttleAddress] = useState("");

    const shuttlePrice = 400000;
    const discount = 800000;
    const formatCurrency = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
    };

    // Tính total (Sửa lại logic)
    const total = useMemo(() => {
        // Hàm tính tổng nội bộ
        const calculateTotal = (items) => {
             return items.reduce((sum, item) => {
                const adultPrice = item.priceAdult ?? item.price ?? 0;
                const childPrice = item.priceChild ?? 0;
                const itemTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
                return sum + itemTotal;
            }, 0);
        };

        if (isBuyNow) {
            // Nếu là "Đặt Ngay", luôn tính toán lại
            return calculateTotal(cartItems);
        }
        
        // Nếu là giỏ hàng, ưu tiên total từ context
        if (totalFromContext !== undefined) {
            return totalFromContext;
        }
        
        // Dự phòng: Nếu giỏ hàng không có total, tự tính
        return calculateTotal(cartItems);

    }, [cartItems, isBuyNow, totalFromContext]);


    const totalPassengers = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0) + (item.infants || 0), 0),
        [cartItems]
    );

    const finalTotal = useMemo(() => {
        const calculatedTotal = total + (useShuttle ? shuttlePrice : 0) - discount;
        return Math.max(0, calculatedTotal);
    }, [total, useShuttle, discount, shuttlePrice]);

    const paymentDeadline = useMemo(() => {
        if (!cartItems || cartItems.length === 0) return new Date();
         const earliestDate =
           cartItems
             .map((item) => item.departureDates?.[0])
             .filter(Boolean)
             .map((dateStr) => new Date(dateStr))
             .sort((a, b) => a - b)[0] || new Date();
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
                const { data: userData } = await supabase
                    .from('Users')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                if (userData) {
                    setContactInfo(prev => ({ ...prev, name: userData.full_name || prev.name }));
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
         if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
           showNotification("Vui lòng điền đầy đủ thông tin liên lạc."); return;
         }
         if (useShuttle && !shuttleAddress) {
           showNotification("Vui lòng nhập địa chỉ đưa đón của bạn."); return;
         }
         if (!agreedToTerms) {
           showNotification("Bạn phải đồng ý với các điều khoản và chính sách."); return;
         }
         if (!currentUser && !loadingUser) {
              showNotification("Bạn cần đăng nhập để hoàn tất đặt tour.");
              setIsSubmitting(false); // Cần set false trước khi navigate
              navigate('/login', { state: { from: location } });
              return;
          }
         if (!currentUser) {
              showNotification("Đang tải thông tin người dùng, vui lòng đợi...");
              return; // Chỉ cần return, isSubmitting vẫn là false
         }


        setIsSubmitting(true);
        const orderId = `TOURZEN-${Date.now()}`;
        let bookingErrorOccurred = false;
        const bookingIds = [];

        for (const item of cartItems) {
            const quantity = (item.adults || 0) + (item.children || 0);
            const adultPrice = item.priceAdult ?? item.price ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotalPrice = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);

            // 👇====== BỎ KIỂM TRA NGÀY KHỞI HÀNH ======👇
            /*
            const departureDate = item.departureDates?.[0];
            if (!departureDate) {
                console.error(`Tour "${item.title}" thiếu ngày khởi hành.`);
                showNotification(`Tour "${item.title}" thiếu thông tin ngày khởi hành.`);
                bookingErrorOccurred = true;
                break;
            }
            */
            // 👆========================================👆

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
                    product_id: productId,
                    quantity: quantity,
                    total_price: itemTotalPrice,
                    status: 'pending',
                    notes: notes,
                    // 👇====== BỎ LƯU NGÀY KHỞI HÀNH ======👇
                    // departure_date: departureDate,
                    // 👆=====================================👆
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

        // --- Gửi Email Xác Nhận ---
        const tour_details_html = `<ul>${cartItems
          .map(item => `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE, ${item.infants || 0} EB)</li>`)
          .join("")}</ul>`;

        try {
          const response = await fetch("/api/sendEmail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  to: contactInfo.email,
                  subject: `TourZen - Xác nhận đặt tour thành công (Mã đơn hàng tạm: ${orderId})`,
                  html: `<h2>Cảm ơn ${contactInfo.name}...</h2> ${tour_details_html} ...`,
              }),
          });

          if (!response.ok) {
            showNotification("Đặt tour thành công nhưng lỗi gửi email.", "warning");
          } else {
            showNotification("Đặt tour thành công! Vui lòng kiểm tra email.", "success");
          }

         // *** *** SỬA LOGIC CLEAR CART *** ***
          if (!isBuyNow) { 
            clearCart(); // Chỉ xóa giỏ hàng nếu đây không phải là "Đặt Ngay"
         }
          
          navigate("/payment-success", { state: {
                method: paymentMethod,
                branch: selectedBranch,
                deadline: formattedDeadline,
                orderId: orderId,
                bookingIds: bookingIds
            } });

        } catch (error) {
          console.error("Lỗi khi gửi email:", error);
          showNotification("Đặt tour thành công nhưng có lỗi khi gửi email.", "warning");
          navigate("/payment-success", { state: { /* ... */ } });
        } finally {
          setIsSubmitting(false);
        }
    };

    // Kiểm tra cartItems (đã được sửa)
    if (!cartItems || cartItems.length === 0) {
        return <div className="text-center py-20 text-xl font-semibold dark:text-white">Giỏ hàng của bạn đang trống.</div>;
    }

    return (
        <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-7xl mx-auto">
                 <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-blue-800 dark:text-sky-400">XÁC NHẬN ĐẶT TOUR</h1>
                 </div>

                 <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* --- Cột trái --- */}
                     <div className="lg:col-span-2 space-y-6">
                         {/* Thông tin liên lạc */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold mb-4 dark:text-white">THÔNG TIN LIÊN LẠC</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {/* Các InfoInput giữ nguyên */}
                                 <InfoInput icon={FaUserFriends} name="name" placeholder="Họ tên *" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                 <InfoInput icon={IoIosCall} name="phone" type="tel" placeholder="Điện thoại *" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                 <InfoInput icon={IoIosMail} name="email" type="email" placeholder="Email *" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={!!currentUser}/>
                                 <InfoInput icon={FaMapMarkerAlt} name="address" placeholder="Địa chỉ" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} />
                             </div>
                             {loadingUser ? (
                                <p className="text-sm text-gray-500 mt-2">Đang tải thông tin...</p>
                             ) : currentUser ? (
                                 <p className="text-sm text-green-600 mt-2">Đặt hàng với tài khoản: {currentUser.email}</p>
                             ) : (
                                 <p className="text-sm text-blue-600 mt-2">Bạn cần <Link to="/login" state={{ from: location }} className="font-bold underline">Đăng nhập</Link> để đặt hàng.</p>
                             )}
                         </div>

                         {/* Dịch vụ cộng thêm */}
                          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold flex items-center gap-2 mb-4 dark:text-white">
                                 <FaShuttleVan className="text-blue-500" /> DỊCH VỤ CỘNG THÊM
                             </h2>
                             <div className="bg-blue-50 dark:bg-sky-900/30 p-4 rounded-lg">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={useShuttle} onChange={(e)=> setUseShuttle(e.target.checked)} className="w-5 h-5 accent-blue-600"/>
                                    <div className="ml-4 flex-1">
                                       <p className="font-semibold text-blue-800 dark:text-sky-300">TourZen Xpress - Xe đưa đón riêng</p>
                                       <p className="text-sm text-gray-600 dark:text-gray-400">Tài xế riêng sẽ đón bạn.</p>
                                   </div>
                                    <span className="font-bold text-blue-600 dark:text-sky-400">{formatCurrency(shuttlePrice)}</span>
                                </label>
                                <AnimatePresence>
                                    {useShuttle && (
                                    <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: "16px" }} exit={{ opacity: 0, height: 0, marginTop: 0 }} >
                                        <InfoInput icon={FaMapMarkerAlt} placeholder="Nhập địa chỉ cần đón *" value={shuttleAddress} onChange={(e)=> setShuttleAddress(e.target.value)} required={useShuttle}/> {/* Thêm required */}
                                    </motion.div>
                                    )}
                                </AnimatePresence>
                             </div>
                          </div>

                         {/* Ghi chú */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold mb-4 dark:text-white">GHI CHÚ</h2>
                             <textarea
                                 placeholder="Ghi chú thêm (nếu có)"
                                 value={notes}
                                 onChange={(e) => setNotes(e.target.value)}
                                 rows={3} // Giảm rows
                                 className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" // Cập nhật style
                              />
                         </div>

                         {/* Phương thức thanh toán */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">PHƯƠNG THỨC THANH TOÁN</h2>
                             <div className="space-y-4">
                               <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === "direct" ? "border-blue-500 ring-2 ring-blue-500" : "dark:border-neutral-600"}`} >
                                   <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === "direct"} onChange={(e)=> setPaymentMethod(e.target.value)} className="w-5 h-5 text-sky-600 focus:ring-sky-500"/> {/* Thêm style */}
                                   <div className="ml-4">
                                       <p className="font-semibold dark:text-white">Thanh toán trực tiếp</p>
                                       <p className="text-sm text-gray-600 dark:text-gray-400">Đặt lịch hẹn và thanh toán tại văn phòng.</p>
                                   </div>
                               </label>
                               <AnimatePresence>
                                   {paymentMethod === "direct" && (
                                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-8 space-y-2 dark:text-gray-300">
                                       <p className="text-sm font-semibold"> Vui lòng thanh toán trước: <span className="text-red-600 font-bold">{formattedDeadline}</span> </p>
                                       <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white">
                                           <option>Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội</option>
                                           <option>Số 456, Đường XYZ, Quận 1, Hồ Chí Minh</option>
                                           <option>Số 789, Đường UVW, Quận Hải Châu, Đà Nẵng</option>
                                       </select>
                                   </motion.div>
                                   )}
                               </AnimatePresence>
                               <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === "vnpay" ? "border-blue-500 ring-2 ring-blue-500" : "dark:border-neutral-600"}`} >
                                   <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === "vnpay"} onChange={(e)=> setPaymentMethod(e.target.value)} className="w-5 h-5 text-sky-600 focus:ring-sky-500"/>
                                   <div className="ml-4 flex items-center">
                                       <p className="font-semibold mr-2 dark:text-white">Thanh toán qua VNPay</p>
                                       <img src="/vnpay_logo.png" alt="VNPay" className="h-8" />
                                   </div>
                               </label>
                           </div>
        S              </div>
                     </div>

                     {/* --- Cột phải: tóm tắt đơn --- */}
                     <aside className="lg:col-span-1">
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md sticky top-24 self-start">
                             <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-neutral-700 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2>
                             <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4"> {/* Giảm max-h */}
                                 {cartItems.map((item) => {
                                      // Tính lại giá cho item này để hiển thị
                                      const adultPrice = item.priceAdult ?? item.price ?? 0;
                                      const childPrice = item.priceChild ?? 0;
                                      const itemDisplayTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
                                     return (
                                     <div key={item.key || item.id} className="flex gap-4 border-b pb-2 last:border-0 dark:border-neutral-700">
                                         <img src={item.image || "/images/default.jpg"} alt={item.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"/> {/* Sửa kích thước ảnh */}
                                         <div className="flex-grow min-w-0"> {/* Thêm flex-grow và min-w-0 */}
                                             <p className="font-bold text-sm text-blue-800 dark:text-sky-400 truncate">{item.title}</p> {/* Thêm truncate */}
                                             <p className="text-xs text-gray-500 dark:text-gray-400">{`${item.adults || 0} NL, ${ item.children || 0 } TE, ${item.infants || 0} EB`}</p>
                                             <p className="text-sm font-semibold dark:text-white">
                                                 {formatCurrency(itemDisplayTotal)}
                                             </p>
body                                  </div>
                                     </div>
                                 );
                                 })}
                             </div>

                             <div className="space-y-2 text-sm border-t pt-4 dark:border-neutral-700 dark:text-gray-300">
                                <div className="flex justify-between font-semibold"> <div className="flex items-center gap-2"> <FaUsers /> <span>Tổng số khách</span> </div> <span>{totalPassengers}</span> </div>
                                <div className="flex justify-between"> <span>Tạm tính</span> <span>{formatCurrency(total)}</span> </div>
                                {useShuttle && ( <div className="flex justify-between"> <span>Phí xe TourZen Xpress</span> <span>{formatCurrency(shuttlePrice)}</span> </div> )}
                                <div className="flex justify-between text-red-600"> <span>Ưu đãi</span> <span>- {formatCurrency(discount)}</span> </div>
                             </div>

                     <div className="mt-4 pt-4 border-t flex justify-between items-center dark:border-neutral-700">
                                <span className="text-lg font-bold dark:text-white">Tổng cộng</span>
                                <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                             </div>

                             <div className="mt-6">
                                 <label className="flex items-center text-sm">
                               <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 mr-2 accent-sky-500"/>
                                     <span className="text-gray-600 dark:text-gray-300"> Tôi đã đọc và đồng ý với <a href="/policy" target="_blank" className="text-blue-600 underline"> Chính sách </a> & <a href="/terms" target="_blank" className="text-blue-600 underline"> Điều khoản </a>. </span> {/* Thêm link thật */}
                                 </label>
                             </div>

                             {/* Thông báo lỗi tập trung */}
                   {notification.message && (
                                <p className={`mt-4 text-sm font-medium ${ notification.type === "error" ? "text-red-600" : notification.type === 'warning' ? 'text-yellow-600' : "text-green-600" }`}>
                               {notification.message}
                                </p>
                             )}


                             <button
                                 type="submit"
                       disabled={isSubmitting || loadingUser || (!currentUser && !loadingUser)}
                                 className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                                 {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
                                 {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"}
                 </button>
                         </div>
                     </aside>
                </form>
             </div>

             {/* Thông báo AnimatePresence */}
             <AnimatePresence>
                 {notification.message && !isSubmitting && ( // Chỉ hiện khi ko submitting
                     <motion.div
                D       initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.5 }}
                     className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${ notification.type === "error" ? "bg-red-500" : notification.type === 'warning' ? 'bg-yellow-500' : "bg-green-500" }`} // Thêm z-50
                     >
                        {notification.message}
                   </motion.div>
               )}
            </AnimatePresence>
        </div>
    );
}
// src/pages/Payment.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaShuttleVan, FaUsers, FaSpinner, FaCar, FaPlane, FaPlus } from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';

const supabase = getSupabase();

// --- SỬA Ở ĐÂY: Thêm hàm slugify ---
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}
// --- KẾT THÚC SỬA ---

const InfoInput = ({ icon: Icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             {Icon && <Icon className="text-gray-400" />}
        </div>
        <input
            {...props}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
        />
    </div>
);


export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { items: cartItemsFromContext, clearCart, total: totalFromContext } = useCart();

    // --- SỬA Ở ĐÂY: Logic "Buy Now" để nhận đúng giá và ảnh ---
    const buyNowItem = location.state?.item;
    const selectedMonthData = location.state?.selectedMonthData; // Lấy data tháng từ TourDetail
    const isBuyNow = !!buyNowItem;

    const cartItems = useMemo(() => {
        if (isBuyNow && buyNowItem) {
            // Dùng data tháng đã chọn (từ TourDetail)
            // Hoặc fallback về giá "từ" nếu không có
            const monthData = selectedMonthData || {
                month: "Chưa chọn",
                prices: { adult: buyNowItem.price, child: 0, infant: 0, singleSupplement: 0 },
                departureDates: []
            };

            // Logic lấy ảnh (copy từ TourDetail.jsx)
            const slug = buyNowItem.name ? slugify(buyNowItem.name) : '';
            const image = buyNowItem.image_url || 
                          (buyNowItem.galleryImages && buyNowItem.galleryImages[0]) || 
                          (slug ? `/images/tour-${slug}.jpg` : "/images/default.jpg");

            // Trả về một mảng item giỏ hàng chuẩn
            return [{
                // ...buyNowItem, // Bỏ dòng này để tránh ghi đè giá sai
                key: `buy-now-${buyNowItem.id}_${monthData.month}`,
                title: buyNowItem.name,
                image: image,
                // Lấy giá ĐÚNG từ monthData
                priceAdult: monthData.prices.adult,
                priceChild: monthData.prices.child,
                priceInfant: monthData.prices.infant,
                singleSupplement: monthData.prices.singleSupplement,
                // Lấy tháng và ngày đi
                month: monthData.month,
                departureDates: monthData.departureDates || [],
                // Mặc định
                adults: 1,
                children: 0,
                infants: 0,
                tourId: buyNowItem.id, // Đảm bảo tourId tồn tại
                id: buyNowItem.id, // Đảm bảo id tồn tại
                location: buyNowItem.location,
            }];
        }
        return cartItemsFromContext;
    }, [isBuyNow, buyNowItem, selectedMonthData, cartItemsFromContext]);
    // --- KẾT THÚC SỬA ---

    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });

    const [availableTransport, setAvailableTransport] = useState([]);
    const [availableFlights, setAvailableFlights] = useState([]);
    const [selectedTransport, setSelectedTransport] = useState('');
    const [selectedFlight, setSelectedFlight] = useState('');
    const [loadingServices, setLoadingServices] = useState(true);

    const discount = 800000;
    const formatCurrency = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
    };

    // Logic tính tổng này VẪN ĐÚNG vì nó đọc từ cartItems đã được useMemo xử lý
    const total = useMemo(() => {
        const calculateTotal = (items) => items.reduce((sum, item) => {
            const adultPrice = item.priceAdult ?? item.price ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
            return sum + itemTotal;
        }, 0);

        // Bỏ if (isBuyNow) vì cartItems đã là nguồn dữ liệu duy nhất
        if (totalFromContext !== undefined && !isBuyNow) return totalFromContext;
        return calculateTotal(cartItems);

    }, [cartItems, isBuyNow, totalFromContext]);

    const totalPassengers = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0) + (item.infants || 0), 0),
        [cartItems]
    );

    const selectedTransportCost = useMemo(() => {
        const transport = availableTransport.find(t => t.id === selectedTransport);
        return transport?.price || 0;
    }, [selectedTransport, availableTransport]);

    const selectedFlightCost = useMemo(() => {
        const flight = availableFlights.find(f => f.id === selectedFlight);
        return flight?.price || 0;
    }, [selectedFlight, availableFlights]);

    const finalTotal = useMemo(() => {
        const calculatedTotal = total + selectedTransportCost + selectedFlightCost - discount;
        return Math.max(0, calculatedTotal);
    }, [total, selectedTransportCost, selectedFlightCost, discount]);

    const paymentDeadline = useMemo(() => {
        if (!cartItems || cartItems.length === 0) return new Date();
        const earliestDate = cartItems.map((item) => item.departureDates?.[0]).filter(Boolean).map((dateStr) => new Date(dateStr)).sort((a, b) => a - b)[0] || new Date();
        earliestDate.setDate(earliestDate.getDate() - 7);
        return earliestDate;
    }, [cartItems]);
    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    useEffect(() => {
        async function getUserData() {
            setLoadingUser(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                setContactInfo(prev => ({ ...prev, email: user.email }));
                const { data: userData, error } = await supabase.from('Users').select('full_name').eq('id', user.id).single();
                if (userData) { setContactInfo(prev => ({ ...prev, name: userData.full_name || prev.name })); }
                if (error) { console.warn("Lỗi lấy full_name:", error.message)} 
            }
            setLoadingUser(false);
        }

        async function getApprovedServices() {
            setLoadingServices(true);
            const { data: servicesData, error } = await supabase
                .from('Products') 
                .select('*')
                .in('product_type', ['transport', 'flight']) 
                .eq('approval_status', 'approved');

            if (error) {
                console.error("Lỗi tải dịch vụ vận chuyển/chuyến bay:", error);
                toast.error("Lỗi tải tùy chọn vận chuyển/chuyến bay.");
            } else {
                setAvailableTransport(servicesData.filter(s => s.product_type === 'transport'));
                setAvailableFlights(servicesData.filter(s => s.product_type === 'flight'));
            }
            setLoadingServices(false);
        }

        getUserData();
        getApprovedServices();
    }, []);

    const handleInputChange = (e, setState) => setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const showNotification = (message, type = "error") => { setNotification({ message, type }); setTimeout(() => setNotification({ message: "", type: "" }), 4000); };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) { showNotification("Vui lòng điền đầy đủ thông tin liên lạc."); return; }
        if (!agreedToTerms) { showNotification("Bạn phải đồng ý với các điều khoản và chính sách."); return; }
        if (!currentUser && !loadingUser) { showNotification("Bạn cần đăng nhập để hoàn tất đặt tour."); setIsSubmitting(false); navigate('/login', { state: { from: location } }); return; }
        if (!currentUser) { showNotification("Đang tải thông tin người dùng, vui lòng đợi..."); return; }

        setIsSubmitting(true);
        const orderId = `TOURZEN-${Date.now()}`;
        let bookingErrorOccurred = false;
        const bookingIds = [];

        for (const item of cartItems) {
            const quantity = (item.adults || 0) + (item.children || 0);
            const adultPrice = item.priceAdult ?? item.price ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotalPrice = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
            // --- SỬA Ở ĐÂY: Đảm bảo luôn lấy đúng ID ---
            const productId = item.tourId ?? item.id; 
            // --- KẾT THÚC SỬA ---

            if (!productId) {
                 console.error(`Item "${item.title}" thiếu ID sản phẩm.`); showNotification(`Sản phẩm "${item.title}" trong giỏ hàng bị lỗi ID.`); bookingErrorOccurred = true; break;
            }

            const bookingPayload = {
                user_id: currentUser.id,
                product_id: productId,
                quantity: quantity,
                total_price: itemTotalPrice, 
                status: 'pending',
                notes: notes,
                num_adults: item.adults,
                num_children: item.children || 0,
                num_infants: item.infants || 0,
                transport_product_id: selectedTransport || null, 
                flight_product_id: selectedFlight || null, 
                // --- SỬA Ở ĐÂY: Thêm thông tin tháng/ngày đi (Cần thêm cột này ở Supabase) ---
                // booking_details: { 
                //    month: item.month,
                //    departureDates: item.departureDates 
                // }
                // Tạm thời comment out, nếu bạn cần thì hãy thêm cột 'booking_details' (jsonb)
                // vào bảng Bookings giống như đã làm với cột 'details' (jsonb) ở bảng Products
                // --- KẾT THÚC SỬA ---
            };
            
            // Lệnh insert này ĐÃ ĐÚNG (giả định bạn đã chạy SQL ở bước trước)
            const { data: bookingData, error: insertError } = await supabase
                .from('Bookings')
                .insert(bookingPayload) 
                .select() 
                .single();

            if (insertError) {
                console.error(`Lỗi khi lưu booking cho sản phẩm ${productId}:`, insertError); 
                // --- SỬA Ở ĐÂY: Hiển thị lỗi rõ ràng hơn ---
                let friendlyMessage = insertError.message;
                if (insertError.message.includes("violates row-level security policy")) {
                    friendlyMessage = "Lỗi bảo mật: Bạn không có quyền đặt tour.";
                } else if (insertError.code === "23503") { // Foreign key violation
                     friendlyMessage = `Lỗi dữ liệu: Tour (ID: ${productId}) không tồn tại.`;
                } else if (insertError.code === "42703") { // Column does not exist
                     friendlyMessage = "Lỗi DB: Cột không tồn tại. (Hãy kiểm tra lại các cột 'notes', 'transport_product_id'...).";
                }
                toast.error(`Lỗi lưu đặt chỗ cho "${item.title}": ${friendlyMessage}`);
                // --- KẾT THÚC SỬA ---
                bookingErrorOccurred = true; 
                break;
            } else if (bookingData) {
                bookingIds.push(bookingData.id);
            }
        }

        if (bookingErrorOccurred) { setIsSubmitting(false); return; }

        // --- Gửi Email Xác Nhận ---
        const selectedTransportInfo = availableTransport.find(t => t.id === selectedTransport);
        const selectedFlightInfo = availableFlights.find(f => f.id === selectedFlight);

        const service_details_html = `
            ${selectedTransportInfo ? `<li><b>Vận chuyển:</b> ${selectedTransportInfo.name} (${formatCurrency(selectedTransportInfo.price)})</li>` : ''}
            ${selectedFlightInfo ? `<li><b>Chuyến bay:</b> ${selectedFlightInfo.name} (${selectedFlightInfo.details?.code || ''} - ${formatCurrency(selectedFlightInfo.price)})</li>` : ''}
        `;

        const tour_details_html = `<ul>${cartItems
          .map(item => `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE, ${item.infants || 0} EB) - Tháng: ${item.month || 'N/A'}</li>`) // Thêm tháng
          .join("")} ${service_details_html} </ul>`;

        try {
          const response = await fetch("/api/sendEmail", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  to: contactInfo.email,
                  subject: `TourZen - Xác nhận đặt tour thành công (Mã đơn: ${orderId})`,
                  html: `<h2>Cảm ơn ${contactInfo.name} đã đặt tour tại TourZen!</h2> <p>Mã đơn hàng tạm thời của bạn là: <strong>${orderId}</strong></p> <p>Chi tiết đơn hàng:</p> ${tour_details_html} <p><strong>Tổng thanh toán: ${formatCurrency(finalTotal)}</strong></p><p>Nhân viên TourZen sẽ liên hệ với bạn sớm để xác nhận. Xin cảm ơn!</p>`,
              }),
          });

          if (!response.ok) { showNotification("Đặt tour thành công nhưng lỗi gửi email.", "warning"); }
          else { showNotification("Đặt tour thành công! Vui lòng kiểm tra email.", "success"); }

          if (!isBuyNow) { clearCart(); }

          navigate("/payment-success", { state: {
              method: paymentMethod, branch: selectedBranch, deadline: formattedDeadline,
              orderId: orderId, bookingIds: bookingIds
          } });

        } catch (error) {
            console.error("Lỗi khi gửi email:", error); showNotification("Đặt tour thành công nhưng có lỗi khi gửi email.", "warning"); navigate("/payment-success", { state: { method: paymentMethod, branch: selectedBranch, deadline: formattedDeadline, orderId: orderId, bookingIds: bookingIds } });
        } finally {
          setIsSubmitting(false);
        }
    };

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
                                 <InfoInput icon={FaUserFriends} name="name" placeholder="Họ tên *" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                 <InfoInput icon={IoIosCall} name="phone" type="tel" placeholder="Điện thoại *" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                 <InfoInput icon={IoIosMail} name="email" type="email" placeholder="Email *" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={!!currentUser}/>
                                 <InfoInput icon={FaMapMarkerAlt} name="address" placeholder="Địa chỉ" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} />
                             </div>
                             {loadingUser ? <p className="text-sm text-gray-500 mt-2">Đang tải thông tin...</p> : currentUser ? <p className="text-sm text-green-600 mt-2">Đặt hàng với tài khoản: {currentUser.email}</p> : <p className="text-sm text-blue-600 mt-2">Bạn cần <Link to="/login" state={{ from: location }} className="font-bold underline">Đăng nhập</Link> để đặt hàng.</p> }
                         </div>

                         {/* DỊCH VỤ CỘNG THÊM */}
                         {(availableTransport.length > 0 || availableFlights.length > 0 || loadingServices) && (
                             <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                                 <h2 className="text-xl font-bold flex items-center gap-2 mb-4 dark:text-white">
                                     <FaPlus className="text-blue-500" /> DỊCH VỤ CỘNG THÊM (Tùy chọn)
                                 </h2>
                                 {loadingServices ? (
                                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                         <FaSpinner className="animate-spin"/> Đang tải các tùy chọn dịch vụ...
                                     </div>
                                 ) : (
                                     <div className="space-y-4">
                                         {availableTransport.length > 0 && (
                                             <div>
                                                 <label htmlFor="transportSelect" className="block text-sm font-medium mb-1 dark:text-neutral-300 flex items-center gap-2"><FaCar/> Chọn phương tiện di chuyển</label>
                                                 <select id="transportSelect" value={selectedTransport} onChange={(e) => setSelectedTransport(e.target.value)} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" >
                                                     <option value="">-- Không sử dụng dịch vụ vận chuyển --</option>
                                                     {availableTransport.map(t => ( <option key={t.id} value={t.id}> {t.name} ({t.details?.vehicle_type}, {t.details?.seats} chỗ) - {formatCurrency(t.price)} </option> ))}
                                                 </select>
                                             </div>
                                         )}
                                         {availableFlights.length > 0 && (
                                             <div>
                                                 <label htmlFor="flightSelect" className="block text-sm font-medium mb-1 dark:text-neutral-300 flex items-center gap-2"><FaPlane/> Chọn chuyến bay</label>
                                                 <select id="flightSelect" value={selectedFlight} onChange={(e) => setSelectedFlight(e.target.value)} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" >
                                                     <option value="">-- Tự túc vé máy bay --</option>
                                                     {availableFlights.map(f => ( <option key={f.id} value={f.id}> {f.name} ({f.details?.airline} {f.details?.code}) - {f.details?.route} - {formatCurrency(f.price)} </option> ))}
                                                 </select>
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         )}

                         {/* Ghi chú */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold mb-4 dark:text-white">GHI CHÚ</h2>
                             <textarea placeholder="Yêu cầu đặc biệt về tour (nếu có)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                         </div>

                         {/* Phương thức thanh toán */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                              <h2 className="text-xl font-bold mb-4 dark:text-white">PHƯƠNG THỨC THANH TOÁN</h2>
                              <div className="space-y-4">
                                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === "direct" ? "border-blue-500 ring-2 ring-blue-500" : "dark:border-neutral-600"}`} >
                                      <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === "direct"} onChange={(e)=> setPaymentMethod(e.target.value)} className="w-5 h-5 text-sky-600 focus:ring-sky-500"/>
                                      <div className="ml-4"> <p className="font-semibold dark:text-white">Thanh toán trực tiếp</p> <p className="text-sm text-gray-600 dark:text-gray-400">Thanh toán tại văn phòng TourZen.</p> </div>
                                  </label>
                                  <AnimatePresence> {paymentMethod === "direct" && ( <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-8 space-y-2 dark:text-gray-300"> <p className="text-sm font-semibold"> Vui lòng thanh toán trước ngày: <span className="text-red-600 font-bold">{formattedDeadline}</span> </p> <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"> <option>VP Hà Nội: Số 123, Đường ABC, Quận Hoàn Kiếm</option> <option>VP TP.HCM: Số 456, Đường XYZ, Quận 1</option> <option>VP Đà Nẵng: Số 789, Đường UVW, Quận Hải Châu</option> </select> </motion.div> )} </AnimatePresence>
                                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === "vnpay" ? "border-blue-500 ring-2 ring-blue-500" : "dark:border-neutral-600"}`} >
                                      <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === "vnpay"} onChange={(e)=> setPaymentMethod(e.target.value)} className="w-5 h-5 text-sky-600 focus:ring-sky-500"/>
                                      <div className="ml-4 flex items-center"> <p className="font-semibold mr-2 dark:text-white">Thanh toán qua VNPay</p> <img src="/vnpay_logo.png" alt="VNPay" className="h-8" /> </div>
                                  </label>
                               </div>
                         </div>
                     </div>

                     {/* --- Cột phải: tóm tắt đơn --- */}
                     <aside className="lg:col-span-1">
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md sticky top-24 self-start">
                             <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-neutral-700 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2>
                             <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
                                 {/* --- SỬA Ở ĐÂY: Thêm logic fallback ảnh --- */}
                                 {cartItems.map((item) => { 
                                     const adultPrice = item.priceAdult ?? item.price ?? 0; 
                                     const childPrice = item.priceChild ?? 0; 
                                     const itemDisplayTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0); 
                                     
                                     // Logic fallback ảnh (cho giỏ hàng cũ trong localStorage)
                                     const itemTitle = item.title || item.name || '';
                                     const itemImage = item.image || (itemTitle ? `/images/tour-${slugify(itemTitle)}.jpg` : "/images/default.jpg");

                                     return ( 
                                     <div key={item.key || item.id} className="flex gap-4 border-b pb-2 last:border-0 dark:border-neutral-700"> 
                                         <img src={itemImage} alt={item.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"/> 
                                         <div className="flex-grow min-w-0"> 
                                            <p className="font-bold text-sm text-blue-800 dark:text-sky-400 truncate">{item.title}</p> 
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{`${item.adults || 0} NL, ${ item.children || 0 } TE, ${item.infants || 0} EB`}</p> 
                                            <p className="text-sm font-semibold dark:text-white"> {formatCurrency(itemDisplayTotal)} </p> 
                                         </div> 
                                     </div> 
                                     ); 
                                 })}
                                 {/* --- KẾT THÚC SỬA --- */}
                             </div>

                             <div className="space-y-2 text-sm border-t pt-4 dark:border-neutral-700 dark:text-gray-300">
                                 <div className="flex justify-between font-semibold"> <div className="flex items-center gap-2"> <FaUsers /> <span>Tổng số khách</span> </div> <span>{totalPassengers}</span> </div>
                                 <div className="flex justify-between"> <span>Tạm tính (Tour)</span> <span>{formatCurrency(total)}</span> </div>
                                 {selectedTransport && ( <div className="flex justify-between"> <span>Phí vận chuyển</span> <span>{formatCurrency(selectedTransportCost)}</span> </div> )}
                                 {selectedFlight && ( <div className="flex justify-between"> <span>Phí chuyến bay</span> <span>{formatCurrency(selectedFlightCost)}</span> </div> )}
                                 <div className="flex justify-between text-red-600"> <span>Ưu đãi</span> <span>- {formatCurrency(discount)}</span> </div>
                             </div>

                             <div className="mt-4 pt-4 border-t flex justify-between items-center dark:border-neutral-700">
                                 <span className="text-lg font-bold dark:text-white">Tổng cộng</span>
                                 <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                             </div>

                             <div className="mt-6">
                                 <label className="flex items-center text-sm"> <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 mr-2 accent-sky-500"/> <span className="text-gray-600 dark:text-gray-300"> Tôi đã đọc và đồng ý với <a href="/policy" target="_blank" className="text-blue-600 underline"> Chính sách </a> & <a href="/terms" target="_blank" className="text-blue-600 underline"> Điều khoản </a>. </span> </label>
                             </div>
                             {notification.message && ( <p className={`mt-4 text-sm font-medium ${ notification.type === "error" ? "text-red-600" : notification.type === 'warning' ? 'text-yellow-600' : "text-green-600" }`}> {notification.message} </p> )}
                             <button type="submit" disabled={isSubmitting || loadingUser || (!currentUser && !loadingUser) || loadingServices} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                 {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
                                 {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"}
                             </button>
                         </div>
                     </aside>
                 </form>
             </div>

             <AnimatePresence>
                 {notification.message && !isSubmitting && ( <motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.5 }} className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${ notification.type === "error" ? "bg-red-500" : notification.type === 'warning' ? 'bg-yellow-500' : "bg-green-500" }`}> {notification.message} </motion.div> )}
             </AnimatePresence>
        </div>
    );
}
// src/pages/Payment.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
// Import thêm icon mới
import { FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaShuttleVan, FaUsers, FaSpinner, FaCar, FaPlane, FaPlus } from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast'; // Import toast nếu chưa có

const supabase = getSupabase();

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

    // Logic xử lý "Đặt Ngay" vs Giỏ hàng (giữ nguyên)
    const buyNowItem = location.state?.item;
    const isBuyNow = !!buyNowItem;
    const cartItems = useMemo(() => {
        if (isBuyNow) {
            return [{ ...buyNowItem, key: `buy-now-${buyNowItem.id}`, title: buyNowItem.name, image: buyNowItem.image_url || (buyNowItem.galleryImages && buyNowItem.galleryImages[0]) || "/images/default.jpg", priceAdult: buyNowItem.price, price: buyNowItem.price, adults: 1, children: 0, infants: 0, singleSupplement: 0 }];
        }
        return cartItemsFromContext;
    }, [isBuyNow, buyNowItem, cartItemsFromContext]);

    // State thông tin người dùng & liên lạc (giữ nguyên)
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("Số 123, Đường ABC, Quận Hoàn Kiếm, Hà Nội");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });

    // *** THÊM STATE CHO DỊCH VỤ VẬN CHUYỂN / BAY ***
    const [availableTransport, setAvailableTransport] = useState([]); // Danh sách xe có sẵn
    const [availableFlights, setAvailableFlights] = useState([]);     // Danh sách chuyến bay có sẵn
    const [selectedTransport, setSelectedTransport] = useState(''); // ID của xe đã chọn
    const [selectedFlight, setSelectedFlight] = useState('');     // ID của chuyến bay đã chọn
    const [loadingServices, setLoadingServices] = useState(true);   // Trạng thái tải dịch vụ
    // *** *** *** *** *** *** *** *** *** *** *** *** ***

    // Bỏ state shuttle cũ
    // const [useShuttle, setUseShuttle] = useState(false);
    // const [shuttleAddress, setShuttleAddress] = useState("");
    // const shuttlePrice = 400000;

    const discount = 800000; // Giữ lại discount chung
    const formatCurrency = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
    };

    // Tổng tiền tour/sản phẩm (giữ nguyên logic)
    const total = useMemo(() => {
        const calculateTotal = (items) => items.reduce((sum, item) => {
            const adultPrice = item.priceAdult ?? item.price ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
            return sum + itemTotal;
        }, 0);
        if (isBuyNow) return calculateTotal(cartItems);
        if (totalFromContext !== undefined) return totalFromContext;
        return calculateTotal(cartItems);
    }, [cartItems, isBuyNow, totalFromContext]);

    // Tổng số khách (giữ nguyên)
    const totalPassengers = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0) + (item.infants || 0), 0),
        [cartItems]
    );

    // *** TÍNH TOÁN GIÁ DỊCH VỤ ĐÃ CHỌN ***
    const selectedTransportCost = useMemo(() => {
        const transport = availableTransport.find(t => t.id === selectedTransport);
        return transport?.price || 0;
    }, [selectedTransport, availableTransport]);

    const selectedFlightCost = useMemo(() => {
        const flight = availableFlights.find(f => f.id === selectedFlight);
        return flight?.price || 0;
    }, [selectedFlight, availableFlights]);

    // *** CẬP NHẬT TỔNG CUỐI CÙNG ***
    const finalTotal = useMemo(() => {
        // Tổng = Tổng tour + Giá xe + Giá bay - Giảm giá
        const calculatedTotal = total + selectedTransportCost + selectedFlightCost - discount;
        return Math.max(0, calculatedTotal); // Đảm bảo không âm
    }, [total, selectedTransportCost, selectedFlightCost, discount]);

    // Hạn thanh toán (giữ nguyên)
    const paymentDeadline = useMemo(() => {
        if (!cartItems || cartItems.length === 0) return new Date();
        const earliestDate = cartItems.map((item) => item.departureDates?.[0]).filter(Boolean).map((dateStr) => new Date(dateStr)).sort((a, b) => a - b)[0] || new Date();
        earliestDate.setDate(earliestDate.getDate() - 7);
        return earliestDate;
    }, [cartItems]);
    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    useEffect(() => {
        // Hàm tải thông tin user (giữ nguyên)
        async function getUserData() {
            setLoadingUser(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                setContactInfo(prev => ({ ...prev, email: user.email }));
                const { data: userData } = await supabase.from('Users').select('full_name').eq('id', user.id).single();
                if (userData) { setContactInfo(prev => ({ ...prev, name: userData.full_name || prev.name })); }
            }
            setLoadingUser(false);
        }

        // *** HÀM TẢI DỊCH VỤ VẬN CHUYỂN & CHUYẾN BAY ĐÃ DUYỆT ***
        async function getApprovedServices() {
            setLoadingServices(true);
            const { data: servicesData, error } = await supabase
                .from('Suppliers')
                .select('*')
                .in('type', ['transport', 'flight']) // Chỉ lấy 2 loại này
                .eq('approval_status', 'approved'); // Chỉ lấy cái đã duyệt

            if (error) {
                console.error("Lỗi tải dịch vụ vận chuyển/chuyến bay:", error);
                // Sử dụng toast đã import ở đầu file
                toast.error("Lỗi tải tùy chọn vận chuyển/chuyến bay.");
            } else {
                // Phân loại vào state tương ứng
                setAvailableTransport(servicesData.filter(s => s.type === 'transport'));
                setAvailableFlights(servicesData.filter(s => s.type === 'flight'));
            }
            setLoadingServices(false);
        }

        getUserData();
        getApprovedServices(); // Gọi hàm tải dịch vụ
    }, []); // useEffect này chỉ chạy 1 lần khi component mount

    const handleInputChange = (e, setState) => setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const showNotification = (message, type = "error") => { setNotification({ message, type }); setTimeout(() => setNotification({ message: "", type: "" }), 4000); };

    const handleCheckout = async (e) => {
        e.preventDefault();
        // Validation (bỏ kiểm tra shuttleAddress)
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
            // Chỉ tính giá của tour/sp chính
            const itemTotalPrice = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
            const productId = item.tourId ?? item.id;

            if (!productId) { /* ... giữ nguyên error handling ... */
                 console.error(`Item "${item.title}" thiếu ID sản phẩm.`); showNotification(`Sản phẩm "${item.title}" trong giỏ hàng bị lỗi ID.`); bookingErrorOccurred = true; break;
            }

            // *** THÊM ID DỊCH VỤ VÀO PAYLOAD GỬI ĐẾN BOOKINGS ***
            // Lưu ý: Đảm bảo đã thêm cột transport_supplier_id và flight_supplier_id (kiểu uuid, nullable) vào bảng Bookings
            const bookingPayload = {
                user_id: currentUser.id,
                product_id: productId,
                quantity: quantity,
                total_price: itemTotalPrice, // Chỉ lưu giá của tour/sp chính
                status: 'pending',
                notes: notes,
                num_adults: item.adults,
                num_children: item.children || 0,
                num_infants: item.infants || 0,
                transport_supplier_id: selectedTransport || null, // Lưu ID transport, null nếu không chọn
                flight_supplier_id: selectedFlight || null,       // Lưu ID flight, null nếu không chọn
                // Bỏ shuttle_address: useShuttle ? shuttleAddress : null,
            };
            // *** *** *** *** *** *** *** *** *** *** *** ***

            const { data: bookingData, error: insertError } = await supabase
                .from('Bookings')
                .insert(bookingPayload) // Sử dụng payload mới
                .select('id')
                .single();

            if (insertError) { /* ... giữ nguyên error handling ... */
               console.error(`Lỗi khi lưu booking cho sản phẩm ${productId}:`, insertError); showNotification(`Đã xảy ra lỗi khi lưu đặt chỗ cho "${item.title}". Vui lòng thử lại.`); bookingErrorOccurred = true; break;
          } else if (bookingData) {
                bookingIds.push(bookingData.id);
            }
        }

        if (bookingErrorOccurred) { setIsSubmitting(false); return; }

        // --- Gửi Email Xác Nhận (Cập nhật để thêm thông tin dịch vụ) ---
        const selectedTransportInfo = availableTransport.find(t => t.id === selectedTransport);
        const selectedFlightInfo = availableFlights.find(f => f.id === selectedFlight);

        // Tạo HTML cho dịch vụ đã chọn (nếu có)
        const service_details_html = `
            ${selectedTransportInfo ? `<li><b>Vận chuyển:</b> ${selectedTransportInfo.name} (${formatCurrency(selectedTransportInfo.price)})</li>` : ''}
            ${selectedFlightInfo ? `<li><b>Chuyến bay:</b> ${selectedFlightInfo.name} (${selectedFlightInfo.details?.code || ''} - ${formatCurrency(selectedFlightInfo.price)})</li>` : ''}
        `;

        const tour_details_html = `<ul>${cartItems
          .map(item => `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE, ${item.infants || 0} EB)</li>`)
          .join("")} ${service_details_html} </ul>`; // Thêm chi tiết dịch vụ vào email

        try {
          const response = await fetch("/api/sendEmail", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  to: contactInfo.email,
                  subject: `TourZen - Xác nhận đặt tour thành công (Mã đơn: ${orderId})`,
                  // Cập nhật nội dung email
                  html: `<h2>Cảm ơn ${contactInfo.name} đã đặt tour tại TourZen!</h2> <p>Mã đơn hàng tạm thời của bạn là: <strong>${orderId}</strong></p> <p>Chi tiết đơn hàng:</p> ${tour_details_html} <p><strong>Tổng thanh toán: ${formatCurrency(finalTotal)}</strong></p><p>Nhân viên TourZen sẽ liên hệ với bạn sớm để xác nhận. Xin cảm ơn!</p>`,
              }),
          });

          if (!response.ok) { showNotification("Đặt tour thành công nhưng lỗi gửi email.", "warning"); }
          else { showNotification("Đặt tour thành công! Vui lòng kiểm tra email.", "success"); }

          // Chỉ xóa giỏ hàng nếu không phải là "Đặt Ngay"
          if (!isBuyNow) { clearCart(); }

          // Chuyển hướng đến trang thành công
          navigate("/payment-success", { state: {
              method: paymentMethod, branch: selectedBranch, deadline: formattedDeadline,
              orderId: orderId, bookingIds: bookingIds
          } });

        } catch (error) { /* ... giữ nguyên error handling ... */
            console.error("Lỗi khi gửi email:", error); showNotification("Đặt tour thành công nhưng có lỗi khi gửi email.", "warning"); navigate("/payment-success", { state: { /* ... */ } });
        } finally {
          setIsSubmitting(false);
        }
    };

    // Thông báo nếu không có gì để thanh toán
    if (!cartItems || cartItems.length === 0) {
        return <div className="text-center py-20 text-xl font-semibold dark:text-white">Giỏ hàng của bạn đang trống.</div>;
    }

    // Giao diện trang thanh toán
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

                        {/* *** DỊCH VỤ CỘNG THÊM (THAY THẾ SHUTTLE CŨ) *** */}
                        {/* Chỉ hiển thị mục này nếu có dịch vụ hoặc đang tải */}
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
                                        {/* Dropdown chọn Vận chuyển */}
                                        {availableTransport.length > 0 && (
                                            <div>
                                                <label htmlFor="transportSelect" className="block text-sm font-medium mb-1 dark:text-neutral-300 flex items-center gap-2"><FaCar/> Chọn phương tiện di chuyển</label>
                                                <select
                                                    id="transportSelect"
                                                    value={selectedTransport} // Giá trị là ID của NCC
                                                    onChange={(e) => setSelectedTransport(e.target.value)}
                                                    className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
                                                >
                                                    <option value="">-- Không sử dụng dịch vụ vận chuyển --</option>
                                                    {availableTransport.map(t => (
                                                        <option key={t.id} value={t.id}>
                                                            {/* Hiển thị Tên (Loại xe, số chỗ) - Giá */}
                                                            {t.name} ({t.details?.vehicle_type}, {t.details?.seats} chỗ) - {formatCurrency(t.price)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {/* Dropdown chọn Chuyến bay */}
                                        {availableFlights.length > 0 && (
                                            <div>
                                                <label htmlFor="flightSelect" className="block text-sm font-medium mb-1 dark:text-neutral-300 flex items-center gap-2"><FaPlane/> Chọn chuyến bay</label>
                                                <select
                                                    id="flightSelect"
                                                    value={selectedFlight} // Giá trị là ID của NCC
                                                    onChange={(e) => setSelectedFlight(e.target.value)}
                                                    className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white"
                                                >
                                                    <option value="">-- Tự túc vé máy bay --</option>
                                                    {availableFlights.map(f => (
                                                        <option key={f.id} value={f.id}>
                                                             {/* Hiển thị Tên (Hãng, Mã) - Tuyến - Giá */}
                                                            {f.name} ({f.details?.airline} {f.details?.code}) - {f.details?.route} - {formatCurrency(f.price)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* *** *** *** *** *** *** *** *** */}

                         {/* Ghi chú */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4 dark:text-white">GHI CHÚ</h2>
                            <textarea placeholder="Yêu cầu đặc biệt về tour (nếu có)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                         </div>

                         {/* Phương thức thanh toán */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold mb-4 dark:text-white">PHƯƠNG THỨC THANH TOÁN</h2>
                             <div className="space-y-4">
                                {/* Thanh toán trực tiếp */}
                                <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === "direct" ? "border-blue-500 ring-2 ring-blue-500" : "dark:border-neutral-600"}`} >
                                    <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === "direct"} onChange={(e)=> setPaymentMethod(e.target.value)} className="w-5 h-5 text-sky-600 focus:ring-sky-500"/>
                                    <div className="ml-4"> <p className="font-semibold dark:text-white">Thanh toán trực tiếp</p> <p className="text-sm text-gray-600 dark:text-gray-400">Thanh toán tại văn phòng TourZen.</p> </div>
                                </label>
                                <AnimatePresence> {paymentMethod === "direct" && ( <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-8 space-y-2 dark:text-gray-300"> <p className="text-sm font-semibold"> Vui lòng thanh toán trước ngày: <span className="text-red-600 font-bold">{formattedDeadline}</span> </p> <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"> <option>VP Hà Nội: Số 123, Đường ABC, Quận Hoàn Kiếm</option> <option>VP TP.HCM: Số 456, Đường XYZ, Quận 1</option> <option>VP Đà Nẵng: Số 789, Đường UVW, Quận Hải Châu</option> </select> </motion.div> )} </AnimatePresence>
                                {/* Thanh toán VNPay */}
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
                             {/* Danh sách tour/sản phẩm */}
                             <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
                                {cartItems.map((item) => { const adultPrice = item.priceAdult ?? item.price ?? 0; const childPrice = item.priceChild ?? 0; const itemDisplayTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0); return ( <div key={item.key || item.id} className="flex gap-4 border-b pb-2 last:border-0 dark:border-neutral-700"> <img src={item.image || "/images/default.jpg"} alt={item.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"/> <div className="flex-grow min-w-0"> <p className="font-bold text-sm text-blue-800 dark:text-sky-400 truncate">{item.title}</p> <p className="text-xs text-gray-500 dark:text-gray-400">{`${item.adults || 0} NL, ${ item.children || 0 } TE, ${item.infants || 0} EB`}</p> <p className="text-sm font-semibold dark:text-white"> {formatCurrency(itemDisplayTotal)} </p> </div> </div> ); })}
                             </div>

                             {/* Chi tiết giá (Đã cập nhật) */}
                             <div className="space-y-2 text-sm border-t pt-4 dark:border-neutral-700 dark:text-gray-300">
                                <div className="flex justify-between font-semibold"> <div className="flex items-center gap-2"> <FaUsers /> <span>Tổng số khách</span> </div> <span>{totalPassengers}</span> </div>
                                <div className="flex justify-between"> <span>Tạm tính (Tour)</span> <span>{formatCurrency(total)}</span> </div>
                                {/* Hiển thị giá dịch vụ đã chọn */}
                                {selectedTransport && ( <div className="flex justify-between"> <span>Phí vận chuyển</span> <span>{formatCurrency(selectedTransportCost)}</span> </div> )}
                                {selectedFlight && ( <div className="flex justify-between"> <span>Phí chuyến bay</span> <span>{formatCurrency(selectedFlightCost)}</span> </div> )}
                                <div className="flex justify-between text-red-600"> <span>Ưu đãi</span> <span>- {formatCurrency(discount)}</span> </div>
                             </div>

                             {/* Tổng cộng */}
                             <div className="mt-4 pt-4 border-t flex justify-between items-center dark:border-neutral-700">
                                <span className="text-lg font-bold dark:text-white">Tổng cộng</span>
                                 <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                             </div>

                             {/* Điều khoản & Nút Xác nhận */}
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

             {/* Thông báo */}
             <AnimatePresence>
                 {notification.message && !isSubmitting && ( <motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.5 }} className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${ notification.type === "error" ? "bg-red-500" : notification.type === 'warning' ? 'bg-yellow-500' : "bg-green-500" }`}> {notification.message} </motion.div> )}
            </AnimatePresence>
        </div>
    );
}
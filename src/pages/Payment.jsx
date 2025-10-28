// src/pages/Payment.jsx
// (NÂNG CẤP V3: Tích hợp chọn Slot + chọn Số lượng + Sửa lỗi CSDL + Sửa lỗi Date)

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaSpinner, FaCar, FaPlane, FaPlus,
    FaUser, FaChild, FaMinus, FaUsers, FaCalendarAlt // (MỚI)
} from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';

const supabase = getSupabase();

// --- Function Slugify (Giữ nguyên) ---
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

// --- InfoInput (Giữ nguyên) ---
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

// (MỚI) Nút tăng giảm số lượng
const QuantityInput = ({ label, icon: Icon, value, onDecrease, onIncrease, max, min = 0, disabled = false }) => (
    <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Icon className="text-gray-500" />
            {label}
        </label>
        <div className="flex items-center gap-2">
            <button type="button" onClick={onDecrease} disabled={disabled || value <= min} className="p-1.5 rounded-full bg-gray-200 dark:bg-neutral-600 hover:bg-gray-300 disabled:opacity-50">
                <FaMinus size={12} />
            </button>
            <span className="w-8 text-center font-bold dark:text-white">{value}</span>
            <button type="button" onClick={onIncrease} disabled={disabled || value >= max} className="p-1.5 rounded-full bg-gray-200 dark:bg-neutral-600 hover:bg-gray-300 disabled:opacity-50">
                <FaPlus size={12} />
            </button>
        </div>
    </div>
);

// --- Hàm format tiền tệ (Giữ nguyên) ---
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();

    // --- (SỬA LỚN) Logic "Buy Now" (Mua ngay) ---
    const buyNowItem = location.state?.item; // Chỉ nhận thông tin tour

    // (MỚI) State cho Lịch khởi hành
    const [departures, setDepartures] = useState([]);
    const [departuresLoading, setDeparturesLoading] = useState(true);
    const [selectedDepartureId, setSelectedDepartureId] = useState(null);

    // (MỚI) State cho số lượng khách
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    // (MỚI) Lịch khởi hành được chọn
    const selectedDeparture = useMemo(() => {
        return departures.find(d => d.id === selectedDepartureId);
    }, [departures, selectedDepartureId]);
    
    // (MỚI) Tính toán số chỗ còn lại
    const maxGuests = useMemo(() => {
        if (!selectedDeparture) return 0;
        return (selectedDeparture.max_slots || 0) - (selectedDeparture.booked_slots || 0); // An toàn hơn
    }, [selectedDeparture]);
    const currentGuests = adults + children;

    const cartItems = useMemo(() => {
        // Chỉ hoạt động khi đã chọn tour VÀ chọn lịch
        if (buyNowItem && selectedDeparture) {
            const slug = buyNowItem.name ? slugify(buyNowItem.name) : '';
            const image = buyNowItem.image_url || 
                          (buyNowItem.galleryImages && buyNowItem.galleryImages[0]) || 
                          (slug ? `/images/tour-${slug}.jpg` : "/images/default.jpg");

            return [{
                key: selectedDeparture.id, 
                title: buyNowItem.name,
                image: image,
                priceAdult: selectedDeparture.adult_price,
                priceChild: selectedDeparture.child_price,
                priceInfant: 0,
                singleSupplement: 0,
                departure_id: selectedDeparture.id,
                departure_date: selectedDeparture.departure_date,
                adults: adults,
                children: children,
                infants: 0,
                tourId: buyNowItem.id, 
                id: buyNowItem.id,
                location: buyNowItem.location,
            }];
        }
        // Nếu chưa chọn, giỏ hàng rỗng
        return [];
    }, [buyNowItem, selectedDeparture, adults, children]);
    // --- KẾT THÚC SỬA LỚN ---

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
    
    // (Tính toán tổng...)
    const total = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const adultPrice = item.priceAdult ?? item.price ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
            return sum + itemTotal;
        }, 0);
    }, [cartItems]);

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

    // (SỬA) Tính hạn thanh toán an toàn hơn
    const paymentDeadline = useMemo(() => {
        let earliestDate = new Date(); // Mặc định là hôm nay
        try {
            // Chỉ tính nếu đã chọn lịch khởi hành
            if (selectedDeparture?.departure_date) {
                const earliestDateStr = selectedDeparture.departure_date;
                // Cố gắng parse ngày tháng
                const parsedDate = new Date(earliestDateStr + 'T00:00:00');
                // Kiểm tra xem parse có thành công không
                if (!isNaN(parsedDate.getTime())) {
                    earliestDate = parsedDate;
                    earliestDate.setDate(earliestDate.getDate() - 7); // Tính lùi 7 ngày
                } else {
                     console.warn("Invalid departure_date format:", earliestDateStr);
                     return null; // Trả về null nếu ngày không hợp lệ
                }
            } else {
                 return null; // Trả về null nếu chưa chọn lịch
            }
        } catch (error) {
            console.error("Error calculating payment deadline:", error);
            return null; // Trả về null nếu có lỗi
        }
        return earliestDate; // Trả về đối tượng Date hợp lệ hoặc null
    }, [selectedDeparture]); // Chỉ phụ thuộc vào lịch đã chọn

    // (SỬA) Format an toàn hơn
    const formattedDeadline = useMemo(() => {
        // Chỉ format nếu paymentDeadline là một Date hợp lệ
        if (paymentDeadline instanceof Date && !isNaN(paymentDeadline)) {
            return paymentDeadline.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        }
        // Nếu không, trả về chuỗi mặc định
        return "N/A (Chọn lịch trình)"; 
    }, [paymentDeadline]);
    
    // (useEffect...)
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
            if (error) { toast.error("Lỗi tải tùy chọn vận chuyển/chuyến bay."); } 
            else {
                setAvailableTransport(servicesData.filter(s => s.product_type === 'transport'));
                setAvailableFlights(servicesData.filter(s => s.product_type === 'flight'));
            }
            setLoadingServices(false);
        }
        
        // (MỚI) Fetch Lịch khởi hành
        async function fetchDepartures() {
            if (!buyNowItem?.id) {
                setDeparturesLoading(false);
                setDepartures([]); // Đảm bảo departures là mảng rỗng
                return;
            }
            setDeparturesLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from("Departures")
                .select("*")
                .eq("product_id", buyNowItem.id)
                .gte("departure_date", today)
                .order("departure_date", { ascending: true });
            
            if (error) {
                toast.error("Lỗi tải lịch khởi hành.");
                setDepartures([]); // Đảm bảo departures là mảng rỗng khi lỗi
            } else {
                setDepartures(data || []); // Đảm bảo data luôn là mảng
            }
            setDeparturesLoading(false);
        }

        getUserData();
        getApprovedServices();
        fetchDepartures();
    }, [buyNowItem]); // Chỉ phụ thuộc vào buyNowItem

    // (MỚI) Hàm xử lý tăng giảm số lượng
    const handleIncrease = (type) => {
        if (!selectedDeparture) return; // Không cho tăng nếu chưa chọn lịch
        if (currentGuests >= maxGuests) {
            toast.error(`Chuyến đi này chỉ còn tối đa ${maxGuests} chỗ.`);
            return;
        }
        if (type === 'adult') setAdults(a => a + 1);
        if (type === 'child') setChildren(c => c + 1);
    };
    const handleDecrease = (type) => {
        if (!selectedDeparture) return;
        if (type === 'adult' && adults > 1) setAdults(a => a - 1);
        if (type === 'child' && children > 0) setChildren(c => c - 1);
    };

    const handleInputChange = (e, setState) => setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const showNotification = (message, type = "error") => { setNotification({ message, type }); setTimeout(() => setNotification({ message: "", type: "" }), 4000); };

    // --- (SỬA LỚN) HÀM CHECKOUT ---
    const handleCheckout = async (e) => {
        e.preventDefault();
        // 1. Kiểm tra
        if (!selectedDeparture) { showNotification("Vui lòng chọn một lịch khởi hành."); return; }
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) { showNotification("Vui lòng điền đầy đủ thông tin liên lạc."); return; }
        if (adults <= 0) { showNotification("Phải có ít nhất 1 người lớn."); return; }
        if (currentGuests > maxGuests) { showNotification(`Số khách (${currentGuests}) vượt quá số chỗ còn lại (${maxGuests}).`); return; }
        if (!agreedToTerms) { showNotification("Bạn phải đồng ý với các điều khoản và chính sách."); return; }
        if (!currentUser && !loadingUser) { showNotification("Bạn cần đăng nhập để hoàn tất đặt tour."); setIsSubmitting(false); navigate('/login', { state: { from: location } }); return; }
        if (!currentUser) { showNotification("Đang tải thông tin người dùng, vui lòng đợi..."); return; }

        setIsSubmitting(true);
        const orderId = `TOURZEN-${Date.now()}`;
        let bookingErrorOccurred = false;
        const bookingIds = [];

        // Giỏ hàng giờ chỉ có 1 item
        if (cartItems.length !== 1) {
            console.error("Lỗi logic: CartItems phải có đúng 1 item.", cartItems);
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
            setIsSubmitting(false);
            return;
        }
        const item = cartItems[0];
        const departureId = item.departure_id;
        const guestCount = (item.adults || 0) + (item.children || 0) + (item.infants || 0);

        // 3. Gọi RPC
        toast.loading(`Đang giữ chỗ cho tour "${item.title}"...`);
        const { data: bookedId, error: rpcError } = await supabase.rpc('book_tour_slot', {
            departure_id_input: departureId,
            guest_count_input: guestCount
        });
        toast.dismiss(); 

        if (rpcError || !bookedId) {
            console.error("Lỗi RPC book_tour_slot:", rpcError);
            toast.error(`Rất tiếc! Tour "${item.title}" ngày ${item.departure_date} đã hết chỗ hoặc đã xảy ra lỗi.`);
            setIsSubmitting(false);
            return;
        }

        // 4. (SỬA) Tạo BOOKING PAYLOAD
        const adultPrice = item.priceAdult ?? item.price ?? 0;
        const childPrice = item.priceChild ?? 0;
        const itemTotalPrice = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0);
        const productId = item.tourId ?? item.id; 

        // (SỬA) Dùng cấu trúc Bảng Bookings của bạn (image_6e27fc.png)
        const bookingPayload = {
            user_id: currentUser.id,
            product_id: productId,
            departure_id: departureId,
            departure_date: item.departure_date, // Tên cột của bạn là departure_date (kiểu timestamptz)
            num_adult: item.adults,
            num_child: item.children || 0,
            tota_price: itemTotalPrice, // Tên cột của bạn là tota_price
            status: 'pending', 
            notes: notes,
            quantity: guestCount, // Tên cột của bạn là quantity
        };
        
        const { data: bookingData, error: insertError } = await supabase
            .from('Bookings')
            .insert(bookingPayload) 
            .select() 
            .single();

        if (insertError) {
            console.error(`Lỗi khi lưu booking:`, insertError); 
            toast.error(`Lỗi lưu đặt chỗ: ${insertError.message}`);
            // TODO: Cần có logic "hoàn trả" lại slot đã book nếu bước này lỗi
            bookingErrorOccurred = true; 
        } else if (bookingData) {
            bookingIds.push(bookingData.id);
        }

        if (bookingErrorOccurred) { setIsSubmitting(false); return; }

        // 5. Gửi Email (Giữ nguyên)
        toast.loading("Đang gửi email xác nhận...");
        const selectedTransportInfo = availableTransport.find(t => t.id === selectedTransport);
        const selectedFlightInfo = availableFlights.find(f => f.id === selectedFlight);
        const service_details_html = `
            ${selectedTransportInfo ? `<li><b>Vận chuyển:</b> ${selectedTransportInfo.name} (${formatCurrency(selectedTransportInfo.price)})</li>` : ''}
            ${selectedFlightInfo ? `<li><b>Chuyến bay:</b> ${selectedFlightInfo.name} (${selectedFlightInfo.details?.code || ''} - ${formatCurrency(selectedFlightInfo.price)})</li>` : ''}
        `;
        const tour_details_html = `<ul>${cartItems
          .map(item => `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE) - Ngày đi: ${item.departure_date || 'N/A'}</li>`) 
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
          toast.dismiss();
          if (!response.ok) { showNotification("Đặt tour thành công nhưng lỗi gửi email.", "warning"); }
          else { toast.success("Đặt tour thành công! Vui lòng kiểm tra email."); }
          
          navigate("/payment-success", { state: {
              method: paymentMethod, branch: selectedBranch, deadline: formattedDeadline,
              orderId: orderId, bookingIds: bookingIds
          } });

        } catch (error) {
            toast.dismiss();
            console.error("Lỗi khi gửi email:", error); showNotification("Đặt tour thành công nhưng có lỗi khi gửi email.", "warning"); navigate("/payment-success", { state: { method: paymentMethod, branch: selectedBranch, deadline: formattedDeadline, orderId: orderId, bookingIds: bookingIds } });
        } finally {
          setIsSubmitting(false);
        }
    };
    // --- KẾT THÚC HÀM CHECKOUT ---


    if (!buyNowItem) {
        return <div className="text-center py-20 text-xl font-semibold dark:text-white">Lỗi: Không có tour nào được chọn. Vui lòng quay lại.</div>;
    }

    return (
        <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-7xl mx-auto">
                 <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-blue-800 dark:text-sky-400">XÁC NHẬN ĐẶT TOUR</h1>
                 </div>

                 <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* --- Cột trái (ĐÃ SỬA) --- */}
                     <div className="lg:col-span-2 space-y-6">
                         
                         {/* CHỌN LỊCH KHỞI HÀNH */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold mb-4 dark:text-white">1. CHỌN LỊCH KHỞI HÀNH</h2>
                             {/* ... JSX chọn lịch khởi hành (giữ nguyên) ... */}
                         </div>

                         {/* Thông tin hành khách */}
                         <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${!selectedDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                             <h2 className="text-xl font-bold mb-4 dark:text-white">2. CHỌN SỐ LƯỢNG KHÁCH</h2>
                             {/* ... JSX chọn số lượng (giữ nguyên) ... */}
                         </div>

                         {/* Thông tin liên lạc */}
                         <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${!selectedDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                             <h2 className="text-xl font-bold mb-4 dark:text-white">3. THÔNG TIN LIÊN LẠC</h2>
                             {/* ... JSX thông tin liên lạc (giữ nguyên) ... */}
                         </div>

                         {/* DỊCH VỤ CỘNG THÊM */}
                         {/* ... (giữ nguyên) ... */}

                         {/* Ghi chú */}
                         {/* ... (giữ nguyên) ... */}

                         {/* Phương thức thanh toán */}
                         {/* ... (giữ nguyên) ... */}
                     </div>

                     {/* --- Cột phải: tóm tắt đơn (ĐÃ SỬA) --- */}
                     <aside className="lg:col-span-1">
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md sticky top-24 self-start">
                             <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-neutral-700 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2>
                             
                             {/* Chỉ hiển thị khi đã chọn tour */}
                             {!selectedDeparture ? (
                                <div className="text-center py-10 text-gray-500 italic">
                                    Vui lòng chọn lịch khởi hành và số lượng khách.
                                </div>
                             ) : (
                                <>
                                    {/* ... JSX tóm tắt đơn hàng (giữ nguyên) ... */}
                                    
                                    <div className="mt-6">
                                        <label className="flex items-center text-sm"> <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 mr-2 accent-sky-500"/> <span className="text-gray-600 dark:text-gray-300"> Tôi đã đọc và đồng ý với <a href="/policy" target="_blank" className="text-blue-600 underline"> Chính sách </a> & <a href="/terms" target="_blank" className="text-blue-600 underline"> Điều khoản </a>. </span> </label>
                                    </div>
                                    {notification.message && ( <p className={`mt-4 text-sm font-medium ${ notification.type === "error" ? "text-red-600" : "text-green-600" }`}> {notification.message} </p> )}
                                    <button type="submit" disabled={isSubmitting || loadingUser || !currentUser || loadingServices || !selectedDeparture || (currentGuests > maxGuests)} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
                                        {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"}
                                    </button>
                                </>
                             )}
                         </div>
                     </aside>
                 </form>
             </div>
             {/* ... (AnimatePresence cho notification) ... */}
        </div>
    );
}
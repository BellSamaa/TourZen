// src/pages/Payment.jsx
// (NÂNG CẤP V3: Tích hợp chọn Slot + chọn Số lượng + Sửa lỗi CSDL)

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
        return selectedDeparture.max_slots - selectedDeparture.booked_slots;
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
    
    // (Tính toán tổng... giữ nguyên)
    const total = useMemo(() => { /* ... */ }, [cartItems]);
    const totalPassengers = useMemo(() => { /* ... */ }, [cartItems]);
    const selectedTransportCost = useMemo(() => { /* ... */ }, [selectedTransport, availableTransport]);
    const selectedFlightCost = useMemo(() => { /* ... */ }, [selectedFlight, availableFlights]);
    const finalTotal = useMemo(() => { /* ... */ }, [total, selectedTransportCost, selectedFlightCost, discount]);
    const paymentDeadline = useMemo(() => { /* ... */ }, [cartItems]);
    const formattedDeadline = paymentDeadline.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    // (Copy y hệt các hàm tính tổng từ file Payment.jsx cũ)
    
    // (useEffect... đã SỬA)
    useEffect(() => {
        async function getUserData() {
            //... (giữ nguyên)
        }
        async function getApprovedServices() {
            //... (giữ nguyên)
        }
        
        // (MỚI) Fetch Lịch khởi hành
        async function fetchDepartures() {
            if (!buyNowItem?.id) {
                setDeparturesLoading(false);
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
            } else {
                setDepartures(data || []);
            }
            setDeparturesLoading(false);
        }

        getUserData();
        getApprovedServices();
        fetchDepartures();
    }, [buyNowItem]); // Chỉ phụ thuộc vào buyNowItem

    // (MỚI) Hàm xử lý tăng giảm số lượng
    const handleIncrease = (type) => {
        if (currentGuests >= maxGuests) {
            toast.error(`Chuyến đi này chỉ còn tối đa ${maxGuests} chỗ.`);
            return;
        }
        if (type === 'adult') setAdults(a => a + 1);
        if (type === 'child') setChildren(c => c + 1);
    };
    const handleDecrease = (type) => {
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
            departure_date: item.departure_date, // Tên cột của bạn là departure_date
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
        // ... (copy y hệt phần gửi email từ file Payment.jsx cũ) ...
        
        // (SỬA) Chỉ cần xóa isBuyNow, không cần clearCart()
        // if (!isBuyNow) { clearCart(); }
        
        navigate("/payment-success", { state: {
            method: paymentMethod, branch: selectedBranch, deadline: formattedDeadline,
            orderId: orderId, bookingIds: bookingIds
        } });
        setIsSubmitting(false);
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
                         
                         {/* (MỚI) CHỌN LỊCH KHỞI HÀNH */}
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-bold mb-4 dark:text-white">1. CHỌN LỊCH KHỞI HÀNH</h2>
                             {departuresLoading && (
                                <div className="flex justify-center items-center p-5">
                                    <FaSpinner className="animate-spin text-2xl text-sky-500" />
                                    <p className="ml-3 text-slate-600 dark:text-slate-400">Đang tải lịch khởi hành...</p>
                                </div>
                             )}
                             {!departuresLoading && departures.length === 0 && (
                                <div className="text-center p-5 text-lg text-slate-500 dark:text-slate-400 italic">
                                    <FaCalendarAlt className="mx-auto text-3xl mb-3 opacity-50" />
                                    Tour này hiện đã hết lịch khởi hành.
                                </div>
                             )}
                             {!departuresLoading && departures.length > 0 && (
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {departures.map(dep => {
                                        const remaining = dep.max_slots - dep.booked_slots;
                                        const isFull = remaining <= 0;
                                        const isSelected = dep.id === selectedDepartureId;
                                        return (
                                            <div
                                                key={dep.id}
                                                onClick={() => !isFull && setSelectedDepartureId(dep.id)}
                                                className={`p-4 border-2 rounded-lg transition-all duration-300 flex justify-between items-center ${isFull ? 'bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed' : 'bg-white dark:bg-slate-700 cursor-pointer hover:shadow-md hover:border-sky-400'} ${isSelected ? 'border-sky-500 shadow-lg bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-slate-600'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-sky-500 bg-sky-500' : 'border-gray-400'}`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <div>
                                                        <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                                                            {new Date(dep.departure_date + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </span>
                                                        <div className={`text-sm font-medium ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                                                            {isFull ? 'Đã hết chỗ' : `Còn ${remaining} chỗ`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-red-600">{formatCurrency(dep.adult_price)}</div>
                                                    <div className="text-xs text-slate-500">/ người lớn</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                             )}
                         </div>

                         {/* (MỚI) Thông tin hành khách */}
                         <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${!selectedDeparture ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             <h2 className="text-xl font-bold mb-4 dark:text-white">2. CHỌN SỐ LƯỢNG KHÁCH</h2>
                             <div className="space-y-4 max-w-sm">
                                <QuantityInput 
                                    label="Người lớn"
                                    icon={FaUser}
                                    value={adults}
                                    onDecrease={() => handleDecrease('adult')}
                                    onIncrease={() => handleIncrease('adult')}
                                    max={maxGuests}
                                    min={1}
                                    disabled={!selectedDeparture}
                                />
                                <QuantityInput 
                                    label="Trẻ em"
                                    icon={FaChild}
                                    value={children}
                                    onDecrease={() => handleDecrease('child')}
                                    onIncrease={() => handleIncrease('child')}
                                    max={maxGuests - adults}
                                    min={0}
                                    disabled={!selectedDeparture}
                                />
                             </div>
                             {selectedDeparture && (
                                <div className="mt-4 text-sm text-sky-600 dark:text-sky-400 font-semibold">
                                    {currentGuests > maxGuests ? 
                                        <span className="text-red-500">Số khách đã chọn ({currentGuests}) vượt quá số chỗ còn lại ({maxGuests}).</span> :
                                        `Tour này còn tối đa ${maxGuests} chỗ.`
                                    }
                                </div>
                             )}
                         </div>

                         {/* Thông tin liên lạc */}
                         <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${!selectedDeparture ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             <h2 className="text-xl font-bold mb-4 dark:text-white">3. THÔNG TIN LIÊN LẠC</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <InfoInput icon={FaUserFriends} name="name" placeholder="Họ tên *" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={!selectedDeparture} />
                                 <InfoInput icon={IoIosCall} name="phone" type="tel" placeholder="Điện thoại *" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={!selectedDeparture} />
                                 <InfoInput icon={IoIosMail} name="email" type="email" placeholder="Email *" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={!selectedDeparture || !!currentUser}/>
                                 <InfoInput icon={FaMapMarkerAlt} name="address" placeholder="Địa chỉ" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} disabled={!selectedDeparture} />
                             </div>
                             {/* ... (loading user text) ... */}
                         </div>

                         {/* DỊCH VỤ CỘNG THÊM (Giữ nguyên) */}
                         {/* ... (code giữ nguyên) ... */}

                         {/* Ghi chú (Giữ nguyên) */}
                         {/* ... (code giữ nguyên) ... */}

                         {/* Phương thức thanh toán (Giữ nguyên) */}
                         {/* ... (code giữ nguyên) ... */}
                     </div>

                     {/* --- Cột phải: tóm tắt đơn (ĐÃ SỬA) --- */}
                     <aside className="lg:col-span-1">
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md sticky top-24 self-start">
                             <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-neutral-700 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2>
                             
                             {/* (SỬA) Chỉ hiển thị khi đã chọn tour */}
                             {!selectedDeparture ? (
                                <div className="text-center py-10 text-gray-500 italic">
                                    Vui lòng chọn lịch khởi hành và số lượng khách.
                                </div>
                             ) : (
                                <>
                                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
                                        {cartItems.map((item) => { 
                                            const adultPrice = item.priceAdult ?? item.price ?? 0; 
                                            const childPrice = item.priceChild ?? 0; 
                                            const itemDisplayTotal = (item.adults * adultPrice) + ((item.children || 0) * childPrice) + (item.singleSupplement || 0); 
                                            const itemTitle = item.title || item.name || '';
                                            const itemImage = item.image || (itemTitle ? `/images/tour-${slugify(itemTitle)}.jpg` : "/images/default.jpg");

                                            return ( 
                                            <div key={item.key || item.id} className="flex gap-4 border-b pb-2 last:border-0 dark:border-neutral-700"> 
                                                <img src={itemImage} alt={item.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"/> 
                                                <div className="flex-grow min-w-0"> 
                                                    <p className="font-bold text-sm text-blue-800 dark:text-sky-400 truncate">{item.title}</p> 
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{`Ngày đi: ${item.departure_date}`}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{`${item.adults} NL, ${item.children || 0} TE`}</p>
                                                    <p className="text-sm font-semibold dark:text-white"> {formatCurrency(itemDisplayTotal)} </p> 
                                                </div> 
                                            </div> 
                                            ); 
                                        })}
                                    </div>

                                    <div className="space-y-2 text-sm border-t pt-4 dark:border-neutral-700 dark:text-gray-300">
                                        <div className="flex justify-between font-semibold"> <span>Tổng số khách</span> <span>{totalPassengers}</span> </div>
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
                                    {notification.message && ( <p className={`mt-4 text-sm font-medium ${ notification.type === "error" ? "text-red-600" : "text-green-600" }`}> {notification.message} </p> )}
                                    <button type="submit" disabled={isSubmitting || loadingUser || !currentUser || loadingServices || !selectedDeparture} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
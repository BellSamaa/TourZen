// src/pages/Payment.jsx
// (V5: Giữ code gốc + THÊM Slot/Số lượng + GỌI RPC + Sửa lỗi Date + THÊM CONSOLE LOGS)

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaSpinner, FaCar, FaPlane, FaPlus,
    FaUser, FaChild, FaMinus, FaUsers, FaCalendarAlt // Icons mới
} from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast'; // Đảm bảo đã import toast

const supabase = getSupabase();

// --- Hàm slugify (Giữ nguyên) ---
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

// --- QuantityInput (MỚI) ---
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
    const { items: cartItemsFromContext, clearCart, total: totalFromContext } = useCart();

    // --- Logic "Buy Now" ---
    const buyNowItem = location.state?.item;
    const isBuyNow = !!buyNowItem;

    // --- THÊM CONSOLE LOG KIỂM TRA isBuyNow ---
    console.log("RENDERING PAYMENT - isBuyNow:", isBuyNow);
    // --- KẾT THÚC THÊM ---

    // --- State cho Lịch khởi hành (MỚI) ---
    const [departures, setDepartures] = useState([]);
    const [departuresLoading, setDeparturesLoading] = useState(true);
    const [selectedDepartureId, setSelectedDepartureId] = useState(null);

    // --- State cho số lượng khách (MỚI) ---
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    // --- Dữ liệu được chọn (MỚI) ---
    const selectedDeparture = useMemo(() => {
        if (!Array.isArray(departures)) return null;
        return departures.find(d => d.id === selectedDepartureId);
    }, [departures, selectedDepartureId]);

    const maxGuests = useMemo(() => {
        if (!selectedDeparture) return 0;
        return (selectedDeparture.max_slots || 0) - (selectedDeparture.booked_slots || 0);
    }, [selectedDeparture]);
    const currentGuests = adults + children;

    // --- cartItems (Sửa lại để kết hợp logic + THÊM CONSOLE LOG) ---
    const cartItems = useMemo(() => {
        // Nếu là Buy Now VÀ đã chọn lịch
        if (isBuyNow && buyNowItem && selectedDeparture) {
            const slug = buyNowItem.name ? slugify(buyNowItem.name) : '';
            const image = buyNowItem.image_url || (buyNowItem.galleryImages && buyNowItem.galleryImages[0]) || (slug ? `/images/tour-${slug}.jpg` : "/images/default.jpg");
            const buyNowCartItem = [{
                key: selectedDeparture.id, title: buyNowItem.name, image: image,
                priceAdult: selectedDeparture.adult_price, priceChild: selectedDeparture.child_price,
                departure_id: selectedDeparture.id, departure_date: selectedDeparture.departure_date,
                adults: adults, children: children, infants: 0,
                tourId: buyNowItem.id, id: buyNowItem.id, location: buyNowItem.location,
            }];
            // --- THÊM CONSOLE LOG ---
            console.log("Cart Items in Payment (Buy Now - Departure Selected):", buyNowCartItem);
            // --- KẾT THÚC THÊM ---
            return buyNowCartItem;
        }
        // Nếu là giỏ hàng cũ
        if (!isBuyNow) {
             const contextCartItems = cartItemsFromContext.map(item => ({
                 ...item,
                 image: item.image || (item.title ? `/images/tour-${slugify(item.title)}.jpg` : "/images/default.jpg"),
                 priceAdult: item.priceAdult ?? item.price ?? 0,
                 adults: item.adults || 1,
                 month: item.month, // Giữ lại month/departureDates gốc từ context
                 departureDates: item.departureDates
             }));
             // --- THÊM CONSOLE LOG ---
             console.log("Cart Items in Payment (From Context):", contextCartItems);
             // --- KẾT THÚC THÊM ---
             return contextCartItems;
        }
        // Trường hợp Buy Now nhưng chưa chọn lịch => mảng rỗng
        // --- THÊM CONSOLE LOG ---
        console.log("Cart Items in Payment (Buy Now - No Departure Yet):", []);
        // --- KẾT THÚC THÊM ---
        return [];
    }, [isBuyNow, buyNowItem, selectedDeparture, cartItemsFromContext, adults, children]);

    // --- Các state khác (Giữ nguyên) ---
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


    // --- Tính toán tổng (Giữ nguyên) ---
    const total = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const adultPrice = item.priceAdult ?? 0;
            const childPrice = item.priceChild ?? 0;
            const numAdults = Number(item.adults) || 0;
            const numChildren = Number(item.children) || 0;
            const itemTotal = (numAdults * adultPrice) + (numChildren * childPrice) + (Number(item.singleSupplement) || 0);
            return sum + itemTotal;
        }, 0);
     }, [cartItems]);
    const totalPassengers = useMemo(() => cartItems.reduce((sum, item) => sum + (Number(item.adults) || 0) + (Number(item.children) || 0) + (Number(item.infants) || 0), 0), [cartItems]);
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

    // --- Tính hạn thanh toán (Giữ nguyên phiên bản an toàn) ---
    const paymentDeadline = useMemo(() => {
        let dateToProcess = null;
        try {
            if (isBuyNow && selectedDeparture?.departure_date) {
                dateToProcess = selectedDeparture.departure_date;
            } else if (!isBuyNow && cartItems.length > 0) {
                 const dates = cartItems[0]?.departureDates;
                 if (Array.isArray(dates) && dates.length > 0) {
                     const sortedDates = [...dates].sort();
                     dateToProcess = sortedDates[0];
                 }
            }
            if (dateToProcess) {
                if (typeof dateToProcess !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateToProcess)) {
                     console.warn("Invalid date format:", dateToProcess); return null;
                }
                const parsedDate = new Date(dateToProcess + 'T00:00:00Z');
                if (!isNaN(parsedDate.getTime())) {
                    parsedDate.setDate(parsedDate.getDate() - 7);
                    return parsedDate;
                } else { console.warn("Could not parse date:", dateToProcess); }
            }
        } catch (error) { console.error("Deadline error:", error); }
        return null;
    }, [cartItems, isBuyNow, selectedDeparture]);
    const formattedDeadline = useMemo(() => {
        if (paymentDeadline instanceof Date && !isNaN(paymentDeadline)) {
            try { return paymentDeadline.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
            catch (e) { console.error("Format date error:", e); return "Lỗi ngày"; }
        }
        return "N/A";
    }, [paymentDeadline]);

    // --- useEffect (Giữ nguyên logic fetch) ---
    useEffect(() => {
        async function getUserData() {
            setLoadingUser(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                setContactInfo(prev => ({ ...prev, email: user.email }));
                const { data: userData, error } = await supabase.from('Users').select('full_name').eq('id', user.id).maybeSingle();
                if (userData) { setContactInfo(prev => ({ ...prev, name: userData.full_name || prev.name })); }
                else if (error && error.code !== 'PGRST116') { console.warn("Lỗi lấy full_name:", error.message); }
            }
            setLoadingUser(false);
         }
        async function getApprovedServices() {
            setLoadingServices(true);
            const { data: servicesData, error } = await supabase.from('Products').select('*').in('product_type', ['transport', 'flight']).eq('approval_status', 'approved');
            if (error) { toast.error("Lỗi tải dịch vụ cộng thêm."); }
            else {
                setAvailableTransport(servicesData.filter(s => s.product_type === 'transport'));
                setAvailableFlights(servicesData.filter(s => s.product_type === 'flight'));
            }
            setLoadingServices(false);
         }
        async function fetchDepartures() {
            if (!buyNowItem?.id) { setDeparturesLoading(false); setDepartures([]); return; }
            setDeparturesLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase.from("Departures").select("*").eq("product_id", buyNowItem.id).gte("departure_date", today).order("departure_date", { ascending: true });
            if (error) { toast.error("Lỗi tải lịch khởi hành."); setDepartures([]); }
            else { setDepartures(data || []); }
            setDeparturesLoading(false);
        }
        getUserData();
        getApprovedServices();
        if (isBuyNow) { fetchDepartures(); }
        else { setDeparturesLoading(false); }
    }, [buyNowItem, isBuyNow]);

    // --- Các handlers (Giữ nguyên) ---
    const handleIncrease = (type) => {
        if (!selectedDeparture) return;
        if (currentGuests >= maxGuests) { toast.error(`Chỉ còn tối đa ${maxGuests} chỗ.`); return; }
        if (type === 'adult') setAdults(a => a + 1);
        if (type === 'child') setChildren(c => c + 1);
     };
    const handleDecrease = (type) => {
        if (!selectedDeparture) return;
        if (type === 'adult' && adults > 1) setAdults(a => a - 1);
        if (type === 'child' && children > 0) setChildren(c => c - 1);
    };
    const handleInputChange = (e, setState) => { setState((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
    const showNotification = (message, type = "error") => { setNotification({ message, type }); setTimeout(() => setNotification({ message: "", type: "" }), 4000); };

    // --- handleCheckout (Giữ nguyên logic gọi RPC + payload CSDL) ---
    const handleCheckout = async (e) => {
        e.preventDefault();
        // 1. Kiểm tra (giữ nguyên)
        if (isBuyNow && !selectedDeparture) { showNotification("Vui lòng chọn lịch khởi hành."); return; }
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) { showNotification("Vui lòng điền thông tin liên lạc."); return; }
        if (isBuyNow && adults <= 0) { showNotification("Phải có ít nhất 1 người lớn."); return; }
        if (isBuyNow && currentGuests > maxGuests) { showNotification(`Số khách vượt quá số chỗ còn lại.`); return; }
        if (!agreedToTerms) { showNotification("Bạn phải đồng ý điều khoản."); return; }
        if (!currentUser && !loadingUser) { showNotification("Bạn cần đăng nhập."); navigate('/login', { state: { from: location } }); return; }
        if (!currentUser) { showNotification("Đang tải thông tin..."); return; }

        setIsSubmitting(true);
        const orderId = `TOURZEN-${Date.now()}`;
        let bookingErrorOccurred = false;
        const bookingIds = [];

        for (const item of cartItems) {
            const numAdults = Number(item.adults) || 0;
            const numChildren = Number(item.children) || 0;
            const numInfants = Number(item.infants) || 0;
            const quantity = numAdults + numChildren + numInfants;
            const adultPrice = item.priceAdult ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotalPrice = (numAdults * adultPrice) + (numChildren * childPrice) + (Number(item.singleSupplement) || 0);
            const productId = item.tourId ?? item.id;

            if (!productId) { bookingErrorOccurred = true; break; }

            // --- Gọi RPC NẾU LÀ BUY NOW ---
            let bookedIdSuccess = !isBuyNow;
            if (isBuyNow && item.departure_id) {
                 const guestCountForRPC = quantity;
                 toast.loading(`Đang giữ chỗ...`);
                 const { data: bookedId, error: rpcError } = await supabase.rpc('book_tour_slot', { departure_id_input: item.departure_id, guest_count_input: guestCountForRPC });
                 toast.dismiss();
                 if (rpcError || !bookedId) { bookingErrorOccurred = true; bookedIdSuccess = false; toast.error(`Hết chỗ hoặc lỗi.`); break; }
                 bookedIdSuccess = true;
            }
            // --- Kết thúc RPC ---

            if (!bookingErrorOccurred && bookedIdSuccess) {
                const bookingPayload = {
                    user_id: currentUser.id, product_id: productId, quantity: quantity,
                    tota_price: itemTotalPrice, status: 'pending', notes: notes,
                    num_adult: numAdults, num_child: numChildren,
                    departure_id: item.departure_id || null, departure_date: item.departure_date || null,
                    // transport_product_id: selectedTransport || null, // Bỏ comment nếu có cột
                    // flight_product_id: selectedFlight || null,       // Bỏ comment nếu có cột
                };
                const { data: bookingData, error: insertError } = await supabase.from('Bookings').insert(bookingPayload).select().single();
                if (insertError) { bookingErrorOccurred = true; toast.error(`Lỗi lưu: ${insertError.message}`); break; }
                else if (bookingData) { bookingIds.push(bookingData.id); }
            } else if (bookingErrorOccurred) { break; }
        } // Hết vòng lặp

        if (bookingErrorOccurred) { setIsSubmitting(false); return; }

        // --- Gửi Email (giữ nguyên) ---
        toast.loading("Đang gửi email...");
        const tour_details_html = `<ul>${cartItems.map(item => `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE) - ${item.departure_date ? `Ngày đi: ${item.departure_date}` : (item.month ? `Tháng: ${item.month}`: 'N/A')}</li>`).join("")}</ul>`;
        try {
            const response = await fetch("/api/sendEmail", { /* ... */ });
            toast.dismiss();
            if (!response.ok) { showNotification("Đặt thành công nhưng lỗi gửi email.", "warning"); }
            else { toast.success("Đặt thành công! Kiểm tra email."); }
            if (!isBuyNow) { clearCart(); }
            navigate("/payment-success", { state: { /* ... */ } });
        } catch (error) { /* ... */ }
        finally { setIsSubmitting(false); }
    };
    // --- KẾT THÚC HÀM CHECKOUT ---


    // --- Kiểm tra giỏ hàng rỗng (giữ nguyên) ---
    if ((!cartItems || cartItems.length === 0) && !(isBuyNow && !selectedDeparture && !departuresLoading)) { /* ... */ }

    // --- JSX (giữ nguyên cấu trúc, thêm phần chọn slot/số lượng khi isBuyNow) ---
    return (
        <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-7xl mx-auto">
                 {/* ... (Tiêu đề) ... */}
                 <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* --- Cột trái --- */}
                     <div className="lg:col-span-2 space-y-6">
                         {/* (MỚI) CHỌN LỊCH KHỞI HÀNH (Chỉ hiển thị nếu là Buy Now) */}
                         {isBuyNow && ( /* ... JSX chọn lịch ... */ )}
                         {/* (MỚI) Thông tin hành khách (Chỉ hiển thị nếu là Buy Now) */}
                         {isBuyNow && ( /* ... JSX chọn số lượng ... */ )}
                         {/* Thông tin liên lạc */}
                         <div className={`bg-white ... ${isBuyNow && !selectedDeparture ? 'opacity-50 ...' : ''}`}> {/* Thêm disabled style */}
                             <h2 className="text-xl ...">{isBuyNow ? '3.' : ''} THÔNG TIN LIÊN LẠC</h2>
                             {/* ... Inputs ... */}
                         </div>
                         {/* DỊCH VỤ CỘNG THÊM */}
                         {(availableTransport.length > 0 || availableFlights.length > 0 || loadingServices) && (
                             <div className={`bg-white ... ${isBuyNow && !selectedDeparture ? 'opacity-50 ...' : ''}`}> {/* Thêm disabled style */}
                                 {/* ... JSX dịch vụ ... */}
                             </div>
                         )}
                         {/* Ghi chú */}
                         <div className={`bg-white ... ${isBuyNow && !selectedDeparture ? 'opacity-50 ...' : ''}`}> {/* Thêm disabled style */}
                             {/* ... JSX ghi chú ... */}
                         </div>
                         {/* Phương thức thanh toán */}
                         <div className={`bg-white ... ${isBuyNow && !selectedDeparture ? 'opacity-50 ...' : ''}`}> {/* Thêm disabled style */}
                             {/* ... JSX thanh toán ... */}
                         </div>
                     </div>
                     {/* --- Cột phải: tóm tắt đơn --- */}
                     <aside className="lg:col-span-1">
                        {/* ... JSX tóm tắt đơn giữ nguyên ... */}
                     </aside>
                 </form>
             </div>
             {/* ... AnimatePresence ... */}
        </div>
    );
}
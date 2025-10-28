// src/pages/Payment.jsx
// (V4: Giữ cấu trúc gốc + THÊM Slot & Số lượng + GỌI RPC + Sửa lỗi Date + Khôi phục JSX)

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

    // --- (SỬA LỚN) Logic "Buy Now" (Mua ngay) ---
    const buyNowItem = location.state?.item; // Chỉ nhận thông tin tour
    const isBuyNow = !!buyNowItem;

    // (MỚI) State cho Lịch khởi hành
    const [departures, setDepartures] = useState([]);
    const [departuresLoading, setDeparturesLoading] = useState(true);
    const [selectedDepartureId, setSelectedDepartureId] = useState(null);

    // (MỚI) State cho số lượng khách
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    // (MỚI) Lịch khởi hành được chọn
    const selectedDeparture = useMemo(() => {
        // Đảm bảo departures là mảng trước khi find
        if (!Array.isArray(departures)) return null;
        return departures.find(d => d.id === selectedDepartureId);
    }, [departures, selectedDepartureId]);

    // (MỚI) Tính toán số chỗ còn lại
    const maxGuests = useMemo(() => {
        if (!selectedDeparture) return 0;
        return (selectedDeparture.max_slots || 0) - (selectedDeparture.booked_slots || 0); // An toàn hơn
    }, [selectedDeparture]);
    const currentGuests = adults + children;

    const cartItems = useMemo(() => {
        // Chỉ hoạt động khi là Buy Now VÀ đã chọn lịch
        if (isBuyNow && buyNowItem && selectedDeparture) {
            const slug = buyNowItem.name ? slugify(buyNowItem.name) : '';
            const image = buyNowItem.image_url ||
                          (buyNowItem.galleryImages && buyNowItem.galleryImages[0]) ||
                          (slug ? `/images/tour-${slug}.jpg` : "/images/default.jpg");

            return [{
                key: selectedDeparture.id,
                title: buyNowItem.name,
                image: image,
                priceAdult: selectedDeparture.adult_price, // Lấy giá ĐÚNG từ selectedDeparture
                priceChild: selectedDeparture.child_price,
                priceInfant: 0,
                singleSupplement: 0,
                departure_id: selectedDeparture.id, // (MỚI)
                departure_date: selectedDeparture.departure_date, // (MỚI)
                adults: adults, // Lấy từ state
                children: children, // Lấy từ state
                infants: 0,
                tourId: buyNowItem.id,
                id: buyNowItem.id,
                location: buyNowItem.location,
                // --- Xóa bỏ month và departureDates cũ ---
            }];
        }
        // Nếu không phải "Mua ngay" hoặc chưa chọn lịch, trả về giỏ hàng cũ
        // Cần đảm bảo giỏ hàng cũ có đủ thông tin cần thiết
        return cartItemsFromContext.map(item => ({
             ...item,
             image: item.image || (item.title ? `/images/tour-${slugify(item.title)}.jpg` : "/images/default.jpg"),
             priceAdult: item.priceAdult ?? item.price ?? 0,
             adults: item.adults || 1
         }));
    }, [isBuyNow, buyNowItem, selectedDeparture, cartItemsFromContext, adults, children]);
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

    // Logic tính tổng (Sửa lại để dùng cartItems mới)
    const total = useMemo(() => {
        // Luôn tính toán dựa trên cartItems hiện tại
        return cartItems.reduce((sum, item) => {
            const adultPrice = item.priceAdult ?? 0;
            const childPrice = item.priceChild ?? 0;
            const numAdults = Number(item.adults) || 0;
            const numChildren = Number(item.children) || 0;
            const itemTotal = (numAdults * adultPrice) + (numChildren * childPrice) + (Number(item.singleSupplement) || 0);
            return sum + itemTotal;
        }, 0);
    }, [cartItems]); // Chỉ phụ thuộc cartItems

    const totalPassengers = useMemo(
        () => cartItems.reduce((sum, item) => sum + (Number(item.adults) || 0) + (Number(item.children) || 0) + (Number(item.infants) || 0), 0),
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

    // (SỬA LẠI LẦN CUỐI) Tính hạn thanh toán an toàn
    const paymentDeadline = useMemo(() => {
        let dateToProcess = null;
        try {
            // Ưu tiên ngày từ selectedDeparture nếu là Buy Now
            if (isBuyNow && selectedDeparture?.departure_date) {
                dateToProcess = selectedDeparture.departure_date;
            }
            // Fallback cho giỏ hàng cũ (lấy ngày đầu tiên nếu có và hợp lệ)
            else if (!isBuyNow && cartItems.length > 0) {
                 // Giả định giỏ hàng cũ lưu ngày trong departureDates
                 const dates = cartItems[0]?.departureDates;
                 if (Array.isArray(dates) && dates.length > 0) {
                     const sortedDates = [...dates].sort();
                     dateToProcess = sortedDates[0];
                 }
            }

            if (dateToProcess) {
                const parsedDate = new Date(dateToProcess + 'T00:00:00Z');
                if (!isNaN(parsedDate.getTime())) {
                    parsedDate.setDate(parsedDate.getDate() - 7);
                    return parsedDate;
                } else {
                     console.warn("Invalid date format in paymentDeadline:", dateToProcess);
                }
            }
        } catch (error) {
            console.error("Error calculating payment deadline:", error);
        }
        return null; // Trả về null nếu không có ngày hoặc có lỗi
    }, [cartItems, isBuyNow, selectedDeparture]);

    // Format an toàn
    const formattedDeadline = useMemo(() => {
        if (paymentDeadline instanceof Date && !isNaN(paymentDeadline)) {
            try {
                return paymentDeadline.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
            } catch (e) { console.error("Error formatting date:", e); return "Lỗi ngày"; }
        }
        return "N/A"; // Hiển thị N/A nếu không có ngày
    }, [paymentDeadline]);
    // --- KẾT THÚC SỬA ---

    // (SỬA) useEffect
    useEffect(() => {
        async function getUserData() {
            setLoadingUser(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
            if (user) {
                setContactInfo(prev => ({ ...prev, email: user.email }));
                // Chỉ lấy full_name nếu Users table tồn tại và có dữ liệu
                const { data: userData, error } = await supabase.from('Users').select('full_name').eq('id', user.id).maybeSingle();
                if (userData) { setContactInfo(prev => ({ ...prev, name: userData.full_name || prev.name })); }
                // Không log lỗi nếu chỉ là không tìm thấy user (PGRST116)
                else if (error && error.code !== 'PGRST116') { console.warn("Lỗi lấy full_name:", error.message); }
            }
            setLoadingUser(false);
        }
        async function getApprovedServices() {
            setLoadingServices(true);
            const { data: servicesData, error } = await supabase
                .from('Products').select('*')
                .in('product_type', ['transport', 'flight'])
                .eq('approval_status', 'approved');
            if (error) { toast.error("Lỗi tải tùy chọn vận chuyển/chuyến bay."); }
            else {
                setAvailableTransport(servicesData.filter(s => s.product_type === 'transport'));
                setAvailableFlights(servicesData.filter(s => s.product_type === 'flight'));
            }
            setLoadingServices(false);
         }

        // (MỚI) Fetch Lịch khởi hành chỉ khi là Buy Now
        async function fetchDepartures() {
            if (!buyNowItem?.id) { setDeparturesLoading(false); setDepartures([]); return; }
            setDeparturesLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from("Departures").select("*").eq("product_id", buyNowItem.id)
                .gte("departure_date", today).order("departure_date", { ascending: true });
            if (error) { toast.error("Lỗi tải lịch khởi hành."); setDepartures([]); }
            else { setDepartures(data || []); }
            setDeparturesLoading(false);
        }

        getUserData();
        getApprovedServices();
        if (isBuyNow) { fetchDepartures(); }
        else { setDeparturesLoading(false); }
    }, [buyNowItem, isBuyNow]);

    // (MỚI) Hàm xử lý tăng giảm số lượng
    const handleIncrease = (type) => {
        if (!selectedDeparture) return;
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
        if (isBuyNow && !selectedDeparture) { showNotification("Vui lòng chọn một lịch khởi hành."); return; }
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) { showNotification("Vui lòng điền đầy đủ thông tin liên lạc."); return; }
        if (isBuyNow && adults <= 0) { showNotification("Phải có ít nhất 1 người lớn."); return; }
        if (isBuyNow && currentGuests > maxGuests) { showNotification(`Số khách (${currentGuests}) vượt quá số chỗ còn lại (${maxGuests}).`); return; }
        if (!agreedToTerms) { showNotification("Bạn phải đồng ý với các điều khoản và chính sách."); return; }
        if (!currentUser && !loadingUser) { showNotification("Bạn cần đăng nhập để hoàn tất đặt tour."); setIsSubmitting(false); navigate('/login', { state: { from: location } }); return; }
        if (!currentUser) { showNotification("Đang tải thông tin người dùng, vui lòng đợi..."); return; }

        setIsSubmitting(true);
        const orderId = `TOURZEN-${Date.now()}`;
        let bookingErrorOccurred = false;
        const bookingIds = [];

        for (const item of cartItems) {
            const quantity = (Number(item.adults) || 0) + (Number(item.children) || 0) + (Number(item.infants) || 0); // Đảm bảo là số
            const adultPrice = item.priceAdult ?? 0;
            const childPrice = item.priceChild ?? 0;
            const itemTotalPrice = ((Number(item.adults) || 0) * adultPrice) + ((Number(item.children) || 0) * childPrice) + (Number(item.singleSupplement) || 0);
            const productId = item.tourId ?? item.id;

            if (!productId) { console.error(`Item "${item.title}" thiếu ID sản phẩm.`); showNotification(`Sản phẩm "${item.title}" trong giỏ hàng bị lỗi ID.`); bookingErrorOccurred = true; break; }

            // --- Gọi RPC NẾU LÀ BUY NOW VÀ CÓ departure_id ---
            let bookedIdSuccess = !isBuyNow; // Mặc định true nếu là giỏ hàng cũ
            if (isBuyNow && item.departure_id) {
                 const guestCountForRPC = quantity;
                 toast.loading(`Đang giữ chỗ...`);
                 const { data: bookedId, error: rpcError } = await supabase.rpc('book_tour_slot', {
                     departure_id_input: item.departure_id,
                     guest_count_input: guestCountForRPC
                 });
                 toast.dismiss();
                 if (rpcError || !bookedId) {
                     console.error("Lỗi RPC:", rpcError);
                     toast.error(`Hết chỗ hoặc lỗi khi giữ chỗ.`);
                     bookingErrorOccurred = true;
                     bookedIdSuccess = false;
                     break;
                 }
                 bookedIdSuccess = true;
            }
            // --- Kết thúc RPC ---

            // Chỉ insert nếu không lỗi VÀ (là giỏ hàng cũ HOẶC đã book slot thành công)
            if (!bookingErrorOccurred && bookedIdSuccess) {
                 // Payload (Đảm bảo đúng cột CSDL của bạn)
                const bookingPayload = {
                    user_id: currentUser.id, product_id: productId, quantity: quantity,
                    tota_price: itemTotalPrice, status: 'pending', notes: notes,
                    num_adult: Number(item.adults) || 0, num_child: Number(item.children) || 0,
                    departure_id: item.departure_id || null,
                    departure_date: item.departure_date || null, // Cột của bạn (kiểu timestamptz)
                };

                const { data: bookingData, error: insertError } = await supabase
                    .from('Bookings').insert(bookingPayload).select().single();

                if (insertError) {
                     console.error(`Lỗi khi lưu booking:`, insertError);
                     let friendlyMessage = insertError.message;
                     if (insertError.message.includes("violates row-level security policy")) { friendlyMessage = "Lỗi bảo mật: Bạn không có quyền đặt tour."; }
                     else if (insertError.code === "23503") { friendlyMessage = `Lỗi dữ liệu: Tour hoặc Lịch trình không tồn tại.`; }
                     else if (insertError.code === "42703") { friendlyMessage = "Lỗi DB: Cột không tồn tại."; }
                     toast.error(`Lỗi lưu đặt chỗ: ${friendlyMessage}`);

                     // --- (QUAN TRỌNG) TODO: Hoàn trả slot nếu insert lỗi ---
                     // if (isBuyNow && item.departure_id && bookedIdSuccess) {
                     //    console.warn("Cần hoàn trả slot đã book do insert lỗi!");
                     //    // await supabase.rpc('unbook_tour_slot', { departure_id_input: item.departure_id, guest_count_input: guestCountForRPC });
                     // }
                     // ---

                     bookingErrorOccurred = true;
                     break;
                } else if (bookingData) {
                    bookingIds.push(bookingData.id);
                }
            } else if (bookingErrorOccurred) { break; }
        } // Hết vòng lặp

        if (bookingErrorOccurred) { setIsSubmitting(false); return; }

        // Gửi Email (Giữ nguyên)
        toast.loading("Đang gửi email xác nhận...");
        const selectedTransportInfo = availableTransport.find(t => t.id === selectedTransport);
        const selectedFlightInfo = availableFlights.find(f => f.id === selectedFlight);
        const service_details_html = `
            ${selectedTransportInfo ? `<li><b>Vận chuyển:</b> ${selectedTransportInfo.name} (${formatCurrency(selectedTransportInfo.price)})</li>` : ''}
            ${selectedFlightInfo ? `<li><b>Chuyến bay:</b> ${selectedFlightInfo.name} (${selectedFlightInfo.details?.code || ''} - ${formatCurrency(selectedFlightInfo.price)})</li>` : ''}
        `;
        const tour_details_html = `<ul>${cartItems
          .map(item => `<li><b>${item.title}</b> (${item.adults} NL, ${item.children || 0} TE) - ${item.departure_date ? `Ngày đi: ${item.departure_date}` : (item.month ? `Tháng: ${item.month}`: 'Chưa chọn lịch')}</li>`) // Hiển thị ngày đi nếu có
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

          if (!isBuyNow) { clearCart(); } // Chỉ clear giỏ hàng cũ

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


    // Giữ nguyên logic kiểm tra giỏ hàng rỗng
    if (!cartItems || cartItems.length === 0) {
        // Nếu là Buy Now nhưng chưa chọn lịch, cũng coi như rỗng
        if(isBuyNow && !selectedDeparture) {
             // Để tránh lỗi render khi buyNowItem có nhưng selectedDeparture chưa có
        } else {
            return <div className="text-center py-20 text-xl font-semibold dark:text-white">Giỏ hàng của bạn đang trống.</div>;
        }
     }

    // --- (SỬA) JSX ---
    return (
        <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-7xl mx-auto">
                 {/* ... (Tiêu đề giữ nguyên) ... */}
                 <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-blue-800 dark:text-sky-400">XÁC NHẬN ĐẶT TOUR</h1>
                 </div>


                 <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* --- Cột trái (ĐÃ SỬA) --- */}
                     <div className="lg:col-span-2 space-y-6">

                         {/* (MỚI) CHỌN LỊCH KHỞI HÀNH (Chỉ hiển thị nếu là Buy Now) */}
                         {isBuyNow && (
                             <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
                                 <h2 className="text-xl font-bold mb-4 dark:text-white">1. CHỌN LỊCH KHỞI HÀNH</h2>
                                 {departuresLoading && ( <div className="flex justify-center items-center p-5"><FaSpinner className="animate-spin text-2xl text-sky-500" /><p className="ml-3 text-slate-600 dark:text-slate-400">Đang tải lịch...</p></div> )}
                                 {!departuresLoading && departures.length === 0 && ( <div className="text-center p-5 text-lg text-slate-500 dark:text-slate-400 italic"><FaCalendarAlt className="mx-auto text-3xl mb-3 opacity-50" />Tour này hiện đã hết lịch khởi hành.</div> )}
                                 {!departuresLoading && departures.length > 0 && (
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {departures.map(dep => {
                                            const remaining = (dep.max_slots || 0) - (dep.booked_slots || 0);
                                            const isFull = remaining <= 0;
                                            const isSelected = dep.id === selectedDepartureId;
                                            return (
                                                <div
                                                    key={dep.id}
                                                    onClick={() => !isFull && setSelectedDepartureId(dep.id)}
                                                    className={`p-4 border-2 rounded-lg transition-all duration-300 flex justify-between items-center ${isFull ? 'bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed' : 'bg-white dark:bg-slate-700 cursor-pointer hover:shadow-md hover:border-sky-400'} ${isSelected ? 'border-sky-500 shadow-lg bg-sky-50 dark:bg-sky-900/30' : 'border-gray-200 dark:border-slate-600'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Radio button */}
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-sky-500 bg-sky-500' : 'border-gray-400'}`}>
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                        </div>
                                                        {/* Ngày và Slot */}
                                                        <div>
                                                            <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                                                                {/* Sửa lại format ngày nếu cần */}
                                                                {dep.departure_date ? new Date(dep.departure_date + 'T00:00:00Z').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                                            </span>
                                                            <div className={`text-sm font-medium ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                                                                {isFull ? 'Đã hết chỗ' : `Còn ${remaining} chỗ`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Giá */}
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
                         )}

                         {/* (MỚI) Thông tin hành khách (Chỉ hiển thị nếu là Buy Now) */}
                         {isBuyNow && (
                             <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${!selectedDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                                 <h2 className="text-xl font-bold mb-4 dark:text-white">2. CHỌN SỐ LƯỢNG KHÁCH</h2>
                                 <div className="space-y-4 max-w-sm">
                                    <QuantityInput
                                        label="Người lớn" icon={FaUser} value={adults}
                                        onDecrease={() => handleDecrease('adult')} onIncrease={() => handleIncrease('adult')}
                                        max={maxGuests} min={1} disabled={!selectedDeparture}
                                    />
                                    <QuantityInput
                                        label="Trẻ em" icon={FaChild} value={children}
                                        onDecrease={() => handleDecrease('child')} onIncrease={() => handleIncrease('child')}
                                        max={maxGuests - adults} min={0} disabled={!selectedDeparture}
                                    />
                                 </div>
                                 {selectedDeparture && (
                                     <div className="mt-4 text-sm text-sky-600 dark:text-sky-400 font-semibold">
                                        {currentGuests > maxGuests ?
                                            <span className="text-red-500">Số khách đã chọn ({currentGuests}) vượt quá số chỗ còn lại ({maxGuests}).</span> :
                                            `Lịch khởi hành này còn tối đa ${maxGuests} chỗ.`
                                        }
                                    </div>
                                 )}
                             </div>
                         )}

                         {/* Thông tin liên lạc (Giữ nguyên logic, thêm disabled) */}
                         <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${isBuyNow && !selectedDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                             <h2 className="text-xl font-bold mb-4 dark:text-white">{isBuyNow ? '3.' : ''} THÔNG TIN LIÊN LẠC</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <InfoInput icon={FaUserFriends} name="name" placeholder="Họ tên *" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={isBuyNow && !selectedDeparture} />
                                 <InfoInput icon={IoIosCall} name="phone" type="tel" placeholder="Điện thoại *" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={isBuyNow && !selectedDeparture} />
                                 <InfoInput icon={IoIosMail} name="email" type="email" placeholder="Email *" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required disabled={(isBuyNow && !selectedDeparture) || !!currentUser}/>
                                 <InfoInput icon={FaMapMarkerAlt} name="address" placeholder="Địa chỉ" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} disabled={isBuyNow && !selectedDeparture} />
                             </div>
                             {loadingUser ? <p className="text-sm text-gray-500 mt-2">Đang tải...</p> : currentUser ? <p className="text-sm text-green-600 mt-2">Tài khoản: {currentUser.email}</p> : <p className="text-sm text-blue-600 mt-2">Bạn cần <Link to="/login" state={{ from: location }} className="font-bold underline">Đăng nhập</Link>.</p> }
                         </div>

                         {/* (KHÔI PHỤC) DỊCH VỤ CỘNG THÊM */}
                         {(availableTransport.length > 0 || availableFlights.length > 0 || loadingServices) && (
                            <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${isBuyNow && !selectedDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                                 <h2 className="text-xl font-bold flex items-center gap-2 mb-4 dark:text-white">
                                     <FaPlus className="text-blue-500" /> DỊCH VỤ CỘNG THÊM (Tùy chọn)
                                 </h2>
                                 {loadingServices ? (
                                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                         <FaSpinner className="animate-spin"/> Đang tải...
                                     </div>
                                 ) : (
                                     <div className="space-y-4">
                                         {availableTransport.length > 0 && (
                                             <div>
                                                 <label htmlFor="transportSelect" className="block text-sm font-medium mb-1 dark:text-neutral-300 flex items-center gap-2"><FaCar/> Vận chuyển</label>
                                                 <select id="transportSelect" value={selectedTransport} onChange={(e) => setSelectedTransport(e.target.value)} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" disabled={isBuyNow && !selectedDeparture} >
                                                     <option value="">-- Không chọn --</option>
                                                     {availableTransport.map(t => ( <option key={t.id} value={t.id}> {t.name} ({t.details?.vehicle_type}, {t.details?.seats} chỗ) - {formatCurrency(t.price)} </option> ))}
                                                 </select>
                                             </div>
                                         )}
                                         {availableFlights.length > 0 && (
                                             <div>
                                                 <label htmlFor="flightSelect" className="block text-sm font-medium mb-1 dark:text-neutral-300 flex items-center gap-2"><FaPlane/> Chuyến bay</label>
                                                 <select id="flightSelect" value={selectedFlight} onChange={(e) => setSelectedFlight(e.target.value)} className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 dark:text-white" disabled={isBuyNow && !selectedDeparture} >
                                                     <option value="">-- Tự túc vé --</option>
                                                     {availableFlights.map(f => ( <option key={f.id} value={f.id}> {f.name} ({f.details?.airline} {f.details?.code}) - {f.details?.route} - {formatCurrency(f.price)} </option> ))}
                                                 </select>
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
                         )}
                         {/* KẾT THÚC KHÔI PHỤC */}

                         {/* Ghi chú */}
                         <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${isBuyNow && !selectedDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                             <h2 className="text-xl font-bold mb-4 dark:text-white">GHI CHÚ</h2>
                             <textarea placeholder="Yêu cầu đặc biệt về tour (nếu có)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" disabled={isBuyNow && !selectedDeparture} />
                         </div>

                         {/* Phương thức thanh toán */}
                         <div className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md transition-opacity ${isBuyNow && !selectedDeparture ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold mb-4 dark:text-white">PHƯƠNG THỨC THANH TOÁN</h2>
                              <div className="space-y-4">
                                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === "direct" ? "border-blue-500 ring-2 ring-blue-500" : "dark:border-neutral-600"} ${isBuyNow && !selectedDeparture ? 'cursor-not-allowed' : ''}`} >
                                      <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === "direct"} onChange={(e)=> setPaymentMethod(e.target.value)} className="w-5 h-5 text-sky-600 focus:ring-sky-500" disabled={isBuyNow && !selectedDeparture}/>
                                      <div className="ml-4"> <p className="font-semibold dark:text-white">Thanh toán trực tiếp</p> <p className="text-sm text-gray-600 dark:text-gray-400">Thanh toán tại văn phòng TourZen.</p> </div>
                                  </label>
                                  <AnimatePresence> {paymentMethod === "direct" && ( <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-8 space-y-2 dark:text-gray-300"> <p className="text-sm font-semibold"> Vui lòng thanh toán trước ngày: <span className="text-red-600 font-bold">{formattedDeadline}</span> </p> <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" disabled={isBuyNow && !selectedDeparture}> <option>VP Hà Nội: Số 123, Đường ABC, Quận Hoàn Kiếm</option> <option>VP TP.HCM: Số 456, Đường XYZ, Quận 1</option> <option>VP Đà Nẵng: Số 789, Đường UVW, Quận Hải Châu</option> </select> </motion.div> )} </AnimatePresence>
                                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === "vnpay" ? "border-blue-500 ring-2 ring-blue-500" : "dark:border-neutral-600"} ${isBuyNow && !selectedDeparture ? 'cursor-not-allowed' : ''}`} >
                                      <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === "vnpay"} onChange={(e)=> setPaymentMethod(e.target.value)} className="w-5 h-5 text-sky-600 focus:ring-sky-500" disabled={isBuyNow && !selectedDeparture}/>
                                      <div className="ml-4 flex items-center"> <p className="font-semibold mr-2 dark:text-white">Thanh toán qua VNPay</p> <img src="/vnpay_logo.png" alt="VNPay" className="h-8" /> </div>
                                  </label>
                               </div>
                         </div>
                     </div>

                     {/* --- Cột phải: tóm tắt đơn (Giữ nguyên logic gốc) --- */}
                     <aside className="lg:col-span-1">
                         <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md sticky top-24 self-start">
                             <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-neutral-700 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2>

                             {/* Chỉ hiển thị nếu có item */}
                             {cartItems.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 italic">
                                    {isBuyNow ? "Vui lòng chọn lịch khởi hành và số lượng khách." : "Giỏ hàng trống."}
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
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{`${item.adults || 0} NL, ${ item.children || 0 } TE, ${item.infants || 0} EB`}</p>
                                                    {/* Hiển thị ngày đi nếu có (từ Buy Now) */}
                                                    {item.departure_date && <p className="text-xs text-gray-500 dark:text-gray-400">{`Ngày đi: ${item.departure_date}`}</p>}
                                                    <p className="text-sm font-semibold dark:text-white"> {formatCurrency(itemDisplayTotal)} </p>
                                                </div>
                                            </div>
                                            );
                                        })}
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
                                    <button type="submit"
                                         // (SỬA) Thêm điều kiện disable cho Buy Now
                                         disabled={isSubmitting || loadingUser || (!currentUser && !loadingUser) || loadingServices || (isBuyNow && (!selectedDeparture || currentGuests > maxGuests))}
                                         className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                     >
                                         {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
                                         {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"}
                                     </button>
                                </>
                             )}
                         </div>
                     </aside>
                 </form>
             </div>

             {/* AnimatePresence cho notification */}
             <AnimatePresence>
                 {notification.message && !isSubmitting && ( <motion.div initial={{ opacity: 0, y: 50, scale: 0.3 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.5 }} className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${ notification.type === "error" ? "bg-red-500" : notification.type === 'warning' ? 'bg-yellow-500' : "bg-green-500" }`}> {notification.message} </motion.div> )}
             </AnimatePresence>
        </div>
    );
}
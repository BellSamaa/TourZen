// src/pages/Payment.jsx
// (V13: Thêm phương thức 'virtual_qr' và lưu 'payment_method' vào booking)

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaSpinner, FaCar, FaPlane, FaPlus,
    FaUser, FaChild, FaMinus, FaUsers, FaCalendarAlt, FaUmbrellaBeach,
    FaBaby, // Icon Sơ sinh
    FaUserTie // Icon Người già
} from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";
// (MỚI) Thêm icon QrCode
import { Buildings, Ticket, CircleNotch, X, WarningCircle, QrCode, Bank } from "@phosphor-icons/react"; 
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext.jsx"; // Cần user auth

const supabase = getSupabase();

// --- Hàm slugify ---
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .normalize('NFD') // Chuẩn hóa Unicode (tách dấu)
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch nối
    .replace(/[^\w-]+/g, '') // Bỏ ký tự không phải chữ/số/gạch nối
    .replace(/--+/g, '-') // Bỏ gạch nối thừa
    .replace(/^-+/, '') // Bỏ gạch nối đầu
    .replace(/-+$/, ''); // Bỏ gạch nối cuối
}

// --- Component InfoInput ---
const InfoInput = ({ icon: Icon, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             {Icon && <Icon className="text-gray-400" />}
        </div>
        <input
            {...props}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white input-style" // Thêm input-style
        />
    </div>
);

// --- Component QuantityInput ---
const QuantityInput = ({ label, icon: Icon, value, onDecrease, onIncrease, max, min = 0, disabled = false }) => (
    <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {Icon && <Icon className="text-gray-500" />} {/* Kiểm tra Icon tồn tại */}
            {label}
        </label>
        <div className="flex items-center gap-2">
            <button type="button" onClick={onDecrease} disabled={disabled || value <= min} className="p-1.5 rounded-full bg-gray-200 dark:bg-neutral-600 hover:bg-gray-300 disabled:opacity-50 transition-colors">
                <FaMinus size={12} />
            </button>
            <span className="w-8 text-center font-bold dark:text-white">{value}</span>
            <button type="button" onClick={onIncrease} disabled={disabled || (max !== undefined && value >= max)} className="p-1.5 rounded-full bg-gray-200 dark:bg-neutral-600 hover:bg-gray-300 disabled:opacity-50 transition-colors">
                <FaPlus size={12} />
            </button>
        </div>
    </div>
);

// --- Hàm format tiền tệ ---
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};

// --- (THÊM MỚI) Hàm tính tổng tiền cho từng item (giống logic tourSubtotal) ---
const calculateItemTotal = (item) =>
  (item.adults || 0) * (item.priceAdult || 0) +
  (item.children || 0) * (item.priceChild || 0) +
  (item.elders || 0) * (item.priceElder || item.priceAdult || 0) + // Infant free
  (item.singleSupplement || 0);


export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { items: cartItemsFromContext, clearCart, updateQty: updateCartQty, updateCartItemDeparture } = useCart();
    const { user: currentUser, loading: loadingUser } = useAuth();

    // State cho Buy Now vs Cart
    const buyNowTourData = location.state?.item;
    const isBuyNow = !!buyNowTourData;

    // State số lượng (cho Buy Now)
    const [buyNowDepartureId, setBuyNowDepartureId] = useState(null);
    const [buyNowAdults, setBuyNowAdults] = useState(1);
    const [buyNowChildren, setBuyNowChildren] = useState(0);
    const [buyNowElders, setBuyNowElders] = useState(0);
    const [buyNowInfants, setBuyNowInfants] = useState(0);

    // State khác
    const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", address: "" });
    const [notes, setNotes] = useState("");
    // (SỬA) Mặc định là 'direct'
    const [paymentMethod, setPaymentMethod] = useState("direct");
    const [selectedBranch, setSelectedBranch] = useState("VP Hà Nội: Số 123, Đường ABC, Quận Hoàn Kiếm");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });

    // State Dịch vụ
    const [availableServices, setAvailableServices] = useState({ hotels: [], transport: [], flights: [] });
    const [selectedHotel, setSelectedHotel] = useState('');
    const [selectedTransport, setSelectedTransport] = useState('');
    const [selectedFlight, setSelectedFlight] = useState('');
    const [loadingServices, setLoadingServices] = useState(true);

    // State Voucher
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherMessage, setVoucherMessage] = useState({ type: "", text: "" });
    const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

    // State Lịch khởi hành
    const [departuresData, setDeparturesData] = useState({}); // { tourId: [departures...] }
    const [loadingDepartures, setLoadingDepartures] = useState({}); // { tourId: boolean }

    // --- Memos ---
    // Tạo cấu trúc displayItems thống nhất
    const displayItems = useMemo(() => {
        if (isBuyNow && buyNowTourData) {
            const departure = (departuresData[buyNowTourData.id] || []).find(d => d.id === buyNowDepartureId);
            // (SỬA) Lấy giá bán (selling_price)
            const sellingPriceAdult = buyNowTourData.selling_price_adult || 0;
            const sellingPriceChild = buyNowTourData.selling_price_child || 0;
            const sellingPriceElder = buyNowTourData.selling_price_elder || 0;
            const priceInfant = 0; // Trẻ sơ sinh free (theo yêu cầu)

            return [{
                key: buyNowDepartureId || `buynow_${buyNowTourData.id}`,
                tourId: buyNowTourData.id,
                title: buyNowTourData.name,
                image: buyNowTourData.image_url || '/images/default.jpg',
                location: buyNowTourData.location,
                priceAdult: sellingPriceAdult, priceChild: sellingPriceChild, priceElder: sellingPriceElder, priceInfant: priceInfant,
                departure_id: buyNowDepartureId, 
                departure_date: departure?.departure_date,
                max_slots: departure ? Math.max(0, (departure.max_slots || 0) - (departure.booked_slots || 0)) : 0,
                adults: buyNowAdults, children: buyNowChildren, elders: buyNowElders, infants: buyNowInfants,
            }];
        } else {
            return cartItemsFromContext.map(item => {
                 const departure = (departuresData[item.tourId] || []).find(d => d.id === item.departure_id);
                 // (SỬA) Lấy giá bán từ item trong cart
                 const sellingPriceAdult = item.selling_price_adult || item.priceAdult || 0;
                 const sellingPriceChild = item.selling_price_child || item.priceChild || 0;
                 const sellingPriceElder = item.selling_price_elder || item.priceElder || sellingPriceAdult; // Fallback
                 const priceInfant = 0; // Trẻ sơ sinh free (theo yêu cầu)

                 return {
                    ...item,
                    priceAdult: sellingPriceAdult, priceChild: sellingPriceChild, priceElder: sellingPriceElder, priceInfant: priceInfant,
                    departure_id: item.departure_id, 
                    departure_date: departure?.departure_date || item.departure_date, // Lấy từ departure hoặc từ item (nếu đã lưu)
                    max_slots: departure ? Math.max(0, (departure.max_slots || 0) - (departure.booked_slots || 0)) : undefined,
                 }
            });
        }
    }, [isBuyNow, buyNowTourData, buyNowDepartureId, buyNowAdults, buyNowChildren, buyNowElders, buyNowInfants, cartItemsFromContext, departuresData]);

    // Tính Tổng số khách
    const totalPassengers = useMemo(() => displayItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0) + (item.elders || 0) + (item.infants || 0), 0), [displayItems]);

    // Tính Tạm tính (Chỉ tiền tour)
    const tourSubtotal = useMemo(() => {
        return displayItems.reduce((sum, item) => {
            // (SỬA) Trẻ sơ sinh (infant) miễn phí
            const itemTotal = (item.adults * item.priceAdult) +
                              (item.children * item.priceChild) +
                              (item.elders * item.priceElder); // Infant free
            return sum + itemTotal;
        }, 0);
    }, [displayItems]);

    // Tính Phí dịch vụ
    const selectedHotelCost = useMemo(() => availableServices.hotels.find(h => h.id === selectedHotel)?.price || 0, [selectedHotel, availableServices.hotels]);
    const selectedTransportCost = useMemo(() => availableServices.transport.find(t => t.id === selectedTransport)?.price || 0, [selectedTransport, availableServices.transport]);
    const selectedFlightCost = useMemo(() => availableServices.flights.find(f => f.id === selectedFlight)?.price || 0, [selectedFlight, availableServices.flights]);

    // Tính Tổng cuối cùng
    const finalTotal = useMemo(() => {
        const base = tourSubtotal + selectedHotelCost + selectedTransportCost + selectedFlightCost;
        const afterDiscount = base - voucherDiscount;
        return Math.max(0, afterDiscount);
    }, [tourSubtotal, selectedHotelCost, selectedTransportCost, selectedFlightCost, voucherDiscount]);

    // Hạn thanh toán
    const paymentDeadline = useMemo(() => {
        let dateToProcess = null;
        try {
            // Ưu tiên ngày đã chọn
            const firstItemWithDate = displayItems.find(item => item.departure_date);
            if (firstItemWithDate) {
                dateToProcess = firstItemWithDate.departure_date;
            }
            // Nếu chưa chọn (cart), lấy ngày sớm nhất có thể
            else if (!isBuyNow && cartItemsFromContext.length > 0) {
                 const earliestPossibleDate = cartItemsFromContext
                    .flatMap(item => departuresData[item.tourId] || [])
                    .map(dep => dep.departure_date)
                    .filter(Boolean)
                    .sort()[0];
                 dateToProcess = earliestPossibleDate;
            }

            if (dateToProcess) {
                if (typeof dateToProcess !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateToProcess)) {
                     console.warn("Invalid date string format:", dateToProcess); return null;
                }
                const parsedDate = new Date(dateToProcess + 'T00:00:00Z');
                if (!isNaN(parsedDate.getTime())) {
                    parsedDate.setDate(parsedDate.getDate() - 7); // Trừ 7 ngày
                    return parsedDate;
                }
            }
        } catch (error) { console.error("Deadline error:", error); }
        return null; // Trả về null nếu không tính được
    }, [displayItems, isBuyNow, cartItemsFromContext, departuresData]);

    const formattedDeadline = useMemo(() => {
        if (paymentDeadline instanceof Date && !isNaN(paymentDeadline)) {
            try { return paymentDeadline.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
            catch (e) { return "Lỗi ngày"; }
        }
        return "N/A";
    }, [paymentDeadline]);

    // --- useEffects ---
    // 1. Lấy thông tin User
    useEffect(() => {
        if (currentUser) {
            setContactInfo(prev => ({
                ...prev,
                email: currentUser.email || '',
                name: currentUser.user_metadata?.full_name || prev.name,
                phone: currentUser.user_metadata?.phone || prev.phone,
                address: currentUser.user_metadata?.address || prev.address
            }));
        }
    }, [currentUser]);

    // 2. Lấy Dịch vụ kèm theo (Theo yêu cầu: Dịch vụ đã được duyệt)
    useEffect(() => {
        async function getApprovedServices() {
            setLoadingServices(true);
            const { data, error } = await supabase
                .from('Products')
                // (SỬA) Lấy thêm inventory
                .select('id, name, price, product_type, details, inventory')
                .neq('product_type', 'tour')
                .eq('approval_status', 'approved') // <-- CHỈ LẤY ĐÃ DUYỆT
                .eq('is_published', true); // Chỉ lấy dịch vụ đang hoạt động

            if (error) { toast.error("Lỗi tải dịch vụ kèm theo."); console.error(error); }
            else if (data) {
                setAvailableServices({
                    hotels: data.filter(s => s.product_type === 'hotel'),
                    // (SỬA) Lọc đúng 'transport'
                    transport: data.filter(s => s.product_type === 'transport'), 
                    // (SỬA) Lọc đúng 'flight'
                    flights: data.filter(s => s.product_type === 'flight') 
                });
            }
            setLoadingServices(false);
        }
        getApprovedServices();
    }, []);

    // 3. Lấy Lịch khởi hành
    const fetchDeparturesForTour = useCallback(async (tourId) => {
        if (!tourId || departuresData[tourId]) return; // Không fetch lại nếu đã có

        setLoadingDepartures(prev => ({ ...prev, [tourId]: true }));
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from("Departures")
            .select("*") // Lấy tất cả thông tin departure
            .eq("product_id", tourId)
            .gte("departure_date", today) // Chỉ lấy ngày từ hôm nay trở đi
            .order("departure_date", { ascending: true });

        if (error) { toast.error(`Lỗi tải lịch khởi hành.`); }
        else { setDeparturesData(prev => ({ ...prev, [tourId]: data || [] })); }
        setLoadingDepartures(prev => ({ ...prev, [tourId]: false }));
    }, [departuresData]); // Phụ thuộc vào departuresData

    useEffect(() => {
        const tourIdsToFetch = new Set();
        if (isBuyNow && buyNowTourData?.id) {
            tourIdsToFetch.add(buyNowTourData.id);
        } else {
            cartItemsFromContext.forEach(item => {
                if (item.tourId) tourIdsToFetch.add(item.tourId);
            });
        }
        tourIdsToFetch.forEach(id => fetchDeparturesForTour(id));
    }, [isBuyNow, buyNowTourData, cartItemsFromContext, fetchDeparturesForTour]);


    // --- Handlers ---
    // (SỬA) Tìm max_slots cho Buy Now
    const maxGuests = useMemo(() => {
        if (!isBuyNow || !buyNowDepartureId) return Infinity; // Không giới hạn nếu chưa chọn
        const departure = (departuresData[buyNowTourData.id] || []).find(d => d.id === buyNowDepartureId);
        return departure ? Math.max(0, (departure.max_slots || 0) - (departure.booked_slots || 0)) : Infinity;
    }, [isBuyNow, buyNowDepartureId, departuresData, buyNowTourData]);
    
    // Thay đổi số lượng Buy Now
    const handleBuyNowQtyChange = (type, delta) => {
        const currentTotal = buyNowAdults + buyNowChildren + buyNowElders + buyNowInfants;
        const potentialTotal = currentTotal + delta;
        const currentAdultsAndElders = buyNowAdults + buyNowElders;

        if (delta > 0 && maxGuests < Infinity && potentialTotal > maxGuests) {
            toast.error(`Chỉ còn tối đa ${maxGuests} chỗ.`); return;
        }

        let newAdults = buyNowAdults, newChildren = buyNowChildren, newElders = buyNowElders, newInfants = buyNowInfants;

        if (type === 'adult') newAdults = Math.max(0, buyNowAdults + delta);
        if (type === 'child') newChildren = Math.max(0, buyNowChildren + delta);
        if (type === 'elder') newElders = Math.max(0, buyNowElders + delta);
        if (type === 'infant') newInfants = Math.max(0, buyNowInfants + delta);

        if ((newAdults + newElders === 0) && (newChildren > 0 || newInfants > 0)) {
             toast.error("Phải có ít nhất 1 người lớn hoặc người già đi kèm."); return;
        }
        if (delta < 0 && (type === 'adult' || type === 'elder') && currentAdultsAndElders === 1 && (buyNowChildren > 0 || buyNowInfants > 0)) {
            toast.error("Phải có ít nhất 1 người lớn hoặc người già đi kèm."); return;
        }
        // Cho phép giảm người lớn/người già cuối cùng về 0 nếu không còn trẻ em/sơ sinh
        if (delta < 0 && (type === 'adult' || type === 'elder') && currentAdultsAndElders === 1 && newChildren === 0 && newInfants === 0) {
             // Allow decreasing to 0 if no dependents
        } else if (delta < 0 && (type === 'adult' && newAdults < 0) || (type === 'elder' && newElders < 0)) {
             return; // Don't go below zero implicitly
        }

        setBuyNowAdults(newAdults);
        setBuyNowChildren(newChildren);
        setBuyNowElders(newElders);
        setBuyNowInfants(newInfants);
    };

    // Thay đổi số lượng Cart
    const handleCartQtyChange = (key, type, delta) => {
        const item = cartItemsFromContext.find(i => i.key === key);
        if (!item) return;

        let newAdults = item.adults || 0;
        let newChildren = item.children || 0;
        let newElders = item.elders || 0;
        let newInfants = item.infants || 0;

        // Apply delta
        if (type === 'adult') newAdults = Math.max(0, newAdults + delta);
        if (type === 'child') newChildren = Math.max(0, newChildren + delta);
        if (type === 'elder') newElders = Math.max(0, newElders + delta);
        if (type === 'infant') newInfants = Math.max(0, newInfants + delta);

        // Check total against max slots if departure is selected
        const departure = (departuresData[item.tourId] || []).find(d => d.id === item.departure_id);
        const itemMaxGuests = departure ? Math.max(0, (departure.max_slots || 0) - (departure.booked_slots || 0)) : undefined;
        const newTotalGuests = newAdults + newChildren + newElders + newInfants;

        if (delta > 0 && itemMaxGuests !== undefined && newTotalGuests > itemMaxGuests) {
             toast.error(`Chỉ còn tối đa ${itemMaxGuests} chỗ cho ngày đã chọn.`); return;
        }

        // Validation
        if ((newAdults + newElders === 0) && (newChildren > 0 || newInfants > 0)) {
             toast.error("Phải có ít nhất 1 người lớn hoặc người già đi kèm."); return;
        }
        if (delta < 0 && (type === 'adult' || type === 'elder') && ((item.adults || 0) + (item.elders || 0) === 1) && ((item.children || 0) > 0 || (item.infants || 0) > 0)) {
            toast.error("Phải có ít nhất 1 người lớn hoặc người già đi kèm."); return;
        }

        // (SỬA) Gọi context update function (đúng thứ tự A, C, I, E)
        updateCartQty(key, newAdults, newChildren, newInfants, newElders); 
    };

    // Chọn Lịch khởi hành cho Cart Item
    const handleCartDepartureSelect = (itemKey, departureId) => {
        if (updateCartItemDeparture) {
            updateCartItemDeparture(itemKey, departureId); // Gọi hàm context để cập nhật
             // Tải lại lịch trình để cập nhật max_slots (không bắt buộc nhưng tốt)
             const item = cartItemsFromContext.find(i => i.key === itemKey);
             if(item) fetchDeparturesForTour(item.tourId);
        } else {
            console.warn("updateCartItemDeparture chưa có trong CartContext");
            toast.error("Lỗi: Không thể cập nhật ngày khởi hành.");
        }
    };

    const handleInputChange = (e, setState) => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, [name]: value }));
    };
    const showNotification = (message, type = "error") => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: "", type: "" }), 4000); // Tăng thời gian hiển thị
    };
    
    // (Giả lập)
    const handleApplyVoucher = async () => { 
        if (!voucherCode) return;
        setIsCheckingVoucher(true);
        setVoucherMessage({ type: '', text: '' });
        await new Promise(res => setTimeout(res, 1000)); // Giả lập check DB
        
        if (voucherCode === "TOURZEN10") {
            const discount = tourSubtotal * 0.1;
            setVoucherDiscount(discount);
            setVoucherMessage({ type: 'success', text: `Đã áp dụng giảm 10% (${formatCurrency(discount)})` });
        } else {
            setVoucherDiscount(0);
            setVoucherMessage({ type: 'error', text: 'Mã không hợp lệ hoặc đã hết hạn.' });
        }
        setIsCheckingVoucher(false);
    };

    // --- (CẬP NHẬT) HÀM CHECKOUT (Thêm payment_method và điều hướng) ---
    const handleCheckout = async (e) => { 
        e.preventDefault();

        // 1. Kiểm tra dữ liệu (Giữ nguyên)
        if (!currentUser) { showNotification("Bạn cần đăng nhập..."); navigate('/login', { state: { from: location } }); return; }
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) { showNotification("Vui lòng điền đủ thông tin liên lạc."); return; }
        if (displayItems.length === 0) { showNotification("Giỏ hàng trống."); return; }
        if (!agreedToTerms) { showNotification("Bạn phải đồng ý điều khoản."); return; }

        let invalidItem = false;
        displayItems.forEach(item => {
            if (!item.departure_id) { showNotification(`Vui lòng chọn ngày khởi hành cho tour "${item.title}".`); invalidItem = true; }
            const guests = (item.adults || 0) + (item.children || 0) + (item.elders || 0) + (item.infants || 0);
            if (guests <= 0) { showNotification(`Vui lòng chọn số lượng khách cho tour "${item.title}".`); invalidItem = true; }
            if ((item.adults || 0) + (item.elders || 0) === 0 && ((item.children || 0) > 0 || (item.infants || 0) > 0)) { showNotification(`"${item.title}" phải có người lớn hoặc người già đi kèm.`); invalidItem = true; }
            if (item.max_slots !== undefined && guests > item.max_slots) { showNotification(`Số khách (${guests}) vượt quá số chỗ còn lại (${item.max_slots}) cho tour "${item.title}".`); invalidItem = true; }
        });
        if (invalidItem) return;

        setIsSubmitting(true);
        let bookingErrorOccurred = false;
        let successfulBookingIds = [];
        const bookingPromises = []; // Khai báo mảng
        const totalAllGuests = displayItems.reduce((sum, i) => sum + (i.adults || 0) + (i.children || 0) + (i.elders || 0) + (i.infants || 0), 0);

        // 2. Xử lý từng tour (Giữ nguyên logic RPC)
        for (const item of displayItems) {
            const numAdults = item.adults || 0;
            const numChildren = item.children || 0;
            const numElders = item.elders || 0;
            const numInfants = item.infants || 0;
            const quantity = numAdults + numChildren + numElders + numInfants;

            // 2.1. Gọi RPC giữ chỗ TOUR
            const { data: bookedSuccess, error: rpcError } = await supabase.rpc('book_tour_slot', {
                departure_id_input: item.departure_id,
                guest_count_input: quantity
            });
            if (rpcError || !bookedSuccess) { 
                console.error("Lỗi RPC book_tour_slot:", rpcError);
                toast.error(`"${item.title}": Đã hết chỗ hoặc lỗi. ${rpcError?.message || ''}`);
                bookingErrorOccurred = true;
                break; 
        	 }

            // 2.2. Giữ chỗ DỊCH VỤ (Giữ nguyên logic RPC)
            if (item === displayItems[0]) {
                const servicePromises = [];
                if (selectedHotel) servicePromises.push(supabase.rpc('book_service_slot', { product_id_input: selectedHotel, quantity_input: 1 }));
                if (selectedTransport) servicePromises.push(supabase.rpc('book_service_slot', { product_id_input: selectedTransport, quantity_input: 1 }));
                if (selectedFlight) servicePromises.push(supabase.rpc('book_service_slot', { product_id_input: selectedFlight, quantity_input: totalAllGuests }));

                if (servicePromises.length > 0) {
                    const serviceResults = await Promise.all(servicePromises);
                    for (const result of serviceResults) {
                        if (result.error || !result.data) { 
                            console.error("Lỗi RPC book_service_slot:", result.error);
                            toast.error("Lỗi: Một dịch vụ (Xe/KS/Vé) đã hết hàng.");
                            bookingErrorOccurred = true;
                            await supabase.rpc('book_tour_slot', { 
                                departure_id_input: item.departure_id,
                                guest_count_input: -quantity 
                            });
                            break; 
                        }
                    }
                }
            }
            if (bookingErrorOccurred) break;

            // 2.3. Tạo bản ghi Booking nếu RPC thành công
            const itemTotalPrice = calculateItemTotal(item); 
            const bookingPayload = {
                user_id: currentUser.id, product_id: item.tourId,
                departure_id: item.departure_id, 
                departure_date: (departuresData[item.tourId] || []).find(d => d.id === item.departure_id)?.departure_date,
                quantity: quantity,
                num_adult: numAdults, num_child: numChildren, num_elder: numElders, num_infant: numInfants,
                total_price: itemTotalPrice, 
                status: 'pending', notes: notes,
                hotel_product_id: item === displayItems[0] ? selectedHotel || null : null,
                transport_product_id: item === displayItems[0] ? selectedTransport || null : null,
                flight_product_id: item === displayItems[0] ? selectedFlight || null : null,
                voucher_code: item === displayItems[0] ? voucherCode || null : null,
                voucher_discount: item === displayItems[0] ? voucherDiscount || 0 : 0,
                // --- (THÊM MỚI) ---
                payment_method: paymentMethod 
                // --- (HẾT THÊM MỚI) ---
            };
            bookingPromises.push(
                supabase.from('Bookings').insert(bookingPayload).select('id')
            );
        } // Hết vòng lặp

        // 3. Xử lý kết quả insert
        if (!bookingErrorOccurred) {
            try {
                const results = await Promise.all(bookingPromises);
                successfulBookingIds = results.map(r => r.data?.[0]?.id).filter(Boolean);

                if (successfulBookingIds.length === 0) {
                   throw new Error("Không thể tạo đơn hàng, vui lòng thử lại.");
                }

                if (!isBuyNow) clearCart(); 
                toast.success("Đã giữ chỗ thành công!");
                
                // --- (CẬP NHẬT) Điều hướng dựa trên paymentMethod ---
                if (paymentMethod === 'virtual_qr') {
                    // Đi đến trang thanh toán ảo
                    navigate('/virtual-payment', { 
                        state: { 
                            bookingIds: successfulBookingIds,
                            finalTotal: finalTotal, // Tổng tiền cuối cùng
                            contactInfo: contactInfo, // Thông tin liên lạc
                            deadline: formattedDeadline
                        } 
                    });
                } else {
                    // Đi đến trang thành công (cho 'direct' và 'transfer')
                    navigate('/booking-success', { 
                        state: { 
                            bookingIds: successfulBookingIds,
                            method: paymentMethod,
                            branch: selectedBranch,
                            deadline: formattedDeadline,
                            total: finalTotal // (Thêm) Gửi tổng tiền
                        } 
                    });
                }
                // --- (HẾT CẬP NHẬT) ---

            } catch (insertError) { 
                 console.error("Lỗi insert Bookings:", insertError);
                 toast.error("Lỗi khi lưu đơn hàng. Đang thử hoàn lại chỗ...");
                 bookingErrorOccurred = true;
                 
                 // Rollback (Giữ nguyên)
                 console.warn("ĐANG THỬ ROLLBACK...");
                 for (const item of displayItems) {
                     const quantity = (item.adults || 0) + (item.children || 0) + (item.elders || 0) + (item.infants || 0);
                     supabase.rpc('book_tour_slot', { 
                        departure_id_input: item.departure_id,
                        guest_count_input: -quantity 
                     });
                 }
                 if(selectedHotel) supabase.rpc('book_service_slot', { product_id_input: selectedHotel, quantity_input: -1 });
                 if(selectedTransport) supabase.rpc('book_service_slot', { product_id_input: selectedTransport, quantity_input: -1 });
                 if(selectedFlight) supabase.rpc('book_service_slot', { product_id_input: selectedFlight, quantity_input: -totalAllGuests });
            }
        }
        setIsSubmitting(false);
    };
    // --- KẾT THÚC CHECKOUT ---

    // --- Render ---
    if (!isBuyNow && cartItemsFromContext.length === 0) {
        return (
            <div className="text-center py-20 max-w-lg mx-auto">
                 <Ticket size={80} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                 <h2 className="mt-6 text-2xl font-bold text-neutral-700 dark:text-neutral-300">Giỏ hàng của bạn đang trống</h2>
                 <p className="mt-2 text-neutral-500">Bạn chưa thêm tour nào để thanh toán. Hãy quay lại và khám phá nhé!</p>
                 <Link to="/tours" className="mt-6 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-lg transition-all">
                     Khám phá Tour
                 </Link>
            </div>
        );
    }
    
    if (isBuyNow && !buyNowTourData) {
         return <div className="text-center py-20 text-red-500">Lỗi: Không tìm thấy dữ liệu tour. Vui lòng thử lại.</div>;
    }


    return (
        <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-7xl mx-auto">
                 {/* Header */}
                 <div className="text-center mb-8"> 
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">XÁC NHẬN ĐẶT TOUR</h1> 
                 </div>

                 <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Cột Trái */}
                     <div className="lg:col-span-2 space-y-6">
                        {/* Mục Tour & Số lượng (Giữ nguyên JSX) */}
                        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-hidden border dark:border-neutral-700">
                            <h2 className="text-xl font-semibold p-5 border-b dark:border-neutral-700 flex items-center gap-2 text-gray-800 dark:text-white">
                                <FaUmbrellaBeach className="text-sky-500" />
                                <span>Tour đã chọn & Số lượng khách</span>
                            </h2>
                            <AnimatePresence>
                            {displayItems.map((item, index) => (
                                <motion.div
                                    key={item.key}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col md:flex-row p-5 gap-6 border-b dark:border-neutral-700 last:border-b-0"
                                >
                                    {/* 1. Thông tin & Giá */}
                                    <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            className="w-full h-40 object-cover rounded-lg shadow-md"
                                            onError={(e) => { e.target.onerror = null; e.target.src='/images/default.jpg'; }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{item.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                            <FaMapMarkerAlt size={12}/> {item.location}
                                        </p>
                                        
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-500 mt-3">
                                            {formatCurrency(calculateItemTotal(item))}
                                        </p>
                                        <p className="text-xs text-gray-500 italic">(Tổng cho mục này)</p>
                                    </div>

                                    {/* 2. Chọn Lịch & Số lượng */}
                                    <div className="w-full md:w-1/2 lg:w-1/3 space-y-4">
                                        {/* Chọn Lịch Khởi hành */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                <FaCalendarAlt className="inline-block mr-1.5 text-sky-500" />
                                                Chọn ngày khởi hành
                                            </label>
                                            {loadingDepartures[item.tourId] ? (
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <CircleNotch size={18} className="animate-spin" /> Đang tải lịch...
                                                </div>
                                            ) : (
                                                <select 
                                                    value={isBuyNow ? (buyNowDepartureId || '') : (item.departure_id || '')}
                                                    onChange={(e) => {
                                                        const depId = e.target.value;
                                                        if (isBuyNow) setBuyNowDepartureId(depId);
                                                        else handleCartDepartureSelect(item.key, depId);
                                                    }}
                                                    className="input-style w-full"
                                                    required
                                                >
                                                    <option value="" disabled>-- Vui lòng chọn ngày đi --</option>
                                                    {(departuresData[item.tourId] || []).map(dep => {
                                                        const remaining = Math.max(0, (dep.max_slots || 0) - (dep.booked_slots || 0));
                                                        return (
                                                            <option key={dep.id} value={dep.id} disabled={remaining === 0}>
                                                                {dep.departure_date} (Còn {remaining} chỗ)
                                                            </option>
                                                        );
                                                    })}
                                                    {(departuresData[item.tourId] || []).length === 0 && (
                                                        <option value="" disabled>Không có lịch khởi hành sắp tới</option>
                                                    )}
                                                </select>
                                            )}
                                        </div>
                                        
                                        {/* Chọn Số lượng */}
                                        <div className="space-y-2 border-t dark:border-neutral-700 pt-4">
                                            <QuantityInput 
                                                label="Người lớn" icon={FaUser}
                                                value={isBuyNow ? buyNowAdults : item.adults}
                                                onIncrease={() => isBuyNow ? handleBuyNowQtyChange('adult', 1) : handleCartQtyChange(item.key, 'adult', 1)}
                                                onDecrease={() => isBuyNow ? handleBuyNowQtyChange('adult', -1) : handleCartQtyChange(item.key, 'adult', -1)}
                                                max={isBuyNow ? maxGuests : item.max_slots}
                                                min={0}
                                            />
                                            <QuantityInput 
                                                label="Người già" icon={FaUserTie}
                                                value={isBuyNow ? buyNowElders : item.elders}
                                                onIncrease={() => isBuyNow ? handleBuyNowQtyChange('elder', 1) : handleCartQtyChange(item.key, 'elder', 1)}
                                                onDecrease={() => isBuyNow ? handleBuyNowQtyChange('elder', -1) : handleCartQtyChange(item.key, 'elder', -1)}
                                                max={isBuyNow ? maxGuests : item.max_slots}
                                                min={0}
                                            />
                                            <QuantityInput 
                                                label="Trẻ em" icon={FaChild}
                                                value={isBuyNow ? buyNowChildren : item.children}
                                                onIncrease={() => isBuyNow ? handleBuyNowQtyChange('child', 1) : handleCartQtyChange(item.key, 'child', 1)}
                                                onDecrease={() => isBuyNow ? handleBuyNowQtyChange('child', -1) : handleCartQtyChange(item.key, 'child', -1)}
                                                max={isBuyNow ? maxGuests : item.max_slots}
                                                min={0}
                                            />
                                            <QuantityInput 
                                                label="Trẻ sơ sinh (Free)" icon={FaBaby}
                                                value={isBuyNow ? buyNowInfants : item.infants}
                                                onIncrease={() => isBuyNow ? handleBuyNowQtyChange('infant', 1) : handleCartQtyChange(item.key, 'infant', 1)}
                                                onDecrease={() => isBuyNow ? handleBuyNowQtyChange('infant', -1) : handleCartQtyChange(item.key, 'infant', -1)}
                                                max={isBuyNow ? maxGuests : item.max_slots}
                                                min={0}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                        
                        {/* Thông tin liên lạc (Giữ nguyên JSX) */}
                        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-5 border dark:border-neutral-700">
                           <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><FaUserFriends className="text-sky-500"/> THÔNG TIN LIÊN LẠC</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoInput icon={FaUser} name="name" placeholder="Họ và tên *" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={IoIosCall} name="phone" placeholder="Số điện thoại *" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={IoIosMail} name="email" type="email" placeholder="Email *" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={FaMapMarkerAlt} name="address" placeholder="Địa chỉ" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} />
                           </div>
                           <p className="text-xs text-gray-500 mt-3 italic">* Thông tin bắt buộc</p>
                        </div>
                        
                        {/* Dịch vụ cộng thêm (Giữ nguyên JSX) */}
                        {(availableServices.hotels.length > 0 || availableServices.transport.length > 0 || availableServices.flights.length > 0) && (
                           <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-5 border dark:border-neutral-700">
                               <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2"><FaPlus className="text-sky-500"/> DỊCH VỤ CỘNG THÊM (Tùy chọn)</h2>
                               {loadingServices ? <div className="text-center"><CircleNotch size={24} className="animate-spin text-sky-500"/></div> : (
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                       {/* Khách sạn */}
                                       {availableServices.hotels.length > 0 && (
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5"><Buildings/> Khách sạn</label>
                                               <select value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)} className="input-style w-full">
                                                    <option value="">Không chọn</option>
                                                    {availableServices.hotels.map(s => 
                                                        <option key={s.id} value={s.id} disabled={s.inventory <= 0}>
                                                            {s.name} ({formatCurrency(s.price)})
                                                            {s.inventory <= 0 ? ' (Hết hàng)' : ` (Còn ${s.inventory})`}
                                                        </option>
                                                    )}
                                               </select>
                                           </div>
                                       )}
                                       {/* Di chuyển */}
                                       {availableServices.transport.length > 0 && (
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5"><FaCar/> Di chuyển</label>
                                               <select value={selectedTransport} onChange={(e) => setSelectedTransport(e.target.value)} className="input-style w-full">
                                                    <option value="">Không chọn</option>
                                                    {availableServices.transport.map(s => 
                                                        <option key={s.id} value={s.id} disabled={s.inventory <= 0}>
                                                            {s.name} ({formatCurrency(s.price)})
                                                            {s.inventory <= 0 ? ' (Hết hàng)' : ` (Còn ${s.inventory})`}
                                                        </option>
                                                    )}
                                               </select>
                                           </div>
                                       )}
                                       {/* Máy bay */}
                                       {availableServices.flights.length > 0 && (
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5"><FaPlane/> Vé máy bay</label>
                                               <select value={selectedFlight} onChange={(e) => setSelectedFlight(e.target.value)} className="input-style w-full">
                                                    <option value="">Không chọn</option>
                                                    {availableServices.flights.map(s => 
                                                        <option key={s.id} value={s.id} disabled={s.inventory <= 0}>
                                                            {s.name} ({formatCurrency(s.price)})
                                                            {s.inventory <= 0 ? ' (Hết hàng)' : ` (Còn ${s.inventory})`}
                                                        </option>
                                                    )}
                                               </select>
                                           </div>
                                       )}
                                   </div>
                               )}
                           </div>
                        )}
                        
                        {/* Ghi chú (Giữ nguyên JSX) */}
                        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-5 border dark:border-neutral-700">
                           <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">GHI CHÚ</h2>
                           <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Yêu cầu đặc biệt (ví dụ: ăn chay, phòng tầng cao...)" className="input-style w-full h-24" />
                        </div>
                        
                        {/* (CẬP NHẬT) Phương thức thanh toán */}
                        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-5 border dark:border-neutral-700">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">PHƯƠNG THỨC THANH TOÁN</h2>
                            <div className="space-y-3">
                                {/* 1. Trực tiếp */}
                                <label className="flex items-center p-3 border dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors">
                                    <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === "direct"} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 text-sky-600 focus:ring-sky-500"/>
                                    <Bank size={20} className="mr-2 text-sky-600 dark:text-sky-400" />
                                    <span className="font-medium dark:text-white">Thanh toán trực tiếp tại văn phòng</span>
                                </label>
                                
                                {/* 2. Chuyển khoản (Admin xác nhận) */}
                                <label className="flex items-center p-3 border dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors">
                                    <input type="radio" name="paymentMethod" value="transfer" checked={paymentMethod === "transfer"} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 text-sky-600 focus:ring-sky-500"/>
                                    <IoIosCall size={20} className="mr-2 text-sky-600 dark:text-sky-400" />
                                    <span className="font-medium dark:text-white">Chuyển khoản (Admin sẽ gọi xác nhận)</span>
                                </label>

                                {/* 3. (MỚI) QR Ảo */}
                                <label className="flex items-center p-3 border dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors">
                                    <input type="radio" name="paymentMethod" value="virtual_qr" checked={paymentMethod === "virtual_qr"} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3 text-sky-600 focus:ring-sky-500"/>
                                    <QrCode size={20} className="mr-2 text-sky-600 dark:text-sky-400" />
                                    <span className="font-medium dark:text-white">Thanh toán QR Ảo (Giả lập)</span>
                                </label>
                            </div>
                        </div>
                     </div>

                     {/* Cột Phải: Tóm tắt (Giữ nguyên JSX) */}
                     <aside className="lg:col-span-1">
                         <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700 p-5 sticky top-24">
                             <h2 className="text-xl font-semibold mb-4 pb-4 border-b dark:border-neutral-700 text-gray-800 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2>
                             {displayItems.length === 0 ? ( 
                                <p className="text-gray-500 italic text-center">Không có tour nào trong giỏ.</p> 
                             ) : (
                                <>
                                    {/* Tóm tắt Items */}
                                    <div className="space-y-4 max-h-60 overflow-y-auto border-b dark:border-neutral-700 pb-4">
                                        {displayItems.map(item => (
                                            <div key={item.key} className="flex justify-between items-center text-sm">
                                                <span className="flex-1 truncate pr-2 dark:text-gray-300">{item.title} (x{ (item.adults || 0) + (item.children || 0) + (item.elders || 0) + (item.infants || 0) })</span>
                                                <span className="font-medium dark:text-white">{formatCurrency(calculateItemTotal(item))}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Chi tiết Giá & Voucher */}
                                    <div className="space-y-2 text-sm border-t dark:border-neutral-700 pt-4">
                                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Tổng khách:</span> <span className="font-medium dark:text-white">{totalPassengers}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Tạm tính (Tour):</span> <span className="font-medium dark:text-white">{formatCurrency(tourSubtotal)}</span></div>
                                        
                                        {selectedHotelCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Khách sạn:</span> <span className="font-medium dark:text-white">{formatCurrency(selectedHotelCost)}</span></div>}
                                        {selectedTransportCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Di chuyển:</span> <span className="font-medium dark:text-white">{formatCurrency(selectedTransportCost)}</span></div>}
                                        {selectedFlightCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Vé máy bay:</span> <span className="font-medium dark:text-white">{formatCurrency(selectedFlightCost)}</span></div>}
                                        
                                        <div className="pt-2">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mã giảm giá</label>
                                            <div className="flex gap-2">
                                                <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} className="input-style !py-1.5 !text-xs flex-1" placeholder="NHẬP MÃ" />
                                                <button type="button" onClick={handleApplyVoucher} disabled={isCheckingVoucher} className="button-secondary !text-xs !py-1.5 !px-3">
                                                    {isCheckingVoucher ? <CircleNotch size={16} className="animate-spin" /> : "Áp dụng"}
                                                </button>
                                            </div>
                                            {voucherMessage.text && <p className={`text-xs mt-1 ${voucherMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{voucherMessage.text}</p>}
                                        </div>
                                        
                                        {voucherDiscount > 0 && (
                                             <div className="flex justify-between text-green-600 dark:text-green-400"><span className="font-medium">Giảm giá:</span> <span className="font-medium">-{formatCurrency(voucherDiscount)}</span></div>
                                        )}
                                    </div>
                                    
                                    {/* Tổng cuối cùng */}
                                    <div className="mt-4 pt-4 border-t dark:border-neutral-700 flex justify-between items-center">
                                        <span className="text-lg font-semibold dark:text-white">Tổng cộng</span>
                                        <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                                    </div>
                                    
                                    {/* Điều khoản & Nút Submit */}
                                    <div className="mt-6">
                                        <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mr-2 text-sky-600 focus:ring-sky-500 rounded" />
                                            Tôi đồng ý với <Link to="/terms" target="_blank" className="text-sky-600 dark:text-sky-400 hover:underline">Điều khoản & Điều kiện</Link>
                                        </label>
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !agreedToTerms || (displayItems.length > 0 && displayItems.some(item => !item.departure_id))} 
                                        className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : <FaCreditCard />}
                                        {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"}
                                    </button>
                                </>
                             )}
                         </div>
                     </aside>
                 </form>
             </div>
             
             {/* Notification (Giữ nguyên JSX) */}
             <AnimatePresence>
                {notification.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-10 left-1/2 p-4 rounded-lg shadow-lg text-white ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
                    >
                        {notification.message}
                    </motion.div>
                )}
             </AnimatePresence>
             
             {/* Styles (Giữ nguyên JSX) */}
             <style jsx>{`
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-900 dark:text-neutral-100 text-sm disabled:opacity-50; }
             `}</style>
        </div>
    );
}

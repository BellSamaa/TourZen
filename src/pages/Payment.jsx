// src/pages/Payment.jsx
// (V7: Hoàn thiện - Đồng bộ hàm handleCartQtyChange với Context)

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUserFriends, FaMapMarkerAlt, FaCreditCard, FaSpinner, FaCar, FaPlane, FaPlus,
    FaUser, FaChild, FaMinus, FaUsers, FaCalendarAlt,
    FaBaby, // Icon Sơ sinh
    FaUserTie // Icon Người già
} from "react-icons/fa";
import { IoIosMail, IoIosCall } from "react-icons/io";
import { Buildings, Ticket, CircleNotch, X } from "@phosphor-icons/react"; // Icons Phosphor
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
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
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
                .select('id, name, price, product_type, details')
                .neq('product_type', 'tour')
                .eq('approval_status', 'approved') // <-- CHỈ LẤY ĐÃ DUYỆT
                .eq('is_published', true); // Chỉ lấy dịch vụ đang hoạt động

            if (error) { toast.error("Lỗi tải dịch vụ kèm theo."); console.error(error); }
            else if (data) {
                setAvailableServices({
                    hotels: data.filter(s => s.product_type === 'hotel'),
                    transport: data.filter(s => s.product_type === 'car'),
                    flights: data.filter(s => s.product_type === 'plane')
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

        // (SỬA) Call context update function
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
    const handleApplyVoucher = async () => { 
        setIsCheckingVoucher(true);
        setVoucherMessage({ type: "", text: "" });
        // --- Giả lập ---
        await new Promise(res => setTimeout(res, 1000));
        if (voucherCode.toUpperCase() === "TOURZEN10") {
            const discount = (tourSubtotal + selectedHotelCost + selectedTransportCost + selectedFlightCost) * 0.1;
            setVoucherDiscount(discount);
            setVoucherMessage({ type: "success", text: `Áp dụng thành công! Giảm ${formatCurrency(discount)}` });
        } else {
            setVoucherDiscount(0);
            setVoucherMessage({ type: "error", text: "Mã không hợp lệ hoặc đã hết hạn." });
        }
        setIsCheckingVoucher(false);
    };

    // --- (CẬP NHẬT) HÀM CHECKOUT ---
    const handleCheckout = async (e) => {
        e.preventDefault();

        // 1. Kiểm tra dữ liệu
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
        const bookingPromises = [];
        let bookingErrorOccurred = false;
        let successfulBookingIds = [];

        // 2. Xử lý từng tour
        for (const item of displayItems) {
            const numAdults = item.adults || 0;
            const numChildren = item.children || 0;
            const numElders = item.elders || 0;
            const numInfants = item.infants || 0;
            const quantity = numAdults + numChildren + numElders + numInfants;

            // Gọi RPC giữ chỗ
            const { data: bookedSuccess, error: rpcError } = await supabase.rpc('book_tour_slot', {
                departure_id_input: item.departure_id,
                guest_count_input: quantity
            });

            if (rpcError || !bookedSuccess) { 
                console.error("RPC Error:", rpcError);
                showNotification(`Hết chỗ hoặc lỗi khi đặt tour "${item.title}". Vui lòng thử lại.`);
                bookingErrorOccurred = true;
                break; // Dừng vòng lặp
            }

            // Tạo bản ghi Booking nếu RPC thành công
            // (SỬA) Tính giá item này (Infant free)
            const itemTotalPrice = (numAdults * item.priceAdult) + (numChildren * item.priceChild) + (numElders * item.priceElder);

            const bookingPayload = {
                user_id: currentUser.id, product_id: item.tourId,
                departure_id: item.departure_id, 
                departure_date: item.departure_date, // Lưu ngày đã chọn
                quantity: quantity,
                num_adult: numAdults, num_child: numChildren, num_elder: numElders, num_infant: numInfants,
                total_price: itemTotalPrice, // Giá tour của item này
                status: 'pending', notes: notes,
                contact_info: contactInfo, // Lưu thông tin liên lạc
                // Gán dịch vụ & voucher cho booking đầu tiên
                hotel_product_id: item === displayItems[0] ? selectedHotel || null : null,
                transport_product_id: item === displayItems[0] ? selectedTransport || null : null,
                flight_product_id: item === displayItems[0] ? selectedFlight || null : null,
                voucher_code: item === displayItems[0] ? voucherCode || null : null,
                voucher_discount: item === displayItems[0] ? voucherDiscount || 0 : 0,
            };

            bookingPromises.push(
                supabase.from('Bookings').insert(bookingPayload).select('id').single()
            );
        } // Hết vòng lặp

        // 3. Xử lý kết quả insert
        if (!bookingErrorOccurred) {
            try {
                const results = await Promise.all(bookingPromises);
                successfulBookingIds = results.map(r => r.data?.id).filter(Boolean);
                
                if (successfulBookingIds.length < displayItems.length) {
                   throw new Error("Không phải tất cả booking đều được tạo thành công.");
                }
                
                // Gửi email
                await supabase.functions.invoke('send-booking-confirmation', {
                   bookingIds: successfulBookingIds,
                   contactEmail: contactInfo.email,
                   contactName: contactInfo.name,
                   finalTotal: finalTotal,
                   paymentMethod: paymentMethod,
                   paymentDeadline: paymentDeadline?.toISOString(),
                });
                
                if (!isBuyNow) clearCart();
                toast.success("Đặt tour thành công! Vui lòng kiểm tra email.");
                navigate('/booking-success', { state: { bookingIds: successfulBookingIds, total: finalTotal } });

            } catch (insertError) { 
                console.error("Insert Error:", insertError);
                showNotification("Lỗi khi lưu đơn hàng. Đang hoàn lại slots...");
                // Rollback RPC
                for (const item of displayItems) {
                    const quantity = (item.adults || 0) + (item.children || 0) + (item.elders || 0) + (item.infants || 0);
                    await supabase.rpc('book_tour_slot', {
                        departure_id_input: item.departure_id,
                        guest_count_input: -quantity // Trừ (hoàn lại)
                    });
                }
            }
        } else {
             // Rollback RPC cho những item đã lỡ book
             // (Logic này phức tạp, tạm thời chỉ thông báo lỗi)
        }

        setIsSubmitting(false);
    };
    // --- KẾT THÚC CHECKOUT ---

    // --- Render ---
    if (loadingUser) {
        return <div className="flex justify-center items-center min-h-[50vh]"><CircleNotch size={40} className="animate-spin text-sky-500" /></div>;
    }
    if ((!isBuyNow && cartItemsFromContext.length === 0) || (isBuyNow && !buyNowTourData)) {
         return (
            <div className="text-center py-20">
                 <h2 className="text-2xl font-bold dark:text-neutral-300">Không có tour nào để thanh toán</h2>
                 <Link to="/tours" className="mt-6 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-lg">
                     Quay lại trang Tour
                 </Link>
            </div>
         );
    }

    return (
        <div className="bg-gray-100 dark:bg-neutral-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-7xl mx-auto">
                 {/* Header */}
                 <div className="text-center mb-8">
                     <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                         XÁC NHẬN ĐẶT TOUR
                     </h1>
                     <p className="text-gray-500 dark:text-gray-400 mt-2">Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</p>
                 </div>

                 <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Cột Trái */}
                     <div className="lg:col-span-2 space-y-6">
                        {/* Mục Tour & Số lượng */}
                        {displayItems.map((item, index) => {
                            const availableDepartures = departuresData[item.tourId] || [];
                            const isLoadingDeps = loadingDepartures[item.tourId];
                            const currentDeparture = availableDepartures.find(d => d.id === item.departure_id);
                            const itemMaxGuests = currentDeparture ? Math.max(0, (currentDeparture.max_slots || 0) - (currentDeparture.booked_slots || 0)) : (isBuyNow ? maxGuests : undefined);
                            const totalGuestsThisItem = (item.adults || 0) + (item.children || 0) + (item.elders || 0) + (item.infants || 0);

                            return (
                                <div key={item.key} className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <img src={item.image} alt={item.title} className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{item.title}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"><FaMapMarkerAlt size={12}/> {item.location}</p>
                                                <p className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-2">{formatCurrency(tourSubtotal)}</Tóm tắt></p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Chọn Lịch khởi hành & Số lượng */}
                                    <div className="p-5 border-t dark:border-neutral-700 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Chọn Lịch */}
                                            <div>
                                                <label className="label-style flex items-center gap-2"><FaCalendarAlt/> Chọn ngày khởi hành *</label>
                                                {isLoadingDeps && <div className="flex items-center gap-2 text-sm text-gray-500"><CircleNotch className="animate-spin" /> Đang tải lịch...</div>}
                                                {!isLoadingDeps && availableDepartures.length === 0 && <p className="text-sm text-red-500 italic">Tour này chưa có lịch khởi hành.</p>}
                                                {!isLoadingDeps && availableDepartures.length > 0 && (
                                                    <select
                                                        value={isBuyNow ? buyNowDepartureId : item.departure_id}
                                                        onChange={isBuyNow ? (e) => setBuyNowDepartureId(e.target.value) : (e) => handleCartDepartureSelect(item.key, e.target.value)}
                                                        required className="input-style"
                                                    >
                                                        <option value="">-- Chọn ngày --</option>
                                                        {availableDepartures.map(dep => {
                                                            const remaining = (dep.max_slots || 0) - (dep.booked_slots || 0);
                                                            return (
                                                                <option key={dep.id} value={dep.id} disabled={remaining <= 0}>
                                                                    {dep.departure_date} (Còn {remaining} chỗ)
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                )}
                                            </div>
                                            {/* Tóm tắt slot */}
                                            {itemMaxGuests !== undefined && (
                                                <div className={`p-3 rounded-lg text-center self-end ${totalGuestsThisItem > itemMaxGuests ? 'bg-red-50 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Số chỗ đã chọn / Còn lại</p>
                                                    <p className={`text-2xl font-bold ${totalGuestsThisItem > itemMaxGuests ? 'text-red-600' : 'text-blue-600'}`}>
                                                        {totalGuestsThisItem} / {itemMaxGuests < Infinity ? itemMaxGuests : '∞'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 pt-4 border-t dark:border-neutral-600">
                                            <QuantityInput label="Người lớn" icon={FaUser} value={item.adults}
                                                onDecrease={isBuyNow ? () => handleBuyNowQtyChange('adult', -1) : () => handleCartQtyChange(item.key, 'adult', -1)}
                                                onIncrease={isBuyNow ? () => handleBuyNowQtyChange('adult', 1) : () => handleCartQtyChange(item.key, 'adult', 1)}
                                                max={itemMaxGuests < Infinity ? itemMaxGuests - (totalGuestsThisItem - item.adults) : undefined}
                                                min={0}
                                            />
                                            <QuantityInput label="Người già (Trên 60t)" icon={FaUserTie} value={item.elders}
                                                onDecrease={isBuyNow ? () => handleBuyNowQtyChange('elder', -1) : () => handleCartQtyChange(item.key, 'elder', -1)}
                                                onIncrease={isBuyNow ? () => handleBuyNowQtyChange('elder', 1) : () => handleCartQtyChange(item.key, 'elder', 1)}
                                                max={itemMaxGuests < Infinity ? itemMaxGuests - (totalGuestsThisItem - item.elders) : undefined}
                                                min={0}
                                            />
                                            <QuantityInput label="Trẻ em (Dưới 1m4)" icon={FaChild} value={item.children}
                                                onDecrease={isBuyNow ? () => handleBuyNowQtyChange('child', -1) : () => handleCartQtyChange(item.key, 'child', -1)}
                                                onIncrease={isBuyNow ? () => handleBuyNowQtyChange('child', 1) : () => handleCartQtyChange(item.key, 'child', 1)}
                                                max={itemMaxGuests < Infinity ? itemMaxGuests - (totalGuestsThisItem - item.children) : undefined}
                                                min={0}
                                            />
                                            <QuantityInput label="Trẻ sơ sinh (Dưới 40cm)" icon={FaBaby} value={item.infants}
                                                onDecrease={isBuyNow ? () => handleBuyNowQtyChange('infant', -1) : () => handleCartQtyChange(item.key, 'infant', -1)}
                                                onIncrease={isBuyNow ? () => handleBuyNowQtyChange('infant', 1) : () => handleCartQtyChange(item.key, 'infant', 1)}
                                                max={itemMaxGuests < Infinity ? itemMaxGuests - (totalGuestsThisItem - item.infants) : undefined}
                                                min={0}
                                            />
                                            <p className="text-xs text-gray-500 italic text-right">* Trẻ sơ sinh (dưới 40cm) được miễn phí.</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        
                        {/* Thông tin liên lạc */}
                        <div className={`bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700 overflow-hidden`}>
                            <h2 className="text-xl font-semibold p-5 border-b dark:border-neutral-700 dark:text-white flex items-center gap-2"><FaUserFriends/> THÔNG TIN LIÊN LẠC</h2>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoInput icon={FaUser} name="name" placeholder="Họ và tên *" value={contactInfo.name} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={IoIosCall} name="phone" placeholder="Số điện thoại *" value={contactInfo.phone} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={IoIosMail} name="email" type="email" placeholder="Email *" value={contactInfo.email} onChange={(e) => handleInputChange(e, setContactInfo)} required />
                                <InfoInput icon={FaMapMarkerAlt} name="address" placeholder="Địa chỉ" value={contactInfo.address} onChange={(e) => handleInputChange(e, setContactInfo)} />
                            </div>
                        </div>

                        {/* Dịch vụ cộng thêm */}
                        {(availableServices.hotels.length > 0 || availableServices.transport.length > 0 || availableServices.flights.length > 0) && (
                            <div className={`bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700 overflow-hidden`}>
                                <h2 className="text-xl font-semibold p-5 border-b dark:border-neutral-700 dark:text-white flex items-center gap-2"><FaPlus/> DỊCH VỤ CỘNG THÊM</h2>
                                <div className="p-5 space-y-4">
                                     {loadingServices && <div className="flex items-center gap-2 text-sm text-gray-500"><CircleNotch className="animate-spin" /> Đang tải dịch vụ...</div>}
                                     {availableServices.hotels.length > 0 && (
                                         <div> <label className="label-style">Khách sạn</label> <select value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)} className="input-style"> <option value="">Không chọn</option> {availableServices.hotels.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)} </select> </div>
                                     )}
                                     {availableServices.transport.length > 0 && (
                                         <div> <label className="label-style">Xe đưa đón</label> <select value={selectedTransport} onChange={(e) => setSelectedTransport(e.target.value)} className="input-style"> <option value="">Không chọn</option> {availableServices.transport.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)} </select> </div>
                                     )}
                                     {availableServices.flights.length > 0 && (
                                         <div> <label className="label-style">Vé máy bay</label> <select value={selectedFlight} onChange={(e) => setSelectedFlight(e.target.value)} className="input-style"> <option value="">Không chọn</option> {availableServices.flights.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)} </select> </div>
                                     )}
                                </div>
                            </div>
                        )}

                        {/* Ghi chú */}
                        <div className={`bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700 overflow-hidden`}>
                            <h2 className="text-xl font-semibold p-5 border-b dark:border-neutral-700 dark:text-white">GHI CHÚ</h2>
                            <div className="p-5">
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Yêu cầu đặc biệt (ví dụ: ăn chay, phòng tầng cao...)" className="input-style h-24" />
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className={`bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700 overflow-hidden`}>
                            <h2 className="text-xl font-semibold p-5 border-b dark:border-neutral-700 dark:text-white">PHƯƠNG THỨC THANH TOÁN</h2>
                             <div className="p-5 space-y-3">
                                <label className="flex items-center gap-3 p-4 border rounded-lg dark:border-neutral-600 has-[:checked]:bg-sky-50 has-[:checked]:border-sky-500">
                                    <input type="radio" name="paymentMethod" value="direct" checked={paymentMethod === "direct"} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio text-sky-600" />
                                    <span className="font-semibold dark:text-white">Thanh toán trực tiếp tại văn phòng</span>
                                </label>
                                {paymentMethod === 'direct' && (
                                    <div className="pl-8 text-sm">
                                        <label className="label-style">Chọn văn phòng:</label>
                                        <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="input-style text-xs">
                                            <option>VP Hà Nội: Số 123, Đường ABC, Quận Hoàn Kiếm</option>
                                            <option>VP Đà Nẵng: Số 456, Đường XYZ, Quận Hải Châu</option>
                                            <option>VP HCM: Số 789, Đường UVW, Quận 1</option>
                                        </select>
                                    </div>
                                )}
                                <label className="flex items-center gap-3 p-4 border rounded-lg dark:border-neutral-600 has-[:checked]:bg-sky-50 has-[:checked]:border-sky-500">
                                    <input type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === "vnpay"} onChange={(e) => setPaymentMethod(e.target.value)} className="form-radio text-sky-600" disabled/>
                                    <span className="font-semibold dark:text-white opacity-50">Thanh toán qua VNPAY (Đang bảo trì)</span>
                                </label>
                            </div>
                        </div>
                     </div>

                     {/* Cột Phải: Tóm tắt */}
                     <aside className="lg:col-span-1">
                         <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700 sticky top-24">
                             <h2 className="text-xl font-semibold p-5 border-b dark:border-neutral-700 dark:text-white">TÓM TẮT ĐƠN HÀNG</h2>
                             
                             {displayItems.length === 0 ? (
                                <p className="p-5 text-gray-500 italic">Không có tour nào.</p>
                             ) : (
                                <>
                                    {/* Tóm tắt Items */}
                                    <div className="space-y-4 max-h-60 overflow-y-auto p-5">
                                        {displayItems.map(item => (
                                            <div key={item.key} className="flex gap-3">
                                                <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-md flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold dark:text-white truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.adults} Lớn, {item.children} Trẻ, {item.elders} Già, {item.infants} Sơ sinh
                                                    </p>
                                                    <p className="text-sm font-bold text-sky-600">{formatCurrency((item.adults * item.priceAdult) + (item.children * item.priceChild) + (item.elders * item.priceElder))}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chi tiết Giá & Voucher */}
                                    <div className="space-y-2 text-sm border-t dark:border-neutral-700 p-5">
                                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Tổng số khách:</span> <span className="font-medium dark:text-white">{totalPassengers}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Tạm tính (Tour):</span> <span className="font-medium dark:text-white">{formatCurrency(tourSubtotal)}</span></div>
                                        {selectedHotelCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Phí khách sạn:</span> <span className="font-medium dark:text-white">{formatCurrency(selectedHotelCost)}</span></div>}
                                        {selectedTransportCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Phí xe:</span> <span className="font-medium dark:text-white">{formatCurrency(selectedTransportCost)}</span></div>}
                                        {selectedFlightCost > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Phí máy bay:</span> <span className="font-medium dark:text-white">{formatCurrency(selectedFlightCost)}</span></div>}
                                        {voucherDiscount > 0 && <div className="flex justify-between"><span className="text-green-600">Giảm giá:</span> <span className="font-medium text-green-600">-{formatCurrency(voucherDiscount)}</span></div>}
                                        
                                        {/* Mục Voucher */}
                                        <div className="pt-2">
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Mã giảm giá" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} className="input-style !py-1.5 text-xs flex-1" />
                                                <button type="button" onClick={handleApplyVoucher} disabled={isCheckingVoucher} className="button-secondary !py-1.5 !px-3 text-xs">
                                                     {isCheckingVoucher ? <CircleNotch className="animate-spin" /> : "Áp dụng"}
                                                </button>
                                            </div>
                                            {voucherMessage.text && <p className={`text-xs mt-1 ${voucherMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{voucherMessage.text}</p>}
                                        </div>
                                    </div>
                                    
                                    {/* Tổng cuối cùng */}
                                    <div className="mt-4 p-5 border-t dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-lg font-bold dark:text-white">Tổng cộng</span>
                                            <span className="text-2xl font-bold text-red-600">{formatCurrency(finalTotal)}</span>
                                        </div>
                                        {paymentDeadline && <p className="text-xs text-orange-600 mt-1 text-right">Hạn thanh toán: {formattedDeadline}</p>}
                                    </div>
                                    
                                    {/* Điều khoản & Nút Submit */}
                                    <div className="p-5 border-t dark:border-neutral-700">
                                        <div className="mt-1">
                                            <label className="flex items-start gap-2 text-sm">
                                                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="form-checkbox mt-0.5" />
                                                <span className="text-gray-600 dark:text-gray-300">Tôi đồng ý với <Link to="/terms" target="_blank" className="text-sky-600 underline">Điều khoản & Chính sách</Link> của TourZen.</span>
                                            </label>
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting || !agreedToTerms || !contactInfo.name || !contactInfo.phone || !contactInfo.email || displayItems.some(item => !item.departure_id)} 
                                            className="w-full mt-6 button-primary flex items-center justify-center gap-2 !py-3 !text-base"
                                        > 
                                            {isSubmitting ? <CircleNotch size={20} className="animate-spin" /> : <FaCreditCard size={18} />} 
                                            {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT TOUR"} 
                                        </button>
                                    </div>
                                </>
                             )}
                         </div>
                     </aside>
                 </form>
             </div>
             {/* Notification */}
             <AnimatePresence>
                {notification.message && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                        {notification.message}
                    </motion.div>
                )}
             </AnimatePresence>
             {/* Styles */}
             <style jsx>{`
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm disabled:opacity-60; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50; }
             `}</style>
        </div>
    );
}
// src/pages/ManageTour.jsx
// (V29-Sửa đổi: 1. Thay Biểu đồ Review bằng Tour Yêu Thích Nhất. 2. Nâng cấp Modal Thêm Đơn Hàng)
// (*** GEMINI SỬA v30 ***)
// YÊU CẦU:
// 1. [EditModal] Khóa mục Khách hàng (read-only).
// 2. [EditModal] Cho phép sửa Ngày đi & Số lượng (thêm logic fetch departures & update slot).
// 3. [EditModal] Bỏ nút "Gửi lại email xác nhận".
// 4. [AddModal] Tự động tính "Tổng tiền" (giống Payment.jsx).
// 5. [AddModal] Thêm validation (phải có người lớn).
// 6. [ManageTour] Cập nhật fetchTours (lấy giá) và handleSaveDetails (logic slot).
// (*** GEMINI SỬA v30.1 - FIX BUILD ERROR ***)
// 1. Thay thế 'Child' (không tồn tại) bằng 'Person'
// (*** GEMINI SỬA v32 - XÓA KHÁCH SẠN ***)

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, Funnel, List, ArrowClockwise,
    User, CalendarBlank, UsersThree, Tag, Wallet, CheckCircle, XCircle, Clock, Info, PencilSimple, Trash, Plus, WarningCircle, Envelope,
    /* (XÓA V32) Buildings, */ AirplaneTilt, Car, Ticket as VoucherIcon, Bank, Image as ImageIcon, FloppyDisk,
    Receipt, // Icon Hóa đơn
    Star, // Icon Sao
    ChatCircleDots, // Icon Bình luận
    UserCircle, // Icon user
    // (THÊM v30) Icons cho số lượng
    User as FaUser, 
    UserFocus as FaUserTie, // Giả lập FaUserTie
    Person as FaChild, // (*** SỬA v30.1) 'Child' không tồn tại, dùng 'Person'
    Baby as FaBaby 
} from "@phosphor-icons/react";

// (V8) Import Modal Hóa đơn
import ViewInvoiceModal from "../components/ViewInvoiceModal.jsx"; // Đảm bảo đường dẫn đúng

const supabase = getSupabase();

// --- Hook Debounce (Giữ nguyên) ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window (Giữ nguyên) ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
    if (totalPages <= 1) return [];
    if (totalPages <= 5 + width * 2) { return Array.from({ length: totalPages }, (_, i) => i + 1); }
    const pages = new Set([1]);
    for (let i = Math.max(2, currentPage - width); i <= Math.min(totalPages - 1, currentPage + width); i++) { pages.add(i); }
    pages.add(totalPages);
    const sortedPages = [...pages].sort((a, b) => a - b);
    const finalPages = []; let lastPage = 0;
    for (const page of sortedPages) { if (lastPage !== 0 && page - lastPage > 1) { finalPages.push("..."); } finalPages.push(page); lastPage = page; }
    return finalPages;
};

// --- Helpers Format (Giữ nguyên v8) ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'Invalid Date'; }
};
const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) { return 'Invalid Date'; }
};
const formatQuantity = (booking) => {
    let parts = [];
    if (booking.num_adult > 0) parts.push(`${booking.num_adult}NL`);
    if (booking.num_elder > 0) parts.push(`${booking.num_elder}NG`);
    if (booking.num_child > 0) parts.push(`${booking.num_child}TE`);
    if (booking.num_infant > 0) parts.push(`${booking.num_infant}EB`);
    return parts.join(', ') || '0';
};
const formatPaymentMethod = (method) => {
    switch (method) {
        case 'direct': return 'Trực tiếp';
        case 'transfer': return 'Chuyển khoản';
        case 'virtual_qr': return 'QR Ảo';
        default: return 'N/A';
    }
};

// --- Component Badge Trạng thái (Giữ nguyên) ---
const StatusBadge = ({ status }) => {
  const baseStyle = "px-3 py-1 text-[11px] font-bold rounded-md inline-flex items-center gap-1 leading-tight whitespace-nowrap";
  switch (status) {
    case 'confirmed':
      return <span className={`${baseStyle} bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900`}><CheckCircle weight="bold" /> Đã xác nhận</span>;
    case 'cancelled':
      return <span className={`${baseStyle} bg-red-600 text-white dark:bg-red-500`}><XCircle weight="bold" /> Đã hủy</span>;
    default:
      return <span className={`${baseStyle} bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-100`}><Clock weight="bold" /> Chờ xử lý</span>;
  }
};

// --- (V9) Component hiển thị sao Rating ---
const RatingDisplay = ({ rating, size = 16 }) => {
    const totalStars = 5;
    // (MỚI V29) Làm tròn lên 0.5 gần nhất
    const displayRating = Math.round((rating || 0) * 2) / 2;
    
    return (
        <div className="flex justify-center text-yellow-500" title={`${(rating || 0).toFixed(1)}/${totalStars} sao`}>
            {[...Array(totalStars)].map((_, i) => (
                <Star key={i} weight={i + 0.5 < displayRating ? "fill" : "regular"} size={size} />
            ))}
        </div>
    );
};

// --- Component Thẻ Thống Kê (Giữ nguyên) ---
const StatCard = ({ title, value, icon, loading }) => {
    return (
        <motion.div
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg"
            whileHover={{ y: -3 }}
        >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
            <div className="text-4xl font-bold text-slate-800 dark:text-white">
                {loading ? <CircleNotch size={32} className="animate-spin text-sky-500" /> : value}
            </div>
        </motion.div>
    );
};

// --- Component Fetch và Hiển thị Thống Kê (Giữ nguyên) ---
const BookingStats = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data, error, count } = await supabase
                    .from('Bookings')
                    .select('status, total_price', { count: 'exact' });
                if (error) throw error;
                let pendingCount = 0; let confirmedCount = 0; let totalRevenue = 0;
                (data || []).forEach(b => {
                    if (b.status === 'pending') pendingCount++;
                    if (b.status === 'confirmed') { confirmedCount++; totalRevenue += (b.total_price || 0); }
                });
                setStats({ total: count || 0, pending: pendingCount, confirmed: confirmedCount, revenue: totalRevenue });
            } catch (err) {
                console.error("Lỗi fetch stats bookings:", err);
                toast.error("Không thể tải thống kê đơn hàng.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tổng đơn hàng" value={stats.total} loading={loading} />
            <StatCard title="Đơn chờ xử lý" value={stats.pending} loading={loading} />
            <StatCard title="Đơn đã xác nhận" value={stats.confirmed} loading={loading} />
            <StatCard title="Tổng doanh thu (Xác nhận)" value={formatCurrency(stats.revenue)} loading={loading} />
        </div>
    );
};


// --- (MỚI V29-Sửa) Component Tour Yêu Thích Nhất ---
const FavoriteTourStats = () => {
    const [loading, setLoading] = useState(true);
    const [favoriteTour, setFavoriteTour] = useState(null); // { product: {...}, avg_rating: 0, review_count: 0 }
    const [reviews, setReviews] = useState([]); // Reviews for that tour

    useEffect(() => {
        const fetchFavoriteTour = async () => {
            setLoading(true);
            try {
                // 1. Fetch all reviews with product_id and rating
                // (Giống logic ReviewStatsChart cũ, fetch tất cả)
                const { data: allReviews, error: reviewError } = await supabase
                    .from('Reviews')
                    .select('rating, product_id');
                
                if (reviewError) throw reviewError;
                if (!allReviews || allReviews.length === 0) {
                    setLoading(false); return; // No reviews, do nothing
                }

                // 2. Process in JS to find the best tour
                const tourStats = allReviews.reduce((acc, review) => {
                    const { product_id, rating } = review;
                    if (!product_id || !rating) return acc;
                    
                    if (!acc[product_id]) {
                        acc[product_id] = { total_rating: 0, count: 0 };
                    }
                    acc[product_id].total_rating += rating;
                    acc[product_id].count++;
                    return acc;
                }, {});

                let topTourId = null;
                let maxAvg = -1;
                let maxCount = -1;

                for (const productId in tourStats) {
                    const stat = tourStats[productId];
                    const avg = stat.total_rating / stat.count;
                    
                    if (avg > maxAvg) {
                        maxAvg = avg;
                        maxCount = stat.count;
                        topTourId = productId;
                    } else if (avg === maxAvg) {
                        if (stat.count > maxCount) {
                            maxCount = stat.count;
                            topTourId = productId;
                        }
                    }
                }

                if (!topTourId) {
                    setLoading(false); return; // No valid tour found
                }

                // 3. Fetch details for the top tour
                const { data: productData, error: productError } = await supabase
                    .from('Products')
                    .select('id, name, image_url')
                    .eq('id', topTourId)
                    .single();

                if (productError) throw productError;

                setFavoriteTour({
                    product: productData,
                    avg_rating: maxAvg,
                    review_count: maxCount
                });

                // 4. Fetch recent reviews for that top tour (limit 3)
                const { data: recentReviews, error: recentReviewsError } = await supabase
                    .from('Reviews')
                    .select('id, rating, comment, reviewer:user_id(full_name, email)')
                    .eq('product_id', topTourId)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (recentReviewsError) throw recentReviewsError;
                setReviews(recentReviews || []);

            } catch (err) {
                console.error("Lỗi fetch favorite tour:", err);
                toast.error("Không thể tải tour yêu thích.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchFavoriteTour();
    }, []); // Chạy 1 lần khi mount

    if (loading) {
        return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 flex justify-center items-center h-40">
                <CircleNotch size={32} className="animate-spin text-sky-500" />
                <span className="ml-3 text-slate-500">Đang tìm tour yêu thích nhất...</span>
            </div>
        );
    }

    if (!favoriteTour) {
        return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                     <Star weight="fill" className="text-yellow-500" />
                     Tour Yêu Thích Nhất
                </h3>
                <p className="text-slate-500 italic">Chưa có đủ dữ liệu đánh giá để tìm tour yêu thích.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Star weight="fill" className="text-yellow-500" />
                Tour Yêu Thích Nhất
            </h3>
            
            {/* Thông tin tour */}
            <div className="flex flex-col md:flex-row gap-6 border-b dark:border-slate-700 pb-6 mb-6">
                <img 
                    src={favoriteTour.product.image_url || 'https://placehold.co/150x100/eee/ccc?text=Tour'} 
                    alt={favoriteTour.product.name}
                    className="w-full md:w-1/3 lg:w-1/4 h-auto object-cover rounded-lg shadow-md"
                />
                <div className="flex-1">
                     <h4 className="text-lg font-bold text-sky-600 dark:text-sky-400">
                        {favoriteTour.product.name}
                     </h4>
                     <div className="flex items-center gap-3 mt-2">
                        <span className="text-4xl font-extrabold text-slate-800 dark:text-white">
                            {favoriteTour.avg_rating.toFixed(1)}
                        </span>
                        <div className="flex flex-col">
                            <RatingDisplay rating={favoriteTour.avg_rating} size={24} />
                            <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                (Từ {favoriteTour.review_count} đánh giá)
                            </span>
                        </div>
                     </div>
                </div>
            </div>

            {/* Bình luận */}
            <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Một số bình luận nổi bật:
            </h4>
            <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(review => (
                    <div key={review.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm text-slate-800 dark:text-white">
                                {review.reviewer?.full_name || review.reviewer?.email || "Khách ẩn danh"}
                            </span>
                            <RatingDisplay rating={review.rating} size={14} />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                            "{review.comment || 'Không có bình luận.'}"
                        </p>
                    </div>
                )) : (
                    <p className="text-sm text-slate-500 italic">Chưa có bình luận cho tour này.</p>
                )}
            </div>
        </motion.div>
    );
};
// --- (HẾT) Component Tour Yêu Thích Nhất ---


// --- (*** CẬP NHẬT V31: EditModal Tự động tính tiền & Read-only) ---
// --- (*** CẬP NHẬT V31: EditModal Tự động tính tiền & Read-only) ---
// (*** CẬP NHẬT THEO YÊU CẦU: Khóa chỉnh sửa/hủy đơn QR ***)
// (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
const EditBookingModal = ({ 
    booking, 
    onClose, 
    onStatusChange, 
    onSaveDetails,
    allUsers,
    allTours,
    allServices // { transport: [], flights: [] } (XÓA V32)
}) => {
    if (!booking) return null;

    // (*** THÊM MỚI: Khóa nếu là thanh toán QR ***)
    const isQrLocked = booking.payment_method === 'virtual_qr';
    
    const [formData, setFormData] = useState({
        user_id: booking.user?.id || '',
        product_id: booking.product?.id || '',
        departure_id: booking.departure_id || '',
        num_adult: booking.num_adult || 0,
        num_child: booking.num_child || 0,
        num_elder: booking.num_elder || 0,
        num_infant: booking.num_infant || 0,
        // (XÓA V32) hotel_product_id: booking.hotel?.id || '',
        transport_product_id: booking.transport?.id || '',
        flight_product_id: booking.flight?.id || '',
        voucher_code: booking.voucher_code || '',
        total_price: booking.total_price || 0,
        notes: booking.notes || ''
    });
    const [departures, setDepartures] = useState([]);
    const [loadingDepartures, setLoadingDepartures] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // useEffect reset form khi mở modal
    useEffect(() => {
        setFormData({
            user_id: booking.user?.id || '',
            product_id: booking.product?.id || '',
            departure_id: booking.departure_id || '',
            num_adult: booking.num_adult || 0,
            num_child: booking.num_child || 0,
            num_elder: booking.num_elder || 0,
            num_infant: booking.num_infant || 0,
            // (XÓA V32) hotel_product_id: booking.hotel?.id || '',
            transport_product_id: booking.transport?.id || '',
            flight_product_id: booking.flight?.id || '',
            voucher_code: booking.voucher_code || '',
            total_price: booking.total_price || 0,
            notes: booking.notes || ''
        });
    }, [booking]);
    
    // useEffect fetch lịch khởi hành
    useEffect(() => {
        if (!formData.product_id) { setDepartures([]); setFormData(prev => ({ ...prev, departure_id: '' })); return; }
        const fetchDepartures = async () => {
            setLoadingDepartures(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase.from("Departures").select("*").eq("product_id", formData.product_id).gte("departure_date", today).order("departure_date", { ascending: true });
            
            if (error) { toast.error("Lỗi tải lịch khởi hành."); } 
            else { 
                const currentDepId = booking.departure_id;
                const currentDepInList = data.find(d => d.id === currentDepId);
                if (!currentDepInList && booking.product_id === formData.product_id) {
                     const { data: oldDep, error: oldDepErr } = await supabase.from("Departures").select("*").eq("id", currentDepId).single();
                     if (oldDep && !oldDepErr) setDepartures([oldDep, ...data]);
                     else setDepartures(data || []);
                } else {
                     setDepartures(data || []); 
                }
            }
            setLoadingDepartures(false);
        };
        fetchDepartures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.product_id]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let newValue = value;
        if (type === 'number') {
             newValue = parseInt(value, 10);
             if (isNaN(newValue) || newValue < 0) newValue = 0;
        }
        setFormData(prev => ({ ...prev, [name]: newValue }));
        if (name === 'product_id' && value !== booking.product?.id) {
            toast.error("Bạn đã đổi Tour. Vui lòng chọn lại Ngày đi.");
            setFormData(prev => ({ ...prev, departure_id: '' }));
        }
    };
    
    const selectedDeparture = useMemo(() => { return departures.find(d => d.id === formData.departure_id); }, [formData.departure_id, departures]);
    const currentGuests = (formData.num_adult || 0) + (formData.num_child || 0) + (formData.num_elder || 0) + (formData.num_infant || 0);
    const remainingSlots = useMemo(() => {
        if (!selectedDeparture) return 0;
        let baseRemaining = (selectedDeparture.max_slots || 0) - (selectedDeparture.booked_slots || 0);
        if (selectedDeparture.id === booking.departure_id && formData.product_id === booking.product_id) {
             baseRemaining += (booking.quantity || 0);
        }
        return baseRemaining;
    }, [selectedDeparture, booking, formData.product_id]);

    // (*** MỚI V31: Logic TỰ ĐỘNG TÍNH TIỀN ***)
    // (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
    const calculatedTotal = useMemo(() => {
        let tourSub = 0;
        let serviceSub = 0;
        const guestCount = (formData.num_adult || 0) + (formData.num_child || 0) + (formData.num_elder || 0) + (formData.num_infant || 0);

        // 1. Tính tiền Tour
        const selectedTour = allTours.find(t => t.id === formData.product_id);
        if (selectedTour) {
            const priceAdult = selectedTour.selling_price_adult || 0;
            const priceChild = selectedTour.selling_price_child || 0;
            const priceElder = selectedTour.selling_price_elder || priceAdult;
            tourSub = (formData.num_adult * priceAdult) + (formData.num_child * priceChild) + (formData.num_elder * priceElder);
        }

        // 2. Tính tiền Dịch vụ
        // (XÓA V32) const hotel = allServices.hotels.find(s => s.id === formData.hotel_product_id);
        // (XÓA V32) if (hotel) serviceSub += (hotel.price || 0);
        const transport = allServices.transport.find(s => s.id === formData.transport_product_id);
        if (transport) serviceSub += (transport.price || 0);
        const flight = allServices.flights.find(s => s.id === formData.flight_product_id);
        if (flight && guestCount > 0) serviceSub += ((flight.price || 0) * guestCount);
        
        return tourSub + serviceSub;
    }, [
        formData.product_id, formData.num_adult, formData.num_child, formData.num_elder, formData.num_infant,
        /* (XÓA V32) formData.hotel_product_id, */ formData.transport_product_id, formData.flight_product_id,
        allTours, allServices
    ]);

    // (*** MỚI V31: Cập nhật vào state khi tính xong ***)
    useEffect(() => {
        setFormData(prev => ({ ...prev, total_price: calculatedTotal }));
    }, [calculatedTotal]);

    const handleSave = async () => {
        if (isQrLocked) {
             toast.error("Không thể lưu đơn đã thanh toán QR.");
             return;
        }
        if (currentGuests <= 0) { toast.error("Số lượng khách phải lớn hơn 0."); return; }
        if (!formData.departure_id) { toast.error("Vui lòng chọn ngày khởi hành."); return; }
        if ((formData.num_adult + formData.num_elder) === 0 && (formData.num_child > 0 || formData.num_infant > 0)) { toast.error("Phải có ít nhất 1 người lớn hoặc người già đi kèm."); return; }
        if (booking.status === 'confirmed' && currentGuests > remainingSlots) { 
            toast.error(`Số khách (${currentGuests}) vượt quá số chỗ còn lại (${remainingSlots}).`); return; 
        }
        setIsSaving(true);
        const selectedDep = departures.find(d => d.id === formData.departure_id);
        const finalData = { ...formData, departure_date: selectedDep?.departure_date || null };
        await onSaveDetails(booking, finalData); 
        setIsSaving(false);
    };

    const handleLocalStatusChange = (newStatus) => {
         if (isQrLocked) {
             toast.error("Không thể đổi trạng thái đơn đã thanh toán QR.");
             return;
         }
         if (booking.status === newStatus) return;
         if (window.confirm(`Bạn có chắc muốn đổi trạng thái thành "${newStatus}"?`)) {
              onStatusChange(booking, newStatus); 
         }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 250 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
             >
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Chi tiết Đơn hàng #{booking.id.slice(-8).toUpperCase()}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"> <X size={22} weight="bold" /> </button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm simple-scrollbar">
                    
                    {/* (*** THÊM MỚI: Cảnh báo đơn QR ***) */}
                    {isQrLocked && (
                        <div className="p-3 mb-4 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
                            <WarningCircle weight="bold" size={20} />
                            <span>Đơn hàng thanh toán bằng QR không thể chỉnh sửa chi tiết hoặc thay đổi trạng thái.</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="label-modal font-semibold">Khách hàng (Chỉ đọc):</label>
                            <span className="value-modal block mt-1 p-2 border border-dashed dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700/50">
                                {allUsers.find(u => u.id === formData.user_id)?.full_name || allUsers.find(u => u.id === formData.user_id)?.email || booking.user?.full_name || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <strong className="label-modal">Email (từ user):</strong> 
                            <span className="value-modal block mt-1 p-2 border border-dashed dark:border-slate-600 rounded">
                                {allUsers.find(u => u.id === formData.user_id)?.email || booking.user?.email || 'N/A'}
                            </span>
                        </div>
                        <div><strong className="label-modal">Ngày đặt:</strong> <span className="value-modal block mt-1">{formatDate(booking.created_at)}</span></div>
                        <div><strong className="label-modal">Phương thức TT:</strong> <span className="value-modal block mt-1 font-semibold text-blue-600 dark:text-blue-400">{formatPaymentMethod(booking.payment_method)}</span></div>
                    </div>
                    
                    <div className="border-t pt-4 dark:border-slate-700 space-y-4">
                        <div>
                            <label className="label-modal font-semibold" htmlFor="product_id_edit">Tour:</label>
                            {/* (*** SỬA: Thêm disabled={isQrLocked} ***) */}
                            <select id="product_id_edit" name="product_id" value={formData.product_id} onChange={handleChange} className="input-style w-full mt-1 !text-lg !font-semibold !text-sky-700 dark:!text-sky-400" disabled={isQrLocked}>
                                <option value="">-- Chọn Tour --</option>
                                {allTours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-modal font-semibold" htmlFor="departure_id_edit">Ngày đi *</label>
                            {/* (*** SỬA: Thêm disabled={... || isQrLocked} ***) */}
                            <select id="departure_id_edit" name="departure_id" value={formData.departure_id} onChange={handleChange} className="input-style w-full mt-1" required disabled={loadingDepartures || departures.length === 0 || isQrLocked}>
                                <option value="" disabled>-- {loadingDepartures ? "Đang tải lịch..." : (formData.product_id ? "Chọn ngày đi" : "Vui lòng chọn tour trước")} --</option>
                                {departures.map(d => {
                                    let remaining = (d.max_slots || 0) - (d.booked_slots || 0);
                                    if (d.id === booking.departure_id && formData.product_id === booking.product_id) remaining += (booking.quantity || 0);
                                    return <option key={d.id} value={d.id} disabled={remaining <= 0 && d.id !== formData.departure_id}> {d.departure_date} (Còn {remaining} chỗ) </option>
                                })}
                            </select>
                             {booking.status === 'confirmed' && selectedDeparture && currentGuests > remainingSlots && <p className="text-xs text-red-500 mt-1">Số lượng khách ({currentGuests}) vượt quá số chỗ còn lại ({remainingSlots})!</p>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                            {/* (*** SỬA: Thêm disabled={isQrLocked} ***) */}
                            <div><label className="label-modal font-semibold flex items-center gap-1.5"><FaUser size={14}/> Người lớn *</label><input type="number" name="num_adult" value={formData.num_adult} onChange={handleChange} min={0} className="input-style w-full mt-1" required disabled={isQrLocked}/></div>
                            <div><label className="label-modal font-semibold flex items-center gap-1.5"><FaUserTie size={14}/> Người già</label><input type="number" name="num_elder" value={formData.num_elder} onChange={handleChange} min={0} className="input-style w-full mt-1" disabled={isQrLocked}/></div>
                            <div><label className="label-modal font-semibold flex items-center gap-1.5"><FaChild size={14}/> Trẻ em</label><input type="number" name="num_child" value={formData.num_child} onChange={handleChange} min={0} className="input-style w-full mt-1" disabled={isQrLocked}/></div>
                            <div><label className="label-modal font-semibold flex items-center gap-1.5"><FaBaby size={14}/> Sơ sinh</label><input type="number" name="num_infant" value={formData.num_infant} onChange={handleChange} min={0} className="input-style w-full mt-1" disabled={isQrLocked}/></div>
                        </div>
                    </div>

                    {/* (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t dark:border-slate-700">
                        {/* (XÓA V32) Khối Khách sạn */}
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5"><Car size={18}/> Vận chuyển:</label>
                            {/* (*** SỬA: Thêm disabled={isQrLocked} ***) */}
                            <select name="transport_product_id" value={formData.transport_product_id} onChange={handleChange} className="input-style w-full mt-1" disabled={isQrLocked}>
                                <option value="">Không chọn</option>
                                {allServices.transport.map(s => <option key={s.id} value={s.id} disabled={s.inventory <= 0}>{s.name} ({formatCurrency(s.price)}){s.inventory <= 0 ? ' (Hết hàng)' : ''}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5"><AirplaneTilt size={18}/> Chuyến bay:</label>
                            {/* (*** SỬA: Thêm disabled={isQrLocked} ***) */}
                            <select name="flight_product_id" value={formData.flight_product_id} onChange={handleChange} className="input-style w-full mt-1" disabled={isQrLocked}>
                                <option value="">Không chọn</option>
                                {allServices.flights.map(s => <option key={s.id} value={s.id} disabled={s.inventory <= 0}>{s.name} ({formatCurrency(s.price)}){s.inventory <= 0 ? ' (Hết hàng)' : ''}</option>)}
                            </select>
                        </div>
                        {/* (*** SỬA: Thêm disabled={isQrLocked} ***) */}
                        <div><label className="label-modal font-semibold flex items-center gap-1.5"><VoucherIcon size={18}/> Voucher:</label><input name="voucher_code" value={formData.voucher_code} onChange={handleChange} className="input-style w-full mt-1" placeholder="Không có" disabled={isQrLocked}/></div>
                    </div>
                    
                    <div className="pt-4 border-t dark:border-slate-700">
                         <label className="label-modal font-semibold">Ghi chú (có thể sửa):</label>
                         {/* (*** SỬA: Thêm disabled={isQrLocked} ***) */}
                         <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input-style w-full mt-1.5 !text-base" placeholder="Không có ghi chú" disabled={isQrLocked}/>
                    </div>

                     {/* (*** MỚI V31: Tổng tiền Read-only & Auto-calc ***) */}
                     <div className="pt-4 border-t dark:border-slate-700 flex justify-end items-center gap-3">
                        <label className="text-lg font-semibold value-modal">Tổng tiền (Tự động):</label>
                        <input 
                            type="text" 
                            value={formatCurrency(formData.total_price)} 
                            readOnly 
                            className="input-style w-48 !text-2xl font-bold !text-red-600 dark:!text-red-400 text-right bg-gray-100 dark:bg-slate-700/50 cursor-not-allowed" 
                        />
                     </div>

                     <div className="pt-5 border-t dark:border-slate-700">
                        <label className="label-modal text-base font-semibold mb-2">Cập nhật trạng thái:</label>
                        <div className="flex flex-col sm:flex-row gap-3 mt-1">
                             {/* (*** SỬA: Thêm disabled={... || isQrLocked} ***) */}
                             <button onClick={() => handleLocalStatusChange('confirmed')} disabled={booking.status === 'confirmed' || isQrLocked} className={`flex-1 button-status-base ${booking.status === 'confirmed' ? 'bg-green-600 text-white shadow-inner' : 'bg-white dark:bg-slate-700 hover:bg-green-50 dark:hover:bg-green-900/30 border border-green-500 text-green-600 dark:text-green-400'}`}> <CheckCircle weight="bold"/> Xác nhận </button>
                             <button onClick={() => handleLocalStatusChange('pending')} disabled={booking.status === 'pending' || isQrLocked} className={`flex-1 button-status-base ${booking.status === 'pending' ? 'bg-gray-500 text-white shadow-inner' : 'bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 border border-gray-500 text-gray-600 dark:text-gray-400'}`}> <Clock weight="bold"/> Chờ xử lý </button>
                             <button onClick={() => handleLocalStatusChange('cancelled')} disabled={booking.status === 'cancelled' || isQrLocked} className={`flex-1 button-status-base ${booking.status === 'cancelled' ? 'bg-red-600 text-white shadow-inner' : 'bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-500 text-red-600 dark:text-red-400'}`}> <XCircle weight="bold"/> Hủy đơn </button>
                        </div>
                     </div>
                </div>
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} disabled={isSaving} className="modal-button-secondary">Đóng</button>
                    {/* (*** SỬA: Thêm disabled={... || isQrLocked} ***) */}
                    <button type="button" onClick={handleSave} disabled={isSaving || loadingDepartures || isQrLocked} className="modal-button-primary flex items-center gap-1.5">
                        {isSaving ? <CircleNotch className="animate-spin" size={18} /> : <FloppyDisk size={18} />}
                        Lưu thay đổi chi tiết
                    </button>
                </div>
            </motion.div>
            <style jsx>{`
                 .label-modal { @apply font-medium text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wider mb-0.5; }
                 .value-modal { @apply text-gray-800 dark:text-white text-base; }
                 .button-status-base { @apply flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold rounded-md transition-all duration-200 disabled:opacity-100 disabled:cursor-not-allowed min-w-[120px]; }
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                 .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                 /* (*** SỬA: Thêm style cho input bị khóa ***) */
                 .input-style:disabled { @apply bg-gray-100 dark:bg-slate-700/50 opacity-70 cursor-not-allowed; }
                 .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                 .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
            `}</style>
        </motion.div>
    );
};
// --- (CẬP NHẬT V20) Component Modal Xác nhận Xóa ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleConfirm = async () => {
        setIsDeleting(true);
        try { await onConfirm(booking); }
        catch (error) { setIsDeleting(false); }
    };
    if (!booking) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 250 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md border dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-5 border-4 border-red-200 dark:border-red-700/50">
                        <Trash size={32} className="text-red-600 dark:text-red-400" weight="duotone"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Xác nhận Xóa Đơn Hàng</h3>
                    <div className="mt-3 text-base text-gray-600 dark:text-gray-300 space-y-2">
                        <p>Xóa vĩnh viễn đơn <b>#{booking.id.slice(-8).toUpperCase()}</b>?</p>
                        
                        {/* (CẬP NHẬT V20) Chỉ hoàn slot nếu đơn KHÔNG PHẢI 'confirmed' */}
                        {booking.status !== 'confirmed' && (
                            <p className="font-semibold text-orange-600 dark:text-orange-400 mt-1 flex items-center justify-center gap-1">
                                <UsersThree size={18}/> Số chỗ ({booking.quantity}) sẽ được hoàn trả.
                            </p>
                        )}
                        
                        <p className="text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 flex flex-row-reverse rounded-b-lg gap-3">
                     <button type="button" onClick={handleConfirm} disabled={isDeleting} className="modal-button-danger flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-md hover:shadow-lg">
                        {isDeleting ? <CircleNotch size={18} className="animate-spin" /> : <Trash size={16}/>}
                        Xác nhận Xóa
                    </button>
                    <button type="button" onClick={onClose} disabled={isDeleting} className="modal-button-secondary w-full sm:w-auto" > Hủy </button>
                </div>
            </motion.div>
        </motion.div>
    );
};


// --- (MỚI v10) Component Modal xem Review ---
const ViewReviewModal = ({ review, onClose }) => {
    if (!review) return null;

    // Lấy tên người dùng (từ cột join Reviews(reviewer) )
    const userName = review.reviewer?.full_name || review.reviewer?.email || "Khách ẩn danh";

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 250 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Chi tiết Đánh giá
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <X size={22} weight="bold" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto simple-scrollbar">
                    <div className="flex items-center gap-3">
                        <UserCircle size={40} className="text-gray-400" weight="duotone" />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{userName}</p>
                            {/* (SỬA V29) Sử dụng RatingDisplay đã định nghĩa ở global */}
                            <RatingDisplay rating={review.rating} size={20} />
                        </div>
                    </div>
                    <div className="pt-4 border-t dark:border-slate-700">
                        <p className="text-gray-700 dark:text-gray-300 text-base italic leading-relaxed">
                            "{review.comment || 'Không có bình luận.'}"
                        </p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="modal-button-primary">
                        Đóng
                    </button>
                </div>
            </motion.div>
             <style jsx>{`
                 /* (Copy style từ các modal khác) */
                 .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </motion.div>
    );
};


// --- (*** CẬP NHẬT V30) Component Modal Thêm Đơn Hàng ---
// (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
// (*** THÊM MỚI ***)
// Helper: Tạo style tùy chỉnh cho react-select để khớp với theme (dark/light)
// Chúng ta cần dùng !important để ghi đè style mặc định của thư viện
const customReactSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'var(--tw-bg-neutral-700) !important', // dark:bg-neutral-700
        borderColor: 'var(--tw-border-neutral-600) !important', // dark:border-neutral-600
        borderRadius: '0.375rem', // rounded-md
        padding: '2px', // Tương đương p-2 của input-style
        minHeight: '42px', // Đảm bảo chiều cao
        boxShadow: state.isFocused ? '0 0 0 1px var(--tw-ring-sky-500)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? 'var(--tw-ring-sky-500)' : 'var(--tw-border-neutral-600) !important',
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 6px',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'white !important', // dark:text-white
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#a3a3a3 !important', // Tương đương text-neutral-400
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'var(--tw-bg-neutral-800) !important', // dark:bg-neutral-800
        border: '1px solid var(--tw-border-neutral-600) !important',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? 'var(--tw-bg-sky-600) !important'
            : state.isFocused
            ? 'var(--tw-bg-neutral-700) !important'
            : 'transparent',
        color: 'white !important',
        '&:active': {
            backgroundColor: 'var(--tw-bg-neutral-600) !important',
        },
    }),
    input: (provided) => ({
        ...provided,
        color: 'white !important', // Màu chữ khi gõ
    }),
    indicatorSeparator: () => ({
        display: 'none', // Bỏ gạch ngăn
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#a3a3a3 !important', // Màu icon dropdown
        '&:hover': {
            color: 'white !important',
        },
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: '#a3a3a3 !important',
        '&:hover': {
            color: 'white !important',
        },
    }),
};

// Hàm lấy style dựa trên theme
const getSelectStyles = () => {
    // Giả sử bạn có class 'dark' trên <html>
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (isDarkMode) {
        return customReactSelectStyles;
    }
    
    // Style cho Light Mode (tương tự input-style)
    return {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#0ea5e9' : '#d1d5db', // focus:border-sky-500, border-gray-300
            borderRadius: '0.375rem',
            padding: '2px',
            minHeight: '42px',
            boxShadow: state.isFocused ? '0 0 0 1px #0ea5e9' : 'none',
            '&:hover': {
                 borderColor: state.isFocused ? '#0ea5e9' : '#d1d5db',
            }
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 50 // Đảm bảo menu nằm trên
        }),
        // các style khác giữ mặc định của thư viện cho light mode là ổn
    };
};
const AddBookingModal = ({ users, tours, allServices, onClose, onSuccess }) => {
    // (MỚI) Thêm state cho dịch vụ
    const [formData, setFormData] = useState({ 
        user_id: '', product_id: '', departure_id: '', 
        num_adult: 1, num_child: 0, num_elder: 0, num_infant: 0, 
        total_price: 0, status: 'pending', notes: '',
        // (XÓA V32) hotel_product_id: '', // (MỚI)
        transport_product_id: '', // (MỚI)
        flight_product_id: '' // (MỚI)
    });
    const [departures, setDepartures] = useState([]);
    const [loadingDepartures, setLoadingDepartures] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // (MỚI) State cho style của react-select
    const [selectStyles, setSelectStyles] = useState(getSelectStyles());
    
    // (MỚI) Lắng nghe thay đổi theme
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setSelectStyles(getSelectStyles());
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        
        // Cập nhật style khi mount
        setSelectStyles(getSelectStyles());
        
        return () => observer.disconnect();
    }, []);


    useEffect(() => {
        if (!formData.product_id) { setDepartures([]); setFormData(prev => ({ ...prev, departure_id: '' })); return; }
        const fetchDepartures = async () => {
            setLoadingDepartures(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase.from("Departures").select("*").eq("product_id", formData.product_id).gte("departure_date", today).order("departure_date", { ascending: true });
            if (error) { toast.error("Lỗi tải lịch khởi hành."); } else { setDepartures(data || []); }
            setLoadingDepartures(false);
        };
        fetchDepartures();
    }, [formData.product_id]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
    };
    
    // (*** THÊM MỚI: Handler cho react-select ***)
    const handleUserChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, user_id: selectedOption ? selectedOption.value : '' }));
    };
    
    const handleTourChange = (selectedOption) => {
        setFormData(prev => ({ 
            ...prev, 
            product_id: selectedOption ? selectedOption.value : '',
            departure_id: '' // Reset ngày đi khi đổi tour
        }));
    };
    
    const handleDepartureChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, departure_id: selectedOption ? selectedOption.value : '' }));
    };
    // (*** HẾT THÊM MỚI ***)

    const selectedDeparture = useMemo(() => { return departures.find(d => d.id === formData.departure_id); }, [formData.departure_id, departures]);
    const currentGuests = (formData.num_adult || 0) + (formData.num_child || 0) + (formData.num_elder || 0) + (formData.num_infant || 0);
    const remainingSlots = selectedDeparture ? (selectedDeparture.max_slots || 0) - (selectedDeparture.booked_slots || 0) : 0;

    // (*** THÊM v30) Logic tự động tính tiền (Giữ nguyên) ***
    // (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
    const calculatedTotal = useMemo(() => {
        let tourSub = 0;
        let serviceSub = 0;
        const guestCount = currentGuests;

        // 1. Tính tiền Tour
        const selectedTour = tours.find(t => t.id === formData.product_id);
        if (selectedTour) {
            const priceAdult = selectedTour.selling_price_adult || 0;
            const priceChild = selectedTour.selling_price_child || 0;
            const priceElder = selectedTour.selling_price_elder || priceAdult; // Giá người già = người lớn nếu null
            
            tourSub = (formData.num_adult * priceAdult) +
                      (formData.num_child * priceChild) +
                      (formData.num_elder * priceElder);
        }

        // 2. Tính tiền Dịch vụ
        // (XÓA V32) const hotel = allServices.hotels.find(s => s.id === formData.hotel_product_id);
        // (XÓA V32) if (hotel) serviceSub += (hotel.price || 0);
        
        const transport = allServices.transport.find(s => s.id === formData.transport_product_id);
        if (transport) serviceSub += (transport.price || 0);

        // Vé máy bay tính theo đầu người
        const flight = allServices.flights.find(s => s.id === formData.flight_product_id);
        if (flight && guestCount > 0) {
            serviceSub += ((flight.price || 0) * guestCount);
        }
        
        return tourSub + serviceSub;
    }, [
        formData.product_id, formData.num_adult, formData.num_child, formData.num_elder, formData.num_infant,
        /* (XÓA V32) formData.hotel_product_id, */ formData.transport_product_id, formData.flight_product_id,
        tours, allServices, currentGuests
    ]);

    // (THÊM v30) Cập nhật formData.total_price khi calculatedTotal thay đổi
    useEffect(() => {
        setFormData(prev => ({ ...prev, total_price: calculatedTotal }));
    }, [calculatedTotal]);
    
    // (*** CẬP NHẬT V30) Logic handleSubmit (Giữ nguyên)
    // (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
    const handleSubmit = async (e) => {
        e.preventDefault();
        // --- (SỬA v30) Validations ---
        if (!formData.user_id) { toast.error("Vui lòng chọn khách hàng."); return; }
        if (!formData.product_id) { toast.error("Vui lòng chọn tour."); return; }
        if (!formData.departure_id) { toast.error("Vui lòng chọn ngày khởi hành."); return; }
        if (currentGuests <= 0) { toast.error("Số lượng khách phải lớn hơn 0."); return; }
        // (THÊM v30)
        if ((formData.num_adult + formData.num_elder) === 0 && (formData.num_child > 0 || formData.num_infant > 0)) { toast.error("Phải có ít nhất 1 người lớn hoặc người già đi kèm."); return; }
        if (currentGuests > remainingSlots) { toast.error(`Số khách (${currentGuests}) vượt quá số chỗ còn lại (${remainingSlots}).`); return; }
        // (SỬA v30)
        if (formData.total_price < 0) { toast.error("Tổng tiền không thể là số âm."); return; }
        
        setIsSubmitting(true);
        
        let tourSlotBooked = false;
        let servicesBooked = { /* (XÓA V32) hotel: false, */ transport: false, flight: false };
        const guestCount = currentGuests; // Lấy số khách

        try {
            // 1. Giữ chỗ Tour (Chỉ giữ nếu status là 'confirmed')
            if (formData.status === 'confirmed') {
                const { error: rpcError, data: rpcData } = await supabase.rpc('book_tour_slot', { 
                    departure_id_input: formData.departure_id, 
                    guest_count_input: guestCount 
                });
                if (rpcError || !rpcData) throw new Error(`Lỗi giữ chỗ tour: ${rpcError?.message || 'Hết chỗ'}`);
                tourSlotBooked = true;
            }

            // 2. Giữ chỗ Dịch vụ (Chỉ giữ nếu status là 'confirmed')
            if (formData.status === 'confirmed') {
                const servicePromises = [];
                // (XÓA V32) if (formData.hotel_product_id) { ... }
                if (formData.transport_product_id) {
                    servicePromises.push(supabase.rpc('book_service_slot', { product_id_input: formData.transport_product_id, quantity_input: 1 }).then(res => ({ ...res, type: 'transport' })));
                }
                if (formData.flight_product_id && guestCount > 0) {
                    servicePromises.push(supabase.rpc('book_service_slot', { product_id_input: formData.flight_product_id, quantity_input: guestCount }).then(res => ({ ...res, type: 'flight' })));
                }

                if (servicePromises.length > 0) {
                    const results = await Promise.all(servicePromises);
                    for (const result of results) {
                        if (result.error || !result.data) {
                            // Lỗi
                            throw new Error(`Lỗi giữ chỗ dịch vụ (${result.type}): ${result.error?.message || 'Hết hàng'}`);
                        }
                        // Đánh dấu đã book thành công
                        servicesBooked[result.type] = true;
                    }
                }
            }
            
            // 3. Tạo Booking Payload (GIỐNG VỚI PAYMENT.JSX)
            const bookingPayload = { 
                user_id: formData.user_id, 
                product_id: formData.product_id, 
                departure_id: formData.departure_id, 
                departure_date: selectedDeparture.departure_date, 
                quantity: guestCount, 
                num_adult: formData.num_adult, 
                num_child: formData.num_child, 
                num_elder: formData.num_elder, 
                num_infant: formData.num_infant, 
                total_price: formData.total_price, // (SỬA v30) Lấy từ state (đã tự tính)
                status: formData.status, 
                notes: formData.notes,
                payment_method: 'direct', // Mặc định
                
                // (MỚI) Thêm dịch vụ
                // (XÓA V32) hotel_product_id: formData.hotel_product_id || null,
                transport_product_id: formData.transport_product_id || null,
                flight_product_id: formData.flight_product_id || null,
            };

            // 4. Insert Booking
            const { error: insertError } = await supabase.from('Bookings').insert(bookingPayload);
            if (insertError) throw insertError;
            
            // 5. Thành công
            toast.success("Tạo đơn hàng thành công!");
            onSuccess(); // Re-fetch
            onClose();

        } catch (err) {
            console.error("Lỗi tạo đơn hàng:", err);
            toast.error(`Lỗi: ${err.message}`);

            // (MỚI) ROLLBACK LOGIC
            // (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
            if (formData.status === 'confirmed') {
                toast.warn("Đang thử hoàn lại chỗ...");
                // Rollback tour slot
                if (tourSlotBooked) {
                    await supabase.rpc('book_tour_slot', { departure_id_input: formData.departure_id, guest_count_input: -guestCount });
                }
                // Rollback service slots
                // (XÓA V32) if (servicesBooked.hotel) { ... }
                if (servicesBooked.transport) {
                    await supabase.rpc('book_service_slot', { product_id_input: formData.transport_product_id, quantity_input: -1 });
                }
                if (servicesBooked.flight && guestCount > 0) {
                    await supabase.rpc('book_service_slot', { product_id_input: formData.flight_product_id, quantity_input: -guestCount });
                }
            }
            
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // (*** THÊM MỚI: Chuẩn bị options cho react-select ***)
    const userOptions = useMemo(() => 
        users.map(u => ({
            value: u.id,
            label: `${u.full_name || ''} (${u.email || 'N/A'})`
        })), [users]);

    const tourOptions = useMemo(() =>
        tours.map(t => ({
            value: t.id,
            label: t.name
        })), [tours]);
        
    const departureOptions = useMemo(() =>
        departures.map(d => {
            const remaining = (d.max_slots || 0) - (d.booked_slots || 0);
            return {
                value: d.id,
                label: `${d.departure_date} (Còn ${remaining} chỗ)`,
                isDisabled: remaining <= 0
            };
        }), [departures]);
        
    // (*** THÊM MỚI: Lấy giá trị object đầy đủ cho react-select ***)
    const selectedUser = userOptions.find(u => u.value === formData.user_id) || null;
    const selectedTour = tourOptions.find(t => t.value === formData.product_id) || null;
    const selectedDepartureOption = departureOptions.find(d => d.value === formData.departure_id) || null;


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose} >
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 18, stiffness: 250 }} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()} >
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Tạo Đơn Hàng Mới (Admin)</h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"> <X size={22} weight="bold" /> </button>
                </div>
                
                {/* (*** BẮT ĐẦU SỬA FORM ***) */}
                <form id="add-booking-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 simple-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label-modal font-semibold" htmlFor="user_id">Khách hàng *</label>
                            {/* (*** SỬA 1 ***) */}
                            <Select
                                id="user_id"
                                name="user_id"
                                options={userOptions}
                                value={selectedUser}
                                onChange={handleUserChange}
                                placeholder="-- Gõ để tìm User --"
                                isClearable
                                styles={selectStyles} // Áp dụng style
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="label-modal font-semibold" htmlFor="product_id">Tour *</label>
                             {/* (*** SỬA 2 ***) */}
                            <Select
                                id="product_id"
                                name="product_id"
                                options={tourOptions}
                                value={selectedTour}
                                onChange={handleTourChange}
                                placeholder="-- Gõ để tìm Tour --"
                                isClearable
                                styles={selectStyles} // Áp dụng style
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-modal font-semibold" htmlFor="departure_id">Ngày khởi hành *</label>
                         {/* (*** SỬA 3 ***) */}
                        <Select
                            id="departure_id"
                            name="departure_id"
                            options={departureOptions}
                            value={selectedDepartureOption}
                            onChange={handleDepartureChange}
                            placeholder={loadingDepartures ? "Đang tải lịch..." : (formData.product_id ? "Gõ để tìm ngày đi" : "Vui lòng chọn tour trước")}
                            isDisabled={loadingDepartures || !formData.product_id}
                            isClearable
                            styles={selectStyles} // Áp dụng style
                            className="mt-1"
                        />
                         {selectedDeparture && currentGuests > remainingSlots && <p className="text-xs text-red-500 mt-1">Số lượng khách ({currentGuests}) vượt quá số chỗ còn lại ({remainingSlots})!</p>}
                    </div>
                    
                    {/* (*** HẾT SỬA FORM ***) */}
                    
                    {/* (MỚI V29-SỬA) Dịch vụ kèm theo (Giữ nguyên) */}
                    {/* (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t dark:border-slate-700">
                        {/* (XÓA V32) Khối Khách sạn */}
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="transport_product_id_add"><Car size={16}/> Vận chuyển:</label>
                            <select id="transport_product_id_add" name="transport_product_id" value={formData.transport_product_id} onChange={handleChange} className="input-style w-full mt-1">
                                <option value="">Không chọn</option>
                                {allServices.transport.map(s => 
                                    <option key={s.id} value={s.id} disabled={s.inventory <= 0}>
                                        {s.name} ({formatCurrency(s.price)})
                                        {s.inventory <= 0 ? ' (Hết hàng)' : ` (Còn ${s.inventory})`}
                                    </option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="flight_product_id_add"><AirplaneTilt size={16}/> Chuyến bay:</label>
                            <select id="flight_product_id_add" name="flight_product_id" value={formData.flight_product_id} onChange={handleChange} className="input-style w-full mt-1">
                                <option value="">Không chọn</option>
                                {allServices.flights.map(s => 
                                    <option key={s.id} value={s.id} disabled={s.inventory <= 0}>
                                        {s.name} ({formatCurrency(s.price)})
                                        {s.inventory <= 0 ? ' (Hết hàng)' : ` (Còn ${s.inventory})`}
                                    </option>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* (Các phần còn lại giữ nguyên) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t dark:border-slate-700">
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="num_adult"><FaUser size={14}/> Người lớn *</label>
                            <input type="number" id="num_adult" name="num_adult" value={formData.num_adult} onChange={handleChange} min={0} className="input-style w-full mt-1" required/>
                        </div>
                         <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="num_elder"><FaUserTie size={14}/> Người già</label>
                            <input type="number" id="num_elder" name="num_elder" value={formData.num_elder} onChange={handleChange} min={0} className="input-style w-full mt-1"/>
                        </div>
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="num_child"><FaChild size={14}/> Trẻ em</label>
                            <input type="number" id="num_child" name="num_child" value={formData.num_child} onChange={handleChange} min={0} className="input-style w-full mt-1"/>
                        </div>
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="num_infant"><FaBaby size={14}/> Sơ sinh</label>
                            <input type="number" id="num_infant" name="num_infant" value={formData.num_infant} onChange={handleChange} min={0} className="input-style w-full mt-1"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pt-3 border-t dark:border-slate-700">
                        
                        <div>
                            <label className="label-modal font-semibold" htmlFor="total_price">Tổng tiền (Tự động tính)</label>
                            <input 
                                type="text" 
                                id="total_price" 
                                name="total_price" 
                                value={formatCurrency(formData.total_price)} 
                                readOnly 
                                className="input-style w-full mt-1 !text-lg !font-bold !text-red-600 bg-gray-100 dark:bg-neutral-800"
                            />
                        </div>

                        <div>
                            <label className="label-modal font-semibold" htmlFor="status">Trạng thái ban đầu *</label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="input-style w-full mt-1" required>
                                <option value="pending">Chờ xử lý</option>
                                <option value="confirmed">Đã xác nhận</option>
                            </select>
                        </div>
                    </div>
                    <div>
                         <label className="label-modal font-semibold" htmlFor="notes_add">Ghi chú (Admin):</label>
                         <textarea id="notes_add" name="notes" value={formData.notes} onChange={handleChange} rows={2} className="input-style w-full mt-1" placeholder="Ghi chú nội bộ..."/>
                    </div>
                </form>
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="modal-button-secondary">Hủy</button>
                    <button type="submit" form="add-booking-form" disabled={isSubmitting || loadingDepartures} className="modal-button-primary flex items-center gap-1.5">
                        {isSubmitting ? <CircleNotch className="animate-spin" size={18} /> : <Plus size={18} />}
                        Tạo Đơn Hàng
                    </button>
                </div>
            </motion.div>
             <style jsx>{`
                 /* (Thêm style cho react-select) */
                 /* Do react-select tạo ra các class-name động, 
                  chúng ta phải dùng :global() để style chúng.
                  Tuy nhiên, cách tốt nhất là dùng prop 'styles' như tôi đã làm ở trên.
                  Nếu dùng 'styles', chúng ta không cần thêm CSS ở đây.
                 */
                 
                 .label-modal { @apply font-medium text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wider mb-0.5; }
                 .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                 .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                 .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                 
                 /* (MỚI) Định nghĩa biến CSS cho style dark mode của react-select */
                 :global(html.dark) {
                    --tw-bg-neutral-700: #3f3f46;
                    --tw-bg-neutral-800: #262626;
                    --tw-bg-neutral-600: #52525b;
                    --tw-border-neutral-600: #52525b;
                    --tw-ring-sky-500: #0ea5e9;
                    --tw-bg-sky-600: #0284c7;
                 }
            `}</style>
        </motion.div>
    );
};
// --- (HẾT) Component Modal Thêm Đơn Hàng ---


// --- Component chính: Quản lý Đặt Tour ---
// (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
export default function ManageTour() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    
    // (CẬP NHẬT V21) Tách 2 thanh search
    const [customerSearchTerm, setCustomerSearchTerm] = useState(""); // Search Khách hàng
    
    const debouncedCustomerSearch = useDebounce(customerSearchTerm, 500); // (MỚI V21)
    
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const [modalBooking, setModalBooking] = useState(null);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const [showAddModal, setShowAddModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [allTours, setAllTours] = useState([]);
    const [allServices, setAllServices] = useState({ /* (XÓA V32) hotels: [], */ transport: [], flights: [] });
    const [loadingAddData, setLoadingAddData] = useState(false);
    
    // (V8) State cho Modal Hóa đơn
    const [viewingInvoiceId, setViewingInvoiceId] = useState(null); // Lưu booking_id
    
    // (MỚI v10) State cho Modal Review
    const [viewingReview, setViewingReview] = useState(null); // Lưu object review

    
    // (*** CẬP NHẬT V29: Sử dụng logic Subquery (Snippet 2) do người dùng cung cấp ***)
    // (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
const fetchBookings = useCallback(async (isInitialLoad = false) => {
  if (!isInitialLoad) setIsFetchingPage(true);
  else setLoading(true);
  setError(null);

  try {
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const selectQuery = `
      id,created_at,departure_date,status,total_price,quantity,
      num_adult,num_child,num_elder,num_infant,departure_id,
      user:user_id(id,full_name,email),
      product:product_id(id,name,image_url),
      /* (XÓA V32) hotel:hotel_product_id(id,name), */
      transport:Products!Bookings_transport_product_id_fkey(id,name,price,product_type,details),
      flight:flight_product_id(id,name,price,product_type,details),
      voucher_code,voucher_discount,notes,payment_method,
      Invoices(id),
      Reviews!booking_id(id,rating,comment,reviewer:user_id(full_name,email))
    `.replace(/\s+/g, '');

    let query = supabase.from("Bookings").select(selectQuery, { count: "exact" });

    // Lọc trạng thái
    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    // Phân trang và sắp xếp
    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error: queryError, count } = await query;
    if (queryError) throw queryError;

    // --- 🔍 Lọc khách hàng (client-side) ---
    let filteredData = data || [];
    if (debouncedCustomerSearch) {
      const keyword = debouncedCustomerSearch.toLowerCase();
      filteredData = filteredData.filter(b =>
        b.user?.full_name?.toLowerCase().includes(keyword) ||
        b.user?.email?.toLowerCase().includes(keyword)
      );
    }

    // Định dạng dữ liệu
    const formattedData = filteredData.map(b => ({
      ...b,
      has_invoice: b.Invoices?.length > 0,
      review_data: b.Reviews?.length > 0 ? b.Reviews[0] : null,
    }));

    setBookings(formattedData);
    setTotalItems(count || 0);

    if (!isInitialLoad && currentPage > 1 && filteredData.length === 0 && count > 0) {
      setCurrentPage(1);
    }
  } catch (err) {
    console.error("Lỗi tải danh sách đơn hàng:", err);
    toast.error(`Lỗi tải đơn hàng: ${err.message}`);
    setError(err.message);
  } finally {
    if (isInitialLoad) setLoading(false);
    setIsFetchingPage(false);
  }
}, [currentPage, debouncedCustomerSearch, filterStatus]);
    // (*** KẾT THÚC SỬA LỖI V29 ***)
    

    // (*** CẬP NHẬT V30) useEffect để fetch Users, Tours (với giá) & Services
    // (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
    useEffect(() => {
        const fetchAddModalData = async () => {
            setLoadingAddData(true);
            try {
                // Fetch Users
                const { data: usersData, error: usersError } = await supabase
                    .from('Users')
                    .select('id, full_name, email')
                    .order('full_name', { ascending: true });
                if (usersError) throw usersError;
                setAllUsers(usersData || []);
                
                // Fetch Tours (approved) (SỬA v30: Thêm giá)
                const { data: toursData, error: toursError } = await supabase
                    .from('Products')
                    .select('id, name, selling_price_adult, selling_price_child, selling_price_elder') // (SỬA v30)
                    .eq('product_type', 'tour')
                    .eq('approval_status', 'approved')
                    .order('name', { ascending: true });
                if (toursError) throw toursError;
                setAllTours(toursData || []);
                
                // Fetch Services (approved)
                const { data: servicesData, error: servicesError } = await supabase
                    .from('Products')
                    .select('id, name, price, product_type, details, inventory')
                    .in('product_type', [/* (XÓA V32) 'hotel', */ 'transport', 'flight']) 
                    .eq('approval_status', 'approved')
                    .eq('is_published', true);
                if (servicesError) throw servicesError;
                setAllServices({
                    // (XÓA V32) hotels: servicesData.filter(s => s.product_type === 'hotel'),
                    transport: servicesData.filter(s => s.product_type === 'transport'),
                    flights: servicesData.filter(s => s.product_type === 'flight')
                });
                
            } catch (err) {
                console.error("Lỗi fetch data cho modal:", err);
                toast.error("Lỗi tải danh sách Users/Tours/Services.");
            }
            setLoadingAddData(false);
        };
        fetchAddModalData();
    }, []);


    // (CẬP NHẬT V28) Sửa lại logic gọi useEffect
     useEffect(() => {
        // Chỉ chạy fetchBookings khi các dependencies thay đổi
        // (currentPage, debouncedCustomerSearch, filterStatus)
        // fetchBookings đã được bọc trong useCallback và có các dependencies này
        
        // Gọi fetchBookings khi component mount (isInitialLoad = true)
        // và khi các dependencies thay đổi (isInitialLoad = false)
        if (loading) { // Chỉ chạy lần đầu khi loading=true
             fetchBookings(true);
        } else {
             fetchBookings(false);
        }
     }, [currentPage, debouncedCustomerSearch, filterStatus, fetchBookings, loading]);


     useEffect(() => {
        // Reset về trang 1 khi filter thay đổi
        if (currentPage !== 1) { setCurrentPage(1); }
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [debouncedCustomerSearch, filterStatus]);


    // (GIỮ NGUYÊN V8) Event Handlers
    const handleStatusChange = async (booking, newStatus) => {
        setIsFetchingPage(true); 
        let needsSlotUpdate = false;
        let slotChange = 0;
        // (SỬA v30) Lấy số lượng từ booking (có thể đã bị sửa)
        const currentQuantity = (booking.num_adult || 0) + (booking.num_child || 0) + (booking.num_elder || 0) + (booking.num_infant || 0);
        
        if (booking.status === 'confirmed' && newStatus !== 'confirmed') { needsSlotUpdate = true; slotChange = currentQuantity; } // Hoàn slot
        else if (booking.status !== 'confirmed' && newStatus === 'confirmed') { needsSlotUpdate = true; slotChange = -currentQuantity; } // Trừ slot
        
        try {
            if (needsSlotUpdate && booking.departure_id && slotChange !== 0) {
                 // (SỬA v30) Dùng book_tour_slot (an toàn hơn)
                 const { error: rpcError, data: rpcData } = await supabase.rpc('book_tour_slot', { 
                    departure_id_input: booking.departure_id, 
                    guest_count_input: slotChange // (slotChange < 0 = trừ slot)
                 });
                if (rpcError || !rpcData) throw new Error(`Lỗi cập nhật slot (hết chỗ?): ${rpcError.message}`);
            }
            const { error: updateError } = await supabase.from('Bookings').update({ status: newStatus }).eq('id', booking.id);
            if (updateError) throw updateError;
            toast.success(`Đã cập nhật trạng thái đơn #${booking.id.slice(-8).toUpperCase()} thành "${newStatus}"`);
            setModalBooking(null); 
            fetchBookings(false); 
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            toast.error(`Lỗi: ${err.message}`);
        } finally {
            setIsFetchingPage(false);
        }
    };
    
    // (CẬP NHẬT V20) Xóa: Chỉ hoàn slot nếu status KHÔNG PHẢI 'confirmed'
    const confirmDeleteBooking = async (booking) => {
        setIsFetchingPage(true);
        
        // (V20) Chỉ hoàn slot nếu trạng thái không phải là 'confirmed'
        let needsSlotUpdate = booking.status !== 'confirmed'; 
        let slotChange = booking.quantity;

        try {
            // (MỚI v9) Xóa Reviews trước (nếu có)
             if (booking.review_data) {
                 const { data, error } = await supabase
                     .from('Reviews')
                     .delete()
                     .eq('booking_id', booking.id); // Xóa theo booking_id
                 if (error) {
                     console.warn(`Lỗi xóa review liên kết: ${error.message}`);
                 }
             }

            // (V8) Xóa Hóa đơn trước (nếu có)
             if (booking.has_invoice) {
                 const { error: invoiceError } = await supabase
                     .from('Invoices')
                     .delete()
                     .eq('booking_id', booking.id);
                 if (invoiceError) {
                      console.warn(`Lỗi xóa hóa đơn liên kết: ${invoiceError.message}`);
                      toast.warn("Lỗi xóa hóa đơn liên kết, nhưng vẫn tiếp tục xóa đơn hàng.");
                 }
             }
            
            // (CẬP NHẬT V20) Hoàn slot nếu cần
            if (needsSlotUpdate && booking.departure_id && slotChange > 0) {
                 const { error: rpcError } = await supabase.rpc('update_departure_slot', { departure_id_input: booking.departure_id, change_amount: slotChange });
                 if (rpcError) { 
                     console.warn(`Lỗi hoàn trả slot khi xóa booking ${booking.id}: ${rpcError.message}`); 
                     toast.warn(`Lỗi hoàn trả slot: ${rpcError.message}. Vui lòng kiểm tra lại.`); 
                 }
            }
            
            // Xóa booking (giữ nguyên)
            const { error: deleteError } = await supabase.from('Bookings').delete().eq('id', booking.id);
            if (deleteError) throw deleteError;
            
            toast.success(`Đã xóa đơn hàng #${booking.id.slice(-8).toUpperCase()}`);
            setBookingToDelete(null); 
            if (bookings.length === 1 && currentPage > 1) { setCurrentPage(currentPage - 1); }
            else { fetchBookings(false); }
        } catch (err) {
            console.error("Lỗi xóa đơn hàng:", err);
            toast.error(`Xóa thất bại: ${err.message}`);
        } finally {
            setIsFetchingPage(false);
        }
    };
    
    // (*** CẬP NHẬT V30) Handler để lưu chỉnh sửa chi tiết (logic slot) ***
    // (*** CẬP NHẬT V32: XÓA KHÁCH SẠN ***)
    const handleSaveDetails = async (booking, updatedData) => {
        setIsFetchingPage(true);
        
        // Lấy dữ liệu mới
        const new_qty = (updatedData.num_adult || 0) + (updatedData.num_child || 0) + (updatedData.num_elder || 0) + (updatedData.num_infant || 0);
        const old_qty = booking.quantity || 0;
        const new_dep_id = updatedData.departure_id;
        const old_dep_id = booking.departure_id;
        
        try {
            // Logic cập nhật Slot (chỉ khi 'confirmed' VÀ có thay đổi)
            if (booking.status === 'confirmed' && (new_dep_id !== old_dep_id || new_qty !== old_qty)) {
                
                // 1. Rollback chỗ cũ (Hoàn trả slotChange = old_qty)
                if (old_qty > 0 && old_dep_id) {
                     await supabase.rpc('update_departure_slot', { 
                        departure_id_input: old_dep_id, 
                        change_amount: old_qty 
                     });
                }

                // 2. Thử book chỗ mới (Trừ slotChange = -new_qty)
                if (new_qty > 0 && new_dep_id) {
                    const { error: rpcError, data: rpcData } = await supabase.rpc('book_tour_slot', { 
                        departure_id_input: new_dep_id, 
                        guest_count_input: new_qty 
                    });

                    if (rpcError || !rpcData) {
                        // 3. Lỗi -> Book lại chỗ cũ (Rollback cái rollback)
                        if (old_qty > 0 && old_dep_id) {
                             await supabase.rpc('update_departure_slot', { 
                                departure_id_input: old_dep_id, 
                                change_amount: -old_qty 
                             });
                        }
                        throw new Error(`Hết chỗ cho ngày mới. Đã khôi phục chỗ cũ. (${rpcError?.message || ''})`);
                    }
                }
            }
            
            // 4. Payload cập nhật
             const dataToUpdate = {
                // user_id: updatedData.user_id, // (XÓA) Không cho sửa user
                product_id: updatedData.product_id,
                // (XÓA V32) hotel_product_id: updatedData.hotel_product_id || null,
                transport_product_id: updatedData.transport_product_id || null,
                flight_product_id: updatedData.flight_product_id || null,
                voucher_code: updatedData.voucher_code || null,
                total_price: updatedData.total_price,
                notes: updatedData.notes,
                
                // (THÊM) Thêm các trường mới
                departure_id: new_dep_id,
                departure_date: updatedData.departure_date, // Modal đã cung cấp
                quantity: new_qty,
                num_adult: updatedData.num_adult,
                num_child: updatedData.num_child,
                num_elder: updatedData.num_elder,
                num_infant: updatedData.num_infant
             };

             const { error } = await supabase
                .from('Bookings')
                .update(dataToUpdate)
                .eq('id', booking.id); 
             
             if (error) throw error;
             
             toast.success("Cập nhật chi tiết đơn hàng thành công!");
             setModalBooking(null);
             fetchBookings(false);

        } catch (err) {
             console.error("Lỗi lưu chi tiết:", err);
             toast.error(`Lỗi: ${err.message}`);
             // Lỗi ở đây (ví dụ Hết chỗ) sẽ không đóng modal,
             // nhưng fetchBookings(false) bên dưới vẫn chạy
             fetchBookings(false); // (SỬA v30) Re-fetch ngay cả khi lỗi để đồng bộ
        } finally {
             setIsFetchingPage(false);
        }
    };
    // (*** HẾT CẬP NHẬT V30 ***)


    const handleViewDetails = (booking) => { setModalBooking(booking); };
    const handleDeleteClick = (booking) => { setBookingToDelete(booking); };
    // (V8) Mở modal hóa đơn
    const handleViewInvoice = (bookingId) => { setViewingInvoiceId(bookingId); };
    // (MỚI v10) Mở modal review
    const handleViewReview = (review) => { setViewingReview(review); };

    
    const handleAddBooking = () => {
        if (loadingAddData) { toast.loading("Đang tải dữ liệu Users/Tours..."); return; }
        if (allUsers.length === 0 || allTours.length === 0) {
            toast.error("Lỗi: Không có đủ dữ liệu Users hoặc Tours để tạo đơn.");
            return;
        }
        setShowAddModal(true);
    };

    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
                <CircleNotch size={48} className="animate-spin text-sky-500" />
                <p className="mt-3 text-slate-500">Đang tải đơn hàng...</p>
            </div>
        );
     }

    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white">
            {/* Header & Nút Tạo (Giữ nguyên) */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Quản Lý Đơn Đặt Tour</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý và duyệt đơn đặt tour của khách hàng.</p>
                </div>
                 <button onClick={handleAddBooking} disabled={loadingAddData} className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow hover:shadow-md transition-all font-semibold text-sm disabled:opacity-60" >
                     {loadingAddData ? <CircleNotch className="animate-spin" size={18} /> : <Plus size={18} weight="bold" />}
                     Thêm Đơn Hàng
                 </button>
            </div>

            {/* Thẻ Thống Kê (Giữ nguyên) */}
            <BookingStats />

            {/* (MỚI V29-SỬA) Tour Yêu Thích Nhất */}
            <FavoriteTourStats />

            {/* (CẬP NHẬT V22) Filter & Search (Layout mới - giữ nguyên) */}
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-gray-100 dark:border-slate-700">
                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-3 justify-between">
                    {/* Filter Trạng thái (Left) */}
                    <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select-figma" disabled={isFetchingPage} >
                            <option value="all">Tất cả</option> 
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    
                    {/* Search Group (Right) */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        {/* Search Khách hàng */}
                        <div className="relative w-full md:w-auto">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input 
                                type="text" 
                                value={customerSearchTerm} 
                                onChange={(e) => setCustomerSearchTerm(e.target.value)} 
                                placeholder="Tìm theo khách hàng..." 
                                className="search-input-figma !pl-10 md:w-60"
                                disabled={isFetchingPage} 
                            />
                        </div>
                        
                        {/* Nút Reload */}
                        <button onClick={() => fetchBookings(false)} disabled={loading || isFetchingPage} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0">
                            <ArrowClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>


                {/* (CẬP NHẬT v10) Bảng Dữ liệu (Sửa cột Đánh giá) */}
                <div className="overflow-x-auto relative">
                    {isFetchingPage && <div className="loading-overlay"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>}
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th className="th-style-figma">Mã đơn</th>
                                <th className="th-style-figma">Khách hàng</th>
                                <th className="th-style-figma min-w-[250px]">Tour</th>
                                <th className="th-style-figma">Ngày đặt</th>
                                <th className="th-style-figma">Ngày đi</th>
                                <th className="th-style-figma">Số người</th>
                                <th className="th-style-figma text-right">Tổng tiền</th>
                                <th className="th-style-figma text-center">P.Thức TT</th>
                                <th className="th-style-figma text-center">Đánh giá</th>
                                <th className="th-style-figma text-center">Trạng thái</th>
                                <th className="th-style-figma text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {!loading && !error && bookings.length === 0 && !isFetchingPage && (
                                // (SỬA v9) Colspan 11
                                <tr><td colSpan="11" className="td-center text-gray-500 italic py-10">
                                    {customerSearchTerm || filterStatus !== 'all' ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                                </td></tr>
                            )}
                            {/* (MỚI V23) Hiển thị lỗi nếu có */}
                             {!loading && error && (
                                <tr><td colSpan="11" className="td-center text-red-500 font-medium py-10">
                                    Đã xảy ra lỗi: {error}
                                </td></tr>
                             )}
                            {!error && bookings.map((booking) => {
                                return (
                                <motion.tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} >
                                    <td className="td-style-figma font-mono text-xs text-gray-500 dark:text-gray-400">#{booking.id.slice(-8).toUpperCase()}</td>
                                    <td className="td-style-figma max-w-xs">
                                        <div className="font-semibold text-gray-800 dark:text-white truncate" title={booking.user?.email}>{booking.user?.full_name || booking.user?.email || 'N/A'}</div>
                                    </td>
                                    <td className="td-style-figma max-w-xs">
                                        <div className="flex items-center gap-3">
                                            <img src={booking.product?.image_url || 'https://placehold.co/80x50/eee/ccc?text=Tour'} alt={booking.product?.name || 'Tour'} className="w-20 h-12 object-cover rounded flex-shrink-0 border dark:border-slate-600" onError={(e) => {e.target.src='https://placehold.co/80x50/eee/ccc?text=Error'}} />
                                            <span className="text-gray-700 dark:text-gray-200 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors font-medium" title={booking.product?.name}>
                                                {booking.product?.name || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="td-style-figma text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(booking.created_at)}</td>
                                    <td className="td-style-figma text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatShortDate(booking.departure_date)}</td>
                                    <td className="td-style-figma text-xs text-center text-gray-600 dark:text-gray-300">{formatQuantity(booking)}</td>
                                    <td className="td-style-figma text-right font-semibold text-red-600 dark:text-red-400 whitespace-noww-rap">{formatCurrency(booking.total_price)}</td>
                                    {/* (V8) Cột PTTT */}
                                    <td className="td-style-figma text-center text-xs text-gray-600 dark:text-gray-300 font-medium">
                                        {formatPaymentMethod(booking.payment_method)}
                                    </td>
                                    
                                    {/* (CẬP NHẬT v10) Cột Đánh giá (Thêm onClick) */}
                                    <td className="td-style-figma text-center">
                                        {booking.review_data ? (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <RatingDisplay rating={booking.review_data.rating} />
                                                {booking.review_data.comment && (
                                                    <button 
                                                        className="action-button-figma text-gray-500 hover:text-sky-500 dark:hover:text-sky-400 p-1"
                                                        title="Xem bình luận"
                                                        onClick={() => handleViewReview(booking.review_data)}
                                                    >
                                                        <ChatCircleDots size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Chưa có</span>
                                        )}
                                    </td>

                                    <td className="td-style-figma text-center"><StatusBadge status={booking.status} /></td>
                                    {/* (V8) Thao tác (Thêm nút Hóa đơn) */}
                                    <td className="td-style-figma text-center whitespace-nowrap">
                                        <div className="flex gap-2 justify-center">
                                            {/* (V8) Nút Hóa đơn */}
                                            {booking.has_invoice && (
                                                <button onClick={() => handleViewInvoice(booking.id)} className="action-button-figma text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400" title="Xem Hóa đơn">
                                                    <Receipt size={18} weight="bold" />
                                                </button>
                                            )}
                                            <button onClick={() => handleViewDetails(booking)} className="action-button-figma text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" title="Xem Chi tiết & Duyệt"><PencilSimple size={18} weight="bold" /></button>
                                            <button onClick={() => handleDeleteClick(booking)} className="action-button-figma text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" title="Xóa Đơn"><Trash size={18} weight="bold"/></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination (Giữ nguyên) */}
            {!loading && totalItems > ITEMS_PER_PAGE && (
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                      <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> trên <span className="font-semibold dark:text-white">{totalItems}</span> đơn hàng </div>
                      <div className="flex items-center gap-1 mt-3 sm:mt-0">
                          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
                          {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
                              <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} disabled={isFetchingPage} className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}>{pageNumber}</button>
                          ))}
                          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
                      </div>
                  </div>
            )}

            {/* (CẬP NHẬT v10) Modals (Thêm Modal Review) */}
            <AnimatePresence>
                {modalBooking && (
                    <EditBookingModal 
                        booking={modalBooking} 
                        onClose={() => setModalBooking(null)} 
                        onStatusChange={handleStatusChange} 
                        onSaveDetails={handleSaveDetails} // (SỬA v30) Prop này đã được cập nhật logic
                        allUsers={allUsers}
                        allTours={allTours}
                        allServices={allServices}
                    />
                )}
                {bookingToDelete && <DeleteConfirmationModal booking={bookingToDelete} onClose={() => setBookingToDelete(null)} onConfirm={confirmDeleteBooking} />}
                
                {/* (CẬP NHẬT V29-SỬA) Pass allServices vào AddBookingModal */}
                {showAddModal && (
                    <AddBookingModal
                        users={allUsers}
                        tours={allTours} // (SỬA v30) Prop này đã có giá
                        allServices={allServices} 
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => fetchBookings(false)} 
                    />
                )}
                
                {/* (V8) Modal Hóa đơn */}
                {viewingInvoiceId && (
                     <ViewInvoiceModal
                         bookingId={viewingInvoiceId}
                         onClose={() => setViewingInvoiceId(null)}
                     />
                )}
                
                {/* (MỚI v10) Modal Xem Review */}
                <AnimatePresence>
                    {viewingReview && (
                        <ViewReviewModal
                            review={viewingReview}
                            onClose={() => setViewingReview(null)}
                        />
                    )}
                </AnimatePresence>

            </AnimatePresence>

            {/* CSS (Giữ nguyên) */}
            <style jsx>{`
                .filter-select-figma { @apply appearance-none block w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 cursor-pointer; }
                .search-input-figma { @apply w-full pl-4 pr-4 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50; }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10 rounded-lg; }
                .th-style-figma { @apply px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap; }
                .td-style-figma { @apply px-5 py-4 text-sm align-middle; }
                .td-center { @apply px-6 py-8 text-center; }
                .action-button-figma { @apply p-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed; }
                .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-danger { @apply px-5 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50 transition-colors shadow-sm hover:shadow-md; }
                .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </div>
    );
}
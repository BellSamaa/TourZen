// src/pages/ManageTour.jsx
// (V4: Giao diện giống ảnh Figma - Quản lý Nhà Cung Cấp, Logic Quản lý Đơn hàng)

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, Funnel, List, ArrowClockwise,
    User, CalendarBlank, UsersThree, Tag, Wallet, CheckCircle, XCircle, Clock, Info, PencilSimple, Trash, Plus, WarningCircle, Envelope,
    Buildings, AirplaneTilt, Car, Ticket as VoucherIcon, Bank, Image as ImageIcon // Thêm icons cần thiết
} from "@phosphor-icons/react";

const supabase = getSupabase();

// --- Hook Debounce ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window ---
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

// --- Helpers Format ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Định dạng "dd/MM/yyyy HH:mm"
        return new Date(dateString).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'Invalid Date'; }
};
const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Định dạng "dd/MM/yyyy"
        return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) { return 'Invalid Date'; }
};
const formatQuantity = (booking) => {
    let parts = [];
    if (booking.num_adult > 0) parts.push(`${booking.num_adult}NL`);
    if (booking.num_elder > 0) parts.push(`${booking.num_elder}NG`); // Người Già
    if (booking.num_child > 0) parts.push(`${booking.num_child}TE`);
    if (booking.num_infant > 0) parts.push(`${booking.num_infant}EB`); // Em Bé
    return parts.join(', ') || '0';
};

// --- Component Badge Trạng thái (Style giống Figma) ---
const StatusBadge = ({ status }) => {
  const baseStyle = "px-3 py-1 text-[11px] font-bold rounded-md inline-flex items-center gap-1 leading-tight whitespace-nowrap";
  switch (status) {
    case 'confirmed':
      // Màu đen chữ trắng như Figma "Hoạt động"
      return <span className={`${baseStyle} bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900`}><CheckCircle weight="bold" /> Đã xác nhận</span>;
    case 'cancelled':
      // Màu đỏ chữ trắng như Figma "Ngừng"
      return <span className={`${baseStyle} bg-red-600 text-white dark:bg-red-500`}><XCircle weight="bold" /> Đã hủy</span>;
    case 'pending':
    default:
      // Màu xám nhạt chữ đậm
      return <span className={`${baseStyle} bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-100`}><Clock weight="bold" /> Chờ xử lý</span>;
  }
};

// --- Component Thẻ Thống Kê (Lấy từ DashboardHome, style Figma) ---
const StatCard = ({ title, value, icon, loading }) => {
    const IconCmp = icon;
    return (
        <motion.div
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg"
            whileHover={{ y: -3 }}
        >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</p>
            <div className="text-4xl font-bold text-slate-800 dark:text-white">
                {loading ? <CircleNotch size={32} className="animate-spin text-sky-500" /> : value}
            </div>
            {/* Có thể thêm icon hoặc biểu đồ nhỏ nếu cần */}
        </motion.div>
    );
};

// --- Component Fetch và Hiển thị Thống Kê ---
const BookingStats = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Lấy tất cả bookings để tính toán
                const { data, error, count } = await supabase
                    .from('Bookings')
                    .select('status, total_price', { count: 'exact' });

                if (error) throw error;

                let pendingCount = 0;
                let confirmedCount = 0;
                let totalRevenue = 0;

                data.forEach(b => {
                    if (b.status === 'pending') pendingCount++;
                    if (b.status === 'confirmed') {
                        confirmedCount++;
                        totalRevenue += (b.total_price || 0);
                    }
                });

                setStats({
                    total: count || 0,
                    pending: pendingCount,
                    confirmed: confirmedCount,
                    revenue: totalRevenue
                });

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


// --- Component Modal Chi tiết/Sửa Đơn hàng (Giữ nguyên logic, cập nhật UI nhẹ) ---
const BookingDetailsModal = ({ booking, onClose, onStatusChange }) => {
    if (!booking) return null;

    const handleLocalStatusChange = (newStatus) => {
        if (booking.status === newStatus) return;
        // Hỏi xác nhận trước khi đổi
         if (window.confirm(`Bạn có chắc muốn đổi trạng thái thành "${newStatus}"?`)) {
              onStatusChange(booking, newStatus); // Gọi hàm prop để xử lý logic (bao gồm RPC)
         }
    };

    const sendConfirmationEmail = (email) => {
         toast.success(`Đã gửi lại email xác nhận đến ${email} (chức năng giả lập).`);
     };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={onClose} // Đóng khi click nền
        >
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 250 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Ngăn click xuyên thấu
             >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Chi tiết Đơn hàng #{booking.id.slice(-8).toUpperCase()}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"> <X size={22} weight="bold" /> </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm simple-scrollbar">
                    {/* Thông tin Khách hàng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div><strong className="label-modal">Khách hàng:</strong> <span className="value-modal">{booking.user?.full_name || booking.user?.email || 'N/A'}</span></div>
                        <div><strong className="label-modal">Email:</strong> <span className="value-modal">{booking.user?.email || 'N/A'}</span></div>
                        <div><strong className="label-modal">Ngày đặt:</strong> <span className="value-modal">{formatDate(booking.created_at)}</span></div>
                        {/* Có thể thêm SĐT nếu có */}
                    </div>
                    {/* Thông tin Tour & Lịch trình */}
                    <div className="border-t pt-4 dark:border-slate-700 space-y-2">
                        <div><strong className="label-modal">Tour:</strong> <span className="font-semibold text-lg text-sky-700 dark:text-sky-400">{booking.product?.name || 'Tour đã bị xóa'}</span></div>
                        <div><strong className="label-modal">Ngày đi:</strong> <span className="font-semibold value-modal text-base">{formatShortDate(booking.departure_date)}</span></div>
                        <div><strong className="label-modal">Số lượng:</strong> <span className="value-modal">{formatQuantity(booking)} ({booking.quantity} người)</span></div>
                    </div>
                    {/* Dịch vụ kèm theo & Voucher */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-4 border-t dark:border-slate-700">
                        <div><strong className="label-modal flex items-center gap-1.5"><Buildings size={18}/> Khách sạn:</strong> <span className="value-modal">{booking.hotel?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1.5"><Car size={18}/> Vận chuyển:</strong> <span className="value-modal">{booking.transport?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1.5"><AirplaneTilt size={18}/> Chuyến bay:</strong> <span className="value-modal">{booking.flight?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1.5"><VoucherIcon size={18}/> Voucher:</strong> <span className="value-modal">{booking.voucher_code || 'Không có'} {booking.voucher_discount > 0 ? `(-${formatCurrency(booking.voucher_discount)})` : ''}</span></div>
                    </div>
                    {/* Ghi chú */}
                    {booking.notes && (
                         <div className="pt-4 border-t dark:border-slate-700">
                             <strong className="label-modal">Ghi chú của khách:</strong>
                             <p className="value-modal bg-gray-50 dark:bg-slate-700/50 p-3 rounded border dark:border-slate-600 mt-1.5 text-base">{booking.notes}</p>
                         </div>
                    )}
                     {/* Tổng tiền */}
                     <div className="pt-4 border-t dark:border-slate-700 text-right">
                        <span className="text-lg font-semibold value-modal">Tổng tiền: </span>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(booking.total_price)}</span>
                     </div>

                     {/* Thay đổi trạng thái */}
                     <div className="pt-5 border-t dark:border-slate-700">
                        <label className="label-modal text-base font-semibold mb-2">Cập nhật trạng thái:</label>
                        <div className="flex flex-wrap gap-3 mt-1">
                             <button onClick={() => handleLocalStatusChange('confirmed')} disabled={booking.status === 'confirmed'} className="button-status bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"> <CheckCircle weight="bold"/> Xác nhận </button>
                             <button onClick={() => handleLocalStatusChange('cancelled')} disabled={booking.status === 'cancelled'} className="button-status bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"> <XCircle weight="bold"/> Hủy đơn </button>
                             <button onClick={() => handleLocalStatusChange('pending')} disabled={booking.status === 'pending'} className="button-status bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"> <Clock weight="bold"/> Đặt lại Chờ xử lý </button>
                        </div>
                        {booking.status === 'confirmed' && booking.user?.email && (
                            <button onClick={() => sendConfirmationEmail(booking.user.email)} className="button-secondary text-sm mt-4 flex items-center gap-1.5"> <Envelope/> Gửi lại email xác nhận </button>
                        )}
                     </div>
                </div>
                {/* Footer */}
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="modal-button-secondary">Đóng</button>
                    {/* Có thể thêm nút Lưu nếu có trường nào edit được */}
                </div>
            </motion.div>
            <style jsx>{`
                 .label-modal { @apply font-medium text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wider mb-0.5; }
                 .value-modal { @apply text-gray-800 dark:text-white text-base; }
                 .button-status { @apply flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-md transition-all duration-200 transform hover:-translate-y-0.5; }
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </motion.div>
    );
};

// --- Component Modal Xác nhận Xóa (Giữ nguyên logic, cập nhật UI nhẹ) ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try { await onConfirm(booking); }
        catch (error) { setIsDeleting(false); /* Lỗi đã được xử lý ở onConfirm */ }
        // finally không cần vì component sẽ unmount
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
                        {booking.status === 'confirmed' && <p className="font-semibold text-orange-600 dark:text-orange-400 mt-1 flex items-center justify-center gap-1"><UsersThree size={18}/> Số chỗ ({booking.quantity}) sẽ được hoàn trả.</p>}
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


// --- Component chính: Quản lý Đặt Tour ---
export default function ManageTour() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false); // Loading riêng cho pagination/filter/search
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500); // Tăng debounce
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const [modalBooking, setModalBooking] = useState(null); // Booking đang xem/sửa
    const [bookingToDelete, setBookingToDelete] = useState(null); // Booking chờ xóa
    const [filterStatus, setFilterStatus] = useState('all'); // Filter trạng thái

    // --- Fetch Bookings (Cập nhật để JOIN nhiều hơn, lấy ảnh) ---
    const fetchBookings = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true);
        else setLoading(true); // Chỉ set loading chính khi tải lần đầu
        setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('Bookings')
                .select(`
                    id, created_at, departure_date, status, total_price, quantity,
                    num_adult, num_child, num_elder, num_infant, departure_id,
                    user:user_id ( id, full_name, email ),
                    product:product_id ( id, name, image_url ), /* Lấy thêm image_url */
                    hotel:hotel_product_id (id, name),
                    transport:transport_product_id (id, name),
                    flight:flight_product_id (id, name),
                    voucher_code, voucher_discount, notes, payment_method
                `, { count: 'exact' }); // Lấy count để phân trang

            // Apply filter
            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            // Apply search (Tìm theo Mã đơn, Tên khách, Email, Tên tour)
            if (debouncedSearch) {
                 const searchTerm = `%${debouncedSearch}%`;
                 // Tìm ID booking (cần ID đầy đủ, không phải slice)
                 // Tìm tên/email user qua bảng Users (cần JOIN hoặc subquery phức tạp hơn, tạm thời bỏ qua)
                 // Tìm tên tour qua bảng Products (đã JOIN)
                 query = query.or(`product.name.ilike.${searchTerm},user.full_name.ilike.${searchTerm},user.email.ilike.${searchTerm},id::text.like.${searchTerm}`); // Tìm cả ID
            }

            query = query.order('created_at', { ascending: false }).range(from, to);
            const { data, error: queryError, count } = await query;

            if (queryError) throw queryError;
            setBookings(data || []);
            setTotalItems(count || 0);
            // Tự động về trang 1 nếu trang hiện tại không còn dữ liệu (sau khi filter/search)
            if (!isInitialLoad && currentPage > 1 && data.length === 0 && count > 0) {
                 setCurrentPage(1);
            }

        } catch (err) {
             console.error("Lỗi tải danh sách đơn hàng:", err);
             setError(err.message || "Không thể tải dữ liệu.");
             toast.error(`Lỗi tải đơn hàng: ${err.message}`);
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch, filterStatus]); // Thêm dependencies

    // --- UseEffects ---
     useEffect(() => {
        // Fetch lần đầu hoặc khi dependencies thay đổi (trừ currentPage)
        fetchBookings(true);
     }, [debouncedSearch, filterStatus]); // Bỏ currentPage

     useEffect(() => {
        // Fetch khi chỉ currentPage thay đổi (không cần set loading chính)
        fetchBookings(false);
     }, [currentPage]); // Chỉ fetch khi currentPage đổi

     // Tự về trang 1 khi filter hoặc search thay đổi
     useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
     }, [debouncedSearch, filterStatus]);


    // --- Event Handlers (Cập nhật logic RPC) ---
    const handleStatusChange = async (booking, newStatus) => {
        setIsFetchingPage(true); // Hiển thị loading overlay
        let needsSlotUpdate = false;
        let slotChange = 0;

        // Xác định xem có cần cập nhật slot không
        if (booking.status === 'confirmed' && newStatus !== 'confirmed') {
            needsSlotUpdate = true;
            slotChange = booking.quantity; // Hoàn trả slot
        } else if (booking.status !== 'confirmed' && newStatus === 'confirmed') {
            needsSlotUpdate = true;
            slotChange = -booking.quantity; // Trừ slot (giữ chỗ)
        }

        try {
            // Bước 1: Cập nhật slot nếu cần
            if (needsSlotUpdate && booking.departure_id) {
                const { error: rpcError } = await supabase.rpc('update_departure_slot', {
                    departure_id_input: booking.departure_id,
                    change_amount: slotChange
                });
                if (rpcError) {
                    // Nếu lỗi RPC (vd: hết chỗ khi xác nhận), không cập nhật booking status
                    throw new Error(`Lỗi cập nhật slot: ${rpcError.message}`);
                }
            }

            // Bước 2: Cập nhật trạng thái booking
            const { error: updateError } = await supabase
                .from('Bookings')
                .update({ status: newStatus })
                .eq('id', booking.id);

            if (updateError) throw updateError;

            toast.success(`Đã cập nhật trạng thái đơn #${booking.id.slice(-8).toUpperCase()} thành "${newStatus}"`);
            setModalBooking(null); // Đóng modal
            fetchBookings(); // Tải lại danh sách

        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            toast.error(`Lỗi: ${err.message}`);
            // Cân nhắc rollback RPC nếu bước 2 thất bại (phức tạp hơn)
        } finally {
            setIsFetchingPage(false);
        }
    };

    const handleViewDetails = (booking) => { setModalBooking(booking); };
    const handleDeleteClick = (booking) => { setBookingToDelete(booking); };

    const confirmDeleteBooking = async (booking) => {
        setIsFetchingPage(true);
        let needsSlotUpdate = booking.status === 'confirmed'; // Chỉ hoàn slot nếu đơn đã xác nhận
        let slotChange = booking.quantity;

        try {
            // Bước 1: Hoàn trả slot nếu cần
            if (needsSlotUpdate && booking.departure_id) {
                 const { error: rpcError } = await supabase.rpc('update_departure_slot', {
                    departure_id_input: booking.departure_id,
                    change_amount: slotChange // Hoàn trả
                 });
                 if (rpcError) {
                    // Log lỗi nhưng vẫn tiếp tục xóa booking
                    console.warn(`Lỗi hoàn trả slot khi xóa booking ${booking.id}: ${rpcError.message}`);
                    toast.warn(`Lỗi hoàn trả slot: ${rpcError.message}. Vui lòng kiểm tra lại.`);
                 }
            }

            // Bước 2: Xóa booking
            const { error: deleteError } = await supabase
                .from('Bookings')
                .delete()
                .eq('id', booking.id);

            if (deleteError) throw deleteError;

            toast.success(`Đã xóa đơn hàng #${booking.id.slice(-8).toUpperCase()}`);
            setBookingToDelete(null); // Đóng modal confirm

            // Tải lại dữ liệu - Kiểm tra nếu xóa hết trang cuối thì lùi trang
            if (bookings.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchBookings();
            }

        } catch (err) {
            console.error("Lỗi xóa đơn hàng:", err);
            toast.error(`Xóa thất bại: ${err.message}`);
        } finally {
            setIsFetchingPage(false);
        }
    };

    // --- Pagination Window ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // --- Loading ban đầu ---
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)]">
                <CircleNotch size={48} className="animate-spin text-sky-500" />
                <p className="mt-3 text-slate-500">Đang tải đơn hàng...</p>
            </div>
        );
     }

    // --- JSX (Giao diện giống Figma) ---
    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white">
            {/* Header & Nút Tạo */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Quản Lý Đơn Đặt Tour</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý và duyệt đơn đặt tour của khách hàng.</p>
                </div>
                {/* Style nút giống Figma */}
                 <button className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow hover:shadow-md transition-all font-semibold text-sm">
                     <Plus size={18} weight="bold" /> Thêm Đơn Hàng {/* Tạm thời không có chức năng */}
                 </button>
            </div>

            {/* Thẻ Thống Kê */}
            <BookingStats />

            {/* Filter & Search + Danh sách */}
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-gray-100 dark:border-slate-700">
                {/* Filter & Search Bar (Style Figma) */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                        {/* Filter Trạng thái */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select-figma"
                            disabled={isFetchingPage}
                        >
                            <option value="all">Tất cả</option> {/* Sửa text */}
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    {/* Search Input (Style Figma) */}
                    <div className="relative flex-grow w-full">
                        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm đơn hàng..." // Sửa placeholder
                            className="search-input-figma"
                            disabled={isFetchingPage}
                        />
                    </div>
                     {/* Nút làm mới */}
                    <button onClick={() => fetchBookings(true)} disabled={loading || isFetchingPage} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0">
                        <ArrowClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Bảng Dữ liệu */}
                <div className="overflow-x-auto relative">
                    {isFetchingPage && <div className="loading-overlay"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>}
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            {/* Header Table giống Figma */}
                            <tr>
                                <th className="th-style-figma">Mã đơn</th>
                                <th className="th-style-figma">Khách hàng</th>
                                <th className="th-style-figma min-w-[250px]">Tour</th>
                                <th className="th-style-figma">Ngày đặt</th>
                                <th className="th-style-figma">Ngày đi</th>
                                <th className="th-style-figma">Số người</th>
                                <th className="th-style-figma text-right">Tổng tiền</th>
                                <th className="th-style-figma text-right">Đã cọc</th>
                                <th className="th-style-figma text-center">Trạng thái</th>
                                <th className="th-style-figma text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {/* Loading/Error/Empty States */}
                            {loading && !isFetchingPage && <tr><td colSpan="10" className="td-center"><CircleNotch size={24} className="animate-spin text-sky-500"/></td></tr>}
                            {!loading && error && !isFetchingPage && <tr><td colSpan="10" className="td-center text-red-500">{error}</td></tr>}
                            {!loading && !error && bookings.length === 0 && !isFetchingPage && (
                                <tr>
                                    <td colSpan="10" className="td-center text-gray-500 italic py-10">
                                        {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                                    </td>
                                </tr>
                            )}
                            {/* Data Rows */}
                            {!error && bookings.map((booking) => {
                                const paidAmount = booking.status === 'confirmed' ? booking.total_price : 0; // Đã cọc = tổng tiền nếu confirmed
                                return (
                                <motion.tr
                                    key={booking.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td className="td-style-figma font-mono text-xs text-gray-500 dark:text-gray-400">#{booking.id.slice(-8).toUpperCase()}</td>
                                    <td className="td-style-figma max-w-xs">
                                        <div className="font-semibold text-gray-800 dark:text-white truncate" title={booking.user?.email}>{booking.user?.full_name || booking.user?.email || 'N/A'}</div>
                                        {/* Có thể thêm email nhỏ ở dưới nếu cần */}
                                    </td>
                                    <td className="td-style-figma max-w-xs">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={booking.product?.image_url || 'https://placehold.co/80x50/eee/ccc?text=Tour'} // Placeholder to hơn
                                                alt={booking.product?.name || 'Tour'}
                                                className="w-20 h-12 object-cover rounded flex-shrink-0 border dark:border-slate-600"
                                                onError={(e) => {e.target.src='https://placehold.co/80x50/eee/ccc?text=Error'}}
                                            />
                                            <span className="text-gray-700 dark:text-gray-200 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors font-medium" title={booking.product?.name}>
                                                {booking.product?.name || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="td-style-figma text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(booking.created_at)}</td>
                                    <td className="td-style-figma text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatShortDate(booking.departure_date)}</td>
                                    <td className="td-style-figma text-xs text-center text-gray-600 dark:text-gray-300">{formatQuantity(booking)}</td>
                                    <td className="td-style-figma text-right font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">{formatCurrency(booking.total_price)}</td>
                                    <td className="td-style-figma text-right font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">{formatCurrency(paidAmount)}</td>
                                    <td className="td-style-figma text-center"><StatusBadge status={booking.status} /></td>
                                    <td className="td-style-figma text-center whitespace-nowrap">
                                        {/* Style nút thao tác giống Figma */}
                                        <div className="flex gap-2 justify-center">
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

            {/* Pagination */}
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

            {/* Modals */}
            <AnimatePresence>
                {modalBooking && <BookingDetailsModal booking={modalBooking} onClose={() => setModalBooking(null)} onStatusChange={handleStatusChange} />}
                {bookingToDelete && <DeleteConfirmationModal booking={bookingToDelete} onClose={() => setBookingToDelete(null)} onConfirm={confirmDeleteBooking} />}
            </AnimatePresence>

            {/* CSS (Thêm style mới) */}
            <style jsx>{`
                /* Nút Thêm (Style Figma) */
                .button-add-figma { @apply flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow hover:shadow-md transition-all font-semibold text-sm; }

                /* Filter/Search (Style Figma) */
                .filter-select-figma { @apply appearance-none block w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 cursor-pointer; }
                .search-input-figma { @apply w-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50; }

                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10 rounded-lg; }

                /* Table Header (Style Figma) */
                .th-style-figma { @apply px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap; }
                /* Table Data Cell (Style Figma) */
                .td-style-figma { @apply px-5 py-4 text-sm align-middle; }

                .td-center { @apply px-6 py-8 text-center; }

                 /* Nút Thao tác (Style Figma - Icon only) */
                .action-button-figma { @apply p-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed; }

                /* Modal Styles */
                .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-danger { @apply px-5 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50 transition-colors shadow-sm hover:shadow-md; }

                /* Pagination */
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
            `}</style>
        </div>
    );
}
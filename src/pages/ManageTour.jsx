// src/pages/ManageTour.jsx
// (V3: Sửa lỗi build, Nâng cấp UI theo ảnh, Thêm ảnh tour, Hiệu ứng)

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion"; // Thêm animation
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, Funnel, List,
    User, CalendarBlank, UsersThree, Tag, Wallet, CheckCircle, XCircle, Clock, Info, Pencil, Trash, Plus, WarningCircle, Envelope,
    Buildings, AirplaneTilt, Car, Ticket as VoucherIcon // Icons Phosphor
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
const getPaginationWindow = (currentPage, totalPages, width = 2) => { /* ... (Giữ nguyên) ... */ };

// --- Helpers Format ---
const formatCurrency = (number) => { /* ... (Giữ nguyên) ... */ };
const formatDate = (dateString) => { /* ... (Giữ nguyên) ... */ };
const formatQuantity = (booking) => { /* ... (Giữ nguyên, hiển thị NL, NG, TE, EB) ... */ };

// --- Component Badge Trạng thái (Giống ảnh) ---
const StatusBadge = ({ status }) => {
  // Styles giống trong ảnh
  const baseStyle = "px-3 py-1 text-[11px] font-bold rounded-md inline-flex items-center gap-1 leading-tight";
  switch (status) {
    case 'confirmed':
      return <span className={`${baseStyle} bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900`}><CheckCircle weight="bold" /> Đã xác nhận</span>;
    case 'cancelled':
      return <span className={`${baseStyle} bg-red-600 text-white dark:bg-red-500`}><XCircle weight="bold" /> Đã hủy</span>;
    case 'pending':
    default:
      return <span className={`${baseStyle} bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-100`}><Clock weight="bold" /> Chờ xử lý</span>;
  }
};

// --- Component Modal Chi tiết/Sửa Đơn hàng (Nâng cấp UI, Animation) ---
const BookingDetailsModal = ({ booking, onClose, onStatusChange }) => {
    if (!booking) return null;

    const handleLocalStatusChange = (newStatus) => {
        if (booking.status === newStatus) return;
        onStatusChange(booking, newStatus);
    };

    const sendConfirmationEmail = (email) => { /* ... (Giả lập gửi mail) ... */ };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={onClose} // Đóng khi click nền
        >
             <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Ngăn click xuyên thấu
             >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Chi tiết Đơn hàng #{booking.id.slice(-8).toUpperCase()} {/* Lấy 8 ký tự cuối */}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"> <X size={20} /> </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                    {/* Thông tin Khách hàng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 dark:border-slate-700">
                        <div><strong className="label-modal">Khách hàng:</strong> <span className="value-modal">{booking.user?.full_name || booking.user?.email || 'N/A'}</span></div>
                        <div><strong className="label-modal">Email:</strong> <span className="value-modal">{booking.user?.email || 'N/A'}</span></div>
                        <div><strong className="label-modal">Ngày đặt:</strong> <span className="value-modal">{formatDate(booking.created_at)}</span></div>
                    </div>
                    {/* Thông tin Tour & Lịch trình */}
                    <div><strong className="label-modal">Tour:</strong> <span className="font-semibold text-sky-700 dark:text-sky-400">{booking.product?.name || 'Tour đã bị xóa'}</span></div>
                    <div><strong className="label-modal">Ngày đi:</strong> <span className="font-semibold value-modal">{formatDate(booking.departure_date)}</span></div>
                    <div><strong className="label-modal">Số lượng:</strong> <span className="value-modal">{formatQuantity(booking)} ({booking.quantity} người)</span></div>

                    {/* Dịch vụ kèm theo & Voucher */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t dark:border-slate-700">
                        <div><strong className="label-modal flex items-center gap-1"><Buildings size={16}/> Khách sạn:</strong> <span className="value-modal">{booking.hotel?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1"><Car size={16}/> Vận chuyển:</strong> <span className="value-modal">{booking.transport?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1"><AirplaneTilt size={16}/> Chuyến bay:</strong> <span className="value-modal">{booking.flight?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1"><VoucherIcon size={16}/> Voucher:</strong> <span className="value-modal">{booking.voucher_code || 'Không có'} {booking.voucher_discount > 0 ? `(-${formatCurrency(booking.voucher_discount)})` : ''}</span></div>
                    </div>
                    {/* Ghi chú */}
                    {booking.notes && (
                         <div className="pt-4 border-t dark:border-slate-700">
                             <strong className="label-modal">Ghi chú của khách:</strong>
                             <p className="value-modal bg-gray-50 dark:bg-slate-700/50 p-2 rounded border dark:border-slate-600 mt-1">{booking.notes}</p>
                         </div>
                    )}
                     {/* Tổng tiền */}
                     <div className="pt-4 border-t dark:border-slate-700 text-right">
                        <span className="text-base font-semibold value-modal">Tổng tiền tour: </span>
                        <span className="text-xl font-bold text-red-600">{formatCurrency(booking.total_price)}</span>
                     </div>

                     {/* Thay đổi trạng thái */}
                     <div className="pt-4 border-t dark:border-slate-700">
                        <label className="label-modal">Cập nhật trạng thái:</label>
                        <div className="flex flex-wrap gap-2 mt-1"> {/* Dùng flex-wrap */}
                             <button onClick={() => handleLocalStatusChange('confirmed')} disabled={booking.status === 'confirmed'} className="button-status bg-green-600 hover:bg-green-700 disabled:opacity-50"> <CheckCircle/> Xác nhận </button>
                             <button onClick={() => handleLocalStatusChange('cancelled')} disabled={booking.status === 'cancelled'} className="button-status bg-red-600 hover:bg-red-700 disabled:opacity-50"> <XCircle/> Hủy đơn </button>
                             <button onClick={() => handleLocalStatusChange('pending')} disabled={booking.status === 'pending'} className="button-status bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"> <Clock/> Chờ xử lý </button>
                        </div>
                        {booking.status === 'confirmed' && booking.user?.email && (
                            <button onClick={() => sendConfirmationEmail(booking.user.email)} className="button-secondary text-sm mt-3 flex items-center gap-1.5"> <Envelope/> Gửi lại email xác nhận </button>
                        )}
                     </div>
                </div>
                {/* Footer */}
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                    <button type="button" onClick={onClose} className="modal-button-secondary">Đóng</button>
                </div>
            </motion.div>
            <style jsx>{`
                 .label-modal { @apply font-medium text-gray-500 dark:text-gray-400 block mb-0.5; }
                 .value-modal { @apply text-gray-800 dark:text-white; }
                 .button-status { @apply flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors; }
            `}</style>
        </motion.div>
    );
};

// --- Component Modal Xác nhận Xóa (Nâng cấp UI, Animation) ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try { await onConfirm(booking); } catch (error) { setIsDeleting(false); }
    };

    if (!booking) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <Trash size={24} className="text-red-600 dark:text-red-400" weight="duotone"/>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Xác nhận Xóa Đơn Hàng</h3>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>Xóa đơn <b>#{booking.id.slice(-8).toUpperCase()}</b>?</p>
                        {booking.status === 'confirmed' && <p className="font-semibold text-orange-600 dark:text-orange-400 mt-1">Số chỗ (<UsersThree className="inline"/> {booking.quantity}) sẽ được hoàn trả.</p>}
                        <p className="mt-1">Hành động này không thể hoàn tác.</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-lg gap-3">
                     <button type="button" onClick={handleConfirm} disabled={isDeleting} className="modal-button-danger flex items-center justify-center gap-1.5 w-full sm:w-auto">
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
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const [modalBooking, setModalBooking] = useState(null); // Booking đang xem
    const [bookingToDelete, setBookingToDelete] = useState(null); // Booking chờ xóa
    const [filterStatus, setFilterStatus] = useState('all');

    // --- Fetch Bookings (Giữ nguyên logic query) ---
    const fetchBookings = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true);
        else setLoading(true);
        setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            // Truy vấn chi tiết hơn để lấy ảnh tour
            let query = supabase
                .from('Bookings')
                .select(`
                    id, created_at, departure_date, status, total_price, quantity,
                    num_adult, num_child, num_elder, num_infant, departure_id,
                    user:user_id ( id, full_name, email ),
                    product:product_id ( id, name, image_url ), /* Lấy thêm image_url */
                    hotel:hotel_product_id (name), transport:transport_product_id (name), flight:flight_product_id (name),
                    voucher_code, voucher_discount, notes, payment_method
                `, { count: 'exact' });

            if (filterStatus !== 'all') { query = query.eq('status', filterStatus); }
            if (debouncedSearch) { /* ... (Logic search giữ nguyên) ... */ }

            query = query.order('created_at', { ascending: false }).range(from, to);
            const { data, error: queryError, count } = await query;

            if (queryError) throw queryError;
            setBookings(data || []);
            setTotalItems(count || 0);

        } catch (err) { /* ... (Error handling) ... */ }
        finally { if (isInitialLoad) setLoading(false); setIsFetchingPage(false); }
    }, [currentPage, debouncedSearch, filterStatus]);

    // --- UseEffects (Giữ nguyên) ---
    useEffect(() => { fetchBookings(true); }, [fetchBookings]);
    useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterStatus]);
    // (Realtime có thể thêm sau)

    // --- Event Handlers ---
    const handleStatusChange = async (booking, newStatus) => { /* ... (Giống code trước, dùng toast confirm, RPC update slot) ... */ };
    const handleViewDetails = (booking) => { setModalBooking(booking); };
    const handleDeleteClick = (booking) => { setBookingToDelete(booking); };
    const confirmDeleteBooking = async (booking) => { /* ... (Giống code trước, gọi RPC update slot nếu cần, xóa booking) ... */ };

    // --- Pagination Window ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // --- Loading ban đầu ---
    if (loading) { return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><CircleNotch size={40} className="animate-spin text-sky-500" /></div>; }

    // --- JSX ---
    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white">
            {/* Header & Nút Tạo */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white"> Quản Lý Đơn Đặt </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400"> Quản lý đơn đặt tour của khách hàng </p>
                </div>
                {/* Nút Tạo Đơn Đặt (Tạm thời ẩn) */}
                 <button disabled className="button-primary-dark flex items-center gap-1.5 opacity-50 cursor-not-allowed"> <Plus size={18} weight="bold" /> Tạo Đơn Đặt </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-100 dark:border-slate-700">
                {/* Filter Trạng thái */}
                <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <Funnel size={16} className="text-gray-400" />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select" disabled={isFetchingPage}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
                {/* Search Input */}
                <div className="relative flex-grow w-full">
                    <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm Mã đơn, Khách hàng, Tour..." className="search-input" disabled={isFetchingPage} />
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && <div className="loading-overlay"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>}
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th className="th-style-new px-4">Mã đơn</th>
                                <th className="th-style-new">Khách hàng</th>
                                <th className="th-style-new min-w-[200px]">Tour</th> {/* Thêm min-width */}
                                <th className="th-style-new">Ngày đặt</th>
                                <th className="th-style-new">Ngày đi</th>
                                <th className="th-style-new">Số người</th>
                                <th className="th-style-new">Tổng tiền</th>
                                <th className="th-style-new">Đã cọc</th>
                                <th className="th-style-new">Trạng thái</th>
                                <th className="th-style-new text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {/* Loading/Error/Empty States */}
                            {loading && <tr><td colSpan="10" className="td-center"><CircleNotch size={24}/></td></tr>}
                            {!loading && error && <tr><td colSpan="10" className="td-center text-red-500">{error}</td></tr>}
                            {!loading && !error && bookings.length === 0 && <tr><td colSpan="10" className="td-center text-gray-500 italic">...</td></tr>}
                            {/* Data Rows */}
                            {!loading && !error && bookings.map((booking) => {
                                const paidAmount = booking.status === 'confirmed' ? booking.total_price : 0;
                                return (
                                <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"> {/* Thêm group */}
                                    <td className="td-style-new px-4 font-mono text-xs text-gray-500 dark:text-gray-400">#{booking.id.slice(-8).toUpperCase()}</td>
                                    <td className="td-style-new max-w-xs">
                                        <span className="font-semibold text-gray-800 dark:text-white truncate block" title={booking.user?.email}>{booking.user?.full_name || booking.user?.email || 'N/A'}</span>
                                    </td>
                                     <td className="td-style-new max-w-xs">
                                        {/* Thêm ảnh tour */}
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={booking.product?.image_url || 'https://placehold.co/64x40/eee/ccc?text=Tour'}
                                                alt={booking.product?.name || 'Tour'}
                                                className="w-16 h-10 object-cover rounded flex-shrink-0"
                                                onError={(e) => {e.target.src='https://placehold.co/64x40/eee/ccc?text=ImgErr'}}
                                            />
                                            <span className="text-gray-700 dark:text-gray-200 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" title={booking.product?.name}>
                                                {booking.product?.name || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="td-style-new text-xs text-gray-500 dark:text-gray-400">{formatDate(booking.created_at)}</td>
                                    <td className="td-style-new text-xs text-gray-500 dark:text-gray-400">{formatDate(booking.departure_date)}</td>
                                    <td className="td-style-new text-xs text-gray-600 dark:text-gray-300">{formatQuantity(booking)}</td>
                                    <td className="td-style-new font-semibold text-red-600">{formatCurrency(booking.total_price)}</td>
                                    <td className="td-style-new font-semibold text-green-600">{formatCurrency(paidAmount)}</td>
                                    <td className="td-style-new"><StatusBadge status={booking.status} /></td>
                                    <td className="td-style-new text-center whitespace-nowrap">
                                        <div className="flex gap-1 justify-center">
                                            <button onClick={() => handleViewDetails(booking)} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Xem Chi tiết & Duyệt"><Pencil size={16} /></button>
                                            <button onClick={() => handleDeleteClick(booking)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa Đơn"><Trash size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && totalItems > ITEMS_PER_PAGE && (
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                      <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> đơn hàng </div>
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

            {/* CSS */}
            <style jsx>{`
                .button-primary-dark { @apply bg-gray-800 hover:bg-gray-900 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md; }
                .search-input { @apply w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .filter-select { @apply px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition appearance-none disabled:opacity-50; }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .th-style-new { @apply px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style-new { @apply px-4 py-3 text-sm text-gray-700 dark:text-gray-300 align-middle; }
                .td-center { @apply px-6 py-8 text-center; }
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                /* Modal Styles */
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50; }
                .modal-button-success { @apply px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 text-sm disabled:opacity-50; }
                .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50; }
                .modal-button-warning { @apply px-4 py-2 bg-yellow-500 text-white rounded-md font-semibold hover:bg-yellow-600 text-sm disabled:opacity-50; }
                /* Pagination */
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                /* Thêm các style khác nếu cần */
            `}</style>
        </div>
    );
}
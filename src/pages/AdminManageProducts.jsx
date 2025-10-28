// src/pages/AdminManageBookings.jsx
// Trang quản lý các đơn đặt tour (bookings) từ khách hàng

import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { Link } from 'react-router-dom'; // Dùng nếu cần link qua chi tiết
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaSpinner, FaSyncAlt } from "react-icons/fa";
import { 
    BookmarkSimple, 
    MagnifyingGlass, 
    CaretLeft, 
    CaretRight, 
    PencilLine, 
    Trash, 
    Eye, // Thêm icon View
    CheckCircle, // Icon Xác nhận
    XCircle, // Icon Hủy
    Clock // Icon Chờ xử lý
} from "@phosphor-icons/react";

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

// --- Helper: Định dạng số người (Giống trong ảnh) ---
const formatGuests = (guestInfo) => {
    if (!guestInfo || typeof guestInfo !== 'object') return 'N/A';
    const parts = [];
    if (guestInfo.adults > 0) parts.push(`${guestInfo.adults}NL`);
    if (guestInfo.children > 0) parts.push(`${guestInfo.children}TE`);
    if (guestInfo.infants > 0) parts.push(`${guestInfo.infants}EB`); // Em bé
    return parts.join(', ') || 'N/A';
};

// --- Helper: Badge trạng thái đơn hàng ---
const BookingStatusBadge = ({ status }) => {
    switch (status) {
        case 'confirmed':
            return <span className="badge-green"><CheckCircle size={14} weight="bold" /> Đã xác nhận</span>;
        case 'cancelled':
            return <span className="badge-red"><XCircle size={14} weight="bold" /> Đã hủy</span>;
        case 'pending':
        default:
            return <span className="badge-yellow"><Clock size={14} weight="bold" /> Chờ xử lý</span>;
    }
};

// --- Component chính: Quản lý Đơn đặt ---
export default function AdminManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'confirmed', 'cancelled'
    const debouncedSearch = useDebounce(searchTerm, 400);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // --- Fetch data (Đơn hàng) ---
    const fetchBookings = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE; const to = from + ITEMS_PER_PAGE - 1;

            // Query: Lấy đơn hàng, join với Bảng Products và Bảng Users
            const selectQuery = `
                id, 
                booking_code, 
                created_at, 
                start_date, 
                guest_info, 
                total_price, 
                deposit_amount, 
                status,
                product:Products(id, name),
                user:Users(id, full_name, email)
            `;

            let query = supabase.from("Bookings").select(selectQuery, { count: 'exact' });

            // Lọc theo trạng thái
            if (statusFilter !== "all") {
                query = query.eq('status', statusFilter);
            }

            // Tìm kiếm
            if (debouncedSearch.trim() !== "") {
                const searchTermLike = `%${debouncedSearch.trim()}%`;
                // Tìm theo tên khách, tên tour, hoặc mã đơn
                 query = query.or(`user.full_name.ilike.${searchTermLike},product.name.ilike.${searchTermLike},booking_code.ilike.${searchTermLike}`);
            }
            
            query = query.order("created_at", { ascending: false }).range(from, to);

            const { data, count, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            setBookings(data || []);
            setTotalItems(count || 0);

            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
                setCurrentPage(1); // Reset về trang 1 nếu trang hiện tại không còn data
            }
        } catch (err) {
            console.error("Lỗi tải đơn hàng:", err);
            setError(err); 
            toast.error(`Lỗi tải danh sách đơn hàng: ${err.message}`);
            setBookings([]); setTotalItems(0);
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch, statusFilter]); // Dependencies

    // --- Trigger fetch ---
    useEffect(() => { const isInitial = bookings.length === 0 && loading; fetchBookings(isInitial); }, [fetchBookings, bookings.length, loading]);

    // --- Reset page on search/filter ---
    useEffect(() => { if (currentPage !== 1) { setCurrentPage(1); } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, statusFilter]);

    // --- Event Handlers ---
    const handleUpdateStatus = async (id, newStatus) => {
        const actionText = newStatus === 'confirmed' ? 'Xác nhận' : 'Hủy';
        if (!window.confirm(`Bạn chắc muốn ${actionText} đơn hàng này?`)) return;

        setIsFetchingPage(true);
        const { error } = await supabase.from("Bookings").update({ status: newStatus }).eq("id", id);
        setIsFetchingPage(false);

        if (error) { toast.error("Lỗi cập nhật: " + error.message); }
        else { toast.success(`Đã ${actionText} đơn hàng!`); fetchBookings(false); }
    };
    
    const handleDelete = async (booking) => {
         if (!window.confirm(`XÓA VĨNH VIỄN đơn hàng "${booking.booking_code}" của "${booking.user?.full_name}"?\nThao tác này không thể hoàn tác!`)) return;
         setIsFetchingPage(true);
         const { error } = await supabase.from("Bookings").delete().eq("id", booking.id);
         setIsFetchingPage(false);
         if (error) { toast.error("Lỗi xóa: " + error.message); }
         else { toast.success("Đã xóa đơn hàng."); fetchBookings(false); }
    };

    // --- Pagination Window ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     // --- Loading ban đầu ---
     if (loading) { return ( <div className="flex justify-center items-center h-[calc(100vh-150px)]"> <FaSpinner className="animate-spin text-4xl text-sky-500" /> </div> ); }

    // --- JSX ---
    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header + Search + Filter */}
             <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <BookmarkSimple weight="duotone" className="text-sky-600" size={28} />
                    Quản lý Đơn Đặt
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                     {/* Filter Trạng thái */}
                     <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="search-input !pl-3"
                    >
                         <option value="all">Tất cả trạng thái</option>
                         <option value="pending">Chờ xử lý</option>
                         <option value="confirmed">Đã xác nhận</option>
                         <option value="cancelled">Đã hủy</option>
                     </select>
                     {/* Search */}
                     <div className="relative w-full sm:w-64">
                         <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                         <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm mã đơn, tên tour, KH..." className="search-input"/>
                     </div>
                     <button onClick={() => fetchBookings(true)} disabled={loading || isFetchingPage} className={`button-secondary flex items-center gap-2 flex-shrink-0 ${isFetchingPage ? 'opacity-50 cursor-not-allowed' : ''}`}> <FaSyncAlt className={isFetchingPage ? "animate-spin" : ""} /> Làm mới </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
             <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && ( <div className="loading-overlay"> <FaSpinner className="animate-spin text-sky-500 text-3xl" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                {/* Giống ảnh */}
                                <th className="th-style">Mã đơn</th>
                                <th className="th-style">Khách hàng</th>
                                <th className="th-style">Tour</th>
                                <th className="th-style">Ngày đặt</th>
                                <th className="th-style">Ngày đi</th>
                                <th className="th-style">Số người</th>
                                <th className="th-style text-right">Tổng tiền</th>
                                <th className="th-style text-right">Đã cọc</th>
                                <th className="th-style">Trạng thái</th>
                                <th className="th-style text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                             {error && !isFetchingPage && ( <tr><td colSpan="10" className="td-center text-red-500">{`Lỗi: ${error.message}`}</td></tr> )}
                             {!error && loading && bookings.length === 0 && ( <tr><td colSpan="10" className="td-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr> )}
                             {!error && !loading && !isFetchingPage && bookings.length === 0 && ( <tr><td colSpan="10" className="td-center text-gray-500 italic">{debouncedSearch || statusFilter !== 'all' ? "Không tìm thấy đơn hàng." : "Chưa có đơn hàng."}</td></tr> )}
                             
                             {!error && bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="td-style font-mono text-gray-700 dark:text-gray-300">{booking.booking_code || booking.id.slice(0, 8)}</td>
                                    <td className="td-style font-medium dark:text-white">{booking.user?.full_name || "N/A"}</td>
                                    <td className="td-style text-gray-600 dark:text-gray-300">{booking.product?.name || "N/A"}</td>
                                    <td className="td-style">{new Date(booking.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td className="td-style">{booking.start_date ? new Date(booking.start_date).toLocaleDateString('vi-VN') : "N/A"}</td>
                                    <td className="td-style">{formatGuests(booking.guest_info)}</td>
                                    <td className="td-style text-right font-semibold text-sky-700 dark:text-sky-400">{booking.total_price?.toLocaleString('vi-VN')}</td>
                                    <td className="td-style text-right font-medium text-gray-700 dark:text-gray-200">{booking.deposit_amount?.toLocaleString('vi-VN')}</td>
                                    <td className="td-style"><BookingStatusBadge status={booking.status} /></td>
                                    <td className="td-style text-right space-x-1">
                                        {/* Actions: Xác nhận, Hủy, Sửa, Xóa */}
                                        {booking.status === 'pending' && (
                                            <>
                                            <button onClick={() => handleUpdateStatus(booking.id, 'confirmed')} disabled={isFetchingPage} className="button-icon-green" title="Xác nhận đơn"><CheckCircle size={14}/></button>
                                            <button onClick={() => handleUpdateStatus(booking.id, 'cancelled')} disabled={isFetchingPage} className="button-icon-red" title="Hủy đơn"><XCircle size={14}/></button>
                                            </>
                                        )}
                                        
                                        {/* Giống ảnh: Sửa, Xóa. Thêm nút Xem */}
                                        <button onClick={() => {/* TODO: Mở modal xem chi tiết */}} disabled={isFetchingPage} className="button-icon-gray" title="Xem chi tiết đơn"> <Eye size={14}/> </button>
                                        <button onClick={() => {/* TODO: Mở modal sửa */}} disabled={isFetchingPage} className="button-icon-sky" title="Sửa đơn (COMING SOON)"> <PencilLine size={14}/> </button>
                                        <button onClick={() => handleDelete(booking)} disabled={isFetchingPage} className="button-icon-red" title="Xóa vĩnh viễn đơn"> <Trash size={14}/> </button>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI (Giữ nguyên) */}
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

            {/* (TODO: Thêm Modal xem/sửa chi tiết đơn hàng nếu cần) */}
            
            {/* CSS (Copy từ AdminManageProducts.jsx và sửa lại badge) */}
            <style jsx>{`
                /* (Toàn bộ CSS giống hệt file AdminManageProducts.jsx) */
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm whitespace-nowrap; }
                .td-center { @apply px-6 py-10 text-center; }
                
                /* (Sửa lại style Badge cho khớp với trạng thái đơn hàng) */
                .badge-base { @apply px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
                
                /* (Style Nút bấm giữ nguyên) */
                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-green { @apply button-icon-base bg-green-500 hover:bg-green-600 text-white focus:ring-green-400; }
                .button-icon-red { @apply button-icon-base bg-red-500 hover:bg-red-600 text-white focus:ring-red-400; }
                .button-icon-sky { @apply button-icon-base bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400; }
                .button-icon-gray { @apply button-icon-base bg-gray-400 hover:bg-gray-500 text-white focus:ring-gray-300; }
                
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                
                /* (Style Pagination giữ nguyên) */
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
            `}</style>
        </div>
    );
}
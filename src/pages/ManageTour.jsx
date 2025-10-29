// src/pages/ManageTour.jsx
// (V2: Giao diện theo ảnh, Duyệt đơn, Thông báo khách)

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, Funnel, List,
    User, CalendarBlank, UsersThree, Tag, Wallet, CheckCircle, XCircle, Clock, Info, Pencil, Trash, Plus, WarningCircle, Envelope // Icons Phosphor
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
    if (typeof number !== "number" || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        // Kiểm tra ngày hợp lệ
        if (isNaN(date.getTime())) return "Ngày lỗi";
        // Định dạng YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Format date error:", e);
        return "Ngày lỗi";
    }
};
const formatQuantity = (booking) => {
    const parts = [];
    if (booking.num_adult > 0) parts.push(`${booking.num_adult}NL`);
    if (booking.num_elder > 0) parts.push(`${booking.num_elder}NG`); // Thêm người già
    if (booking.num_child > 0) parts.push(`${booking.num_child}TE`);
    if (booking.num_infant > 0) parts.push(`${booking.num_infant}EB`); // Thêm sơ sinh
    return parts.join(', ') || '0';
};

// --- Component Badge Trạng thái ---
const StatusBadge = ({ status }) => {
  const baseStyle = "px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap";
  switch (status) {
    case 'confirmed':
      return <span className={`${baseStyle} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}><CheckCircle weight="bold" /> Đã xác nhận</span>;
    case 'cancelled':
      return <span className={`${baseStyle} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}><XCircle weight="bold" /> Đã hủy</span>;
    case 'pending': // Chờ xử lý
    default:
      return <span className={`${baseStyle} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}><Clock weight="bold" /> Chờ xử lý</span>;
      // Thêm các trạng thái khác nếu cần (vd: đã thanh toán, chờ thanh toán...)
      // case 'paid': return <span className={`${baseStyle} bg-blue-100 text-blue-800 ...`}><Wallet/> Đã thanh toán</span>;
  }
};

// --- Component Modal Chi tiết/Sửa Đơn hàng ---
// (Chỉ cho phép xem chi tiết và đổi trạng thái đơn giản)
const BookingDetailsModal = ({ booking, onClose, onStatusChange }) => {
    if (!booking) return null;

    const handleLocalStatusChange = (newStatus) => {
        if (booking.status === newStatus) return;
        // Gọi hàm xử lý từ component cha, truyền booking và status mới
        onStatusChange(booking, newStatus);
        // Không đóng modal ngay, chờ component cha xử lý và có thể đóng sau
    };

    // Hàm giả lập gửi mail
    const sendConfirmationEmail = (email) => {
      console.log(`(Giả lập) Gửi email xác nhận đến: ${email}`);
      toast.success(`Đã gửi email xác nhận đến ${email}`);
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4">
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Chi tiết Đơn hàng #{booking.id.slice(-6).toUpperCase()}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X size={20} />
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
                    {/* Thông tin Khách hàng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 dark:border-slate-700">
                        <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Khách hàng:</strong> <span className="dark:text-white">{booking.user?.full_name || booking.user?.email || 'N/A'}</span></div>
                        <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Email:</strong> <span className="dark:text-white">{booking.user?.email || 'N/A'}</span></div>
                        {/* Thêm SĐT nếu có trong bảng Users */}
                        {/* <div><strong className="font-medium ...">Điện thoại:</strong> <span>{booking.user?.phone || 'N/A'}</span></div> */}
                        <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Ngày đặt:</strong> <span className="dark:text-white">{formatDate(booking.created_at)}</span></div>
                    </div>
                    {/* Thông tin Tour & Lịch trình */}
                    <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Tour:</strong> <span className="font-semibold text-sky-700 dark:text-sky-400">{booking.product?.name || 'Tour đã bị xóa'}</span></div>
                    <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Ngày đi:</strong> <span className="font-semibold dark:text-white">{formatDate(booking.departure_date)}</span></div>
                    <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Số lượng:</strong> <span className="dark:text-white">{formatQuantity(booking)} ({booking.quantity} người)</span></div>

                    {/* Dịch vụ kèm theo & Voucher (Lấy từ booking) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t dark:border-slate-700">
                        <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Khách sạn:</strong> <span className="dark:text-white">{booking.hotel?.name || 'Không chọn'}</span></div>
                        <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Vận chuyển:</strong> <span className="dark:text-white">{booking.transport?.name || 'Không chọn'}</span></div>
                        <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Chuyến bay:</strong> <span className="dark:text-white">{booking.flight?.name || 'Không chọn'}</span></div>
                        <div><strong className="font-medium text-gray-500 dark:text-gray-400 block">Voucher:</strong> <span className="dark:text-white">{booking.voucher_code || 'Không có'} {booking.voucher_discount > 0 ? `(-${formatCurrency(booking.voucher_discount)})` : ''}</span></div>
                    </div>
                    {/* Ghi chú */}
                    {booking.notes && (
                         <div className="pt-4 border-t dark:border-slate-700">
                             <strong className="font-medium text-gray-500 dark:text-gray-400 block">Ghi chú của khách:</strong>
                             <p className="dark:text-white bg-gray-50 dark:bg-slate-700/50 p-2 rounded border dark:border-slate-600 mt-1">{booking.notes}</p>
                         </div>
                    )}
                     {/* Tổng tiền */}
                     <div className="pt-4 border-t dark:border-slate-700 text-right">
                        <span className="text-base font-semibold dark:text-white">Tổng tiền tour: </span>
                        <span className="text-xl font-bold text-red-600">{formatCurrency(booking.total_price)}</span>
                     </div>

                     {/* Thay đổi trạng thái */}
                     <div className="pt-4 border-t dark:border-slate-700">
                        <label className="label-style">Cập nhật trạng thái:</label>
                        <div className="flex gap-2">
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
                    {/* Có thể thêm nút Lưu nếu có sửa đổi khác ngoài status */}
                </div>
            </div>
            <style jsx>{`
                 .button-status { @apply flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors; }
            `}</style>
        </div>
    );
};

// --- Component Modal Xác nhận Xóa ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(booking); // Gọi hàm xóa từ component cha
            // onClose(); // Component cha sẽ đóng modal sau khi onConfirm thành công
        } catch (error) {
            // Lỗi đã được toast ở onConfirm, không cần toast lại
            setIsDeleting(false); // Cho phép thử lại nếu lỗi
        }
        // Không set isDeleting về false nếu thành công vì modal sẽ đóng
    };

    if (!booking) return null;

    return ( /* ... (JSX modal xóa giống code trước) ... */ );
};


// --- Component chính: Quản lý Đặt Tour ---
export default function ManageTour() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false); // Loading phụ (chuyển trang, filter, search)
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const [modalBooking, setModalBooking] = useState(null); // Booking đang xem/sửa
    const [bookingToDelete, setBookingToDelete] = useState(null); // Booking chờ xóa
    const [filterStatus, setFilterStatus] = useState('all'); // Filter trạng thái

    // --- Fetch Bookings ---
    const fetchBookings = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true);
        else setLoading(true); // Chỉ loading toàn trang lần đầu
        setError(null);

        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            // Truy vấn chính
            let query = supabase
                .from('Bookings')
                .select(`
                    id, created_at, departure_date, status, total_price, quantity,
                    num_adult, num_child, num_elder, num_infant,
                    user:user_id ( id, full_name, email ),
                    product:product_id ( id, name ),
                    hotel:hotel_product_id (name),
                    transport:transport_product_id (name),
                    flight:flight_product_id (name),
                    voucher_code, voucher_discount, notes, payment_method
                `, { count: 'exact' }); // Lấy count để phân trang

            // Lọc theo trạng thái
            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }

            // Lọc theo tìm kiếm (Mã đơn, Tên/Email KH, Tên Tour)
            if (debouncedSearch) {
                const searchTermLower = `%${debouncedSearch.toLowerCase()}%`;
                // Tìm gần đúng ID (chỉ tìm 6 ký tự cuối)
                const searchIdLike = `%${debouncedSearch.toUpperCase().slice(-6)}`;
                query = query.or(
                    `id::text.like.${searchIdLike},user.full_name.ilike.${searchTermLower},user.email.ilike.${searchTermLower},product.name.ilike.${searchTermLower}`
                     // Cần tạo index text search nếu muốn tìm hiệu quả hơn
                );
            }

            query = query.order('created_at', { ascending: false }).range(from, to);

            const { data, error: queryError, count } = await query;

            if (queryError) throw queryError;

            setBookings(data || []);
            setTotalItems(count || 0);

        } catch (err) {
            console.error("Lỗi fetch bookings:", err);
            setError("Không thể tải danh sách đặt tour: " + err.message);
            setBookings([]); // Reset về mảng rỗng nếu lỗi
            setTotalItems(0);
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch, filterStatus]); // Thêm filterStatus

    // --- UseEffects ---
    useEffect(() => {
        fetchBookings(true); // Fetch lần đầu
    }, [fetchBookings]); // Chỉ chạy fetchBookings khi các dependency của nó thay đổi

    useEffect(() => {
        setCurrentPage(1); // Reset về trang 1 khi filter hoặc search
    }, [debouncedSearch, filterStatus]);

    // (Realtime có thể thêm sau nếu cần)

    // --- Event Handlers ---
    // Xử lý thay đổi trạng thái
    const handleStatusChange = async (booking, newStatus) => {
        if (booking.status === newStatus) return;

        let confirmationText = '';
        let confirmIcon = <WarningCircle size={24} className="text-yellow-500"/>;
        let confirmButtonClass = '';

        if (newStatus === 'confirmed') {
            confirmationText = `XÁC NHẬN đơn #${booking.id.slice(-6).toUpperCase()}?`;
            confirmIcon = <WarningCircle size={24} className="text-green-500"/>;
            confirmButtonClass = 'modal-button-success'; // Màu xanh lá
        } else if (newStatus === 'cancelled') {
             confirmationText = `HỦY đơn #${booking.id.slice(-6).toUpperCase()}?`;
             confirmIcon = <WarningCircle size={24} className="text-red-500"/>;
             confirmButtonClass = 'modal-button-danger'; // Màu đỏ
        } else { // pending
            confirmationText = `CHUYỂN VỀ CHỜ XỬ LÝ đơn #${booking.id.slice(-6).toUpperCase()}?`;
            confirmButtonClass = 'modal-button-warning'; // Màu vàng
        }

        toast((t) => (
             <span>
                 {confirmationText}
                <button
                     className={`ml-3 px-3 py-1 ${confirmButtonClass} text-white rounded text-sm font-semibold`}
                     onClick={async () => {
                         toast.dismiss(t.id);
                         setIsFetchingPage(true); // Bật loading overlay
                         try {
                             // --- (THÊM) Logic Hoàn/Trừ Slot ---
                             // Chỉ xử lý slot khi chuyển TỪ confirmed -> cancelled hoặc ngược lại
                             let slotChange = 0;
                             if (booking.status === 'confirmed' && newStatus === 'cancelled') {
                                 slotChange = booking.quantity; // Hoàn lại slot
                             } else if (booking.status !== 'confirmed' && newStatus === 'confirmed') {
                                 slotChange = -booking.quantity; // Trừ slot (giả định đã kiểm tra đủ slot trước đó)
                             }

                             if (slotChange !== 0 && booking.departure_id) {
                                  // Gọi RPC để cập nhật slot
                                  const { error: slotError } = await supabase.rpc('update_departure_slot', {
                                      departure_id_input: booking.departure_id,
                                      quantity_change: slotChange
                                  });
                                  if (slotError) {
                                      // Nếu lỗi cập nhật slot, không nên đổi status booking? Hoặc báo lỗi?
                                      console.error("Lỗi cập nhật slot:", slotError);
                                      toast.error("Lỗi cập nhật số chỗ còn lại!");
                                      // Có thể dừng ở đây hoặc vẫn tiếp tục cập nhật status booking
                                      // throw slotError; // Ném lỗi để dừng hẳn
                                  }
                             }
                             // --- Kết thúc Logic Slot ---

                             const { error: updateError } = await supabase.from("Bookings")
                                                      .update({ status: newStatus })
                                                      .eq("id", booking.id);
                             if (updateError) throw updateError;

                             toast.success("Cập nhật trạng thái thành công!");
                             // Gửi email nếu xác nhận
                             if (newStatus === 'confirmed' && booking.user?.email) {
                                 console.log(`(Giả lập) Gửi email xác nhận đơn #${booking.id.slice(-6)} cho ${booking.user.email}`);
                                 toast.success(`Đã gửi email xác nhận cho khách.`);
                             }
                             // Cập nhật UI ngay
                             setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));
                             // fetchStats(); // Cập nhật lại stats nếu có

                         } catch (e) {
                             toast.error(`Lỗi cập nhật: ${e.message}`);
                             console.error("Status change error:", e);
                         } finally {
                             setIsFetchingPage(false); // Tắt loading overlay
                         }
                     }}> Xác nhận </button>
                <button className="ml-2 modal-button-secondary text-sm" onClick={() => toast.dismiss(t.id)}> Hủy </button>
             </span>
        ), { icon: confirmIcon, duration: 8000 });
    };

    // Mở modal Chi tiết
    const handleViewDetails = (booking) => {
        setModalBooking(booking);
    };

    // Mở modal Xóa
    const handleDeleteClick = (booking) => {
        setBookingToDelete(booking);
    };

    // Xác nhận Xóa (gọi từ modal)
    const confirmDeleteBooking = async (booking) => {
        if (!booking) return;
        setIsFetchingPage(true);
        try {
            // Hoàn lại slot nếu đơn đã confirm
            if (booking.status === 'confirmed' && booking.departure_id) {
                const { error: slotError } = await supabase.rpc('update_departure_slot', {
                     departure_id_input: booking.departure_id,
                     quantity_change: booking.quantity // Hoàn lại số lượng khách
                 });
                 if (slotError) { console.warn("Lỗi hoàn slot khi xóa booking:", slotError); } // Log lỗi nhưng vẫn tiếp tục xóa
            }

            // Xóa booking
            const { error: deleteError } = await supabase.from('Bookings').delete().eq('id', booking.id);
            if (deleteError) throw deleteError;

            toast.success("Đã xóa đơn hàng!");
            setBookingToDelete(null); // Đóng modal

            // Fetch lại data
            if (bookings.length === 1 && currentPage > 1) { setCurrentPage(prev => prev - 1); }
            else { fetchBookings(false); }
            // fetchStats(); // Cập nhật stats nếu có

        } catch (e) {
            toast.error(`Lỗi xóa: ${e.message}`);
            console.error("Delete booking error:", e);
            throw e; // Ném lỗi để modal biết
        } finally {
            setIsFetchingPage(false);
        }
    };

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
                {/* Nút Tạo Đơn Đặt (Tạm thời ẩn/disable, mở modal chi tiết với booking=null thay thế) */}
                <button
                    // onClick={() => navigate('/admin/bookings/new')} // Hoặc mở modal
                    onClick={() => toast.error('Chức năng "Tạo Đơn Đặt" chưa được triển khai.')}
                    disabled={true} // Tạm disable
                    className="button-primary-dark flex items-center gap-1.5 opacity-50 cursor-not-allowed" // Style disable
                >
                    <Plus size={18} weight="bold" /> Tạo Đơn Đặt
                </button>
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
                    {/* Loading Overlay */}
                    {isFetchingPage && <div className="loading-overlay"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>}
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
                        {/* Table Header */}
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th className="th-style-new px-4">Mã đơn</th>
                                <th className="th-style-new">Khách hàng</th>
                                <th className="th-style-new">Tour</th>
                                <th className="th-style-new">Ngày đặt</th>
                                <th className="th-style-new">Ngày đi</th>
                                <th className="th-style-new">Số người</th>
                                <th className="th-style-new">Tổng tiền</th>
                                <th className="th-style-new">Đã cọc</th>
                                <th className="th-style-new">Trạng thái</th>
                                <th className="th-style-new text-center">Thao tác</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {/* Loading State */}
                            {loading && <tr><td colSpan="10" className="td-center"><CircleNotch size={24} className="animate-spin text-sky-500 mx-auto"/></td></tr>}
                            {/* Error State */}
                            {!loading && error && <tr><td colSpan="10" className="td-center text-red-500">{error}</td></tr>}
                            {/* Empty State */}
                            {!loading && !error && bookings.length === 0 && <tr><td colSpan="10" className="td-center text-gray-500 italic">{searchTerm || filterStatus !== 'all' ? "Không tìm thấy đơn hàng phù hợp." : "Chưa có đơn hàng nào."}</td></tr>}
                            {/* Data Rows */}
                            {!loading && !error && bookings.map((booking) => {
                                const paidAmount = booking.status === 'confirmed' ? booking.total_price : 0; // Logic Đã cọc
                                return (
                                <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="td-style-new px-4 font-mono text-xs text-gray-500 dark:text-gray-400">#{booking.id.slice(-8).toUpperCase()}</td>
                                    <td className="td-style-new max-w-xs">
                                        <span className="font-semibold text-gray-800 dark:text-white truncate block" title={booking.user?.email}>{booking.user?.full_name || booking.user?.email || 'N/A'}</span>
                                    </td>
                                    <td className="td-style-new max-w-xs">
                                        <span className="text-gray-700 dark:text-gray-200 truncate block">{booking.product?.name || 'N/A'}</span>
                                    </td>
                                    <td className="td-style-new text-xs text-gray-500 dark:text-gray-400">{formatDate(booking.created_at)}</td>
                                    <td className="td-style-new text-xs text-gray-500 dark:text-gray-400">{formatDate(booking.departure_date)}</td>
                                    <td className="td-style-new text-xs text-gray-600 dark:text-gray-300">{formatQuantity(booking)}</td>
                                    <td className="td-style-new font-semibold text-red-600">{formatCurrency(booking.total_price)}</td>
                                    <td className="td-style-new font-semibold text-green-600">{formatCurrency(paidAmount)}</td>
                                    <td className="td-style-new"><StatusBadge status={booking.status} /></td>
                                    <td className="td-style-new text-center whitespace-nowrap">
                                        <div className="flex gap-1 justify-center">
                                            {/* Sửa lại: Nút Xem chi tiết/Sửa sẽ mở modal */}
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
            {!loading && totalItems > ITEMS_PER_PAGE && ( /* ... (JSX Pagination giống code trước) ... */ )}

            {/* Modals */}
            {modalBooking && <BookingDetailsModal booking={modalBooking} onClose={() => setModalBooking(null)} onStatusChange={handleStatusChange} />}
            {bookingToDelete && <DeleteConfirmationModal booking={bookingToDelete} onClose={() => setBookingToDelete(null)} onConfirm={confirmDeleteBooking} />}

            {/* CSS */}
            <style jsx>{`
                /* Nút primary tối màu */
                .button-primary-dark { @apply bg-gray-800 hover:bg-gray-900 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md; }
                /* Các style khác từ ManageSuppliers nếu cần */
                .search-input { @apply w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .filter-select { @apply px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition appearance-none disabled:opacity-50; }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .th-style-new { @apply px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style-new { @apply px-4 py-3 text-sm text-gray-700 dark:text-gray-300 align-middle; }
                .td-center { @apply px-6 py-8 text-center; }
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .link-style { @apply inline-flex items-center gap-1 hover:underline; }
                /* Modal Styles */
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50; }
                .modal-button-success { @apply px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 text-sm disabled:opacity-50; }
                .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50; }
                .modal-button-warning { @apply px-4 py-2 bg-yellow-500 text-white rounded-md font-semibold hover:bg-yellow-600 text-sm disabled:opacity-50; }
                /* Pagination */
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
            `}</style>
        </div>
    );
}
// src/pages/ManageTour.jsx
// (UPGRADED: UI đồng bộ, Toast Confirmations + FIXED: Comment in select)

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import {
    FaSpinner, // Giữ lại cho stats loading
    FaExclamationTriangle // Giữ lại cho modal xóa
} from "react-icons/fa";
// <<< SỬA: Dùng Phosphor Icons nhiều hơn >>>
import {
    Package, CaretLeft, CaretRight, CircleNotch, X,
    ChartBar,
    UserList, // Đổi tên từ FaUsers, dùng cho filter NCC
    Envelope,
    Buildings,
    CheckCircle,
    XCircle,
    MagnifyingGlass, // Thay FaSearch
    Plus, // Thay FaPlus
    Pencil, // Thay FaEdit
    Trash, // Thay FaTrash
    User, // Thay FaUser
    Clock, // Cho ngày đặt
    Tag, // Cho giá
    WarningCircle, // Cho toast confirm
    ArrowsClockwise // Thay FaSyncAlt (Refresh)
} from "@phosphor-icons/react";
import toast from 'react-hot-toast';

const supabase = getSupabase();

// --- (FIXED) String Select Query: Xóa comment ---
const bookingSelect = `
    id, created_at, user_id, product_id, quantity, total_price, status, cancellation_reason,
    user:Users(id, full_name, email),
    main_tour:product_id!inner( /* <<< Đã xóa comment ở đây */
        id, name, price, stock, supplier_id, product_type,
        supplier:Suppliers(
            id, name, user_id,
            user:Users(id, full_name, email)
        )
    )
`;

// --- Hook Debounce (Giữ nguyên) ---
const useDebounce = (value, delay) => { /* ... */ };

// --- Helper Pagination Window (Giữ nguyên) ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => { /* ... */ };

// --- Các hàm helpers (Giữ nguyên) ---
const formatCurrency = (number) => { /* ... */ };
const formatDate = (dateString) => { /* ... */ };
const getStatusColor = (status) => { /* ... */ };
const getPaymentStatus = (status) => { /* ... */ };

// --- Các hàm nghiệp vụ (Giữ nguyên) ---
const getProductsFromBooking = (booking) => { /* ... */ };
const sendBookingEmail = async (booking, newStatus) => { /* ... */ };
const updateStockAndNotify = async (product, quantityChange, reason) => { /* ... */ };
const applyStockChanges = async (oldBooking, newBooking) => { /* ... */ };

// --- Component Thống Kê (Giữ nguyên) ---
const BookingStats = ({ stats, loading }) => { /* ... (JSX giữ nguyên) ... */ };

// --- Component Modal Thêm/Sửa Booking (Nâng cấp UI) ---
const EditBookingModal = ({ booking, onClose, onSave, allProducts, allUsers }) => {
    // ... (State và logic giữ nguyên) ...
    const [formData, setFormData] = useState({ user_id: '', product_id: '', quantity: 1, status: 'pending' });
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tours = useMemo(() => allProducts.filter(p => p.product_type === 'tour' && ((p.stock ?? 0) > 0 || p.id === booking?.main_tour?.id)), [allProducts, booking]);

    useEffect(() => { /* ... */ }, [booking]);
    useEffect(() => { /* ... */ }, [formData.product_id, formData.quantity, allProducts]);

    const handleChange = (e) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4">
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"> {/* <<< Style modal chính */}
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700"> {/* <<< Style header */}
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white"> {/* <<< Style title */}
                        {booking ? 'Sửa Đặt Tour' : 'Tạo Đặt Tour Mới'}
                    </h3>
                    <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"> {/* <<< Style nút X */}
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1"> {/* <<< Style body */}
                        {error && <p className="error-message">{error}</p>}
                        <div>
                            <label className="label-style">Khách hàng *</label>
                            <select name="user_id" value={formData.user_id} onChange={handleChange} required className="input-style">
                                <option value="" disabled>-- Chọn khách hàng --</option>
                                {allUsers.map(user => (<option key={user.id} value={user.id}>{user.full_name || user.email}</option>))} {/* <<< Hiển thị email nếu ko có tên */}
                            </select>
                        </div>
                        <div>
                            <label className="label-style">Tour chính *</label>
                            <select name="product_id" value={formData.product_id} onChange={handleChange} required className="input-style">
                                <option value="" disabled>-- Chọn tour --</option>
                                {tours.map(product => (<option key={product.id} value={product.id}>{product.name} ({formatCurrency(product.price)}) - Còn: {product.stock ?? 0}</option>))}
                                {booking?.main_tour && !tours.find(t => t.id === booking.main_tour.id) && (
                                    <option key={booking.main_tour.id} value={booking.main_tour.id} disabled> {booking.main_tour.name} ({formatCurrency(booking.main_tour.price)}) - Hết hàng </option>
                                )}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-style">Số lượng *</label>
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="input-style" />
                            </div>
                            <div>
                                <label className="label-style">Trạng thái</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="input-style">
                                    <option value="pending">Chờ xử lý</option> <option value="confirmed">Đã xác nhận</option> <option value="cancelled">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-2 border-t dark:border-slate-700 mt-4">
                            <span className="text-lg font-semibold dark:text-white">Tổng cộng: </span>
                            <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg"> {/* <<< Style footer */}
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="modal-button-primary flex items-center justify-center gap-1.5"> {/* <<< Đổi class */}
                            {isSubmitting ? <CircleNotch size={18} className="animate-spin" /> : <CheckCircle size={18}/> } {/* <<< Icon save mới */}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Component Modal Xác nhận Xóa (Nâng cấp UI) ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    // ... (State và logic giữ nguyên) ...
     const [isDeleting, setIsDeleting] = useState(false);
    const handleConfirm = async () => { /* ... */ };
    if (!booking) return null;

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"> {/* <<< Tăng z-index */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm"> {/* <<< Style modal */}
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <Trash size={24} className="text-red-600 dark:text-red-400" weight="duotone"/> {/* <<< Icon mới */}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Xác nhận Xóa Đặt Tour</h3>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>Xóa đơn <b>#{booking.id.slice(-6).toUpperCase()}</b>?</p>
                        {booking.status === 'confirmed' && <p className="font-semibold text-red-500 dark:text-red-400 mt-1">Stock sẽ được hoàn trả.</p>}
                        <p className="mt-1">Hành động này không thể hoàn tác.</p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-lg gap-3"> {/* <<< Style footer */}
                     <button type="button" onClick={handleConfirm} disabled={isDeleting} className="modal-button-danger flex items-center justify-center gap-1.5 w-full sm:w-auto"> {/* <<< Đổi class */}
                        {isDeleting ? <CircleNotch size={18} className="animate-spin" /> : <Trash size={16}/>}
                        Xác nhận Xóa
                    </button>
                    <button type="button" onClick={onClose} disabled={isDeleting} className="modal-button-secondary w-full sm:w-auto" >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component chính: Quản lý Đặt Tour ---
export default function ManageTour() {
    // ... (States giữ nguyên) ...
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({ pending: 0, confirmed: 0, cancelled: 0, total: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSupplier, setFilterSupplier] = useState('all');

    // --- Fetch Thống Kê (Giữ nguyên) ---
    const fetchStats = useCallback(async () => { /* ... */ }, []);

    // --- Fetch data (Giữ nguyên) ---
    const fetchData = useCallback(async (isInitialLoad = false) => { /* ... */ }, [currentPage, debouncedSearch, filterStatus, filterSupplier]);

    // --- UseEffects (Giữ nguyên) ---
    useEffect(() => { /* Trigger fetch */ }, [fetchData, bookings.length, loading]);
    useEffect(() => { /* Reset page */ }, [debouncedSearch, filterStatus, filterSupplier]);
     useEffect(() => { /* Fetch modal & filter data */ }, []);
    useEffect(() => { /* Realtime */ }, [fetchData, fetchStats]);

    // --- (SỬA) Event Handlers ---
    const handleStatusChange = (booking, newStatus) => {
        if (booking.status === newStatus) return;

        // <<< SỬA: Dùng Toast Confirm thay prompt >>>
        let cancellationReasonInput = ''; // Biến để lưu lý do hủy từ toast

        const confirmAction = async () => {
            const oldBooking = { ...booking };
             // Lấy booking mới nhất từ state để đảm bảo thông tin user/tour đầy đủ khi gửi mail
            const latestBookingData = bookings.find(b => b.id === booking.id) || booking;
            const newBooking = { ...latestBookingData, status: newStatus, cancellation_reason: newStatus === 'cancelled' ? cancellationReasonInput.trim() : null };


            setIsFetchingPage(true);
            try {
                await applyStockChanges(oldBooking, newBooking);
                const { error: updateError } = await supabase.from("Bookings")
                                         .update({ status: newStatus, cancellation_reason: newStatus === 'cancelled' ? cancellationReasonInput.trim() : null })
                                         .eq("id", booking.id);
                if (updateError) throw updateError;
                toast.success("Cập nhật trạng thái thành công!");
                await sendBookingEmail(newBooking, newStatus);
                 // Cập nhật UI ngay nếu muốn phản hồi nhanh hơn realtime
                 setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus, cancellation_reason: newStatus === 'cancelled' ? cancellationReasonInput.trim() : null } : b));
                 fetchStats(); // Cập nhật lại stats

            } catch (e) {
                toast.error(`Lỗi cập nhật: ${e.message}`);
                console.error("Status change error:", e);
                // Rollback UI nếu cần (hiện tại dựa vào realtime/fetch lại)
                 fetchCustomers(); // Fetch lại khi có lỗi để đảm bảo đồng bộ
            } finally {
                setIsFetchingPage(false);
            }
        };

        if (newStatus === 'cancelled') {
             toast((t) => (
                <div className="flex flex-col gap-3 p-1"> {/* Thêm padding */}
                    <span className="font-medium text-center">Hủy đơn <b>#{booking.id.slice(-6).toUpperCase()}</b>?</span>
                    <input
                        type="text"
                        placeholder="Nhập lý do hủy (tùy chọn)..."
                        className="input-style text-sm mt-1" // Style input
                        onChange={(e) => cancellationReasonInput = e.target.value}
                        maxLength={150} // Giới hạn độ dài lý do
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button className="modal-button-danger text-sm" onClick={() => { toast.dismiss(t.id); confirmAction(); }}> Xác nhận Hủy </button>
                        <button className="modal-button-secondary text-sm" onClick={() => toast.dismiss(t.id)}> Bỏ qua </button>
                    </div>
                </div>
              ), { icon: <WarningCircle size={24} className="text-red-500"/>, duration: 15000 }); // Tăng duration cho phép nhập
        } else { // 'confirmed' or 'pending'
            const actionText = newStatus === 'confirmed' ? 'XÁC NHẬN' : 'CHUYỂN VỀ CHỜ XỬ LÝ';
            const bgColor = newStatus === 'confirmed' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'; // Màu nút xác nhận
            toast((t) => (
                <span>
                    {actionText} đơn <b>#{booking.id.slice(-6).toUpperCase()}</b>?
                   <button className={`ml-3 px-3 py-1 ${bgColor} text-white rounded text-sm font-semibold`} onClick={() => { toast.dismiss(t.id); confirmAction(); }}> Xác nhận </button>
                   <button className="ml-2 modal-button-secondary text-sm" onClick={() => toast.dismiss(t.id)}> Hủy </button>
                </span>
              ), { icon: <WarningCircle size={20} className={newStatus === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}/>, duration: 6000 });
        }
    };

    const handleSaveBooking = async (dataToSave, oldBooking) => { /* (Giữ nguyên) */ };

    // <<< SỬA: handleDeleteBooking giờ chỉ gọi setBookingToDelete >>>
    const handleDeleteBooking = (booking) => {
        if (!booking) return;
        setBookingToDelete(booking); // Mở modal xác nhận
    };

    // <<< THÊM: Hàm xác nhận xóa thực sự (gọi từ modal) >>>
    const confirmDeleteBooking = async (booking) => {
        if (!booking) return;
        // Logic xóa giữ nguyên từ handleDeleteBooking cũ
        setIsFetchingPage(true); // Bật loading overlay
        try {
            const { data: fullBooking, error: fetchErr } = await supabase
                .from('Bookings').select(bookingSelect).eq('id', booking.id).single();
            if (fetchErr || !fullBooking) throw fetchErr || new Error("Không tìm thấy booking để xóa.");

            await applyStockChanges(fullBooking, null);
            const { error: deleteError } = await supabase.from('Bookings').delete().eq('id', booking.id);
            if (deleteError) throw deleteError;
            toast.success("Đã xóa booking!");
            setBookingToDelete(null); // Đóng modal

            // Fetch lại data sau khi xóa thành công
            if (bookings.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1); // Quay về trang trước nếu trang hiện tại trống
            } else {
                fetchData(false); // Fetch lại trang hiện tại
            }
             fetchStats(); // Cập nhật stats
             // Cập nhật allProducts
             const { data: productsData } = await supabase.from('Products').select('id, name, price, stock, supplier_id, product_type').eq('approval_status', 'approved').eq('product_type', 'tour');
             setAllProducts(productsData || []);


        } catch (e) {
            toast.error(`Lỗi xóa: ${e.message}`);
            console.error("Delete booking error:", e);
            // Ném lỗi để modal biết và không tự đóng (nếu cần)
             throw e; // Modal sẽ xử lý isDeleting=false trong handleConfirm
        } finally {
             setIsFetchingPage(false); // Tắt loading overlay
        }
    };


    const handleEmailCustomer = (booking) => { /* (Giữ nguyên) */ };
    const handleEmailSupplier = (booking) => { /* (Giữ nguyên) */ };

    // --- Pagination Window (Giữ nguyên) ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     // --- Loading ban đầu (Giữ nguyên) ---
     if (loading) { /* ... */ }

    // --- JSX (Nâng cấp UI) ---
    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header */}
             <div className="flex flex-wrap justify-between items-center mb-0 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Package size={30} weight="duotone" className="text-sky-600" /> Quản lý Đặt Tour
                </h1>
                <div className="flex flex-wrap gap-2">
                     <button onClick={() => { fetchData(true); fetchStats(); }} disabled={isFetchingPage || loading} className={`button-secondary flex items-center gap-1.5 ${isFetchingPage || loading ? 'opacity-50 cursor-wait' : ''}`}> {/* <<< Style lại nút Refresh */}
                         <ArrowsClockwise size={16} className={isFetchingPage ? "animate-spin" : ""} /> Tải lại {/* <<< Icon mới */}
                     </button>
                     <button onClick={() => { setCurrentBooking(null); setIsModalOpen(true); }} className="button-primary flex items-center gap-1.5" disabled={loading || isFetchingPage}> {/* <<< Style lại nút Thêm */}
                         <Plus size={16} weight="bold"/> Thêm Đơn
                     </button>
                </div>
            </div>

            {/* Thống Kê */}
            <BookingStats stats={stats} loading={loadingStats} />

            {/* Lọc và Tìm kiếm */}
             <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-200 dark:border-slate-700"> {/* <<< Style lại thanh filter */}
                <div className="relative flex-grow w-full">
                    <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /> {/* <<< Icon mới */}
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm Mã đơn, Tên/email khách, Tên tour..." className="search-input" disabled={loading} />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <Buildings size={16} className="text-gray-400 hidden sm:block" /> {/* <<< Icon mới */}
                    <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="filter-select" disabled={loading || isFetchingPage}>
                        <option value="all">Tất cả NCC</option>
                        {allSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <ChartBar size={16} className="text-gray-400 hidden sm:block" />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select" disabled={loading || isFetchingPage}>
                        <option value="all">Tất cả trạng thái</option> <option value="pending">Chờ xử lý</option> <option value="confirmed">Đã xác nhận</option> <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Bảng dữ liệu */}
             <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )} {/* <<< Chỉ hiện overlay khi fetch phụ */}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40"> {/* <<< Style thead */}
                            <tr>
                                <th className="th-style px-4">Mã Đơn</th>
                                <th className="th-style">Khách Hàng</th>
                                <th className="th-style">Tour</th>
                                <th className="th-style">Ngày Đặt</th>
                                <th className="th-style">Tổng Giá</th>
                                <th className="th-style">NCC</th>
                                <th className="th-style">TT Thanh Toán</th>
                                <th className="th-style">TT Đơn Hàng</th>
                                <th className="th-style text-center">Liên hệ</th>
                                <th className="th-style text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700"> {/* <<< Style tbody */}
                             {error && !isFetchingPage && ( <tr><td colSpan="10" className="td-center text-red-500">{typeof error === 'string' ? error : error.message}</td></tr> )}
                             {!error && !loading && !isFetchingPage && bookings.length === 0 && ( <tr><td colSpan="10" className="td-center text-gray-500 italic">{debouncedSearch || filterStatus !== 'all' || filterSupplier !== 'all' ? "Không tìm thấy đơn." : "Chưa có đơn."}</td></tr> )}
                             {!error && bookings.map((booking) => {
                                 const paymentStatus = getPaymentStatus(booking.status);
                                 return (
                                <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"> {/* <<< Style tr */}
                                    <td className="td-style px-4 text-xs font-mono text-gray-500 dark:text-gray-400">#{booking.id.slice(-6).toUpperCase()}</td>
                                    <td className="td-style font-medium text-gray-900 dark:text-white">
                                        <Link to={`/admin/accounts?search=${booking.user?.email || booking.user_id}`} title={`Xem KH ${booking.user?.full_name}`} className="link-style hover:text-sky-500">
                                            <User size={14} weight="duotone" className="inline mr-1 opacity-70"/> {booking.user?.full_name || "Khách vãng lai"}
                                        </Link>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{booking.user?.email}</span>
                                    </td>
                                    <td className="td-style text-gray-700 dark:text-gray-200">
                                        <Link to={`/admin/products?search=${booking.main_tour?.name}`} title={`Xem tour ${booking.main_tour?.name}`} className="link-style hover:text-sky-500">
                                            {booking.main_tour?.name || "N/A"}
                                        </Link>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">SL: {booking.quantity || 0}</span>
                                    </td>
                                    <td className="td-style text-gray-500 dark:text-gray-400"><Clock size={14} className="inline mr-1 opacity-70"/>{formatDate(booking.created_at)}</td>
                                    <td className="td-style font-semibold text-sky-600 dark:text-sky-400"><Tag size={14} weight="duotone" className="inline mr-1"/>{formatCurrency(booking.total_price)}</td>
                                    <td className="td-style text-xs text-gray-500 dark:text-gray-400">
                                        <Link to={`/admin/suppliers?search=${booking.main_tour?.supplier?.name}`} title={`Xem NCC ${booking.main_tour?.supplier?.name}`} className="link-style hover:text-sky-500">
                                            {booking.main_tour?.supplier?.name || 'N/A'}
                                        </Link>
                                    </td>
                                    <td className="td-style">
                                        <span className={`status-badge ${paymentStatus.color}`}>{paymentStatus.text}</span>
                                    </td>
                                    <td className="td-style">
                                        <select value={booking.status} onChange={(e) => handleStatusChange(booking, e.target.value)} className={`status-select ${getStatusColor(booking.status)}`} disabled={isFetchingPage}>
                                            <option value="pending">Chờ xử lý</option> <option value="confirmed">Xác nhận</option> <option value="cancelled">Hủy</option>
                                        </select>
                                    </td>
                                    <td className="td-style text-center space-x-1">
                                        <button onClick={() => handleEmailCustomer(booking)} className="action-button text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/30" title={`Email Khách: ${booking.user?.email}`} disabled={isFetchingPage || !booking.user?.email}><Envelope size={16} /></button>
                                        <button onClick={() => handleEmailSupplier(booking)} className="action-button text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30" title={`Email NCC: ${booking.main_tour?.supplier?.user?.email || 'N/A'}`} disabled={isFetchingPage || !booking.main_tour?.supplier?.user?.email}><Buildings size={16} /></button>
                                    </td>
                                    <td className="td-style text-center space-x-1">
                                        <button onClick={() => { setCurrentBooking(booking); setIsModalOpen(true); }} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa" disabled={isFetchingPage}><Pencil size={16} /></button>
                                        <button onClick={() => handleDeleteBooking(booking)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa" disabled={isFetchingPage}><Trash size={16} /></button>
                                    </td>
                                </tr>
                             )}
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Pagination UI (Giữ nguyên) --- */}
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

            {/* Modals (Giữ nguyên) */}
            {isModalOpen && <EditBookingModal booking={currentBooking} onClose={() => setIsModalOpen(false)} onSave={handleSaveBooking} allProducts={allProducts} allUsers={allUsers} />}
             {bookingToDelete && <DeleteConfirmationModal booking={bookingToDelete} onClose={() => setBookingToDelete(null)} onConfirm={confirmDeleteBooking} />} {/* <<< Sửa: Gọi hàm confirmDeleteBooking */}


            {/* --- CSS --- */}
            <style jsx>{`
                /* Các class dùng chung */
                .search-input { @apply w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .filter-select { @apply px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition appearance-none disabled:opacity-50; }
                .status-badge { @apply text-xs font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap; }
                .status-select { @apply text-xs font-medium rounded-md px-2 py-1 border-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-sky-500 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap; }
                .td-style { @apply px-6 py-4 whitespace-nowrap text-sm; }
                .td-center { @apply px-6 py-8 text-center; }
                .link-style { @apply inline-flex items-center gap-1 hover:underline; }
                /* Modal Styles */
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .error-message { @apply text-sm text-red-500 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded-md text-center; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50; }
                 .modal-button-save { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50; }
                 .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50; }

            `}</style>
        </div>
    );
}
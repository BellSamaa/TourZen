// src/pages/ManageTour.jsx
// (NÂNG CẤP: Lọc NCC, Thống kê, Nút Liên hệ, Links - Theo yêu cầu "Employee View")

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import {
    FaSpinner, FaSearch, FaEdit, FaTrash, FaPlus,
    FaExclamationTriangle, FaSyncAlt, FaUser
} from "react-icons/fa";
// <<< THÊM: Import icons cần thiết >>>
import { 
    Package, CaretLeft, CaretRight, CircleNotch, X, 
    ChartBar, // <<< Thêm: Thống kê
    UserList, // <<< Thêm: Lọc NCC
    Envelope, // <<< Thêm: Mail
    Buildings, // <<< Thêm: NCC
} from "@phosphor-icons/react";
import toast from 'react-hot-toast';

const supabase = getSupabase();

// --- (SỬA) String Select Query (Quan trọng): Join sâu để lấy email NCC ---
const bookingSelect = `
    id, created_at, user_id, product_id, quantity, total_price, status, cancellation_reason,
    user:Users(id, full_name, email), 
    main_tour:Products(
        id, name, price, stock, supplier_id, product_type, 
        supplier:Suppliers(
            id, name, user_id, 
            user:Users(id, full_name, email)
        )
    )
`;

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

// --- Các hàm helpers (Sửa đổi) ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(number);
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    try {
        return new Date(dateString).toLocaleString("vi-VN", options);
    } catch (e) {
        console.error("Invalid date string:", dateString, e);
        return 'Invalid Date';
    }
};

// Trạng thái (Nội bộ)
const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'pending': default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
};
// (MỚI) Trạng thái Thanh toán (Theo yêu cầu)
const getPaymentStatus = (status) => {
    switch (status) {
        case 'confirmed': return { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
        case 'cancelled': return { text: 'Đã hủy', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
        case 'pending': default: return { text: 'Chưa thanh toán', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    }
};

// --- Các hàm nghiệp vụ (Giữ nguyên) ---
const getProductsFromBooking = (booking) => {
    const prods = [];
    if (booking && booking.main_tour) { prods.push(booking.main_tour); }
    return prods;
};
const sendBookingEmail = async (booking, newStatus) => { /* (Giữ nguyên) */ 
    if (!booking || !booking.user || !booking.user.email || !booking.main_tour || !booking.main_tour.name) {
        console.error("Thiếu thông tin booking để gửi email:", booking);
        toast.error("Thiếu thông tin booking để gửi email.");
        return;
    }
    if (newStatus !== 'confirmed' && newStatus !== 'cancelled') { return; }
    const customerEmail = booking.user.email;
    const customerName = booking.user.full_name || 'Quý khách';
    const tourName = booking.main_tour.name;
    const bookingId = booking.id;
    const shortBookingId = bookingId.slice(-6).toUpperCase();
    let subject = '';
    let emailBody = '';
    if (newStatus === 'confirmed') {
        subject = `TourZen: Đơn hàng #${shortBookingId} của bạn đã được xác nhận!`;
        emailBody = `... (nội dung email xác nhận) ...`; // Giữ nguyên nội dung HTML
    } else if (newStatus === 'cancelled') {
        subject = `TourZen: Đơn hàng #${shortBookingId} của bạn đã bị hủy.`;
        emailBody = `... (nội dung email hủy) ...`; // Giữ nguyên nội dung HTML
    }
    try {
        const response = await fetch('/api/send-booking-email', {
            method: 'POST', headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ to: customerEmail, subject: subject, html: emailBody, }),
        });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.error || 'Lỗi API gửi email'); }
        toast.success(`Đã gửi email ${newStatus === 'confirmed' ? 'Xác nhận' : 'Hủy'}!`);
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        toast.error(`Lỗi gửi email: ${error.message}`);
    }
};
const updateStockAndNotify = async (product, quantityChange, reason) => { /* (Giữ nguyên) */ 
    if (!product || !product.id || !product.supplier_id) {
        console.warn("Thiếu thông tin sản phẩm/NCC để cập nhật stock.");
        return;
    }
    let currentStock = 0;
    try {
        const { data: currentProduct, error: fetchError } = await supabase.from('Products').select('stock, name').eq('id', product.id).single();
        if (fetchError || !currentProduct) { throw new Error("Lỗi fetch stock."); }
        currentStock = currentProduct.stock;
    } catch (fetchErr) {
        console.error(fetchErr); toast.error("Lỗi lấy stock."); throw fetchErr;
    }
    const newStock = currentStock + quantityChange;
    const { error: stockError } = await supabase.from('Products').update({ stock: newStock }).eq('id', product.id);
    if (stockError) { console.error("Lỗi cập nhật stock:", stockError); toast.error("Lỗi cập nhật tồn kho."); throw new Error("Lỗi cập nhật tồn kho."); }
    const message = `Cập nhật SL: ${reason}. Tour "${product.name}". Thay đổi: ${quantityChange > 0 ? '+' : ''}${quantityChange}. Còn lại: ${newStock}.`;
    const { error: notifyError } = await supabase.from('Notifications').insert({ supplier_id: product.supplier_id, message: message, related_product_id: product.id, is_read: false });
    if (notifyError) { console.error("Lỗi tạo thông báo:", notifyError); toast.error("Lỗi tạo thông báo NCC."); }
    else { console.log(`Thông báo stock gửi tới NCC ID: ${product.supplier_id}`); }
};
const applyStockChanges = async (oldBooking, newBooking) => { /* (Giữ nguyên) */ 
    const changes = [];
    if (oldBooking && oldBooking.status === 'confirmed') {
        const oldProducts = getProductsFromBooking(oldBooking);
        for (const prod of oldProducts) { changes.push({ product: prod, delta: oldBooking.quantity, reason: `Hoàn trả từ đơn #${oldBooking.id.slice(-6).toUpperCase()}` }); }
    }
    if (newBooking && newBooking.status === 'confirmed') {
        const newProducts = getProductsFromBooking(newBooking);
        for (const prod of newProducts) {
             const { data: currentProdData, error: fetchErr } = await supabase.from('Products').select('stock').eq('id', prod.id).single();
             if (fetchErr || !currentProdData) {
                 throw new Error(`Lỗi kiểm tra stock cho tour "${prod.name}".`);
             }
             const currentStock = currentProdData.stock;
             if (currentStock < newBooking.quantity) {
                throw new Error(`Không đủ chỗ cho tour "${prod.name}". Còn lại: ${currentStock}, cần: ${newBooking.quantity}`);
            }
            changes.push({ product: { ...prod, stock: currentStock }, delta: -newBooking.quantity, reason: `Xác nhận đơn #${newBooking.id.slice(-6).toUpperCase()}` }); // Truyền stock đã kiểm tra
        }
    }
    if (changes.length === 0) return;
    try {
        for (const ch of changes) { await updateStockAndNotify(ch.product, ch.delta, ch.reason); }
    } catch (error) {
        console.error("Lỗi áp dụng stock:", error); toast.error("Lỗi nghiêm trọng khi cập nhật tồn kho!"); throw error;
    }
};

// --- (MỚI) Component Thống Kê (Dashboard) ---
const BookingStats = ({ stats, loading }) => {
    const statItems = [
        { label: 'Chờ xử lý', value: stats.pending, color: 'text-yellow-600 dark:text-yellow-400', icon: <CircleNotch size={24} /> },
        { label: 'Đã xác nhận', value: stats.confirmed, color: 'text-green-600 dark:text-green-400', icon: <CheckCircle size={24} /> },
        { label: 'Đã hủy', value: stats.cancelled, color: 'text-red-600 dark:text-red-400', icon: <XCircle size={24} /> },
        { label: 'Tổng số đơn', value: stats.total, color: 'text-sky-600 dark:text-sky-400', icon: <Package size={24} /> },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statItems.map(item => (
                <div key={item.label} className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-5 flex items-center justify-between border dark:border-neutral-700">
                    <div>
                        <div className={`text-3xl font-bold ${item.color}`}>
                            {loading ? <FaSpinner className="animate-spin" size={28} /> : item.value}
                        </div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
                    </div>
                    <div className={`opacity-30 ${item.color}`}>
                        {item.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Component Modal Thêm/Sửa Booking (Giữ nguyên) ---
const EditBookingModal = ({ booking, onClose, onSave, allProducts, allUsers }) => { /* (Giữ nguyên) */ 
    const [formData, setFormData] = useState({ user_id: '', product_id: '', quantity: 1, status: 'pending' });
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tours = useMemo(() => allProducts.filter(p => p.product_type === 'tour' && (p.stock > 0 || p.id === booking?.main_tour?.id)), [allProducts, booking]);

    useEffect(() => {
        if (booking) { setFormData({ user_id: booking.user_id || '', product_id: booking.main_tour?.id || '', quantity: booking.quantity || 1, status: booking.status || 'pending', id: booking.id }); }
        else { setFormData({ user_id: '', product_id: '', quantity: 1, status: 'pending' }); }
        setError('');
    }, [booking]);

    useEffect(() => {
        const quantity = parseInt(formData.quantity) || 0;
        const selectedTour = allProducts.find(p => p.id === formData.product_id);
        setTotalPrice((selectedTour?.price || 0) * quantity);
    }, [formData.product_id, formData.quantity, allProducts]);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); setError(''); };
    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        if (!formData.user_id || !formData.product_id || !formData.quantity || formData.quantity <= 0) { setError('Điền đủ Khách hàng, Tour, Số lượng > 0.'); return; }
        const selectedTour = allProducts.find(p => p.id === formData.product_id);
        if (!selectedTour) { setError('Tour không hợp lệ.'); return; }
        const isEditingSameQuantityOrLess = booking && booking.main_tour?.id === formData.product_id && formData.quantity <= booking.quantity;
        let currentStock = selectedTour.stock;
        try {
             const { data: stockData, error: stockError } = await supabase.from('Products').select('stock').eq('id', selectedTour.id).single();
             if (stockError || !stockData) throw stockError || new Error("Không lấy được stock");
             currentStock = stockData.stock;
        } catch(err) {
             setError(`Lỗi kiểm tra số lượng tồn kho: ${err.message}`);
             return;
        }
        if (currentStock < formData.quantity && !isEditingSameQuantityOrLess) { setError(`Hết chỗ! Tour "${selectedTour.name}" còn ${currentStock} chỗ.`); return; }
        setIsSubmitting(true);
        const dataToSave = { user_id: formData.user_id, product_id: formData.product_id, quantity: parseInt(formData.quantity), total_price: totalPrice, status: formData.status, id: formData.id };
        try { await onSave(dataToSave, formData.id ? booking : null); }
        catch (err) { setError(err.message || "Lỗi lưu."); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
             <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100">
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white">{booking ? 'Sửa Đặt Tour' : 'Tạo Đặt Tour Mới'}</h3>
                    <button onClick={onClose} disabled={isSubmitting} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"> <X size={20} /> </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        {error && <p className="error-message">{error}</p>}
                        <div>
                            <label className="label-style">Khách hàng *</label>
                            <select name="user_id" value={formData.user_id} onChange={handleChange} required className="input-style">
                                <option value="" disabled>-- Chọn khách hàng --</option>
                                {allUsers.map(user => (<option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="label-style">Tour chính *</label>
                            <select name="product_id" value={formData.product_id} onChange={handleChange} required className="input-style">
                                <option value="" disabled>-- Chọn tour --</option>
                                {tours.map(product => (<option key={product.id} value={product.id}>{product.name} ({formatCurrency(product.price)}) - Còn: {product.stock}</option>))}
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
                      D</div>
                        </div>
                        <div className="pt-2 border-t dark:border-neutral-700 mt-4">
                             <span className="text-lg font-semibold dark:text-white">Tổng cộng: </span>
                             <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="modal-button-save flex items-center gap-1.5">
                            {isSubmitting && <CircleNotch size={18} className="animate-spin" />} {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Component Modal Xác nhận Xóa (Giữ nguyên) ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => { /* (Giữ nguyên) */ 
    const [isDeleting, setIsDeleting] = useState(false);
    const handleConfirm = async () => {
        setIsDeleting(true);
        try { await onConfirm(booking); } catch (err) { /* Lỗi đã toast */ }
        finally { setIsDeleting(false); }
    };
    if (!booking) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
             <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md transform transition-transform duration-300 scale-100">
                 <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                         <FaExclamationTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Xác nhận Xóa Đặt Tour</h3>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                         <p>Bạn có chắc chắn muốn xóa đơn đặt tour #{booking.id.slice(-6).toUpperCase()}?</p>
                         {booking.status === 'confirmed' && <p className="font-semibold text-red-500 dark:text-red-400 mt-1">Số lượng tồn kho sẽ được hoàn trả.</p>}
                         <p className="mt-1">Hành động này không thể hoàn tác.</p>
                    </div>
                </div>
                 <div className="bg-gray-50 dark:bg-neutral-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button type="button" onClick={handleConfirm} disabled={isDeleting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50" >
                        {isDeleting ? <CircleNotch size={20} className="animate-spin" /> : 'Xác nhận Xóa'}
                    </button>
                    <button type="button" onClick={onClose} disabled={isDeleting} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-neutral-600 shadow-sm px-4 py-2 bg-white dark:bg-neutral-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50" >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Component chính: Quản lý Đặt Tour (Sửa đổi) ---
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    
    // (MỚI) State cho Thống kê và Lọc NCC
    const [stats, setStats] = useState({ pending: 0, confirmed: 0, cancelled: 0, total: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSupplier, setFilterSupplier] = useState('all'); // <<< MỚI


    // --- (MỚI) Fetch Thống Kê (chỉ chạy 1 lần) ---
    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            // 1. Lấy ID của tất cả sản phẩm là 'tour'
            const { data: productsData, error: productError } = await supabase
                .from('Products')
                .select('id')
                .eq('product_type', 'tour');
            if (productError) throw productError;
            
            const tourIds = productsData.map(p => p.id);
            if (tourIds.length === 0) {
                 setStats({ pending: 0, confirmed: 0, cancelled: 0, total: 0 });
                 setLoadingStats(false);
                 return;
            }

            // 2. Đếm bookings dựa trên các ID tour đó, nhóm theo status
            const { data, error } = await supabase
                .from('Bookings')
                .select('status, count')
                .in('product_id', tourIds) // Chỉ đếm các đơn hàng là tour
                .group('status');
            
            if (error) throw error;

            const newStats = { pending: 0, confirmed: 0, cancelled: 0, total: 0 };
            let total = 0;
            data.forEach(item => {
                if (item.status) {
                    newStats[item.status] = item.count;
                    total += item.count;
                }
            });
            newStats.total = total;
            setStats(newStats);

        } catch (err) {
            console.error("Lỗi fetch thống kê:", err);
            toast.error("Lỗi tải thống kê.");
        } finally {
            setLoadingStats(false);
        }
    };

    // --- (SỬA) Fetch data (Thêm filterSupplier) ---
    const fetchData = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE; const to = from + ITEMS_PER_PAGE - 1;
            
            // Sử dụng bookingSelect đã join sâu
            let query = supabase.from("Bookings").select(bookingSelect, { count: 'exact' })
                            .not('main_tour', 'is', null) // Chỉ lấy đơn có tour
                            .eq('main_tour.product_type', 'tour'); // Đảm bảo main_tour là tour
            
            if (filterStatus !== 'all') { query = query.eq('status', filterStatus); }

            // (MỚI) Thêm Lọc NCC
            if (filterSupplier !== 'all') {
                query = query.eq('main_tour.supplier_id', filterSupplier);
            }
            
            if (debouncedSearch.trim() !== "") {
                const searchTermLike = `%${debouncedSearch.trim()}%`; let idSearch = null;
                if (debouncedSearch.trim().length >= 3) { // Tìm ID ngắn hơn
                    idSearch = `id.like.%${debouncedSearch.trim().toUpperCase()}`; 
                }
                 query = query.or(`${idSearch ? `${idSearch},` : ''}user.full_name.ilike.${searchTermLike},user.email.ilike.${searchTermLike},main_tour.name.ilike.${searchTermLike}`);
            }
            
            query = query.order('created_at', { ascending: false }).range(from, to);
            
            const { data, count, error: fetchError } = await query;
            
            if (fetchError) throw fetchError;
            
            setBookings(data || []); setTotalItems(count || 0);
            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) { setCurrentPage(1); }
        } catch (err) {
            console.error("Lỗi fetch đặt tour:", err); setError("Không thể tải danh sách đặt tour."); toast.error("Lỗi tải danh sách đặt tour."); setBookings([]); setTotalItems(0);
        } finally { if (isInitialLoad) setLoading(false); setIsFetchingPage(false); }
    }, [currentPage, debouncedSearch, filterStatus, filterSupplier]); // <<< Thêm filterSupplier

    // --- Trigger fetch (Giữ nguyên) ---
    useEffect(() => { const isInitial = bookings.length === 0 && loading; fetchData(isInitial); }, [fetchData, bookings.length, loading]);

    // --- (SỬA) Reset page on search/filter ---
    useEffect(() => { if (currentPage !== 1) { setCurrentPage(1); } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, filterStatus, filterSupplier]); // <<< Thêm filterSupplier

    // --- (SỬA) Tải data cho modal VÀ Lọc 1 lần ---
    useEffect(() => {
        const fetchModalAndFilterData = async () => {
             // Data cho Modal
             const { data: productsData } = await supabase.from('Products').select('id, name, price, stock, supplier_id, product_type').eq('approval_status', 'approved').eq('product_type', 'tour'); setAllProducts(productsData || []);
             const { data: usersData } = await supabase.from('Users').select('id, full_name, email'); setAllUsers(usersData || []);
             
             // (MỚI) Data cho Lọc NCC
             const { data: suppliersData } = await supabase.from('Suppliers').select('id, name').order('name'); 
             setAllSuppliers(suppliersData || []);

             // (MỚI) Data cho Thống kê
             fetchStats();
        }; 
        fetchModalAndFilterData();
    }, []); // Chạy 1 lần

    // --- (SỬA) Realtime (Fetch cả stats) ---
    useEffect(() => {
        const channel = supabase.channel('public:Bookings_ManageTour_Pagination')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'Bookings' }, (payload) => { 
                console.log('Realtime Change!', payload); 
                fetchData(false); // Fetch bảng
                fetchStats(); // (MỚI) Fetch lại stats
                toast.info('Danh sách cập nhật.'); 
            }).subscribe((status, err) => { if(err) console.error(err) });
        return () => { supabase.removeChannel(channel); };
    }, [fetchData]); // Bỏ fetchStats khỏi dependency để tránh re-sub

    // --- Event Handlers (Sửa đổi) ---
    const handleStatusChange = async (booking, newStatus) => {
        if (booking.status === newStatus) return; let cancellation_reason = null;
        if (newStatus === 'cancelled') { cancellation_reason = prompt("Lý do hủy:", "Admin hủy"); if (cancellation_reason === null) return; }
        const oldBooking = { ...booking }; const newBooking = { ...booking, status: newStatus, cancellation_reason: cancellation_reason };
        setIsFetchingPage(true);
        try {
            await applyStockChanges(oldBooking, newBooking);
            const { error } = await supabase.from("Bookings").update({ status: newStatus, cancellation_reason: cancellation_reason }).eq("id", booking.id);
            if (error) throw error;
            toast.success("Cập nhật thành công!");
            await sendBookingEmail(newBooking, newStatus);
            // Realtime sẽ tự fetch
        } catch (e) {
            toast.error(`Lỗi cập nhật: ${e.message}`);
        } finally {
            setIsFetchingPage(false);
        }
    };
    const handleSaveBooking = async (dataToSave, oldBooking) => { /* (Giữ nguyên) */ 
        let result, dbError; dataToSave.transport_product_id = null; dataToSave.flight_product_id = null;
        try {
            if (dataToSave.id) { result = await supabase.from('Bookings').update(dataToSave).eq('id', dataToSave.id).select(bookingSelect); dbError = result.error; }
            else { delete dataToSave.id; result = await supabase.from('Bookings').insert(dataToSave).select(bookingSelect); dbError = result.error; }
            if (dbError) throw dbError;
            const newBookingData = result.data[0];
            await applyStockChanges(oldBooking, newBookingData); // Cập nhật stock
            if (!oldBooking && newBookingData.status === 'confirmed') { await sendBookingEmail(newBookingData, 'confirmed'); }
            toast.success(dataToSave.id ? "Sửa đơn hàng thành công!" : "Thêm đơn hàng thành công!");
            setIsModalOpen(false); // Đóng modal sau khi thành công
            // Refetch products để cập nhật stock cho modal lần sau mở
             const { data: productsData } = await supabase.from('Products').select('id, name, price, stock, supplier_id, product_type').eq('approval_status', 'approved').eq('product_type', 'tour'); setAllProducts(productsData || []);
        } catch(err) {
            toast.error(`Lỗi lưu đơn hàng: ${err.message}`);
            throw err; // Ném lỗi lại để modal biết và không đóng
        }
    };
    const handleDeleteBooking = async (booking) => { /* (Giữ nguyên) */ 
        if (!booking) return;
        try {
            await applyStockChanges(booking, null); // Hoàn stock trước
            const { error } = await supabase.from('Bookings').delete().eq('id', booking.id); // Xóa booking
            if (error) throw error;
            toast.success("Đã xóa booking!");
            setBookingToDelete(null); // Đóng modal xác nhận
             // Refetch products để cập nhật stock
             const { data: productsData } = await supabase.from('Products').select('id, name, price, stock, supplier_id, product_type').eq('approval_status', 'approved').eq('product_type', 'tour'); setAllProducts(productsData || []);
        } catch (e) {
            toast.error(`Lỗi xóa: ${e.message}`);
            throw e;
        }
    };

    // --- (MỚI) Handlers Liên hệ ---
    const handleEmailCustomer = (booking) => {
        if (!booking?.user?.email) {
            toast.error("Khách hàng này không có email.");
            return;
        }
        const subject = `[TourZen] Hỗ trợ về đơn hàng #${booking.id.slice(-6).toUpperCase()}`;
        const body = `Chào ${booking.user.full_name || 'Quý khách'},%0D%0A%0D%0AChúng tôi liên hệ về đơn hàng tour "${booking.main_tour.name}"...%0D%0A%0D%0A`;
        window.location.href = `mailto:${booking.user.email}?subject=${subject}&body=${body}`;
    };
    const handleEmailSupplier = (booking) => {
        // Lấy email từ join sâu
        const supplierEmail = booking.main_tour?.supplier?.user?.email; 
        if (!supplierEmail) {
            toast.error("Không tìm thấy email liên hệ của NCC này.");
            return;
        }
        const subject = `[TourZen Admin] Trao đổi về đơn hàng #${booking.id.slice(-6).toUpperCase()} (Tour: ${booking.main_tour.name})`;
        const body = `Chào ${booking.main_tour.supplier.name},%0D%0A%0D%0AChúng tôi cần trao đổi về đơn hàng #${booking.id.slice(-6).toUpperCase()} của khách hàng ${booking.user.full_name}...%0D%0A%0D%0A`;
        window.location.href = `mailto:${supplierEmail}?subject=${subject}&body=${body}`;
    };

    // --- Pagination Window (Giữ nguyên) ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // --- Loading ban đầu (Giữ nguyên) ---
    if (loading) { 
        return (
            <div className="flex flex-col justify-center items-center p-24 text-center">
                <FaSpinner className="animate-spin text-sky-500" size={40} />
                <p className="text-slate-500 mt-3 font-medium"> Đang tải dữ liệu... </p>
            </div>
        );
     }

    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-0 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <Package size={30} weight="duotone" className="text-sky-600" /> Quản lý Đặt Tour
                </h1>
                <div className="flex flex-wrap gap-2">
                     <button onClick={() => { fetchData(true); fetchStats(); }} disabled={isFetchingPage} className={`button-secondary flex items-center gap-2 ${isFetchingPage ? 'opacity-50 cursor-not-allowed' : ''}`}> <FaSyncAlt className={isFetchingPage ? "animate-spin" : ""} /> Tải lại </button>
                     <button onClick={() => { setCurrentBooking(null); setIsModalOpen(true); }} className="button-primary flex items-center gap-2" disabled={loading || isFetchingPage}> <FaPlus /> Thêm Đơn Tour </button>
                </div>
            </div>

            {/* (MỚI) Thống Kê */}
            <BookingStats stats={stats} loading={loadingStats} />

            {/* (MỚI) Thanh Lọc và Tìm kiếm */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-200 dark:border-slate-700">
                <div className="relative flex-grow w-full">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm Mã đơn, Tên/email khách, Tên tour..." className="search-input" disabled={loading} />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <UserList size={16} className="text-gray-400 hidden sm:block" />
                    <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="filter-select" disabled={loading || isFetchingPage}>
                        <option value="all">Tất cả Nhà Cung Cấp</option>
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
            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden border dark:border-neutral-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && ( <div className="loading-overlay"> <FaSpinner className="animate-spin text-sky-500 text-3xl" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style px-4">Mã Đơn</th>
                                <th className="th-style px-6">Khách Hàng</th>
                                <th className="th-style px-6">Tour</th>
                                <th className="th-style px-6">Ngày Đặt</th>
                                <th className="th-style px-6">Tổng Giá</th>
                                <th className="th-style px-6">NCC</th>
                                <th className="th-style px-6">Trạng thái TT</th>
                                <th className="th-style px-6">Trạng thái</th>
                                <th className="th-style px-6 text-center">Liên hệ</th>
                                <th className="th-style px-6 text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-slate-700">
                             {error && !isFetchingPage && ( <tr><td colSpan="10" className="td-center text-red-500">{error}</td></tr> )}
                             {!error && loading && bookings.length === 0 && ( <tr><td colSpan="10" className="td-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr> )}
                             {!error && !loading && !isFetchingPage && bookings.length === 0 && ( <tr><td colSpan="10" className="td-center text-gray-500 italic">{debouncedSearch || filterStatus !== 'all' || filterSupplier !== 'all' ? "Không tìm thấy đơn đặt tour." : "Chưa có đơn đặt tour."}</td></tr> )}
                             {!error && bookings.map((booking) => {
                                 const paymentStatus = getPaymentStatus(booking.status);
                                 return (
                                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                    <td className="td-style px-4 text-xs font-mono text-gray-500">#{booking.id.slice(-6).toUpperCase()}</td>
                                    <td className="td-style px-6 font-medium text-gray-900 dark:text-white">
                                        <Link to={`/admin/accounts?search=${booking.user?.email || booking.user_id}`} title={`Xem KH ${booking.user?.full_name}`} className="link-style hover:text-sky-500">
                                            <FaUser size={12} className="inline mr-1 opacity-60"/> {booking.user?.full_name || "Khách vãng lai"}
                                        </Link>
                                        <span className="block text-xs text-gray-500">{booking.user?.email}</span>
                                    </td>
                                    <td className="td-style px-6 text-gray-600 dark:text-gray-200">
                                        <Link to={`/admin/products?search=${booking.main_tour?.name}`} title={`Xem sản phẩm ${booking.main_tour?.name}`} className="link-style hover:text-sky-500">
                                            {booking.main_tour?.name || "N/A"}
                                        </Link>
                                        <span className="block text-xs text-gray-500">SL: {booking.quantity || 0}</span>
                                    </td>
                                    <td className="td-style px-6 text-gray-500">{formatDate(booking.created_at)}</td>
                                    <td className="td-style px-6 font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(booking.total_price)}</td>
                                    <td className="td-style px-6 text-xs text-gray-500">
                                        <Link to={`/admin/suppliers?search=${booking.main_tour?.supplier?.name}`} title={`Xem NCC ${booking.main_tour?.supplier?.name}`} className="link-style hover:text-sky-500">
                                            {booking.main_tour?.supplier?.name || 'N/A'}
                                        </Link>
                                    </td>
                                    {/* (MỚI) Trạng thái TT */}
                                    <td className="td-style px-6">
                                        <span className={`status-badge ${paymentStatus.color}`}>{paymentStatus.text}</span>
                                    </td>
                                    {/* Trạng thái Đơn hàng */}
                                    <td className="td-style px-6">
                                        <select value={booking.status} onChange={(e) => handleStatusChange(booking, e.target.value)} className={`status-select ${getStatusColor(booking.status)}`} disabled={isFetchingPage}>
                                            <option value="pending">Chờ xử lý</option> <option value="confirmed">Đã xác nhận</option> <option value="cancelled">Đã hủy</option>
                                        </select>
                                    </td>
                                    {/* (MỚI) Nút Liên hệ */}
                                    <td className="td-style px-6 text-center space-x-1">
                                        <button onClick={() => handleEmailCustomer(booking)} className="action-button text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/30" title={`Email Khách: ${booking.user?.email}`} disabled={isFetchingPage || !booking.user?.email}><Envelope size={14} /></button>
                                        <button onClick={() => handleEmailSupplier(booking)} className="action-button text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30" title={`Email NCC: ${booking.main_tour?.supplier?.user?.email || 'N/A'}`} disabled={isFetchingPage || !booking.main_tour?.supplier?.user?.email}><Buildings size={14} /></button>
                                    </td>
                                    <td className="td-style px-6 text-center space-x-1">
                                        <button onClick={() => { setCurrentBooking(booking); setIsModalOpen(true); }} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa" disabled={isFetchingPage}><FaEdit size={14} /></button>
                                        <button onClick={() => setBookingToDelete(booking)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa" disabled={isFetchingPage}><FaTrash size={14} /></button>
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
            {bookingToDelete && <DeleteConfirmationModal booking={bookingToDelete} onClose={() => setBookingToDelete(null)} onConfirm={handleDeleteBooking} />}

            {/* --- CSS (Thêm/Sửa) --- */}
            <style jsx>{`
                .filter-select { @apply px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition appearance-none disabled:opacity-50; }
                .search-input { @apply w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50; }
                /* (MỚI) Badge cho trạng thái TT */
                .status-badge { @apply text-xs font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap; }
                .status-select { @apply text-xs font-medium rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-sky-500 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed; }
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-secondary { @apply bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap; }
                .td-style { @apply px-6 py-4 whitespace-nowrap text-sm; }
                .td-center { @apply px-6 py-8 text-center; }
                .link-style { @apply hover:underline flex items-center gap-1.5; } /* (SỬA) Thêm gap */
                /* Modal Styles */
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .error-message { @apply text-sm text-red-500 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded-md text-center; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-save { @apply px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-semibold disabled:opacity-50; }
            `}</style>

        </div>
    );
}
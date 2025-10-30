// src/pages/ManageTour.jsx
// (V8: Thêm cột Payment Method và Nút xem Hóa đơn)

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, Funnel, List, ArrowClockwise,
    User, CalendarBlank, UsersThree, Tag, Wallet, CheckCircle, XCircle, Clock, Info, PencilSimple, Trash, Plus, WarningCircle, Envelope,
    Buildings, AirplaneTilt, Car, Ticket as VoucherIcon, Bank, Image as ImageIcon, FloppyDisk,
    Receipt // (MỚI) Icon Hóa đơn
} from "@phosphor-icons/react";

// (MỚI) Import Modal Hóa đơn
import ViewInvoiceModal from "../components/ViewInvoiceModal.jsx"; // Đảm bảo đường dẫn đúng

const supabase = getSupabase();

// --- Hook Debounce (Giữ nguyên) ---
const useDebounce = (value, delay) => {
  // ... (code giữ nguyên)
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window (Giữ nguyên) ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
    // ... (code giữ nguyên)
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

// --- Helpers Format (CẬP NHẬT) ---
const formatCurrency = (number) => {
    // ... (code giữ nguyên)
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDate = (dateString) => {
    // ... (code giữ nguyên)
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: '2-digit', minute: '2-digit' });
    } catch (e) { return 'Invalid Date'; }
};
const formatShortDate = (dateString) => {
    // ... (code giữ nguyên)
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) { return 'Invalid Date'; }
};
const formatQuantity = (booking) => {
    // ... (code giữ nguyên)
    let parts = [];
    if (booking.num_adult > 0) parts.push(`${booking.num_adult}NL`);
    if (booking.num_elder > 0) parts.push(`${booking.num_elder}NG`);
    if (booking.num_child > 0) parts.push(`${booking.num_child}TE`);
    if (booking.num_infant > 0) parts.push(`${booking.num_infant}EB`);
    return parts.join(', ') || '0';
};
// (MỚI) Format PTTT
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
  // ... (code giữ nguyên)
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

// --- Component Thẻ Thống Kê (Giữ nguyên) ---
const StatCard = ({ title, value, icon, loading }) => {
    // ... (code giữ nguyên)
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
    // ... (code giữ nguyên)
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


// --- (GIỮ NGUYÊN V7) Component Modal Chi tiết/Sửa Đơn hàng ---
const EditBookingModal = ({ 
    booking, 
    onClose, 
    onStatusChange, 
    onSaveDetails,
    allUsers,
    allTours,
    allServices // { hotels: [], transport: [], flights: [] }
}) => {
    if (!booking) return null;
    
    const [formData, setFormData] = useState({
        user_id: booking.user?.id || '',
        product_id: booking.product?.id || '',
        hotel_product_id: booking.hotel?.id || '',
        transport_product_id: booking.transport?.id || '',
        flight_product_id: booking.flight?.id || '',
        voucher_code: booking.voucher_code || '',
        total_price: booking.total_price || 0,
        notes: booking.notes || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({
            user_id: booking.user?.id || '',
            product_id: booking.product?.id || '',
            hotel_product_id: booking.hotel?.id || '',
            transport_product_id: booking.transport?.id || '',
            flight_product_id: booking.flight?.id || '',
            voucher_code: booking.voucher_code || '',
            total_price: booking.total_price || 0,
            notes: booking.notes || ''
        });
    }, [booking]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value || 0) : value
        }));
        
        if (name === 'product_id' && value !== booking.product?.id) {
            toast.error("Bạn đã đổi Tour. Ngày đi có thể không còn hợp lệ. Vui lòng Hủy và Tạo đơn mới nếu cần đổi ngày.");
        }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        const finalData = { ...formData };
        await onSaveDetails(booking.id, finalData); // Gọi hàm prop
        setIsSaving(false);
    };

    const handleLocalStatusChange = (newStatus) => {
         if (booking.status === newStatus) return;
         if (window.confirm(`Bạn có chắc muốn đổi trạng thái thành "${newStatus}"?`)) {
              onStatusChange(booking, newStatus); 
         }
    };
    const sendConfirmationEmail = (email) => { toast.success(`Đã gửi lại email xác nhận đến ${email} (chức năng giả lập).`); };

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
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Chi tiết Đơn hàng #{booking.id.slice(-8).toUpperCase()}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"> <X size={22} weight="bold" /> </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm simple-scrollbar">
                    
                    {/* Thông tin Khách hàng (Thành select) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="label-modal font-semibold" htmlFor="user_id_edit">Khách hàng:</label>
                            <select id="user_id_edit" name="user_id" value={formData.user_id} onChange={handleChange} className="input-style w-full mt-1">
                                <option value="">-- Chọn User --</option>
                                {allUsers.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                            </select>
                        </div>
                        <div>
                            <strong className="label-modal">Email (từ user):</strong> 
                            <span className="value-modal block mt-1 p-2 border border-dashed dark:border-slate-600 rounded">
                                {allUsers.find(u => u.id === formData.user_id)?.email || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <strong className="label-modal">Ngày đặt:</strong> 
                            <span className="value-modal block mt-1">{formatDate(booking.created_at)}</span>
                        </div>
                        {/* (MỚI) Hiển thị PTTT (chỉ đọc) */}
                        <div>
                            <strong className="label-modal">Phương thức TT:</strong> 
                            <span className="value-modal block mt-1 font-semibold text-blue-600 dark:text-blue-400">
                                {formatPaymentMethod(booking.payment_method)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Thông tin Tour (Thành select) */}
                    <div className="border-t pt-4 dark:border-slate-700 space-y-4">
                        <div>
                            <label className="label-modal font-semibold" htmlFor="product_id_edit">Tour:</label>
                            <select id="product_id_edit" name="product_id" value={formData.product_id} onChange={handleChange} className="input-style w-full mt-1 !text-lg !font-semibold !text-sky-700 dark:!text-sky-400">
                                <option value="">-- Chọn Tour --</option>
                                {allTours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        
                        {/* (GIỮ CHỈ ĐỌC) Ngày đi & Số lượng */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong className="label-modal">Ngày đi (Chỉ đọc):</strong> 
                                <span className="value-modal block mt-1 p-2 border border-dashed dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700/50">
                                    {formatShortDate(booking.departure_date)}
                                </span>
                            </div>
                            <div>
                                <strong className="label-modal">Số lượng (Chỉ đọc):</strong> 
                                <span className="value-modal block mt-1 p-2 border border-dashed dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-700/50">
                                    {formatQuantity(booking)} ({booking.quantity} người)
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-orange-600 dark:text-orange-400 italic text-center">
                            * Để thay đổi <span className="font-semibold">Ngày đi</span> hoặc <span className="font-semibold">Số lượng</span>, vui lòng <span className="font-semibold">Hủy</span> đơn này (để hoàn slot) và <span className="font-semibold">Tạo Đơn Hàng Mới</span>.
                        </p>
                    </div>

                    {/* Dịch vụ kèm theo & Voucher (Thành select/input) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t dark:border-slate-700">
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="hotel_product_id_edit"><Buildings size={18}/> Khách sạn:</label>
                            <select id="hotel_product_id_edit" name="hotel_product_id" value={formData.hotel_product_id} onChange={handleChange} className="input-style w-full mt-1">
                                <option value="">Không chọn</option>
                                {allServices.hotels.map(s => 
                                    <option key={s.id} value={s.id} disabled={s.inventory <= 0}>
                                        {s.name} ({formatCurrency(s.price)})
                                        {s.inventory <= 0 ? ' (Hết hàng)' : ` (Còn ${s.inventory})`}
                                    </option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="transport_product_id_edit"><Car size={18}/> Vận chuyển:</label>
                            <select id="transport_product_id_edit" name="transport_product_id" value={formData.transport_product_id} onChange={handleChange} className="input-style w-full mt-1">
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
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="flight_product_id_edit"><AirplaneTilt size={18}/> Chuyến bay:</label>
                            <select id="flight_product_id_edit" name="flight_product_id" value={formData.flight_product_id} onChange={handleChange} className="input-style w-full mt-1">
                                <option value="">Không chọn</option>
                                {allServices.flights.map(s => 
                                    <option key={s.id} value={s.id} disabled={s.inventory <= 0}>
                                        {s.name} ({formatCurrency(s.price)})
                                        {s.inventory <= 0 ? ' (Hết hàng)' : ` (Còn ${s.inventory})`}
                                    </option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="label-modal font-semibold flex items-center gap-1.5" htmlFor="voucher_code_edit"><VoucherIcon size={18}/> Voucher:</label>
                            <input id="voucher_code_edit" name="voucher_code" value={formData.voucher_code} onChange={handleChange} className="input-style w-full mt-1" placeholder="Không có"/>
                        </div>
                    </div>
                    
                    {/* Ghi chú (Editable - Giữ nguyên) */}
                    <div className="pt-4 border-t dark:border-slate-700">
                         <label className="label-modal font-semibold" htmlFor="notes_edit">Ghi chú (có thể sửa):</label>
                         <textarea id="notes_edit" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input-style w-full mt-1.5 !text-base" placeholder="Không có ghi chú" />
                    </div>

                     {/* Tổng tiền (Editable - Giữ nguyên) */}
                     <div className="pt-4 border-t dark:border-slate-700 flex justify-end items-center gap-3">
                        <label className="text-lg font-semibold value-modal" htmlFor="total_price_edit">Tổng tiền:</label>
                        <input id="total_price_edit" name="total_price" type="number" value={formData.total_price} onChange={handleChange} className="input-style w-48 !text-2xl font-bold !text-red-600 dark:!text-red-400 text-right" />
                     </div>

                     {/* Thay đổi trạng thái (Style mới - Giữ nguyên) */}
                     <div className="pt-5 border-t dark:border-slate-700">
                        <label className="label-modal text-base font-semibold mb-2">Cập nhật trạng thái:</label>
                        <div className="flex flex-col sm:flex-row gap-3 mt-1">
                             <button 
                                onClick={() => handleLocalStatusChange('confirmed')} 
                                disabled={booking.status === 'confirmed'} 
                                className={`flex-1 button-status-base ${
                                    booking.status === 'confirmed' 
                                    ? 'bg-green-600 text-white shadow-inner' 
                                    : 'bg-white dark:bg-slate-700 hover:bg-green-50 dark:hover:bg-green-900/30 border border-green-500 text-green-600 dark:text-green-400'
                                }`}
                             > 
                                <CheckCircle weight="bold"/> Xác nhận 
                             </button>
                             <button 
                                onClick={() => handleLocalStatusChange('pending')} 
                                disabled={booking.status === 'pending'} 
                                className={`flex-1 button-status-base ${
                                    booking.status === 'pending' 
                                    ? 'bg-gray-500 text-white shadow-inner' 
                                    : 'bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 border border-gray-500 text-gray-600 dark:text-gray-400'
                                }`}
                             > 
                                <Clock weight="bold"/> Chờ xử lý 
                             </button>
                             <button 
                                onClick={() => handleLocalStatusChange('cancelled')} 
                                disabled={booking.status === 'cancelled'} 
                                className={`flex-1 button-status-base ${
                                    booking.status === 'cancelled' 
                                    ? 'bg-red-600 text-white shadow-inner' 
                                    : 'bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-500 text-red-600 dark:text-red-400'
                                }`}
                             > 
                                <XCircle weight="bold"/> Hủy đơn 
                             </button>
                        </div>
                        {booking.status === 'confirmed' && booking.user?.email && (
                            <button onClick={() => sendConfirmationEmail(booking.user.email)} className="button-secondary text-sm mt-4 flex items-center gap-1.5"> <Envelope/> Gửi lại email xác nhận </button>
                        )}
                     </div>
                </div>
                {/* Footer (Giữ nguyên) */}
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} disabled={isSaving} className="modal-button-secondary">Đóng</button>
                    <button type="button" onClick={handleSave} disabled={isSaving} className="modal-button-primary flex items-center gap-1.5">
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
                 .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                 .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                 .button-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50; }
            `}</style>
        </motion.div>
    );
};

// --- Component Modal Xác nhận Xóa (Giữ nguyên) ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    // ... (code giữ nguyên)
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


// --- Component Modal Thêm Đơn Hàng (Giữ nguyên) ---
const AddBookingModal = ({ users, tours, onClose, onSuccess }) => {
    // ... (code giữ nguyên từ V7)
    const [formData, setFormData] = useState({ user_id: '', product_id: '', departure_id: '', num_adult: 1, num_child: 0, num_elder: 0, num_infant: 0, total_price: 0, status: 'pending', notes: '', });
    const [departures, setDepartures] = useState([]);
    const [loadingDepartures, setLoadingDepartures] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    const selectedDeparture = useMemo(() => { return departures.find(d => d.id == formData.departure_id); }, [formData.departure_id, departures]);
    const currentGuests = formData.num_adult + formData.num_child + formData.num_elder + formData.num_infant;
    const remainingSlots = selectedDeparture ? (selectedDeparture.max_slots || 0) - (selectedDeparture.booked_slots || 0) : 0;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.user_id) { toast.error("Vui lòng chọn khách hàng."); return; }
        if (!formData.product_id) { toast.error("Vui lòng chọn tour."); return; }
        if (!formData.departure_id) { toast.error("Vui lòng chọn ngày khởi hành."); return; }
        if (currentGuests <= 0) { toast.error("Số lượng khách phải lớn hơn 0."); return; }
        if (currentGuests > remainingSlots) { toast.error(`Số khách (${currentGuests}) vượt quá số chỗ còn lại (${remainingSlots}).`); return; }
        if (formData.total_price <= 0) { toast.error("Tổng tiền phải lớn hơn 0 (Admin tự nhập)."); return; }
        setIsSubmitting(true);
        try {
            if (formData.status === 'confirmed') {
                const { error: rpcError } = await supabase.rpc('book_tour_slot', { departure_id_input: formData.departure_id, guest_count_input: currentGuests });
                if (rpcError) throw new Error(`Lỗi giữ chỗ: ${rpcError.message}`);
            }
            // (SỬA) Thêm PTTT là 'direct' (mặc định cho admin tạo)
            const bookingPayload = { 
                user_id: formData.user_id, 
                product_id: formData.product_id, 
                departure_id: formData.departure_id, 
                departure_date: selectedDeparture.departure_date, 
                quantity: currentGuests, 
                num_adult: formData.num_adult, 
                num_child: formData.num_child, 
                num_elder: formData.num_elder, 
                num_infant: formData.num_infant, 
                total_price: formData.total_price, 
                status: formData.status, 
                notes: formData.notes,
                payment_method: 'direct' // Mặc định
            };
            const { error: insertError } = await supabase.from('Bookings').insert(bookingPayload);
            if (insertError) throw insertError;
            toast.success("Tạo đơn hàng thành công!");
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Lỗi tạo đơn hàng:", err);
            toast.error(`Lỗi: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose} >
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 18, stiffness: 250 }} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()} >
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Tạo Đơn Hàng Mới (Admin)</h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"> <X size={22} weight="bold" /> </button>
                </div>
                <form id="add-booking-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 simple-scrollbar">
                    {/* ... (JSX của AddBookingModal giữ nguyên) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label-modal font-semibold" htmlFor="user_id">Khách hàng *</label>
                            <select id="user_id" name="user_id" value={formData.user_id} onChange={handleChange} className="input-style w-full mt-1" required>
                                <option value="" disabled>-- Chọn User --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-modal font-semibold" htmlFor="product_id">Tour *</label>
                            <select id="product_id" name="product_id" value={formData.product_id} onChange={handleChange} className="input-style w-full mt-1" required>
                                <option value="" disabled>-- Chọn Tour --</option>
                                {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label-modal font-semibold" htmlFor="departure_id">Ngày khởi hành *</label>
                        <select id="departure_id" name="departure_id" value={formData.departure_id} onChange={handleChange} className="input-style w-full mt-1" required disabled={loadingDepartures || departures.length === 0}>
                            <option value="" disabled>-- {loadingDepartures ? "Đang tải lịch..." : (formData.product_id ? "Chọn ngày đi" : "Vui lòng chọn tour trước")} --</option>
                            {departures.map(d => {
                                const remaining = (d.max_slots || 0) - (d.booked_slots || 0);
                                return <option key={d.id} value={d.id} disabled={remaining <= 0}> {d.departure_date} (Còn {remaining} chỗ) </option>
                            })}
                        </select>
                         {selectedDeparture && currentGuests > remainingSlots && <p className="text-xs text-red-500 mt-1">Số lượng khách ({currentGuests}) vượt quá số chỗ còn lại ({remainingSlots})!</p>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t dark:border-slate-700">
                        <div>
                            <label className="label-modal font-semibold" htmlFor="num_adult">Người lớn *</label>
                            <input type="number" id="num_adult" name="num_adult" value={formData.num_adult} onChange={handleChange} min={0} className="input-style w-full mt-1" required/>
                        </div>
                         <div>
                            <label className="label-modal font-semibold" htmlFor="num_elder">Người già</label>
                            <input type="number" id="num_elder" name="num_elder" value={formData.num_elder} onChange={handleChange} min={0} className="input-style w-full mt-1"/>
                        </div>
                        <div>
                            <label className="label-modal font-semibold" htmlFor="num_child">Trẻ em</label>
                            <input type="number" id="num_child" name="num_child" value={formData.num_child} onChange={handleChange} min={0} className="input-style w-full mt-1"/>
                        </div>
                        <div>
                            <label className="label-modal font-semibold" htmlFor="num_infant">Sơ sinh</label>
                            <input type="number" id="num_infant" name="num_infant" value={formData.num_infant} onChange={handleChange} min={0} className="input-style w-full mt-1"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t dark:border-slate-700">
                        <div>
                            <label className="label-modal font-semibold" htmlFor="total_price">Tổng tiền (Admin tự nhập) *</label>
                            <input type="number" id="total_price" name="total_price" value={formData.total_price} onChange={handleChange} min={0} className="input-style w-full mt-1 !text-lg !font-bold !text-red-600" required placeholder="0 ₫"/>
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
                 .label-modal { @apply font-medium text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wider mb-0.5; }
                 .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                 .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                 .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </motion.div>
    );
};
// --- (HẾT) Component Modal Thêm Đơn Hàng ---


// --- Component chính: Quản lý Đặt Tour ---
export default function ManageTour() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
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
    const [allServices, setAllServices] = useState({ hotels: [], transport: [], flights: [] });
    const [loadingAddData, setLoadingAddData] = useState(false);
    
    // (MỚI) State cho Modal Hóa đơn
    const [viewingInvoiceId, setViewingInvoiceId] = useState(null); // Lưu booking_id
    
    // (CẬP NHẬT) Fetch Bookings (thêm payment_method và join Invoices)
    const fetchBookings = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true);
        else setLoading(true); 
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
                    product:product_id ( id, name, image_url ),
                    hotel:hotel_product_id (id, name),
                    transport:Products!Bookings_transport_product_id_fkey (id, name, price, product_type, details),
                    flight:flight_product_id (id, name, price, product_type, details),
                    voucher_code, voucher_discount, notes, 
                    payment_method,
                    Invoices ( id ) 
                `, { count: 'exact' });
            if (filterStatus !== 'all') { query = query.eq('status', filterStatus); }
            if (debouncedSearch) {
                 const searchTermVal = `%${debouncedSearch}%`;
                 query = query.or(`product.name.ilike.${searchTermVal},user.full_name.ilike.${searchTermVal},user.email.ilike.${searchTermVal},id::text.like.${searchTermVal}`);
            }
            query = query.order('created_at', { ascending: false }).range(from, to);
            const { data, error: queryError, count } = await query;
            if (queryError) throw queryError;
            
             // (SỬA) Xử lý join Invoices (trả về mảng)
             const formattedData = (data || []).map(b => ({
                 ...b,
                 has_invoice: b.Invoices && b.Invoices.length > 0
             }));

            setBookings(formattedData || []);
            setTotalItems(count || 0);
            if (!isInitialLoad && currentPage > 1 && (data || []).length === 0 && count > 0) {
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
    }, [currentPage, debouncedSearch, filterStatus]);

    // (GIỮ NGUYÊN V7) useEffect để fetch Users, Tours & Services
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
                
                // Fetch Tours (approved)
                const { data: toursData, error: toursError } = await supabase
                    .from('Products')
                    .select('id, name')
                    .eq('product_type', 'tour')
                    .eq('approval_status', 'approved')
                    .order('name', { ascending: true });
                if (toursError) throw toursError;
                setAllTours(toursData || []);
                
                // Fetch Services (approved)
                const { data: servicesData, error: servicesError } = await supabase
                    .from('Products')
                    .select('id, name, price, product_type, details, inventory')
                    .in('product_type', ['hotel', 'transport', 'flight']) 
                    .eq('approval_status', 'approved')
                    .eq('is_published', true);
                if (servicesError) throw servicesError;
                setAllServices({
                    hotels: servicesData.filter(s => s.product_type === 'hotel'),
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


     useEffect(() => {
        fetchBookings(true);
     }, [debouncedSearch, filterStatus, fetchBookings]); 

     useEffect(() => {
        if (!loading) { fetchBookings(false); }
     }, [currentPage, loading, fetchBookings]);

     useEffect(() => {
        if (currentPage !== 1) { setCurrentPage(1); }
     }, [debouncedSearch, filterStatus]);


    // (GIỮ NGUYÊN V7) Event Handlers
    const handleStatusChange = async (booking, newStatus) => {
        // ... (code giữ nguyên)
        setIsFetchingPage(true); 
        let needsSlotUpdate = false;
        let slotChange = 0;
        if (booking.status === 'confirmed' && newStatus !== 'confirmed') { needsSlotUpdate = true; slotChange = booking.quantity; }
        else if (booking.status !== 'confirmed' && newStatus === 'confirmed') { needsSlotUpdate = true; slotChange = -booking.quantity; }
        try {
            if (needsSlotUpdate && booking.departure_id) {
                const { error: rpcError } = await supabase.rpc('update_departure_slot', { departure_id_input: booking.departure_id, change_amount: slotChange });
                if (rpcError) throw new Error(`Lỗi cập nhật slot: ${rpcError.message}`);
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
    
    // (CẬP NHẬT) Xóa: Xóa hóa đơn liên kết trước khi xóa booking
    const confirmDeleteBooking = async (booking) => {
        setIsFetchingPage(true);
        let needsSlotUpdate = booking.status === 'confirmed'; 
        let slotChange = booking.quantity;
        try {
            // (MỚI) Xóa Hóa đơn trước (nếu có)
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
            
            // Hoàn slot (giữ nguyên)
            if (needsSlotUpdate && booking.departure_id) {
                 const { error: rpcError } = await supabase.rpc('update_departure_slot', { departure_id_input: booking.departure_id, change_amount: slotChange });
                 if (rpcError) { console.warn(`Lỗi hoàn trả slot khi xóa booking ${booking.id}: ${rpcError.message}`); toast.warn(`Lỗi hoàn trả slot: ${rpcError.message}. Vui lòng kiểm tra lại.`); }
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
    
    // (GIỮ NGUYÊN V7) Handler để lưu chỉnh sửa chi tiết
    const handleSaveDetails = async (bookingId, updatedData) => {
        setIsFetchingPage(true);
        try {
             const dataToUpdate = {
                user_id: updatedData.user_id,
                product_id: updatedData.product_id,
                hotel_product_id: updatedData.hotel_product_id || null,
                transport_product_id: updatedData.transport_product_id || null,
                flight_product_id: updatedData.flight_product_id || null,
                voucher_code: updatedData.voucher_code || null,
                total_price: updatedData.total_price,
                notes: updatedData.notes
             };

             const { error } = await supabase
                .from('Bookings')
                .update(dataToUpdate)
                .eq('id', bookingId);
             
             if (error) throw error;
             
             toast.success("Cập nhật chi tiết đơn hàng thành công!");
             setModalBooking(null);
             fetchBookings(false);

        } catch (err) {
             console.error("Lỗi lưu chi tiết:", err);
             toast.error(`Lỗi: ${err.message}`);
        } finally {
             setIsFetchingPage(false);
        }
    };

    const handleViewDetails = (booking) => { setModalBooking(booking); };
    const handleDeleteClick = (booking) => { setBookingToDelete(booking); };
    // (MỚI) Mở modal hóa đơn
    const handleViewInvoice = (bookingId) => { setViewingInvoiceId(bookingId); };
    
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

            {/* Filter & Search + Danh sách (Giữ nguyên) */}
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-gray-100 dark:border-slate-700">
                {/* Filter & Search Bar (Giữ nguyên) */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select-figma" disabled={isFetchingPage} >
                            <option value="all">Tất cả</option> 
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div className="relative flex-grow w-full">
                        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm đơn hàng..." className="search-input-figma" disabled={isFetchingPage} />
                    </div>
                    <button onClick={() => fetchBookings(true)} disabled={loading || isFetchingPage} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0">
                        <ArrowClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* (CẬP NHẬT) Bảng Dữ liệu (Thêm cột PTTT) */}
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
                                <th className="th-style-figma text-center">P.Thức TT</th> {/* MỚI */}
                                <th className="th-style-figma text-center">Trạng thái</th>
                                <th className="th-style-figma text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {!loading && !error && bookings.length === 0 && !isFetchingPage && (
                                <tr><td colSpan="10" className="td-center text-gray-500 italic py-10">
                                    {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                                </td></tr>
                            )}
                            {!error && bookings.map((booking) => {
                                // const paidAmount = booking.status === 'confirmed' ? booking.total_price : 0; // Bỏ cột Đã cọc
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
                                    <td className="td-style-figma text-right font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">{formatCurrency(booking.total_price)}</td>
                                    {/* (MỚI) Cột PTTT */}
                                    <td className="td-style-figma text-center text-xs text-gray-600 dark:text-gray-300 font-medium">
                                        {formatPaymentMethod(booking.payment_method)}
                                    </td>
                                    <td className="td-style-figma text-center"><StatusBadge status={booking.status} /></td>
                                    {/* (CẬP NHẬT) Thao tác (Thêm nút Hóa đơn) */}
                                    <td className="td-style-figma text-center whitespace-nowrap">
                                        <div className="flex gap-2 justify-center">
                                            {/* (MỚI) Nút Hóa đơn */}
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

            {/* (CẬP NHẬT) Modals (Thêm Modal Hóa đơn) */}
            <AnimatePresence>
                {modalBooking && (
                    <EditBookingModal 
                        booking={modalBooking} 
                        onClose={() => setModalBooking(null)} 
                        onStatusChange={handleStatusChange} 
                        onSaveDetails={handleSaveDetails}
                        allUsers={allUsers}
                        allTours={allTours}
                        allServices={allServices}
                    />
                )}
                {bookingToDelete && <DeleteConfirmationModal booking={bookingToDelete} onClose={() => setBookingToDelete(null)} onConfirm={confirmDeleteBooking} />}
                
                {showAddModal && (
                    <AddBookingModal
                        users={allUsers}
                        tours={allTours}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => fetchBookings(false)} 
                    />
                )}
                
                {/* (MỚI) Modal Hóa đơn */}
                {viewingInvoiceId && (
                     <ViewInvoiceModal
                         bookingId={viewingInvoiceId}
                         onClose={() => setViewingInvoiceId(null)}
                     />
                )}
            </AnimatePresence>

            {/* CSS (Giữ nguyên) */}
            <style jsx>{`
                /* ... (Tất cả CSS styles từ file gốc giữ nguyên) ... */
                .filter-select-figma { @apply appearance-none block w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 cursor-pointer; }
                .search-input-figma { @apply w-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50; }
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
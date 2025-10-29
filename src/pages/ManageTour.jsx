// src/pages/ManageTour.jsx
// (V5: Thêm chức năng Thêm mới & Chỉnh sửa chi tiết Đơn hàng)

import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, Funnel, List, ArrowClockwise,
    User, CalendarBlank, UsersThree, Tag, Wallet, CheckCircle, XCircle, Clock, Info, PencilSimple, Trash, Plus, WarningCircle, Envelope,
    Buildings, AirplaneTilt, Car, Ticket as VoucherIcon, Bank, Image as ImageIcon, FloppyDisk // Thêm icon Save
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

// --- Helpers Format (Giữ nguyên) ---
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
    if (booking.num_elder > 0) parts.push(`${booking.num_elder}NG`); // Người Già
    if (booking.num_child > 0) parts.push(`${booking.num_child}TE`);
    if (booking.num_infant > 0) parts.push(`${booking.num_infant}EB`); // Em Bé
    return parts.join(', ') || '0';
};

// --- Component Badge Trạng thái (Giữ nguyên) ---
const StatusBadge = ({ status }) => {
  const baseStyle = "px-3 py-1 text-[11px] font-bold rounded-md inline-flex items-center gap-1 leading-tight whitespace-nowrap";
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

// --- Component Thẻ Thống Kê (Giữ nguyên) ---
const StatCard = ({ title, value, icon, loading }) => {
    // ... (Giữ nguyên code StatCard) ...
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


// --- (CẬP NHẬT) Component Modal Chi tiết/Sửa Đơn hàng ---
const EditBookingModal = ({ booking, onClose, onStatusChange, onSaveDetails }) => {
    if (!booking) return null;
    
    // --- (MỚI) State để chỉnh sửa ---
    const [formData, setFormData] = useState({
        total_price: booking.total_price || 0,
        notes: booking.notes || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Cập nhật state nếu booking prop thay đổi
        setFormData({
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
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        await onSaveDetails(booking.id, formData); // Gọi hàm prop
        setIsSaving(false);
    };
    // --- (Kết thúc Mới) ---

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
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
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
                    {/* ... (Các thông tin chỉ đọc giữ nguyên) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div><strong className="label-modal">Khách hàng:</strong> <span className="value-modal">{booking.user?.full_name || booking.user?.email || 'N/A'}</span></div>
                        <div><strong className="label-modal">Email:</strong> <span className="value-modal">{booking.user?.email || 'N/A'}</span></div>
                        <div><strong className="label-modal">Ngày đặt:</strong> <span className="value-modal">{formatDate(booking.created_at)}</span></div>
                    </div>
                    <div className="border-t pt-4 dark:border-slate-700 space-y-2">
                        <div><strong className="label-modal">Tour:</strong> <span className="font-semibold text-lg text-sky-700 dark:text-sky-400">{booking.product?.name || 'Tour đã bị xóa'}</span></div>
                        <div><strong className="label-modal">Ngày đi:</strong> <span className="font-semibold value-modal text-base">{formatShortDate(booking.departure_date)}</span></div>
                        <div><strong className="label-modal">Số lượng:</strong> <span className="value-modal">{formatQuantity(booking)} ({booking.quantity} người)</span></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-4 border-t dark:border-slate-700">
                        {/* ... (Các dịch vụ kèm theo giữ nguyên) ... */}
                        <div><strong className="label-modal flex items-center gap-1.5"><Buildings size={18}/> Khách sạn:</strong> <span className="value-modal">{booking.hotel?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1.5"><Car size={18}/> Vận chuyển:</strong> <span className="value-modal">{booking.transport?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1.5"><AirplaneTilt size={18}/> Chuyến bay:</strong> <span className="value-modal">{booking.flight?.name || 'Không chọn'}</span></div>
                        <div><strong className="label-modal flex items-center gap-1.5"><VoucherIcon size={18}/> Voucher:</strong> <span className="value-modal">{booking.voucher_code || 'Không có'} {booking.voucher_discount > 0 ? `(-${formatCurrency(booking.voucher_discount)})` : ''}</span></div>
                    </div>
                    
                    {/* --- (CẬP NHẬT) Ghi chú (Thành textarea) --- */}
                    <div className="pt-4 border-t dark:border-slate-700">
                         <label className="label-modal font-semibold" htmlFor="notes_edit">Ghi chú của khách (có thể sửa):</label>
                         <textarea
                            id="notes_edit"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="input-style w-full mt-1.5 !text-base"
                            placeholder="Không có ghi chú"
                         />
                    </div>

                     {/* --- (CẬP NHẬT) Tổng tiền (Thành input) --- */}
                     <div className="pt-4 border-t dark:border-slate-700 flex justify-end items-center gap-3">
                        <label className="text-lg font-semibold value-modal" htmlFor="total_price_edit">Tổng tiền:</label>
                        <input
                            id="total_price_edit"
                            name="total_price"
                            type="number"
                            value={formData.total_price}
                            onChange={handleChange}
                            className="input-style w-48 !text-2xl font-bold !text-red-600 dark:!text-red-400 text-right"
                        />
                     </div>

                     {/* Thay đổi trạng thái (Giữ nguyên) */}
                     <div className="pt-5 border-t dark:border-slate-700">
                        <label className="label-modal text-base font-semibold mb-2">Cập nhật trạng thái (Hành động riêng):</label>
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
                {/* --- (CẬP NHẬT) Footer: Thêm nút Save --- */}
                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                    <button type="button" onClick={onClose} disabled={isSaving} className="modal-button-secondary">Đóng</button>
                    <button type="button" onClick={handleSave} disabled={isSaving} className="modal-button-primary flex items-center gap-1.5">
                        {isSaving ? <CircleNotch className="animate-spin" size={18} /> : <FloppyDisk size={18} />}
                        Lưu thay đổi (Tiền & Ghi chú)
                    </button>
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
                 .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                 .modal-button-secondary { @apply px-5 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                 .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
            `}</style>
        </motion.div>
    );
};

// --- Component Modal Xác nhận Xóa (Giữ nguyên) ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    // ... (Giữ nguyên code DeleteConfirmationModal) ...
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


// --- (MỚI) Component Modal Thêm Đơn Hàng ---
const AddBookingModal = ({ users, tours, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        user_id: '',
        product_id: '',
        departure_id: '',
        num_adult: 1,
        num_child: 0,
        num_elder: 0,
        num_infant: 0,
        total_price: 0,
        status: 'pending',
        notes: '',
    });
    const [departures, setDepartures] = useState([]);
    const [loadingDepartures, setLoadingDepartures] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch lịch khởi hành khi chọn tour
    useEffect(() => {
        if (!formData.product_id) {
            setDepartures([]);
            setFormData(prev => ({ ...prev, departure_id: '' }));
            return;
        }
        
        const fetchDepartures = async () => {
            setLoadingDepartures(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from("Departures")
                .select("*")
                .eq("product_id", formData.product_id)
                .gte("departure_date", today)
                .order("departure_date", { ascending: true });
            
            if (error) { toast.error("Lỗi tải lịch khởi hành."); }
            else { setDepartures(data || []); }
            setLoadingDepartures(false);
        };
        fetchDepartures();
    }, [formData.product_id]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const selectedDeparture = useMemo(() => {
        return departures.find(d => d.id == formData.departure_id); // Dùng == vì value từ select có thể là string
    }, [formData.departure_id, departures]);

    const currentGuests = formData.num_adult + formData.num_child + formData.num_elder + formData.num_infant;
    const remainingSlots = selectedDeparture ? (selectedDeparture.max_slots || 0) - (selectedDeparture.booked_slots || 0) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.user_id) { toast.error("Vui lòng chọn khách hàng."); return; }
        if (!formData.product_id) { toast.error("Vui lòng chọn tour."); return; }
        if (!formData.departure_id) { toast.error("Vui lòng chọn ngày khởi hành."); return; }
        if (currentGuests <= 0) { toast.error("Số lượng khách phải lớn hơn 0."); return; }
        if (currentGuests > remainingSlots) { toast.error(`Số khách (${currentGuests}) vượt quá số chỗ còn lại (${remainingSlots}).`); return; }
        if (formData.total_price <= 0) { toast.error("Tổng tiền phải lớn hơn 0 (Admin tự nhập)."); return; }
        
        setIsSubmitting(true);
        
        try {
            // Bước 1: Giữ chỗ nếu đơn là 'confirmed'
            if (formData.status === 'confirmed') {
                const { error: rpcError } = await supabase.rpc('book_tour_slot', {
                    departure_id_input: formData.departure_id,
                    guest_count_input: currentGuests
                });
                if (rpcError) throw new Error(`Lỗi giữ chỗ: ${rpcError.message}`);
            }

            // Bước 2: Tạo payload
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
                // Admin thêm đơn hàng, không có các dịch vụ/voucher kèm theo
            };

            // Bước 3: Insert
            const { error: insertError } = await supabase
                .from('Bookings')
                .insert(bookingPayload);

            if (insertError) throw insertError;
            
            toast.success("Tạo đơn hàng thành công!");
            onSuccess(); // Tải lại danh sách
            onClose(); // Đóng modal

        } catch (err) {
            console.error("Lỗi tạo đơn hàng:", err);
            toast.error(`Lỗi: ${err.message}`);
            // (Nâng cao) Cần rollback RPC nếu insert thất bại
        } finally {
            setIsSubmitting(false);
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
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
             >
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Tạo Đơn Hàng Mới (Admin)</h3>
                    <button onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"> <X size={22} weight="bold" /> </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 simple-scrollbar">
                    {/* Chọn Khách hàng & Tour */}
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
                    {/* Chọn Lịch khởi hành (dependent) */}
                    <div>
                        <label className="label-modal font-semibold" htmlFor="departure_id">Ngày khởi hành *</label>
                        <select id="departure_id" name="departure_id" value={formData.departure_id} onChange={handleChange} className="input-style w-full mt-1" required disabled={loadingDepartures || departures.length === 0}>
                            <option value="" disabled>-- {loadingDepartures ? "Đang tải lịch..." : (formData.product_id ? "Chọn ngày đi" : "Vui lòng chọn tour trước")} --</option>
                            {departures.map(d => {
                                const remaining = (d.max_slots || 0) - (d.booked_slots || 0);
                                return <option key={d.id} value={d.id} disabled={remaining <= 0}>
                                    {d.departure_date} (Còn {remaining} chỗ)
                                </option>
                            })}
                        </select>
                         {selectedDeparture && currentGuests > remainingSlots && <p className="text-xs text-red-500 mt-1">Số lượng khách ({currentGuests}) vượt quá số chỗ còn lại ({remainingSlots})!</p>}
                    </div>
                    {/* Nhập số lượng */}
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
                     {/* Giá & Trạng thái */}
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
                     {/* Ghi chú */}
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

    // --- (MỚI) State cho modal Thêm ---
    const [showAddModal, setShowAddModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [allTours, setAllTours] = useState([]);
    const [loadingAddData, setLoadingAddData] = useState(false);
    
    // --- (CẬP NHẬT) Fetch Bookings (Giữ nguyên) ---
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
                    transport:Products!Bookings_transport_product_id_fkey (id, name),
                    flight:flight_product_id (id, name),
                    voucher_code, voucher_discount, notes, payment_method
                `, { count: 'exact' });

            if (filterStatus !== 'all') { query = query.eq('status', filterStatus); }
            if (debouncedSearch) {
                 const searchTermVal = `%${debouncedSearch}%`;
                 query = query.or(`product.name.ilike.${searchTermVal},user.full_name.ilike.${searchTermVal},user.email.ilike.${searchTermVal},id::text.like.${searchTermVal}`);
            }

            query = query.order('created_at', { ascending: false }).range(from, to);
            const { data, error: queryError, count } = await query;

            if (queryError) throw queryError;
            setBookings(data || []);
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

    // --- (MỚI) useEffect để fetch Users & Tours cho modal 'Add' ---
    useEffect(() => {
        const fetchAddModalData = async () => {
            setLoadingAddData(true);
            try {
                // Fetch Users
                const { data: usersData, error: usersError } = await supabase
                    .from('Users') // Giả sử bạn có bảng 'Users' public
                    .select('id, full_name, email')
                    .order('full_name', { ascending: true });
                if (usersError) throw usersError;
                setAllUsers(usersData || []);
                
                // Fetch Tours
                const { data: toursData, error: toursError } = await supabase
                    .from('Products')
                    .select('id, name')
                    .eq('product_type', 'tour')
                    .eq('approval_status', 'approved') // Chỉ cho phép thêm đơn cho tour đã duyệt
                    .order('name', { ascending: true });
                if (toursError) throw toursError;
                setAllTours(toursData || []);
                
            } catch (err) {
                console.error("Lỗi fetch data cho modal Add:", err);
                toast.error("Lỗi tải danh sách Users/Tours.");
            }
            setLoadingAddData(false);
        };
        fetchAddModalData();
    }, []);
    // --- (HẾT MỚI) ---


     useEffect(() => {
        fetchBookings(true);
     }, [debouncedSearch, filterStatus, fetchBookings]); 

     useEffect(() => {
        if (!loading) { fetchBookings(false); }
     }, [currentPage, loading, fetchBookings]);

     useEffect(() => {
        if (currentPage !== 1) { setCurrentPage(1); }
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [debouncedSearch, filterStatus]);


    // --- (CẬP NHẬT) Event Handlers ---
    // (onStatusChange và confirmDeleteBooking giữ nguyên logic RPC)
    const handleStatusChange = async (booking, newStatus) => {
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
    const confirmDeleteBooking = async (booking) => {
        setIsFetchingPage(true);
        let needsSlotUpdate = booking.status === 'confirmed'; 
        let slotChange = booking.quantity;
        try {
            if (needsSlotUpdate && booking.departure_id) {
                 const { error: rpcError } = await supabase.rpc('update_departure_slot', { departure_id_input: booking.departure_id, change_amount: slotChange });
                 if (rpcError) { console.warn(`Lỗi hoàn trả slot khi xóa booking ${booking.id}: ${rpcError.message}`); toast.warn(`Lỗi hoàn trả slot: ${rpcError.message}. Vui lòng kiểm tra lại.`); }
            }
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
    
    // --- (MỚI) Handler để lưu chỉnh sửa chi tiết ---
    const handleSaveDetails = async (bookingId, updatedData) => {
        setIsFetchingPage(true); // Dùng loading overlay
        try {
             const { error } = await supabase
                .from('Bookings')
                .update({
                    total_price: updatedData.total_price,
                    notes: updatedData.notes
                })
                .eq('id', bookingId);
             
             if (error) throw error;
             
             toast.success("Cập nhật chi tiết đơn hàng thành công!");
             setModalBooking(null); // Đóng modal
             fetchBookings(false); // Tải lại danh sách

        } catch (err) {
             console.error("Lỗi lưu chi tiết:", err);
             toast.error(`Lỗi: ${err.message}`);
        } finally {
             setIsFetchingPage(false);
        }
    };

    const handleViewDetails = (booking) => { setModalBooking(booking); };
    const handleDeleteClick = (booking) => { setBookingToDelete(booking); };
    // --- (MỚI) Handler mở modal Add ---
    const handleAddBooking = () => {
        if (loadingAddData) {
            toast.loading("Đang tải dữ liệu Users/Tours...");
            return;
        }
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
            {/* --- (CẬP NHẬT) Header & Nút Tạo --- */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Quản Lý Đơn Đặt Tour</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý và duyệt đơn đặt tour của khách hàng.</p>
                </div>
                 <button 
                    onClick={handleAddBooking} // <-- (CẬP NHẬT)
                    disabled={loadingAddData}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow hover:shadow-md transition-all font-semibold text-sm disabled:opacity-60"
                 >
                     {loadingAddData ? <CircleNotch className="animate-spin" size={18} /> : <Plus size={18} weight="bold" />}
                     Thêm Đơn Hàng
                 </button>
            </div>

            {/* Thẻ Thống Kê (Giữ nguyên) */}
            <BookingStats />

            {/* Filter & Search + Danh sách (Giữ nguyên) */}
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-gray-100 dark:border-slate-700">
                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select-figma"
                            disabled={isFetchingPage}
                        >
                            <option value="all">Tất cả</option> 
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div className="relative flex-grow w-full">
                        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm đơn hàng..."
                            className="search-input-figma"
                            disabled={isFetchingPage}
                        />
                    </div>
                    <button onClick={() => fetchBookings(true)} disabled={loading || isFetchingPage} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0">
                        <ArrowClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Bảng Dữ liệu (Giữ nguyên) */}
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
                                <th className="th-style-figma text-right">Đã cọc</th>
                                <th className="th-style-figma text-center">Trạng thái</th>
                                <th className="th-style-figma text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {/* ... (Render loading/error/empty/data rows giữ nguyên) ... */}
                            {!loading && !error && bookings.length === 0 && !isFetchingPage && (
                                <tr><td colSpan="10" className="td-center text-gray-500 italic py-10">
                                    {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy đơn hàng phù hợp.' : 'Chưa có đơn hàng nào.'}
                                </td></tr>
                            )}
                            {!error && bookings.map((booking) => {
                                const paidAmount = booking.status === 'confirmed' ? booking.total_price : 0; 
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
                                    </td>
                                    <td className="td-style-figma max-w-xs">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={booking.product?.image_url || 'https://placehold.co/80x50/eee/ccc?text=Tour'} 
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

            {/* --- (CẬP NHẬT) Modals --- */}
            <AnimatePresence>
                {modalBooking && (
                    <EditBookingModal 
                        booking={modalBooking} 
                        onClose={() => setModalBooking(null)} 
                        onStatusChange={handleStatusChange} 
                        onSaveDetails={handleSaveDetails} // <-- (MỚI) Pass hàm save
                    />
                )}
                {bookingToDelete && <DeleteConfirmationModal booking={bookingToDelete} onClose={() => setBookingToDelete(null)} onConfirm={confirmDeleteBooking} />}
                
                {/* --- (MỚI) Render modal Add --- */}
                {showAddModal && (
                    <AddBookingModal
                        users={allUsers}
                        tours={allTours}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => fetchBookings(false)} // Tải lại danh sách
                    />
                )}
            </AnimatePresence>

            {/* CSS (Thêm style mới) */}
            <style jsx>{`
                /* ... (Tất cả CSS styles từ file gốc giữ nguyên) ... */
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
                /* (MỚI) Thêm style cho modal-button-primary */
                .modal-button-primary { @apply px-5 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                /* (MỚI) Thêm style cho input-style (dùng trong modal) */
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                /* Pagination */
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                /* (MỚI) Thêm style cho scrollbar modal */
                 .simple-scrollbar::-webkit-scrollbar { width: 6px; }
                 .simple-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .simple-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                 .dark .simple-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
            `}</style>
        </div>
    );
}
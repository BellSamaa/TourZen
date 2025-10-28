// src/pages/AdminManageProducts.jsx
// (UPGRADED: UI đồng bộ, Toast Confirm, Animation + FIXED: Comment in select)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaSpinner, FaCheck, FaTimes, FaPlus, FaMinus } from "react-icons/fa"; // Giữ lại một số Fa icons
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, CalendarPlus,
    PencilLine, UploadSimple, ArrowsClockwise, WarningCircle, Trash, Buildings // <<< Thêm icons
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion"; // <<< Thêm Framer Motion

const supabase = getSupabase();

// --- Hook Debounce (Giữ nguyên) ---
const useDebounce = (value, delay) => { /* ... */ };

// --- Helper Pagination Window (Giữ nguyên) ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => { /* ... */ };

// --- (UPGRADED) Modal Chỉnh sửa Tour ---
const EditTourModal = ({ tour, onClose, onSuccess, suppliers }) => {
    const [formData, setFormData] = useState({ /* ... state ... */ });
    const [loading, setLoading] = useState(false);

    useEffect(() => { /* ... load data ... */ }, [tour]);

    // Handlers (Giữ nguyên logic)
    const handleChange = (e) => { /* ... */ };
    const handleItineraryChange = (index, field, value) => { /* ... */ };
    const addItineraryItem = () => { /* ... */ };
    const removeItineraryItem = (index) => { /* ... */ };
    const handleDepartureChange = (index, field, value) => { /* ... */ };
    const addDepartureItem = () => { /* ... */ };
    const removeDepartureItem = (index) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... (Logic submit giữ nguyên) ... */ };

    return (
        <motion.div // <<< Thêm motion div cho backdrop
            className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* <<< Thêm motion div cho modal content */}
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 flex-shrink-0">
                     <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {tour.is_published ? 'Chỉnh sửa Tour đã đăng' : 'Hoàn thiện & Đăng Tour'}
                    </h3>
                    <button onClick={onClose} disabled={loading} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"> <X size={20}/> </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-y-auto p-6 space-y-5"> {/* <<< Tăng space */}
                        {/* Thông tin cơ bản */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h4 className="text-md font-semibold mb-3 dark:text-white border-b pb-2 dark:border-slate-700">Thông tin cơ bản</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div> <label className="label-style">Tên Tour *</label> <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" /> </div>
                                <div> <label className="label-style">Địa điểm</label> <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" /> </div>
                                <div> <label className="label-style">Thời lượng (VD: 3N2Đ)</label> <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" /> </div>
                                <div>
                                    <label className="label-style">Nhà cung cấp *</label>
                                    <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style">
                                        <option value="" disabled>-- Chọn NCC --</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4"> <label className="label-style">Mô tả chi tiết Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="input-style resize-y"></textarea> </div>
                        </motion.div>

                        {/* Quản lý Lịch trình */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h4 className="text-md font-semibold mt-4 mb-3 dark:text-white border-b pb-2 dark:border-slate-700">Lịch trình chi tiết (Theo ngày)</h4>
                            <AnimatePresence> {/* <<< Cho hiệu ứng khi thêm/xóa */}
                            {formData.itinerary.map((item, index) => (
                                <motion.div
                                    key={`itinerary-${index}`} // Cần key ổn định
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col sm:flex-row gap-2 mb-2 p-3 border rounded-md dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 overflow-hidden" // Thêm overflow-hidden
                                >
                                    <input type="text" placeholder={`Tiêu đề Ngày ${index+1}`} value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} className="input-style sm:w-1/3 font-medium" />
                                    <textarea placeholder="Nội dung hoạt động..." value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} rows="3" className="input-style flex-1 resize-y"></textarea>
                                    <button type="button" onClick={() => removeItineraryItem(index)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 self-center sm:self-start mt-2 sm:mt-0" title="Xóa ngày"><Minus size={16} /></button>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                            <button type="button" onClick={addItineraryItem} className="mt-2 button-secondary text-xs flex items-center gap-1"><Plus size={14} weight="bold"/> Thêm ngày</button>
                        </motion.div>

                        {/* Quản lý Lịch khởi hành */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                             <h4 className="text-md font-semibold mt-4 mb-3 dark:text-white border-b pb-2 dark:border-slate-700">Lịch khởi hành & Giá *</h4>
                             <AnimatePresence>
                             {formData.departures.map((item, index) => (
                                 <motion.div
                                     key={`departure-${index}`} // Cần key ổn định
                                     initial={{ opacity: 0, height: 0 }}
                                     animate={{ opacity: 1, height: 'auto' }}
                                     exit={{ opacity: 0, height: 0 }}
                                     transition={{ duration: 0.2 }}
                                     className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2 items-end p-3 border rounded-md dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 overflow-hidden" // items-end
                                 >
                                     <div className="sm:col-span-1">
                                         <label className="label-style text-xs">Ngày đi *</label>
                                         <input type="date" value={item.date} onChange={(e) => handleDepartureChange(index, 'date', e.target.value)} className="input-style" required />
                                         {item.month_hint && !item.date && <span className="text-xs text-gray-500 italic">(Tháng cũ: {item.month_hint})</span>}
                                     </div>
                                     <div className="sm:col-span-1">
                                        <label className="label-style text-xs">Giá Người lớn *</label>
                                         <input type="number" placeholder="Giá NL" value={item.adult_price} onChange={(e) => handleDepartureChange(index, 'adult_price', e.target.value)} className="input-style" required min="1" step="1000" />
                                     </div>
                                      <div className="sm:col-span-1">
                                        <label className="label-style text-xs">Giá Trẻ em</label>
                                         <input type="number" placeholder="Giá TE" value={item.child_price} onChange={(e) => handleDepartureChange(index, 'child_price', e.target.value)} className="input-style" min="0" step="1000" />
                                     </div>
                                     <div className="sm:col-span-1 flex justify-end">
                                        <button type="button" onClick={() => removeDepartureItem(index)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa ngày khởi hành"><Minus size={16} /></button>
                                     </div>
                                 </motion.div>
                             ))}
                             </AnimatePresence>
                             <button type="button" onClick={addDepartureItem} className="mt-2 button-secondary text-xs flex items-center gap-1"><CalendarPlus size={14} weight="bold"/> Thêm ngày khởi hành</button>
                        </motion.div>
                    </div>
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={loading} className="modal-button-primary flex items-center justify-center gap-1.5 min-w-[140px]"> {/* <<< Thêm min-width */}
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : (tour.is_published ? <PencilLine size={18} /> : <UploadSimple size={18} />) }
                            {tour.is_published ? 'Lưu thay đổi' : 'Hoàn tất & Đăng'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// --- Component chính: Quản lý Sản phẩm (Tour) ---
export default function AdminManageProducts() {
    // ... (States giữ nguyên) ...
     const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [modalTour, setModalTour] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // --- (FIXED) Fetch data ---
    const fetchProducts = useCallback(async (isInitialLoad = false) => {
        // ... (Logic fetch giữ nguyên, đảm bảo comment đã xóa) ...
          if (!isInitialLoad) setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE; const to = from + ITEMS_PER_PAGE - 1;
            const selectQuery = `
                id, name, price, location, duration, supplier_id,
                approval_status, is_published, created_at,
                description, itinerary, departures, departure_months,
                supplier:Suppliers(id, name)
            `;
            let query = supabase.from("Products").select(selectQuery, { count: 'exact' })
                            .eq('product_type', 'tour');

            if (debouncedSearch.trim() !== "") { /* ... search logic ... */ }
            query = query.order('approval_status', { ascending: true })
                         .order('is_published', { ascending: true })
                         .order("created_at", { ascending: false })
                         .range(from, to);

            const { data, count, error: fetchError } = await query;
            if (fetchError) { /* ... error handling ... */ throw fetchError; }

            const processedData = data?.map(p => ({ ...p, supplier_name: p.supplier?.name })) || [];
            setProducts(processedData);
            setTotalItems(count || 0);

            if (isInitialLoad && suppliers.length === 0) { /* ... fetch suppliers ... */ }
            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) { setCurrentPage(1); }
        } catch (err) { /* ... error handling ... */ }
        finally { /* ... reset loading ... */ }
    }, [currentPage, debouncedSearch, suppliers.length]);

    // --- UseEffects (Giữ nguyên) ---
    useEffect(() => { /* Trigger fetch */ }, [fetchProducts, products.length, loading]);
    useEffect(() => { /* Reset page */ }, [debouncedSearch]);

    // --- (UPGRADED) Event Handlers ---
    const handleSetStatus = (id, currentStatus, newStatus) => {
        const actionText = newStatus === 'approved' ? 'Duyệt' : (newStatus === 'rejected' ? 'Từ chối' : 'Đặt lại chờ');
        const confirmMsg = newStatus === 'approved'
            ? `Duyệt tour này? (Cần thêm bước 'Sửa & Đăng')`
            : `${actionText} tour này?`;
        const iconColor = newStatus === 'approved' ? 'text-green-500' : (newStatus === 'rejected' ? 'text-red-500' : 'text-yellow-500');

        toast((t) => (
            <span>
                {confirmMsg}
               <button
                className={`ml-3 px-3 py-1 ${newStatus === 'approved' ? 'bg-green-500' : (newStatus === 'rejected' ? 'bg-red-500' : 'bg-yellow-500')} text-white rounded text-sm font-semibold hover:bg-opacity-80`}
                onClick={async () => {
                    toast.dismiss(t.id);
                    setIsFetchingPage(true);
                    const updateData = { approval_status: newStatus, is_published: false };
                    const { error: updateError } = await supabase.from("Products").update(updateData).eq("id", id);
                    setIsFetchingPage(false);
                    if (updateError) { toast.error("Lỗi: " + updateError.message); }
                    else { toast.success(`Đã ${actionText} tour!`); fetchProducts(false); }
                }}
              > Xác nhận </button>
              <button className="ml-2 modal-button-secondary text-sm" onClick={() => toast.dismiss(t.id)}> Hủy </button>
            </span>
          ), { icon: <WarningCircle size={20} className={iconColor}/>, duration: 6000 });
    };

    const handleDelete = (tour) => {
         toast((t) => (
            <div className="flex flex-col items-center p-1">
                 <span className="text-center">
                    Xóa vĩnh viễn tour <b>{tour.name}</b>?<br/>
                    <span className="text-xs text-orange-600">Hành động này không thể hoàn tác.</span>
                </span>
               <div className="mt-3 flex gap-2">
                 <button
                    className="modal-button-danger text-sm"
                    onClick={async () => {
                        toast.dismiss(t.id);
                        setIsFetchingPage(true);
                        const { error: deleteError } = await supabase.from("Products").delete().eq("id", tour.id);
                        setIsFetchingPage(false);
                        if (deleteError) { toast.error("Lỗi xóa: " + deleteError.message); }
                        else { toast.success("Đã xóa tour."); fetchProducts(false); }
                    }}
                  > Xác nhận Xóa </button>
                  <button className="modal-button-secondary text-sm" onClick={() => toast.dismiss(t.id)}> Hủy </button>
               </div>
            </div>
          ), { icon: <WarningCircle size={24} className="text-red-500"/>, duration: 8000 });
    };

    // --- Pagination Window (Giữ nguyên) ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     // --- Loading ban đầu (Giữ nguyên) ---
     if (loading && products.length === 0) { /* ... */ }

    // --- JSX (Nâng cấp UI) ---
    return (
        <motion.div // <<< Thêm motion div cho hiệu ứng fade-in trang
            className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header + Search + Refresh */}
             <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Package weight="duotone" className="text-sky-600" size={30} /> {/* <<< Tăng size icon */}
                    Quản lý Sản phẩm Tour
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                     <div className="relative w-full sm:w-64">
                         <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                         <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên tour, NCC..." className="search-input"/>
                     </div>
                     <button onClick={() => fetchProducts(true)} disabled={loading || isFetchingPage} className={`button-secondary flex items-center gap-1.5 ${isFetchingPage ? 'opacity-50 cursor-wait' : ''}`}>
                         <ArrowsClockwise size={16} className={isFetchingPage ? "animate-spin" : ""} /> Làm mới {/* <<< Icon mới */}
                     </button>
                </div>
            </div>

             {/* Hiển thị lỗi fetch chính */}
             {error && !loading && ( /* ... */ )}

            {/* Bảng dữ liệu */}
             <motion.div // <<< Thêm motion div cho bảng
                 className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
            >
                <div className="overflow-x-auto relative">
                    {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th className="th-style w-2/5">Tên Tour</th> {/* <<< Điều chỉnh width */}
                                <th className="th-style w-1/5">Nhà Cung Cấp</th>
                                <th className="th-style w-[15%]">Trạng thái Duyệt</th>
                                <th className="th-style w-[15%]">Trạng thái Đăng</th>
                                <th className="th-style text-right w-[15%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                             {error && !isFetchingPage && ( <tr><td colSpan="5" className="td-center text-red-500">{`Lỗi: ${error.message}`}</td></tr> )}
                             {!error && !loading && !isFetchingPage && products.length === 0 && ( /* ... */ )}
                             {!error && products.map((product) => (
                                <motion.tr // <<< Thêm motion tr cho hiệu ứng khi load/thay đổi
                                    key={product.id}
                                    layout // Cho phép animation khi vị trí thay đổi
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <td className="td-style font-medium dark:text-white whitespace-normal">{product.name}</td> {/* <<< whitespace-normal cho tên dài */}
                                    <td className="td-style text-gray-600 dark:text-gray-300">
                                        {product.supplier ? (
                                            <Link to={`/admin/suppliers?search=${product.supplier.name}`} className="link-style hover:text-sky-500" title={`Xem NCC ${product.supplier.name}`}>
                                                <Buildings size={14} weight="duotone" className="inline mr-1 opacity-70"/> {/* <<< Icon NCC */}
                                                {product.supplier.name}
                                            </Link>
                                        ) : "N/A"}
                                    </td>
                                    <td className="td-style">
                                        {/* Badges */}
                                        {product.approval_status === 'approved' && <span className="badge-green"><CheckCircle size={12} weight="fill"/> Đã duyệt</span>}
                                        {product.approval_status === 'pending' && <span className="badge-yellow"><CircleNotch size={12} className="animate-spin"/> Chờ duyệt</span>}
                                        {product.approval_status === 'rejected' && <span className="badge-red"><XCircle size={12} weight="fill"/> Bị từ chối</span>}
                                    </td>
                                    <td className="td-style">
                                        {product.is_published ? <span className="badge-blue"><UploadSimple size={12} weight="fill"/> Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>}
                                    </td>
                                    <td className="td-style text-right space-x-1">
                                        {/* Buttons Actions */}
                                        {product.approval_status === 'pending' && ( /* ... */ )}
                                        {product.approval_status === 'approved' && !product.is_published && ( /* ... */ )}
                                        {product.approval_status === 'approved' && product.is_published && ( /* ... */ )}
                                        {(product.approval_status === 'approved' || product.approval_status === 'rejected') && ( /* ... */ )}
                                        <button onClick={() => handleDelete(product)} disabled={isFetchingPage} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa vĩnh viễn tour"> <Trash size={16}/> </button>
                                    </td>
                                </motion.tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination UI */}
             {!loading && totalItems > ITEMS_PER_PAGE && (
                  <motion.div // <<< Thêm motion div cho phân trang
                      className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                  >
                      {/* ... Nội dung phân trang ... */}
                  </motion.div>
             )}

            {/* Modal Edit */}
            <AnimatePresence> {/* <<< Bọc modal bằng AnimatePresence */}
                {modalTour && (
                    <EditTourModal
                        tour={modalTour}
                        onClose={() => setModalTour(null)}
                        onSuccess={() => fetchProducts(false)}
                        suppliers={suppliers}
                    />
                )}
            </AnimatePresence>

            {/* CSS */}
            <style jsx>{`
                /* Các class dùng chung */
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm; } /* Bỏ whitespace-nowrap mặc định */
                .td-center { @apply px-6 py-10 text-center; }
                .badge-base { @apply px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300 italic; } /* <<< Sửa dark mode */
                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-green { @apply button-icon-base bg-green-500 hover:bg-green-600 text-white focus:ring-green-400; }
                .button-icon-red { @apply button-icon-base bg-red-500 hover:bg-red-600 text-white focus:ring-red-400; }
                .button-icon-sky { @apply button-icon-base bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400; }
                .button-icon-gray { @apply button-icon-base bg-gray-400 hover:bg-gray-500 text-white focus:ring-gray-300; }
                .button-blue { @apply px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .link-style { @apply inline-flex items-center gap-1 hover:underline; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                 /* Modal Styles */
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                 .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50 transition-colors; }
                 .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }

            `}</style>
        </motion.div>
    );
}
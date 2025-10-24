// src/pages/AdminManageProducts.jsx
// (Pagination + Chỉ quản lý Tour - Code đầy đủ)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaSpinner, FaCheck, FaTimes, FaEdit, FaTrash, FaRegSave, FaPlus, FaMinus, FaSyncAlt } from "react-icons/fa";
import { CheckSquare, Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass } from "@phosphor-icons/react";

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
  // Nếu tổng số trang ít, hiển thị tất cả
  if (totalPages <= 5 + width * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();
  pages.add(1); // Luôn thêm trang 1

  // Thêm các trang xung quanh trang hiện tại
  // Đảm bảo không trùng lặp và nằm trong khoảng [1, totalPages]
  for (let i = Math.max(2, currentPage - width); i <= Math.min(totalPages - 1, currentPage + width); i++) {
     pages.add(i);
  }

  pages.add(totalPages); // Luôn thêm trang cuối

  const sortedPages = [...pages].sort((a, b) => a - b);
  const finalPages = [];

  // Thêm "..." vào các khoảng trống
  let lastPage = 0;
  for (const page of sortedPages) {
    if (lastPage !== 0 && page - lastPage > 1) {
      // Chỉ thêm "..." nếu khoảng cách > 1
      finalPages.push("...");
    }
    finalPages.push(page);
    lastPage = page;
  }
  return finalPages;
};


// --- Modal Chỉnh sửa Tour ---
const EditTourModal = ({ tour, onClose, onSuccess, suppliers }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', price: 0, location: '', duration: '',
        supplier_id: '', itinerary: [], departure_months: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load data từ tour prop
        setFormData({
            name: tour.name || '',
            description: tour.description || '',
            price: tour.price || 0,
            location: tour.location || '',
            duration: tour.duration || '',
            supplier_id: tour.supplier_id || '',
            itinerary: Array.isArray(tour.itinerary)
                ? tour.itinerary.map((item, index) => (typeof item === 'string'
                    ? { title: `Ngày ${index + 1}`, content: item }
                    : { title: item.title || `Ngày ${index + 1}`, content: item.content || item } // Handle object format
                )) : [],
            // Đảm bảo departure_months là array chứa object {month: string, prices: object}
            departure_months: Array.isArray(tour.departure_months)
                 ? tour.departure_months.map(item => ({
                     month: typeof item === 'string' ? item : item?.month || '', // Handle old string format or object
                     prices: item?.prices || { adult: 0, child: 0 } // Default prices if missing
                 }))
                 : [],
        });
    }, [tour]);

    // Các hàm handleChange, handleItineraryChange, add/remove item...
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };
    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index] = { ...newItinerary[index], [field]: value }; // Correct update for object
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };
    const addItineraryItem = () => {
        setFormData(prev => ({ ...prev, itinerary: [...prev.itinerary, { title: `Ngày ${prev.itinerary.length + 1}`, content: '' }] }));
    };
    const removeItineraryItem = (index) => {
        setFormData(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== index) }));
    };
    const handleMonthChange = (index, value) => {
         const newMonths = [...formData.departure_months];
         newMonths[index] = { ...newMonths[index], month: value }; // Update month property
         setFormData(prev => ({ ...prev, departure_months: newMonths }));
    };
    const addMonthItem = () => {
        setFormData(prev => ({ ...prev, departure_months: [...prev.departure_months, { month: '', prices: { adult: 0, child: 0 } }] }));
    };
     const removeMonthItem = (index) => {
        setFormData(prev => ({ ...prev, departure_months: prev.departure_months.filter((_, i) => i !== index) }));
    };

    // Hàm Submit (Lưu & Đăng)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToUpdate = {
            ...formData,
            price: parseFloat(formData.price),
            is_published: true, // <<< Đăng tour
            approval_status: 'approved' // Đảm bảo vẫn approved
        };
        if (!dataToUpdate.name || dataToUpdate.price <= 0 || !dataToUpdate.supplier_id) {
            toast.error("Vui lòng điền Tên tour, Giá (>0), và chọn NCC."); setLoading(false); return;
        }
        const { error } = await supabase.from("Products").update(dataToUpdate).eq("id", tour.id);
        if (error) { toast.error("Lỗi cập nhật: " + error.message); }
        else { toast.success("Đã lưu và đăng tour thành công!"); onSuccess(); onClose(); }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white">Chỉnh sửa & Đăng Tour</h3>
                    <button onClick={onClose} disabled={loading} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-y-auto p-6 space-y-4">
                        {/* Thông tin cơ bản */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> <label className="label-style">Tên Tour *</label> <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" /> </div>
                            <div> <label className="label-style">Giá (chính) *</label> <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1000" className="input-style" /> </div>
                            <div> <label className="label-style">Địa điểm</label> <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" /> </div>
                            <div> <label className="label-style">Thời lượng</label> <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" /> </div>
                            <div>
                                <label className="label-style">Nhà cung cấp *</label>
                                <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style">
                                    <option value="" disabled>-- Chọn NCC --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div> <label className="label-style">Mô tả</label> <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="input-style"></textarea> </div>

                        {/* Quản lý Lịch trình */}
                        <div className="border-t pt-4 dark:border-neutral-700">
                            <h4 className="text-lg font-semibold mb-2 dark:text-white">Lịch trình chi tiết</h4>
                            {formData.itinerary.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 p-3 border rounded-md dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700/50">
                                    <input type="text" placeholder="Tiêu đề (VD: Ngày 1)" value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} className="input-style sm:w-1/3" />
                                    <textarea placeholder="Nội dung hoạt động..." value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} rows="2" className="input-style flex-1 resize-y sm:resize-none"></textarea>
                                    <button type="button" onClick={() => removeItineraryItem(index)} className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 self-center sm:self-auto" title="Xóa ngày"><FaMinus /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addItineraryItem} className="mt-1 text-sm text-sky-600 flex items-center gap-1 hover:underline"><FaPlus /> Thêm ngày</button>
                        </div>

                        {/* Quản lý Tháng khởi hành */}
                         <div className="border-t pt-4 dark:border-neutral-700">
                             <h4 className="text-lg font-semibold mb-2 dark:text-white">Tháng khởi hành (Đơn giản)</h4>
                             {formData.departure_months.map((item, index) => (
                                 <div key={index} className="flex gap-2 mb-2 items-center p-2 border rounded-md dark:border-neutral-600">
                                    <input type="text" placeholder="Tháng (VD: Tháng 10)" value={item.month} onChange={(e) => handleMonthChange(index, e.target.value)} className="input-style flex-1" />
                                    <button type="button" onClick={() => removeMonthItem(index)} className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa tháng"><FaMinus /></button>
                                 </div>
                             ))}
                              <button type="button" onClick={addMonthItem} className="mt-1 text-sm text-sky-600 flex items-center gap-1 hover:underline"><FaPlus /> Thêm tháng</button>
                         </div>
                    </div>
                    {/* Footer Modal */}
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={loading} className="modal-button-primary flex items-center gap-1.5"> {/* <<< Đổi class nút Lưu */}
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : <FaRegSave />}
                            Lưu & Đăng tour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Component chính: Quản lý Sản phẩm (Tour) ---
export default function AdminManageProducts() {
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

    // --- Fetch data ---
    const fetchProducts = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE; const to = from + ITEMS_PER_PAGE - 1;
            let query = supabase.from("Products").select(`*, supplier_name:Suppliers(name)`, { count: 'exact' }).eq('product_type', 'tour');
            if (debouncedSearch.trim() !== "") {
                const searchTermLike = `%${debouncedSearch.trim()}%`;
                query = query.or(`name.ilike.${searchTermLike},supplier_name.name.ilike.${searchTermLike}`);
            }
            query = query.order('approval_status', { ascending: true }).order('is_published', { ascending: true }).order("created_at", { ascending: false }).range(from, to);
            const { data, count, error: fetchError } = await query; if (fetchError) throw fetchError;
            setProducts(data || []); setTotalItems(count || 0);
            if (isInitialLoad && suppliers.length === 0) { const { data: sData } = await supabase.from("Suppliers").select("id, name"); if (sData) setSuppliers(sData); }
            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) { setCurrentPage(1); }
        } catch (err) { console.error("Lỗi tải tour:", err); setError("Lỗi tải danh sách tour."); toast.error("Lỗi tải danh sách tour."); setProducts([]); setTotalItems(0); }
        finally { if (isInitialLoad) setLoading(false); setIsFetchingPage(false); }
    }, [currentPage, debouncedSearch, suppliers.length]); // <<< Dependencies

    // --- Trigger fetch ---
    useEffect(() => { const isInitial = products.length === 0 && loading; fetchProducts(isInitial); }, [fetchProducts, products.length, loading]);

    // --- Reset page on search ---
    useEffect(() => { if (currentPage !== 1) { setCurrentPage(1); } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    // --- Event Handlers ---
    const handleSetStatus = async (id, currentStatus, newStatus) => {
        const actionText = newStatus === 'approved' ? 'Duyệt' : (newStatus === 'rejected' ? 'Từ chối' : 'Đặt lại chờ');
        if (!window.confirm(`Bạn chắc muốn ${actionText} tour này?`)) return;
        setIsFetchingPage(true);
        const { error } = await supabase.from("Products").update({ approval_status: newStatus, is_published: newStatus !== 'approved' ? false : undefined }).eq("id", id);
        setIsFetchingPage(false);
        if (error) { toast.error("Lỗi: " + error.message); }
        else { toast.success(`Đã ${actionText} tour!`); fetchProducts(false); }
    };
    const handleDelete = async (tour) => {
         if (!window.confirm(`XÓA VĨNH VIỄN tour "${tour.name}"?`)) return;
         setIsFetchingPage(true);
         const { error } = await supabase.from("Products").delete().eq("id", tour.id);
         setIsFetchingPage(false);
         if (error) { toast.error("Lỗi xóa: " + error.message); }
         else { toast.success("Đã xóa tour."); fetchProducts(false); }
    };

    // --- Pagination Window ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     // --- Loading ban đầu ---
     if (loading) { return ( <div className="flex justify-center items-center h-[calc(100vh-150px)]"> <FaSpinner className="animate-spin text-4xl text-sky-500" /> </div> ); }

    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header + Search + Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Package weight="duotone" className="text-sky-600" size={28} />
                    Quản lý Sản phẩm Tour
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                     <div className="relative w-full sm:w-64">
                        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên tour, NCC..." className="search-input"/>
                    </div>
                     <button onClick={() => fetchProducts(true)} disabled={loading || isFetchingPage} className={`button-secondary flex items-center gap-2 flex-shrink-0 ${isFetchingPage ? 'opacity-50 cursor-not-allowed' : ''}`}> <FaSyncAlt className={isFetchingPage ? "animate-spin" : ""} /> Làm mới </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && ( <div className="loading-overlay"> <FaSpinner className="animate-spin text-sky-500 text-3xl" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="th-style">Tên Tour</th>
                                <th className="th-style">NCC</th>
                                <th className="th-style">Duyệt</th>
                                <th className="th-style">Đăng</th>
                                <th className="th-style text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                             {error && !isFetchingPage && ( <tr><td colSpan="5" className="td-center text-red-500">{error}</td></tr> )}
                             {!error && loading && products.length === 0 && ( <tr><td colSpan="5" className="td-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr> )}
                             {!error && !loading && !isFetchingPage && products.length === 0 && ( <tr><td colSpan="5" className="td-center text-gray-500 italic">{debouncedSearch ? "Không tìm thấy tour." : "Chưa có tour."}</td></tr> )}
                             {!error && products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="td-style font-medium dark:text-white">{product.name}</td>
                                    <td className="td-style text-gray-600 dark:text-gray-300">{product.supplier_name?.name || "N/A"}</td>
                                    <td className="td-style">
                                        {product.approval_status === 'approved' && <span className="badge-green">Đã duyệt</span>}
                                        {product.approval_status === 'pending' && <span className="badge-yellow">Chờ duyệt</span>}
                                        {product.approval_status === 'rejected' && <span className="badge-red">Bị từ chối</span>}
                                    </td>
                                    <td className="td-style">
                                        {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>}
                                    </td>
                                    <td className="td-style text-right space-x-1"> {/* Giảm space */}
                                        {product.approval_status === 'pending' && (
                                            <>
                                                <button onClick={() => handleSetStatus(product.id, product.approval_status, 'approved')} disabled={isFetchingPage} className="button-icon-green" title="Duyệt"><FaCheck size={14}/></button>
                                                <button onClick={() => handleSetStatus(product.id, product.approval_status, 'rejected')} disabled={isFetchingPage} className="button-icon-red" title="Từ chối"><FaTimes size={14}/></button>
                                            </>
                                        )}
                                        {product.approval_status === 'approved' && !product.is_published && (
                                            <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-blue text-xs"> Sửa & Đăng </button>
                                        )}
                                        {product.approval_status === 'approved' && product.is_published && (
                                            <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-icon-sky" title="Sửa lại"> <FaEdit size={14}/> </button>
                                        )}
                                        {product.approval_status === 'rejected' && (
                                             <button onClick={() => handleSetStatus(product.id, product.approval_status, 'pending')} disabled={isFetchingPage} className="button-icon-gray" title="Đặt lại chờ"> ↩️ </button>
                                        )}
                                        <button onClick={() => handleDelete(product)} disabled={isFetchingPage} className="button-icon-red" title="Xóa"> <FaTrash size={14}/> </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI */}
            {!loading && totalItems > ITEMS_PER_PAGE && (
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                    <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> tours </div>
                    <div className="flex items-center gap-1 mt-3 sm:mt-0">
                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
                        {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
                            <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} disabled={isFetchingPage} className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}>{pageNumber}</button>
                        ))}
                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {modalTour && ( <EditTourModal tour={modalTour} onClose={() => setModalTour(null)} onSuccess={() => fetchProducts(false)} suppliers={suppliers} /> )}

            {/* CSS */}
            <style jsx>{`
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; } /* Added disabled */
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm whitespace-nowrap; }
                .td-center { @apply px-6 py-10 text-center; }
                .badge-base { @apply px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
                .button-icon-base { @apply p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; } /* Added disabled */
                .button-icon-green { @apply button-icon-base bg-green-500 hover:bg-green-600 text-white focus:ring-green-400; }
                .button-icon-red { @apply button-icon-base bg-red-500 hover:bg-red-600 text-white focus:ring-red-400; }
                .button-icon-sky { @apply button-icon-base bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400; }
                .button-icon-gray { @apply button-icon-base bg-gray-400 hover:bg-gray-500 text-white focus:ring-gray-300; }
                .button-blue { @apply px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; } /* Added disabled */
                .button-secondary { @apply bg-slate-600 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; } /* Style nút phụ */
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                /* Modal Styles */
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50; } /* Nút Lưu/Đăng */
            `}</style>
        </div>
    );
}
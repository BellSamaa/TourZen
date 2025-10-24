// src/pages/AdminManageProducts.jsx
// (Chỉ quản lý Tour + Quy trình Chỉnh sửa & Đăng)

import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    FaSpinner, FaCheck, FaTimes, FaEdit, FaTrash, FaRegSave, FaPlus, FaMinus // <<< Icons cần thiết
} from "react-icons/fa";
import { CheckSquare, Package } from "@phosphor-icons/react"; // <<< Thêm Package

const supabase = getSupabase();

// --- Modal Chỉnh sửa Tour ---
// (Component EditTourModal code đầy đủ như đã cung cấp trước đó)
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
                    : { title: item.title || `Ngày ${index + 1}`, content: item.content || item }
                )) : [],
            departure_months: Array.isArray(tour.departure_months) ? tour.departure_months : [],
        });
    }, [tour]);

    // Các hàm handleChange, handleItineraryChange, add/remove item...
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };
    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index][field] = value;
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };
    const addItineraryItem = () => {
        setFormData(prev => ({ ...prev, itinerary: [...prev.itinerary, { title: `Ngày ${prev.itinerary.length + 1}`, content: '' }] }));
    };
    const removeItineraryItem = (index) => {
        setFormData(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== index) }));
    };
    // Tương tự cho departure_months (phiên bản đơn giản)
    const handleMonthChange = (index, value) => {
         const newMonths = [...formData.departure_months];
         newMonths[index] = { ...newMonths[index], month: value };
         setFormData(prev => ({ ...prev, departure_months: newMonths }));
    };
    const addMonthItem = () => {
        setFormData(prev => ({ ...prev, departure_months: [...prev.departure_months, { month: '', prices: { adult: 0, child: 0 } }] }));
    };
     const removeMonthItem = (index) => { // <<< Thêm hàm xóa tháng
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

        // --- Validate ---
        if (!dataToUpdate.name || dataToUpdate.price <= 0 || !dataToUpdate.supplier_id) {
            toast.error("Vui lòng điền Tên tour, Giá (>0), và chọn Nhà cung cấp.");
            setLoading(false);
            return;
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
                    <button onClick={onClose} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    {/* Nội dung cuộn */}
                    <div className="overflow-y-auto p-6 space-y-4">
                        {/* Thông tin cơ bản */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên Tour *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Giá (chính) *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" className="input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Địa điểm</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Thời lượng</label>
                                <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Nhà cung cấp *</label>
                                <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style">
                                    <option value="" disabled>-- Chọn NCC --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-neutral-300">Mô tả</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="input-style"></textarea>
                        </div>

                        {/* Quản lý Lịch trình */}
                        <div className="border-t pt-4 dark:border-neutral-700">
                            <h4 className="text-lg font-semibold mb-2 dark:text-white">Lịch trình chi tiết</h4>
                            {formData.itinerary.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 p-3 border rounded-md dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700/50">
                                    <input type="text" placeholder="Tiêu đề (VD: Ngày 1)" value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} className="input-style sm:w-1/3" />
                                    <textarea placeholder="Nội dung hoạt động..." value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} rows="2" className="input-style flex-1 resize-none"></textarea> {/* <<< resize-none */}
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
                                    {/* Có thể thêm input cho giá ở đây nếu cần */}
                                    <button type="button" onClick={() => removeMonthItem(index)} className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa tháng"><FaMinus /></button>
                                 </div>
                             ))}
                              <button type="button" onClick={addMonthItem} className="mt-1 text-sm text-sky-600 flex items-center gap-1 hover:underline"><FaPlus /> Thêm tháng</button>
                         </div>
                    </div>

                    {/* Footer Modal */}
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 text-sm">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm">
                            {loading ? <FaSpinner className="animate-spin" /> : <FaRegSave />}
                            Lưu & Đăng tour
                        </button>
                    </div>
                </form>
                 {/* CSS cho input */}
                 <style jsx>{` .input-style { /* ... code CSS input ... */ } `}</style>
            </div>
        </div>
    );
};


// --- Component chính: Quản lý Sản phẩm (Tour) ---
export default function AdminManageProducts() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]); // Cần cho Modal
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalTour, setModalTour] = useState(null); // Tour đang được sửa

    // --- (CẬP NHẬT) Fetch data + Pagination ---
    const ITEMS_PER_PAGE = 10; // Số tour mỗi trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    const fetchProducts = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            // <<< Chỉ lấy tour >>>
            const { data, error: fetchError, count } = await supabase
                .from("Products")
                // Lấy tất cả cột cần thiết cho Modal + tên NCC
                .select(`*, supplier_name:Suppliers(name)`, { count: 'exact' })
                .eq('product_type', 'tour') // <<< CHỈ LẤY TOUR
                // Ưu tiên hiển thị pending và chưa published
                .order('approval_status', { ascending: true }) // pending -> approved/rejected
                .order('is_published', { ascending: true })    // false -> true
                .order("created_at", { ascending: false })
                .range(from, to); // <<< Phân trang

            if (fetchError) throw fetchError;
            setProducts(data || []);
            setTotalItems(count || 0);

            // Lấy suppliers cho modal (chỉ cần lấy 1 lần)
            if (suppliers.length === 0) {
                 const { data: supplierData } = await supabase.from("Suppliers").select("id, name");
                 if (supplierData) setSuppliers(supplierData);
            }
             // Tự về trang 1 nếu trang hiện tại trống
            if (data.length === 0 && count > 0 && currentPage > 1) {
                setCurrentPage(1);
            }

        } catch (err) {
            setError("Lỗi tải danh sách tour: " + err.message);
            toast.error("Lỗi tải danh sách tour.");
        } finally {
            if (showLoading) setLoading(false);
        }
    // <<< Dependencies: Chỉ currentPage >>>
    }, [currentPage, suppliers.length]); // Thêm suppliers.length để chỉ fetch suppliers 1 lần

    // Fetch khi trang thay đổi
    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // --- Hàm xử lý trạng thái Duyệt/Từ chối ---
    const handleSetStatus = async (id, status) => {
        const actionText = status === 'approved' ? 'Duyệt' : (status === 'rejected' ? 'Từ chối' : 'Đặt lại chờ');
        if (!window.confirm(`Bạn có chắc muốn ${actionText} tour này?`)) return;

        // Optimistic UI (tùy chọn)
        const originalStatus = products.find(p => p.id === id)?.approval_status;
        setProducts(prev => prev.map(p => p.id === id ? { ...p, approval_status: status, is_published: status !== 'approved' ? false : p.is_published } : p)); // Nếu reject hoặc pending lại thì bỏ publish

        const { error } = await supabase
            .from("Products")
            // Nếu duyệt thì giữ nguyên is_published, nếu reject/pending thì set is_published = false
            .update({ approval_status: status, is_published: status !== 'approved' ? false : undefined })
            .eq("id", id);

        if (error) {
            toast.error("Lỗi: " + error.message);
            // Rollback UI
             setProducts(prev => prev.map(p => p.id === id ? { ...p, approval_status: originalStatus, is_published: originalStatus === 'approved' ? p.is_published : false } : p));
        } else {
            toast.success(`Đã ${actionText} tour!`);
            // Fetch lại nếu muốn chắc chắn
            // fetchProducts(false);
        }
    };

    // --- Hàm Xóa Tour ---
    const handleDelete = async (tour) => {
         if (!window.confirm(`XÓA VĨNH VIỄN tour "${tour.name}"? Hành động này không thể hoàn tác.`)) return;

         // Hiển thị loading (có thể thêm state riêng cho việc xóa)
         toast.loading('Đang xóa tour...');

         const { error } = await supabase.from("Products").delete().eq("id", tour.id);

         toast.dismiss(); // Tắt loading toast

         if (error) {
             toast.error("Lỗi xóa: " + error.message);
         } else {
             toast.success("Đã xóa tour.");
             fetchProducts(false); // Fetch lại danh sách sau khi xóa thành công
         }
    };

     // --- Pagination controls (Tạo component riêng hoặc để trực tiếp) ---
     const paginationWindow = useMemo(
        () => getPaginationWindow(currentPage, totalPages, 2),
        [currentPage, totalPages]
    );


    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white"> {/* <<< Thêm dark mode */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Package weight="duotone" className="text-sky-600" size={28} /> {/* <<< Đổi icon */}
                    Quản lý Sản phẩm Tour
                </h1>
                 <button
                    onClick={() => fetchProducts(true)}
                    className={`flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    <FaSyncAlt className={loading ? "animate-spin" : ""} />
                    Làm mới
                </button>
            </div>

            {/* Chỉ hiện loading xoay tròn khi chưa có data */}
            {loading && products.length === 0 ? (
                <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-sky-500" /></div>
            ) : error ? (
                <div className="text-red-500 text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">{error}</div>
            ) : (
                <> {/* <<< Dùng Fragment để bọc bảng và pagination */}
                    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                        <div className="overflow-x-auto relative"> {/* Thêm relative */}
                             {/* Loading overlay khi chuyển trang */}
                            {loading && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center z-10">
                                    <FaSpinner className="animate-spin text-sky-500 text-3xl" />
                                </div>
                            )}
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Tên Tour</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nhà Cung Cấp</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Trạng thái Duyệt</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Trạng thái Đăng</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {products.length > 0 ? products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 text-sm font-medium dark:text-white whitespace-nowrap">{product.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{product.supplier_name?.name || "N/A"}</td>
                                            {/* Trạng thái Duyệt */}
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                {product.approval_status === 'approved' && <span className="badge-green">Đã duyệt</span>}
                                                {product.approval_status === 'pending' && <span className="badge-yellow">Chờ duyệt</span>}
                                                {product.approval_status === 'rejected' && <span className="badge-red">Bị từ chối</span>}
                                            </td>
                                            {/* Trạng thái Đăng */}
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                {product.is_published ? (
                                                    <span className="badge-blue">Đã đăng</span>
                                                ) : (
                                                    <span className="badge-gray">Chưa đăng</span>
                                                )}
                                            </td>
                                            {/* Nút Hành động */}
                                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                {/* 1. Nếu đang chờ (pending) */}
                                                {product.approval_status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleSetStatus(product.id, 'approved')} className="button-icon-green" title="Duyệt"><FaCheck/></button>
                                                        <button onClick={() => handleSetStatus(product.id, 'rejected')} className="button-icon-red" title="Từ chối"><FaTimes/></button>
                                                    </>
                                                )}
                                                {/* 2. Nếu đã duyệt (approved) nhưng chưa đăng */}
                                                {product.approval_status === 'approved' && !product.is_published && (
                                                    <button onClick={() => setModalTour(product)} className="button-blue"> Chỉnh sửa & Đăng </button>
                                                )}
                                                {/* 3. Nếu đã duyệt VÀ đã đăng */}
                                                {product.approval_status === 'approved' && product.is_published && (
                                                    <button onClick={() => setModalTour(product)} className="button-icon-sky" title="Sửa lại"> <FaEdit /> </button>
                                                )}
                                                {/* 4. Nếu bị từ chối */}
                                                {product.approval_status === 'rejected' && (
                                                     <button onClick={() => handleSetStatus(product.id, 'pending')} className="button-icon-gray" title="Đặt lại chờ duyệt"> ↩️ </button>
                                                )}
                                                {/* Nút Xóa (luôn có) */}
                                                <button onClick={() => handleDelete(product)} className="button-icon-red" title="Xóa vĩnh viễn"> <FaTrash /> </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">Không có tour nào.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                     {/* --- Pagination UI --- */}
                    {!loading && totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                             <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> tours </div>
                             <div className="flex items-center gap-1 mt-3 sm:mt-0">
                                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
                                {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
                                    <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}>{pageNumber}</button>
                                ))}
                                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
                             </div>
                        </div>
                    )}
                </>
            )}

            {/* Render Modal */}
            {modalTour && (
                <EditTourModal
                    tour={modalTour}
                    onClose={() => setModalTour(null)}
                    onSuccess={() => fetchProducts(false)} // Fetch lại không loading
                    suppliers={suppliers}
                />
            )}

            {/* --- CSS cho Badges & Buttons --- */}
            <style jsx>{`
                .badge-base { @apply px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }

                .button-icon-base { @apply p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50; }
                .button-icon-green { @apply button-icon-base bg-green-500 hover:bg-green-600 text-white focus:ring-green-400; }
                .button-icon-red { @apply button-icon-base bg-red-500 hover:bg-red-600 text-white focus:ring-red-400; }
                .button-icon-sky { @apply button-icon-base bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400; }
                 .button-icon-gray { @apply button-icon-base bg-gray-400 hover:bg-gray-500 text-white focus:ring-gray-300; }

                .button-blue { @apply px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800; }

                 .input-style { /* ... code CSS input ... */ }

                 .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                 .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700; }
                 .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                 .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }

            `}</style>
             {/* --- CSS cho input style (dán vào đây) --- */}
            <style jsx>{` .input-style { /* ... */ } .dark .input-style { /* ... */ } .input-style:focus { /* ... */ } .input-style::placeholder { /* ... */ } `}</style>

        </div>
    );
}

// --- Helper Pagination Window (Dán code vào đây) ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => { /* ... code ... */ };
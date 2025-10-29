// src/pages/AdminManageProducts.jsx
// (V4: Tập trung Duyệt Tour & Đặt Giá Bán cho Admin)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass,
    PencilLine, WarningCircle, CheckCircle, Clock, XCircle, Ticket, Triangle,
    FloppyDisk, Info, CloudArrowUp, Minus, Plus, ToggleLeft, ToggleRight,
    Image, ArrowClockwise, List, GridFour, CurrencyDollar // Thêm icons cần thiết
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

const supabase = getSupabase();

// --- Hook Debounce ---
const useDebounce = (value, delay) => { /* ... */ };

// --- Helper Pagination Window ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => { /* ... */ };

// --- Helper Format Currency ---
const formatCurrency = (num) => { /* ... */ };

// --- Component Trạng thái Phê duyệt ---
const ApprovalStatus = ({ status }) => { /* ... */ };

// --- Component Tóm tắt Slot ---
const SlotSummary = ({ departures }) => { /* ... */ };

// --- Component con DeparturesManager (Phiên bản ReadOnly cho Admin) ---
// (Component này sẽ hiển thị thông tin slot nhưng không cho phép sửa đổi)
const DeparturesManagerReadOnly = ({ tourId }) => {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDepartures = useCallback(async () => { /* ... (fetch logic giống bản NCC) ... */ }, [tourId]);
    useEffect(() => { fetchDepartures(); }, [fetchDepartures]);

    return (
        <div className="border-t pt-4 dark:border-neutral-700">
             <h4 className="text-lg font-semibold dark:text-white mb-2">Lịch khởi hành & Slots (Do NCC quản lý)</h4>
             {loading && <div className="flex justify-center p-4"><CircleNotch size={24} className="animate-spin text-sky-500" /></div>}
             {error && <div className="text-red-500 p-4 text-center">{error}</div>}
             {!loading && !error && (
                 <div className="overflow-x-auto max-h-[250px] overflow-y-auto border dark:border-neutral-600 rounded-md bg-gray-50 dark:bg-neutral-700/30">
                     <table className="min-w-full text-sm">
                         <thead className="bg-gray-100 dark:bg-neutral-700 sticky top-0">
                             <tr>
                                 <th className="px-3 py-2 text-left">Ngày đi</th>
                                 <th className="px-3 py-2 text-left">Giá Lớn (NCC)</th>
                                 <th className="px-3 py-2 text-left">Giá Trẻ (NCC)</th>
                                 <th className="px-3 py-2 text-left">Slots</th>
                                 <th className="px-3 py-2 text-left">Đã đặt</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y dark:divide-neutral-600">
                             {departures.map(dep => (
                                 <tr key={dep.id} className="opacity-80"> {/* Giảm độ mờ để biết là read-only */}
                                     <td className="px-3 py-2">{dep.departure_date}</td>
                                     <td className="px-3 py-2">{formatCurrency(dep.adult_price)}</td>
                                     <td className="px-3 py-2">{formatCurrency(dep.child_price)}</td>
                                     <td className="px-3 py-2 font-medium">{dep.max_slots || 0}</td>
                                     <td className="px-3 py-2 font-medium">{dep.booked_slots || 0}</td>
                                 </tr>
                             ))}
                              {departures.length === 0 && (
                                 <tr><td colSpan="5" className="p-4 text-center text-gray-500 italic">Chưa có lịch khởi hành.</td></tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             )}
             <p className="text-xs text-gray-500 mt-1 italic">* Admin không chỉnh sửa Lịch khởi hành/Slots.</p>
        </div>
    );
};


// ====================================================================
// --- Modal Chỉnh sửa Tour (PHIÊN BẢN ADMIN) ---
// ====================================================================
const EditTourModalAdmin = ({ tour, onClose, onSuccess, suppliers }) => {
    const [formData, setFormData] = useState({
        name: '', description: '',
        // Giá NCC (Chỉ đọc)
        supplier_price_adult: 0, supplier_price_child: 0, supplier_price_infant: 0,
        // Giá Bán Admin (Có thể sửa)
        selling_price_adult: 0, selling_price_child: 0, selling_price_elder: 0,
        location: '', duration: '', supplier_id: '', image_url: '', tour_code: '',
        itinerary: [{ title: 'Ngày 1', content: '' }],
    });

    const [isPublished, setIsPublished] = useState(false); // Admin kiểm soát đăng/ẩn
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (tour) {
            setFormData({
                name: tour.name || '', description: tour.description || '',
                // Giá NCC từ DB (có thể là tên cũ price, child_price...)
                supplier_price_adult: tour.supplier_price_adult || tour.price || 0,
                supplier_price_child: tour.supplier_price_child || tour.child_price || 0,
                supplier_price_infant: tour.supplier_price_infant || tour.infant_price || 0,
                // Giá bán Admin từ DB
                selling_price_adult: tour.selling_price_adult || 0,
                selling_price_child: tour.selling_price_child || 0,
                selling_price_elder: tour.selling_price_elder || 0,
                location: tour.location || '', duration: tour.duration || '',
                supplier_id: tour.supplier_id || '',
                image_url: tour.image_url || '', tour_code: tour.tour_code || '',
                itinerary: Array.isArray(tour.itinerary) && tour.itinerary.length > 0
                    ? tour.itinerary.map((item, index) => ({
                          title: item.title || `Ngày ${index + 1}`,
                          content: item.content || (typeof item === 'string' ? item : '')
                      }))
                    : [{ title: 'Ngày 1', content: '' }],
            });
            setIsPublished(tour.is_published || false);
        }
    }, [tour]);

    // Handlers (Admin sửa thông tin + giá bán)
    const handleChange = (e) => { /* ... (giống modal NCC) ... */ };
    const handleItineraryChange = (index, field, value) => { /* ... (giống modal NCC) ... */ };
    const addItineraryItem = () => { /* ... (giống modal NCC) ... */ };
    const removeItineraryItem = (index) => { /* ... (giống modal NCC) ... */ };
    const handleImageUpload = async (e) => { /* ... (giống modal NCC) ... */ };

    // Submit cho Admin
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.selling_price_adult <= 0) {
            toast.error("Giá bán Người lớn phải lớn hơn 0."); return;
        }
        setLoading(true);

        // Dữ liệu Admin lưu (KHÔNG bao gồm giá NCC)
        const dataToSave = {
            name: formData.name, description: formData.description,
            selling_price_adult: formData.selling_price_adult,
            selling_price_child: formData.selling_price_child,
            selling_price_elder: formData.selling_price_elder, // Lưu giá người già
            location: formData.location, duration: formData.duration,
            supplier_id: formData.supplier_id, // Giữ liên kết NCC
            image_url: formData.image_url, tour_code: formData.tour_code,
            itinerary: formData.itinerary,
            is_published: isPublished, // Admin kiểm soát trực tiếp
            // approval_status được xử lý bằng nút riêng
        };

        const { error } = await supabase.from('Products').update(dataToSave).eq('id', tour.id);

        if (error) { toast.error("Lỗi cập nhật: " + error.message); }
        else { toast.success("Cập nhật tour thành công!"); onSuccess(); onClose(); }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <motion.div
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white"> Chỉnh sửa & Duyệt Tour </h3>
                    <button onClick={onClose} disabled={loading || uploading} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"><X size={20}/></button>
                </div>

                {/* Form Body */}
                <form id="admin-tour-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Thông tin cơ bản */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-2"> <label className="label-style">Tên Tour *</label> <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" /> </div>
                       <div> <label className="label-style">Mã Tour</label> <input type="text" name="tour_code" value={formData.tour_code} onChange={handleChange} className="input-style" /> </div>
                       <div> <label className="label-style">Địa điểm</label> <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" /> </div>
                       <div> <label className="label-style">Thời lượng</label> <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" /> </div>
                       <div> <label className="label-style">Nhà cung cấp *</label> <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style"> <option value="">-- Chọn NCC --</option> {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)} </select> </div>
                    </fieldset>

                    {/* Phần Giá */}
                    <fieldset className="border dark:border-neutral-600 p-4 rounded-md">
                        <legend className="text-lg font-semibold mb-3 px-2 dark:text-white flex items-center gap-2"><CurrencyDollar weight="bold"/> Thiết lập Giá Bán</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Giá Bán Admin (Editable) */}
                            <div> <label className="label-style text-green-700 dark:text-green-400">Giá bán Người lớn *</label> <input type="number" name="selling_price_adult" value={formData.selling_price_adult} onChange={handleChange} required className="input-style border-green-300 dark:border-green-600 focus:ring-green-500" min="0" /> </div>
                            <div> <label className="label-style text-green-700 dark:text-green-400">Giá bán Trẻ em</label> <input type="number" name="selling_price_child" value={formData.selling_price_child} onChange={handleChange} className="input-style border-green-300 dark:border-green-600 focus:ring-green-500" min="0" /> </div>
                            <div> <label className="label-style text-green-700 dark:text-green-400">Giá bán Người già</label> <input type="number" name="selling_price_elder" value={formData.selling_price_elder} onChange={handleChange} className="input-style border-green-300 dark:border-green-600 focus:ring-green-500" min="0" /> </div>
                            {/* Giá NCC (Read Only) */}
                            <div className="opacity-70 mt-2"> <label className="label-style text-xs">Tham khảo: Giá NCC Lớn</label> <input type="text" value={formatCurrency(formData.supplier_price_adult)} readOnly className="input-style !bg-gray-100 dark:!bg-neutral-700 cursor-not-allowed !text-xs" /> </div>
                            <div className="opacity-70 mt-2"> <label className="label-style text-xs">Tham khảo: Giá NCC Trẻ</label> <input type="text" value={formatCurrency(formData.supplier_price_child)} readOnly className="input-style !bg-gray-100 dark:!bg-neutral-700 cursor-not-allowed !text-xs" /> </div>
                            <div className="opacity-70 mt-2"> <label className="label-style text-xs">Tham khảo: Giá NCC Sơ sinh</label> <input type="text" value={formatCurrency(formData.supplier_price_infant)} readOnly className="input-style !bg-gray-100 dark:!bg-neutral-700 cursor-not-allowed !text-xs" /> </div>
                        </div>
                         <p className="text-xs text-gray-500 mt-3 italic">* Giá bán là giá cuối cùng hiển thị cho khách hàng.</p>
                    </fieldset>

                    {/* Ảnh */}
                    <div> <label className="label-style">Ảnh minh họa</label> <div className="flex items-center gap-2"> <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="input-style flex-1"/> <label className="modal-button-secondary ..."><CloudArrowUp/> {uploading ? <CircleNotch/> : "Tải lên"} <input type="file" onChange={handleImageUpload} className="hidden"/> </label> </div> {formData.image_url && ( <img src={formData.image_url} alt="Preview" className="mt-2 ..."/> )} </div>
                    {/* Mô tả */}
                    <div> <label className="label-style">Mô tả Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} className="input-style h-24"/> </div>
                    {/* Lịch trình */}
                    <div className="border-t pt-4 dark:border-neutral-700"> <h4 className="text-lg font-semibold mb-2 dark:text-white">Lịch trình chi tiết</h4> <div className="space-y-2 max-h-48 ..."> {formData.itinerary.map((item, index) => ( <div key={index} className="flex ..."> <input value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} /> <textarea value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} /> <button onClick={() => removeItineraryItem(index)}><Minus/></button> </div> ))} </div> <button onClick={addItineraryItem}><Plus/> Thêm ngày</button> </div>

                    {/* Lịch khởi hành (Read Only) */}
                    <DeparturesManagerReadOnly tourId={tour.id} />

                </form>

                {/* Footer Modal - Nút bấm */}
                <div className="p-4 border-t dark:border-neutral-700 flex justify-between items-center gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                    {/* Nút Đăng/Ẩn */}
                    <button type="button" onClick={() => setIsPublished(!isPublished)} title={isPublished ? "Bấm để Ẩn tour" : "Bấm để Đăng tour"} className={`font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} >
                        {isPublished ? <ToggleRight weight="fill" size={20} /> : <ToggleLeft size={20} />}
                        {isPublished ? 'Đang Đăng' : 'Đang Ẩn'}
                    </button>
                    {/* Nút Lưu */}
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                        <button type="submit" form="admin-tour-form" disabled={loading || uploading} className="modal-button-primary flex items-center gap-2"> {loading && <CircleNotch size={18} className="animate-spin" />} Lưu </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
// --- KẾT THÚC ADMIN MODAL ---


// --- Component chính: AdminManageProducts ---
export default function AdminManageProducts() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState('list');
    const [modalTour, setModalTour] = useState(null); // Tour đang sửa trong modal
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const ITEMS_PER_PAGE = 10;
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Fetch Tours cho Admin (bao gồm cả chờ/từ chối)
    const fetchProducts = useCallback(async (isInitialLoad = false) => {
        // ... (Logic fetch giữ nguyên, đảm bảo select đủ các trường giá mới:
        // supplier_price_adult:price, supplier_price_child:child_price, ...
        // selling_price_adult, selling_price_child, selling_price_elder) ...
        if (isInitialLoad) setLoading(true);
        setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('Products')
                .select(`
                    id, name, tour_code, image_url, location, duration,
                    supplier_price_adult:price, supplier_price_child:child_price, supplier_price_infant:infant_price, /* Lấy giá NCC (có thể dùng alias từ tên cột cũ) */
                    selling_price_adult, selling_price_child, selling_price_elder, /* Lấy giá bán Admin */
                    itinerary, approval_status, is_published, supplier_id,
                    supplier:supplier_id ( name ),
                    Departures ( id, departure_date, max_slots, booked_slots, adult_price, child_price )
                `, { count: 'exact' })
                .eq('product_type', 'tour') // Chỉ Tour
                .order('created_at', { ascending: false })
                .range(from, to);

            if (debouncedSearch) {
                query = query.or(`name.ilike.%${debouncedSearch}%,tour_code.ilike.%${debouncedSearch}%`);
            }

            const { data, error: queryError, count } = await query;
            if (queryError) throw queryError;

            if (isInitialLoad) {
                const { data: supData, error: supError } = await supabase.from('Suppliers').select('id, name');
                if (supError) throw supError;
                setSuppliers(supData || []);
            }

            setProducts(data || []);
            setTotalItems(count || 0);
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

        } catch (error) {
             console.error("Lỗi fetch products:", error);
             setError(error.message);
             toast.error("Tải sản phẩm thất bại: " + error.message);
        } finally {
             if (isInitialLoad) setLoading(false);
             setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch, ITEMS_PER_PAGE]);

    useEffect(() => { fetchProducts(true); }, [fetchProducts]);
    useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

    // Xử lý Duyệt/Từ chối/Đặt lại
    const handleSetStatus = async (id, newStatus, currentStatus) => {
        // ... (Logic giữ nguyên: cập nhật status, tự động set is_published khi duyệt, tải lại UI) ...
        if (newStatus === currentStatus) return;
        setIsFetchingPage(true);
        const { error } = await supabase
            .from('Products')
            .update({ approval_status: newStatus, is_published: newStatus === 'approved' }) // Tự động ĐĂNG khi duyệt
            .eq('id', id);
        if (error) { toast.error("Cập nhật thất bại: " + error.message); }
        else {
            toast.success(newStatus === 'approved' ? 'Đã duyệt & TỰ ĐỘNG ĐĂNG tour!' : (newStatus === 'rejected' ? 'Đã từ chối tour.' : 'Đã đặt lại chờ duyệt.'));
            // Cập nhật UI ngay lập tức
            setProducts(prev => prev.map(p => p.id === id ? { ...p, approval_status: newStatus, is_published: newStatus === 'approved' } : p ));
        }
        setIsFetchingPage(false);
    };

    // Nút Bấm Hành động trong danh sách/grid
    const ActionButtons = ({ product }) => (
        <div className="flex items-center justify-end gap-2 flex-wrap">
            {product.approval_status !== 'approved' && ( <button onClick={() => handleSetStatus(product.id, 'approved', product.approval_status)} disabled={isFetchingPage} className="button-green text-xs ..."> <CheckCircle/> Duyệt </button> )}
            {product.approval_status !== 'rejected' && ( <button onClick={() => handleSetStatus(product.id, 'rejected', product.approval_status)} disabled={isFetchingPage} className="button-red text-xs ..."> <XCircle/> Từ chối </button> )}
            {/* Nút Sửa & Duyệt (Mở modal Admin) */}
            <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-sky text-xs ..."> <PencilLine/> Sửa & Duyệt </button>
            {product.approval_status !== 'pending' && ( <button onClick={() => handleSetStatus(product.id, 'pending', product.approval_status)} disabled={isFetchingPage} className="button-yellow text-xs ..."> <Clock/> Đặt lại </button> )}
        </div>
    );

    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // --- JSX cho Card và List Item (Hiển thị giá bán Admin) ---
    const TourCard = ({ product }) => (
        <div className="card-hover-effect"> {/* Use shared style */}
            <div className="relative h-48 ...">
                {/* ... (Image, Badge Status, SlotSummary) ... */}
                 {product.approval_status === 'approved' && ( <div className="absolute top-2 left-2 z-10"> {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>} </div> )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3>{product.name}</h3>
                <p>NCC: {product.supplier?.name || 'N/A'}</p>
                <p>Mã: {product.tour_code || "N/A"}</p>
                 {/* Hiển thị Giá Bán */}
                <div className="text-xl font-bold text-red-600 mt-2 mb-3"> {formatCurrency(product.selling_price_adult || 0)} </div>
                <div className="mt-auto pt-3 border-t ..."> <ActionButtons product={product} /> </div>
            </div>
        </div>
    );
    const TourListItem = ({ product }) => (
        <tr className="hover:bg-gray-50 ...">
            <td> {/* ... (Image, Name, Code) ... */} </td>
            <td> {product.supplier?.name || "N/A"} </td>
             {/* Hiển thị Giá Bán */}
            <td className="px-6 py-4 text-sm font-semibold text-red-600"> {formatCurrency(product.selling_price_adult || 0)} </td>
            <td> <SlotSummary departures={product.Departures || []} /> </td>
            <td> <ApprovalStatus status={product.approval_status} /> </td>
            <td> {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>} </td>
            <td> <ActionButtons product={product} /> </td>
        </tr>
    );

    // --- Cấu trúc JSX Chính (Header, Search, View, Grid/List, Pagination) ---
    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header + Search + Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold ..."> <Package/> Quản lý & Duyệt Tour </h1>
                <div className="flex ..."> {/* Search, View Toggle, Refresh */}
                    <div className="relative w-full sm:w-64"> <MagnifyingGlass/> <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> </div>
                    <div className="flex items-center bg-slate-200 ..."> <button onClick={() => setViewMode('list')}><List/></button> <button onClick={() => setViewMode('grid')}><GridFour/></button> </div>
                    <button onClick={() => fetchProducts(true)} disabled={loading || isFetchingPage}> <ArrowClockwise className={isFetchingPage ? "animate-spin" : ""}/> Làm mới </button>
                </div>
            </div>

            {/* Loading / Error / Empty States */}
            {loading ? <div className="flex justify-center ..."><CircleNotch/></div> : null}
            {!loading && error ? <div className="text-red-500 ...">{error}</div> : null}
            {!loading && !error && products.length === 0 ? <div className="text-center ...">{debouncedSearch ? "..." : "Chưa có tour nào."}</div> : null}

            {/* Grid or List View */}
            {!loading && !error && products.length > 0 && viewMode === 'grid' && ( <div className="grid ..."> {products.map((p) => <TourCard key={p.id} product={p} />)} </div> )}
            {!loading && !error && products.length > 0 && viewMode === 'list' && ( <div className="bg-white ..."> <div className="overflow-x-auto ..."> {isFetchingPage && <div className="loading-overlay ..."><CircleNotch/></div>} <table className="min-w-full ..."> <thead className="..."><tr><th>Tên</th><th>NCC</th><th>Giá Bán</th><th>Slots</th><th>Duyệt</th><th>Đăng</th><th>Hành động</th></tr></thead> <tbody className="..."> {products.map((p) => <TourListItem key={p.id} product={p} />)} </tbody> </table> </div> </div> )}

            {/* Pagination */}
            {!loading && totalItems > ITEMS_PER_PAGE && ( <div className="flex justify-between ..."> <div>Hiển thị ...</div> <div className="flex gap-1 ..."> <button disabled={currentPage === 1}><CaretLeft/></button> {paginationWindow.map((p, i) => p === "..." ? <span key={i}>...</span> : <button key={p} className={currentPage === p ? 'active' : ''} onClick={() => setCurrentPage(p)}>{p}</button>)} <button disabled={currentPage === totalPages}><CaretRight/></button> </div> </div> )}

            {/* Admin Edit Modal */}
            {modalTour && (
                <EditTourModalAdmin
                    tour={modalTour}
                    onClose={() => setModalTour(null)}
                    onSuccess={() => fetchProducts(false)} // Tải lại khi lưu
                    suppliers={suppliers}
                />
            )}

            {/* CSS */}
            <style jsx>{`
                /* ... (Tất cả CSS trước đó + CSS cho nút duyệt/từ chối/đặt lại nếu cần) ... */
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
                .button-base-text { @apply px-3 py-1.5 text-xs rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5; }
                .button-green { @apply button-base-text bg-green-600 text-white hover:bg-green-700 focus:ring-green-400; }
                .button-red { @apply button-base-text bg-red-600 text-white hover:bg-red-700 focus:ring-red-400; }
                .button-sky { @apply button-base-text bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-400; }
                .button-yellow { @apply button-base-text bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400; }
                /* Thêm các style khác nếu cần */
            `}</style>
        </div>
    );
}
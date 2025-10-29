// src/pages/AdminManageProducts.jsx
// (File này đã đúng logic, Admin đặt Giá Bán, NCC lo Slots)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass,
    PencilLine, WarningCircle, CheckCircle, Clock, XCircle, Ticket, Triangle,
    FloppyDisk, Info, CloudArrowUp, Minus, Plus, ToggleLeft, ToggleRight,
    Image as ImageIcon, ArrowClockwise, List, GridFour, CurrencyDollar // Thêm icons cần thiết
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

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
    if (totalPages <= 1 + width * 2) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let pages = [];
    pages.push(1);
    if (currentPage > 1 + width + 1) pages.push("...");
    for (let i = Math.max(2, currentPage - width); i <= Math.min(totalPages - 1, currentPage + width); i++) {
        pages.push(i);
    }
    if (currentPage < totalPages - width - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
};

// --- Helper Format Currency ---
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};

// --- Component Trạng thái Phê duyệt ---
const ApprovalStatus = ({ status }) => {
  switch (status) {
    case "approved":
      return <span className="badge-green"><CheckCircle weight="bold"/> Đã duyệt</span>;
    case "rejected":
      return <span className="badge-red"><XCircle weight="bold"/> Bị từ chối</span>;
    default:
      return <span className="badge-yellow"><Clock weight="bold"/> Chờ duyệt</span>;
  }
};

// --- Component Tóm tắt Slot ---
const SlotSummary = ({ departures }) => {
    if (!Array.isArray(departures)) {
        return <span className="badge-gray"><Triangle weight="bold" /> Lỗi slot</span>;
    }
    const today = new Date().toISOString().split('T')[0];
    const upcomingDepartures = useMemo(() =>
        departures.filter(d => d.departure_date >= today),
    [departures, today]);

    if (upcomingDepartures.length === 0) {
        return <span className="badge-gray"><Triangle weight="bold" /> Chưa có lịch</span>;
    }

    const totalRemaining = upcomingDepartures.reduce((sum, d) => {
        const remaining = (d.max_slots || 0) - (d.booked_slots || 0);
        return sum + Math.max(0, remaining);
    }, 0);

    return (
        <span className={totalRemaining > 0 ? "badge-blue" : "badge-red"}>
            <Ticket weight="bold"/> {totalRemaining > 0 ? `Còn ${totalRemaining} chỗ` : 'Hết chỗ'}
            <span className="font-normal opacity-75">({upcomingDepartures.length} lịch)</span>
        </span>
    );
};

// --- Component con DeparturesManager (Phiên bản ReadOnly cho Admin) ---
// (Component này sẽ hiển thị thông tin slot nhưng không cho phép sửa đổi)
const DeparturesManagerReadOnly = ({ tourId }) => {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDepartures = useCallback(async () => {
         setLoading(true); setError(null);
         const today = new Date().toISOString().split('T')[0];
         try {
             const { data, error } = await supabase
                .from('Departures')
                .select('*')
                .eq('product_id', tourId)
                .gte('departure_date', today)
                .order('departure_date', { ascending: true });
             if (error) throw error;
             setDepartures(data || []);
         } catch(err) {
             setError("Lỗi tải lịch khởi hành: " + err.message);
         } finally {
             setLoading(false);
         }
    }, [tourId]);
    
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
                // (ĐÚNG) Giá NCC từ DB (có thể là tên cũ price, child_price...)
                supplier_price_adult: tour.supplier_price_adult || tour.price || 0,
                supplier_price_child: tour.supplier_price_child || tour.child_price || 0,
                supplier_price_infant: tour.supplier_price_infant || tour.infant_price || 0,
                // (ĐÚNG) Giá bán Admin từ DB
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
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value || 0) : value
        }));
    };
    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index][field] = value;
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };
    const addItineraryItem = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, { title: `Ngày ${prev.itinerary.length + 1}`, content: '' }]
        }));
    };
    const removeItineraryItem = (index) => {
         setFormData(prev => ({
            ...prev,
            itinerary: prev.itinerary.filter((_, i) => i !== index)
        }));
    };
    const handleImageUpload = async (e) => { /* ... (Logic tải ảnh) ... */ };

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
            // (ĐÚNG) Lưu giá bán
            selling_price_adult: formData.selling_price_adult,
            selling_price_child: formData.selling_price_child,
            selling_price_elder: formData.selling_price_elder, // Lưu giá người già
            
            location: formData.location, duration: formData.duration,
            supplier_id: formData.supplier_id, // Giữ liên kết NCC
            image_url: formData.image_url, tour_code: formData.tour_code,
            itinerary: formData.itinerary,
            is_published: isPublished, // Admin kiểm soát trực tiếp
            // approval_status được xử lý bằng nút riêng bên ngoài
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
                    <div> <label className="label-style">Ảnh minh họa</label> <div className="flex items-center gap-2"> <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="input-style flex-1"/> <label className="modal-button-secondary cursor-pointer !py-2.5 !px-3"><CloudArrowUp/> {uploading ? <CircleNotch/> : "Tải lên"} <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*"/> </label> </div> {formData.image_url && ( <img src={formData.image_url} alt="Preview" className="mt-2 h-24 w-auto rounded-md object-cover"/> )} </div>
                    {/* Mô tả */}
                    <div> <label className="label-style">Mô tả Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} className="input-style h-24"/> </div>
                    
                    {/* Lịch trình */}
                    <div className="border-t pt-4 dark:border-neutral-700"> 
                        <h4 className="text-lg font-semibold mb-2 dark:text-white">Lịch trình chi tiết</h4> 
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2"> 
                            {formData.itinerary.map((item, index) => ( 
                                <div key={index} className="flex gap-2 items-start"> 
                                    <input value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} placeholder="Tiêu đề (VD: Ngày 1)" className="input-style !w-32 !text-sm"/> 
                                    <textarea value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} placeholder="Nội dung lịch trình..." className="input-style flex-1 !text-sm h-16"/> 
                                    <button type="button" onClick={() => removeItineraryItem(index)} className="button-icon-red mt-1"><Minus/></button> 
                                </div> 
                            ))} 
                        </div> 
                        <button type="button" onClick={addItineraryItem} className="button-secondary !text-xs !py-1 mt-2"><Plus/> Thêm ngày</button> 
                    </div>

                    {/* (ĐÚNG) Lịch khởi hành (Read Only) */}
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
            
            {/* CSS nội bộ */}
            <style jsx>{`
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
                .button-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50; }
            `}</style>
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
        if (isInitialLoad) setLoading(true);
        setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

//...
            let query = supabase
                .from('Products')
                .select(`
                    id, name, tour_code, image_url, location, duration,
                    supplier_price_adult:price, supplier_price_child:child_price, supplier_price_infant:infant_price,
                    selling_price_adult, selling_price_child, selling_price_elder,
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

    useEffect(() => { fetchProducts(true); }, [debouncedSearch]); // Tải lại trang 1 khi search
    useEffect(() => { fetchProducts(false); }, [currentPage]); // Tải trang khi đổi trang

    // Xử lý Duyệt/Từ chối/Đặt lại
    const handleSetStatus = async (id, newStatus, currentStatus) => {
        if (newStatus === currentStatus) return;
        
        // (ĐÚNG) Kiểm tra nếu duyệt, phải có giá bán
        if (newStatus === 'approved') {
            const product = products.find(p => p.id === id);
            if (!product || !product.selling_price_adult || product.selling_price_adult <= 0) {
                 toast.error("Bạn phải đặt Giá Bán (Người Lớn) > 0 trước khi duyệt!");
                 setModalTour(product); // Mở modal
                 return;
            }
        }
        
        setIsFetchingPage(true);
        const { error } = await supabase
            .from('Products')
            .update({ 
                approval_status: newStatus, 
                is_published: newStatus === 'approved' // (ĐÚNG) Tự động ĐĂNG khi duyệt
            }) 
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
            {product.approval_status !== 'approved' && ( <button onClick={() => handleSetStatus(product.id, 'approved', product.approval_status)} disabled={isFetchingPage} className="button-green text-xs !px-2 !py-1"> <CheckCircle/> Duyệt </button> )}
            {product.approval_status !== 'rejected' && ( <button onClick={() => handleSetStatus(product.id, 'rejected', product.approval_status)} disabled={isFetchingPage} className="button-red text-xs !px-2 !py-1"> <XCircle/> Từ chối </button> )}
            {/* Nút Sửa & Duyệt (Mở modal Admin) */}
            <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-sky text-xs !px-2 !py-1"> <PencilLine/> Sửa & Đặt giá </button>
            {product.approval_status !== 'pending' && ( <button onClick={() => handleSetStatus(product.id, 'pending', product.approval_status)} disabled={isFetchingPage} className="button-yellow text-xs !px-2 !py-1"> <Clock/> Đặt lại </button> )}
        </div>
    );

    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // --- JSX cho Card và List Item (Hiển thị giá bán Admin) ---
    const TourCard = ({ product }) => (
        <div className="flex flex-col bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border dark:border-slate-700 transition-all duration-300 hover:shadow-xl h-full">
            <div className="relative h-48 w-full flex-shrink-0">
                {product.image_url ? ( <img src={product.image_url} alt={product.name} className="h-full w-full object-cover"/> ) : ( <div className="h-full w-full bg-slate-200 ... flex items-center justify-center"><ImageIcon/></div> )}
                 {/* Badge Trạng thái duyệt */}
                 <div className="absolute top-2 right-2 z-10">
                     <ApprovalStatus status={product.approval_status} />
                 </div>
                 {/* Badge Đăng/Ẩn */}
                 {product.approval_status === 'approved' && ( <div className="absolute top-2 left-2 z-10"> {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>} </div> )}
                 {/* Badge Slots */}
                 <div className="absolute bottom-2 left-2 z-10">
                     <SlotSummary departures={product.Departures || []} />
                 </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">NCC: {product.supplier?.name || 'N/A'}</p>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2"> Mã: {product.tour_code || "N/A"} </p>
                 
                 {/* (ĐÚNG) Hiển thị Giá Bán */}
                <div className="text-xl font-bold text-red-600 mt-2 mb-3"> 
                    {formatCurrency(product.selling_price_adult || 0)} 
                    <span className="text-sm font-normal text-slate-500"> (Giá bán)</span>
                </div>
                {/* Hiển thị Giá NCC (để Admin tham khảo) */}
                <div className="text-sm text-gray-500 dark:text-gray-400"> 
                    {formatCurrency(product.supplier_price_adult || product.price || 0)} 
                    <span className="text-xs italic"> (Giá NCC)</span>
                </div>

                <div className="mt-auto pt-3 border-t dark:border-slate-700"> <ActionButtons product={product} /> </div>
            </div>
        </div>
    );
    const TourListItem = ({ product }) => (
        <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <td className="px-6 py-4"> {/* Tên Tour & Ảnh */}
                <div className="flex items-center gap-3">
                    {product.image_url ? ( <img src={product.image_url} alt={product.name} className="h-12 w-16 object-cover rounded-md flex-shrink-0"/> ) : ( <div className="h-12 w-16 ... flex items-center justify-center"><ImageIcon/></div> )}
                    <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-white">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{product.tour_code || "N/A"}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300"> {product.supplier?.name || "N/A"} </td>
             {/* (ĐÚNG) Hiển thị Giá Bán */}
            <td className="px-6 py-4 text-sm font-semibold text-red-600"> {formatCurrency(product.selling_price_adult || 0)} </td>
            {/* Hiển thị Giá NCC (tham khảo) */}
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 italic"> {formatCurrency(product.supplier_price_adult || product.price || 0)} </td>
            <td className="px-6 py-4 text-sm"> <SlotSummary departures={product.Departures || []} /> </td>
            <td className="px-6 py-4 text-sm"> <ApprovalStatus status={product.approval_status} /> </td>
            <td className="px-6 py-4 text-sm"> {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>} </td>
            <td className="px-6 py-4 text-right"> <ActionButtons product={product} /> </td>
        </tr>
    );

    // --- Cấu trúc JSX Chính (Header, Search, View, Grid/List, Pagination) ---
    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header + Search + Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3"> <Package/> Quản lý & Duyệt Tour </h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64"> 
                        <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/> 
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo tên, mã tour..." className="input-style !pl-9 !py-2"/> 
                    </div>
                    <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1"> 
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}><List/></button> 
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}><GridFour/></button> 
                    </div>
                    <button onClick={() => fetchProducts(true)} disabled={loading || isFetchingPage} className="button-secondary !px-3 !py-2"> <ArrowClockwise size={18} className={isFetchingPage ? "animate-spin" : ""}/> </button>
                </div>
            </div>

            {/* Loading / Error / Empty States */}
            {loading ? <div className="flex justify-center p-20"><CircleNotch size={40} className="animate-spin text-sky-500"/></div> : null}
            {!loading && error ? <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div> : null}
            {!loading && !error && products.length === 0 ? <div className="text-center py-20 text-gray-500 italic">{debouncedSearch ? `Không tìm thấy tour nào khớp với "${debouncedSearch}".` : "Chưa có tour nào."}</div> : null}

            {/* Grid or List View */}
            {!loading && !error && products.length > 0 && viewMode === 'grid' && ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {products.map((p) => <TourCard key={p.id} product={p} />)} </div> )}
            {!loading && !error && products.length > 0 && viewMode === 'list' && ( 
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700"> 
                    <div className="overflow-x-auto relative"> 
                        {isFetchingPage && !loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex justify-center items-center">
                                <CircleNotch size={32} className="animate-spin text-sky-500"/>
                            </div>
                        )} 
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700"> 
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="th-style">Tên Tour</th>
                                    <th className="th-style">NCC</th>
                                    <th className="th-style">Giá Bán</th>
                                    <th className="th-style">Giá NCC</th>
                                    <th className="th-style">Slots</th>
                                    <th className="th-style">Duyệt</th>
                                    <th className="th-style">Đăng</th>
                                    <th className="th-style text-right">Hành động</th>
                                </tr>
                            </thead> 
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700"> 
                                {products.map((p) => <TourListItem key={p.id} product={p} />)} 
                            </tbody> 
                        </table> 
                    </div> 
                </div> 
            )}

            {/* Pagination */}
            {!loading && totalItems > ITEMS_PER_PAGE && ( 
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400"> 
                    <div>Hiển thị <b>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</b> - <b>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</b> trên <b>{totalItems}</b> tour</div> 
                    <div className="flex gap-1"> 
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="page-button"><CaretLeft/></button> 
                        {paginationWindow.map((p, i) => p === "..." ? 
                            <span key={i} className="px-3 py-1">...</span> : 
                            <button key={p} className={`page-button ${currentPage === p ? 'page-button-active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                        )} 
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="page-button"><CaretRight/></button> 
                    </div> 
                </div> 
            )}

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
                /* Styles badges */
                .badge-base { @apply px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
                
                /* Styles nút chung */
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
                .button-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50; }
                
                /* Styles nút duyệt/từ chối */
                .button-base-text { @apply px-3 py-1.5 text-xs rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5; }
                .button-green { @apply button-base-text bg-green-600 text-white hover:bg-green-700 focus:ring-green-400; }
                .button-red { @apply button-base-text bg-red-600 text-white hover:bg-red-700 focus:ring-red-400; }
                .button-sky { @apply button-base-text bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-400; }
                .button-yellow { @apply button-base-text bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400; }

                /* Styles bảng */
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                
                /* Styles pagination */
                .page-button { @apply px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .page-button-active { @apply bg-sky-600 text-white border-sky-600 hover:bg-sky-700; }
            `}</style>
        </div>
    );
}
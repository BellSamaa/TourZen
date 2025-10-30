// src/pages/AdminManageProducts.jsx
// (SỬA LỖI LỚN v2: Sửa lỗi logic đọc/ghi 'itinerary' từ JSON string)
// (Nâng cấp VIP: Gradient VIP, shadow sâu, nút bấm màu sắc sống động, pop-up xịn với animation)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass,
    PencilLine, WarningCircle, CheckCircle, Clock, XCircle, Ticket, Triangle,
    FloppyDisk, Info, CloudArrowUp, Minus, Plus, ToggleLeft, ToggleRight,
    Image as ImageIcon, ArrowClockwise, List, GridFour, CurrencyDollar 
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
                                 <tr key={dep.id} className="opacity-80">
                                     <td className="px-3 py-2">{dep.departure_date}</td>
                                     <td className="px-3 py-2">{formatCurrency(dep.adult_price)}</td>
                                     <td className="px-3 py-2">{formatCurrency(dep.child_price)}</td>
                                     <td className="px-3 py-2 font-medium">{dep.max_slots}</td>
                                     <td className="px-3 py-2 font-medium">{dep.booked_slots}</td>
                                 </tr>
                             ))}
                             {departures.length === 0 && (
                                 <tr>
                                     <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400 italic">Chưa có lịch khởi hành nào.</td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             )}
        </div>
    );
};

// --- Component con TourListItem (Nâng cấp VIP) ---
const TourListItem = ({ product }) => {
    const departures = useMemo(() => {
        try {
            return Array.isArray(product.departures) ? product.departures : JSON.parse(product.departures || '[]');
        } catch (e) { return []; }
    }, [product.departures]);

    return (
        <motion.tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors" whileHover={{ scale: 1.01 }}>
            <td className="td-style-new">
                <div className="flex items-center gap-3 max-w-md">
                    <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                    <span className="font-semibold truncate" title={product.name}>{product.name}</span>
                </div>
            </td>
            <td className="td-style-new">{product.supplier_name}</td>
            <td className="td-style-new font-bold text-sky-600 dark:text-sky-400">{formatCurrency(product.price)}</td>
            <td className="td-style-new">{formatCurrency(product.supplier_price)}</td>
            <td className="td-style-new"><SlotSummary departures={departures} /></td>
            <td className="td-style-new"><ApprovalStatus status={product.approval_status} /></td>
            <td className="td-style-new">
                <button 
                    onClick={() => handleTogglePublished(product)} 
                    disabled={product.approval_status !== 'approved'} 
                    title={product.is_published ? "Đang Đăng (Bấm để Tắt)" : "Đang Tắt (Bấm để Đăng)"} 
                    className={`text-2xl ${product.is_published ? 'text-green-500' : 'text-gray-500'} disabled:opacity-30`}
                >
                    {product.is_published ? <ToggleRight weight="fill" size={24} /> : <ToggleLeft size={24} />}
                </button>
            </td>
            <td className="td-style-new text-right whitespace-nowrap">
                <div className="flex justify-end gap-2">
                    <button onClick={() => setModalTour(product)} className="action-button text-blue-600 hover:text-blue-800" title="Chỉnh sửa"><PencilLine size={20}/></button>
                    <button onClick={() => handleApproval(product.id, 'approved')} disabled={product.approval_status !== 'pending'} className="action-button text-green-600 hover:text-green-800 disabled:opacity-30" title="Duyệt"><CheckCircle size={20}/></button>
                    <button onClick={() => handleApproval(product.id, 'rejected')} disabled={product.approval_status !== 'pending'} className="action-button text-red-600 hover:text-red-800 disabled:opacity-30" title="Từ chối"><XCircle size={20}/></button>
                    <button onClick={() => handleApproval(product.id, 'pending')} disabled={product.approval_status === 'pending'} className="action-button text-yellow-600 hover:text-yellow-800 disabled:opacity-30" title="Reset chờ duyệt"><Clock size={20}/></button>
                </div>
            </td>
        </motion.tr>
    );
};

// --- Component con TourCardItem (Nâng cấp VIP) ---
const TourCardItem = ({ product }) => {
    const departures = useMemo(() => {
        try {
            return Array.isArray(product.departures) ? product.departures : JSON.parse(product.departures || '[]');
        } catch (e) { return []; }
    }, [product.departures]);

    return (
        <motion.div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col" whileHover={{ y: -5, shadow: "xl" }}>
            <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover" />
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.supplier_name}</p>
                <div className="mt-2 flex justify-between text-sm">
                    <span>Giá Bán: <b>{formatCurrency(product.price)}</b></span>
                    <span>Giá NCC: <b>{formatCurrency(product.supplier_price)}</b></span>
                </div>
                <div className="mt-2"><SlotSummary departures={departures} /></div>
                <div className="mt-2 flex gap-2">
                    <ApprovalStatus status={product.approval_status} />
                    <button 
                        onClick={() => handleTogglePublished(product)} 
                        disabled={product.approval_status !== 'approved'} 
                        className={`text-xl ${product.is_published ? 'text-green-500' : 'text-gray-500'} disabled:opacity-30`}
                    >
                        {product.is_published ? <ToggleRight weight="fill" /> : <ToggleLeft />}
                    </button>
                </div>
                <div className="mt-auto pt-4 flex justify-end gap-2 border-t dark:border-slate-700 mt-4">
                    <button onClick={() => setModalTour(product)} className="text-blue-600"><PencilLine size={16}/></button>
                    <button onClick={() => handleApproval(product.id, 'approved')} disabled={product.approval_status !== 'pending'} className="text-green-600 disabled:opacity-30"><CheckCircle size={16}/></button>
                    <button onClick={() => handleApproval(product.id, 'rejected')} disabled={product.approval_status !== 'pending'} className="text-red-600 disabled:opacity-30"><XCircle size={16}/></button>
                    <button onClick={() => handleApproval(product.id, 'pending')} disabled={product.approval_status === 'pending'} className="text-yellow-600 disabled:opacity-30"><Clock size={16}/></button>
                </div>
            </div>
        </motion.div>
    );
};

// --- Component con EditTourModalAdmin (Nâng cấp VIP với pop-up xịn) ---
const EditTourModalAdmin = ({ tour, onClose, onSuccess, suppliers }) => {
    const [formData, setFormData] = useState({
        name: tour.name || '',
        description: tour.description || '',
        image_url: tour.image_url || '',
        location: tour.location || '',
        duration: tour.duration || '',
        price: tour.price || 0,
        supplier_id: tour.supplier_id || '',
        supplier_price: tour.supplier_price || 0,
        approval_status: tour.approval_status || 'pending',
        is_published: tour.is_published || false,
        itinerary: tour.itinerary || [],
    });
    const [loading, setLoading] = useState(false);
    const [dayDetails, setDayDetails] = useState(Array(formData.duration).fill(''));
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (tour.itinerary) {
            try {
                const parsedItinerary = Array.isArray(tour.itinerary) ? tour.itinerary : JSON.parse(tour.itinerary);
                setDayDetails(parsedItinerary.map(day => day.details || ''));
            } catch (e) {
                console.error("Lỗi parse itinerary:", e);
                setDayDetails(Array(formData.duration).fill(''));
            }
        }
    }, [tour.itinerary, formData.duration]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'supplier_price' ? parseFloat(value) || 0 : value }));
        if (name === 'duration') {
            const newDuration = parseInt(value) || 0;
            setDayDetails(prev => {
                const newDetails = [...prev];
                newDetails.length = newDuration;
                for (let i = prev.length; i < newDuration; i++) {
                    newDetails[i] = '';
                }
                return newDetails;
            });
        }
    };

    const handleDayChange = (index, value) => {
        setDayDetails(prev => {
            const newDetails = [...prev];
            newDetails[index] = value;
            return newDetails;
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { data, error } = await supabase.storage
                .from('tour_images')
                .upload(`tour_${Date.now()}.${file.name.split('.').pop()}`, file);
            if (error) throw error;
            const publicUrl = supabase.storage.from('tour_images').getPublicUrl(data.path).data.publicUrl;
            setFormData(prev => ({ ...prev, image_url: publicUrl }));
            toast.success("Tải ảnh lên thành công!");
        } catch (err) {
            toast.error("Lỗi tải ảnh: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const itineraryJson = dayDetails.map((details, index) => ({
            day: index + 1,
            details
        }));

        const dataToSubmit = {
            ...formData,
            itinerary: JSON.stringify(itineraryJson),
        };

        try {
            const { error } = await supabase
                .from('Products')
                .update(dataToSubmit)
                .eq('id', tour.id);
            if (error) throw error;
            toast.success("Cập nhật tour thành công!");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error("Lỗi cập nhật tour: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
                className="bg-gradient-to-br from-white to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-sky-200 dark:border-sky-700 overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring" }}
            >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                    <div className="flex justify-between items-center p-6 border-b dark:border-slate-700 bg-gradient-to-r from-sky-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Chỉnh sửa Tour</h3>
                        <button type="button" onClick={onClose} disabled={loading} className="text-gray-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label-style">Tên Tour *</label>
                                <input name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                            </div>
                            <div>
                                <label className="label-style">Vị trí *</label>
                                <input name="location" value={formData.location} onChange={handleChange} required className="input-style" />
                            </div>
                            <div>
                                <label className="label-style">Thời gian (ngày) *</label>
                                <input name="duration" type="number" min="1" value={formData.duration} onChange={handleChange} required className="input-style" />
                            </div>
                            <div>
                                <label className="label-style">Nhà cung cấp *</label>
                                <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style">
                                    <option value="">Chọn NCC</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-style">Giá Bán (Admin) *</label>
                                <input name="price" type="number" min="0" step="1000" value={formData.price} onChange={handleChange} required className="input-style" />
                            </div>
                            <div>
                                <label className="label-style">Giá NCC *</label>
                                <input name="supplier_price" type="number" min="0" step="1000" value={formData.supplier_price} onChange={handleChange} required className="input-style" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label-style">Mô tả *</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required className="input-style resize-y"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="label-style">Ảnh Tour</label>
                                {formData.image_url && <img src={formData.image_url} alt="Tour" className="w-full h-48 object-cover rounded-md mb-2" />}
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="input-style" />
                                {isUploading && <p className="text-sm text-gray-500 mt-1">Đang tải lên...</p>}
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="label-style">Lịch Trình Chi Tiết</label>
                                {[...Array(parseInt(formData.duration) || 0)].map((_, index) => (
                                    <div key={index} className="space-y-2">
                                        <h5 className="font-medium">Ngày {index + 1}</h5>
                                        <textarea
                                            value={dayDetails[index] || ''}
                                            onChange={(e) => handleDayChange(index, e.target.value)}
                                            rows="3"
                                            className="input-style resize-y"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-b-2xl">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={loading} className="modal-button-primary flex items-center gap-2">
                            {loading && <CircleNotch size={20} className="animate-spin" />}
                            Lưu Thay Đổi
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// --- Component chính AdminManageProducts ---
export default function AdminManageProducts() {
    const ITEMS_PER_PAGE = 10;
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [modalTour, setModalTour] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const fetchProducts = useCallback(async (page = 1, search = '') => {
        setIsFetchingPage(true);
        setError(null);
        try {
            let query = supabase
                .from('Products')
                .select('id, name, description, image_url, location, duration, price, supplier_price, approval_status, is_published, departures, supplier:supplier_id(name)', { count: 'exact' })
                .eq('product_type', 'tour')
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            const { data, count, error } = await query;

            if (error) throw error;

            const processedData = data.map(p => ({
                ...p,
                supplier_name: p.supplier?.name || 'N/A'
            }));

            setProducts(processedData);
            setTotalItems(count);
        } catch (err) {
            setError("Lỗi tải danh sách tour: " + err.message);
        } finally {
            setIsFetchingPage(false);
            if (page === 1) setLoading(false);
        }
    }, []);

    const fetchSuppliers = async () => {
        const { data, error } = await supabase.from('Suppliers').select('id, name');
        if (error) {
            console.error("Lỗi tải NCC:", error);
        } else {
            setSuppliers(data || []);
        }
    };

    useEffect(() => {
        fetchProducts(currentPage, debouncedSearch);
        fetchSuppliers();
    }, [currentPage, debouncedSearch, fetchProducts]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginationWindow = getPaginationWindow(currentPage, totalPages);

    const handleTogglePublished = async (product) => {
        if (product.approval_status !== 'approved') {
            toast.error("Chỉ có thể Bật/Tắt tour đã được duyệt.");
            return;
        }
        const newStatus = !product.is_published;
        try {
            const { error } = await supabase
                .from('Products')
                .update({ is_published: newStatus })
                .eq('id', product.id);
            if (error) throw error;
            toast.success(newStatus ? "Đã BẬT (Hiển thị) tour." : "Đã TẮT (Ngừng) tour.");
            fetchProducts(currentPage, debouncedSearch);
        } catch (err) {
            toast.error("Lỗi: " + err.message);
        }
    };

    const handleApproval = async (productId, newStatus) => {
        try {
            const { error } = await supabase
                .from('Products')
                .update({ 
                    approval_status: newStatus,
                    is_published: newStatus === 'approved' ? true : false 
                })
                .eq('id', productId);
            if (error) throw error;
            toast.success(newStatus === 'approved' ? "Đã duyệt tour!" : (newStatus === 'rejected' ? "Đã từ chối tour!" : "Đã reset chờ duyệt!"));
            fetchProducts(currentPage, debouncedSearch);
        } catch (err) {
            toast.error("Lỗi: " + err.message);
        }
    };

    return (
        <div className="p-6 space-y-8 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 dark:text-white">
            <div className="flex flex-wrap justify-between items-center gap-5">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Package size={32} className="text-sky-600" /> Quản Lý Tour Du Lịch
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý và phê duyệt sản phẩm tour từ NCC</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchProducts(1, searchTerm)} className="button-secondary flex items-center gap-1" disabled={loading || isFetchingPage}>
                        <ArrowClockwise size={16} /> Làm mới
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-slate-700'} hover:bg-sky-700 transition-colors`}>
                            <List size={20} />
                        </button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-slate-700'} hover:bg-sky-700 transition-colors`}>
                            <GridFour size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative">
                <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm theo tên tour..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
            </div>

            {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-md">{error}</p>}

            {!loading && products.length === 0 && (
                <p className="text-center text-neutral-500 italic py-12">Chưa có tour nào.</p>
            )}

            {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(p => <TourCardItem key={p.id} product={p} />)}
                </div>
            ) : (
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

            {modalTour && (
                <EditTourModalAdmin
                    tour={modalTour}
                    onClose={() => setModalTour(null)}
                    onSuccess={() => fetchProducts(false)}
                    suppliers={suppliers}
                />
            )}

            {/* CSS */}
            <style jsx>{`
                .badge-base { @apply px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
                
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
                .button-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50; }
                
                .button-base-text { @apply px-3 py-1.5 text-xs rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5; }
                .button-green { @apply button-base-text bg-green-600 text-white hover:bg-green-700 focus:ring-green-400; }
                .button-red { @apply button-base-text bg-red-600 text-white hover:bg-red-700 focus:ring-red-400; }
                .button-sky { @apply button-base-text bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-400; }
                .button-yellow { @apply button-base-text bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400; }

                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                
                .page-button { @apply px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .page-button-active { @apply bg-sky-600 text-white border-sky-600 hover:bg-sky-700; }
            `}</style>
        </div>
    );
}
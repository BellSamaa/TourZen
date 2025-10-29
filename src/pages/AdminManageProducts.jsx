// src/pages/AdminManageProducts.jsx
// (V3.1: Khôi phục JSX + Nâng cấp nút Sửa)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaSpinner, FaSyncAlt, FaThList, FaThLarge, FaImage, FaRegSave, FaTimes, FaMinus, FaPlus } from "react-icons/fa"; // Bổ sung icon cần thiết
import {
    CheckSquare, Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, CalendarPlus,
    PencilLine, UploadSimple, WarningCircle, CheckCircle, Clock, XCircle, Ticket, Triangle, // Icons Phosphor
    Trash, FloppyDisk, Info // Thêm icons
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

// --- Component Trạng thái Phê duyệt (Giữ nguyên) ---
const ApprovalStatus = ({ status }) => {
  switch (status) {
    case "approved":
      return <span className="badge-green"><CheckCircle weight="bold" /> Đã duyệt</span>;
    case "rejected":
      return <span className="badge-red"><XCircle weight="bold" /> Bị từ chối</span>;
    default:
      return <span className="badge-yellow"><Clock weight="bold" /> Chờ duyệt</span>;
  }
};

// --- Component Tóm tắt Slot (Giữ nguyên) ---
const SlotSummary = ({ departures }) => {
    if (!Array.isArray(departures)) {
        console.warn("Departures data is not an array:", departures);
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
            <Ticket weight="bold" /> {totalRemaining > 0 ? `Còn ${totalRemaining} chỗ` : 'Hết chỗ'}
            <span className="font-normal opacity-75">({upcomingDepartures.length} lịch)</span>
        </span>
    );
};


// --- (KHÔI PHỤC ĐẦY ĐỦ) Component con DeparturesManager ---
const DeparturesManager = ({ tourId }) => {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRow, setEditingRow] = useState(null);

    const fetchDepartures = useCallback(async () => {
        setLoading(true); setError(null);
        const { data, error } = await supabase.from("Departures").select("*").eq("product_id", tourId).order("departure_date", { ascending: true });
        if (error) { console.error("Lỗi tải departures:", error); setError(error.message); toast.error("Lỗi tải lịch khởi hành: " + error.message); }
        else { setDepartures(data || []); }
        setLoading(false);
    }, [tourId]);

    useEffect(() => { fetchDepartures(); }, [fetchDepartures]);

    const handleAddNew = () => {
        if (editingRow) return;
        setEditingRow({ id: 'new', departure_date: '', adult_price: 0, child_price: 0, max_slots: 20 });
    };
    const handleEdit = (row) => {
        if (editingRow) return;
        setEditingRow({ ...row });
    };
    const handleCancel = () => { setEditingRow(null); };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc muốn XÓA lịch khởi hành này?")) return;
        const { error } = await supabase.from("Departures").delete().eq("id", id);
        if (error) { toast.error("Lỗi xóa: " + error.message); }
        else { toast.success("Đã xóa lịch khởi hành."); fetchDepartures(); }
    };

    const handleSave = async () => {
        if (!editingRow.departure_date || editingRow.adult_price <= 0 || editingRow.max_slots <= 0) {
            toast.error("Vui lòng điền Ngày đi, Giá người lớn (>0) và Tổng số chỗ (>0)."); return;
        }
        const dataToSave = {
            product_id: tourId, departure_date: editingRow.departure_date,
            adult_price: parseFloat(editingRow.adult_price), child_price: parseFloat(editingRow.child_price) || 0,
            max_slots: parseInt(editingRow.max_slots),
        };
        const { error } = (editingRow.id === 'new')
            ? await supabase.from("Departures").insert(dataToSave)
            : await supabase.from("Departures").update(dataToSave).eq("id", editingRow.id);
        if (error) {
            toast.error(error.code === '23505' ? "Lỗi: Ngày khởi hành này đã tồn tại." : "Lỗi lưu: " + error.message);
        } else {
            toast.success(editingRow.id === 'new' ? "Đã thêm!" : "Đã cập nhật!");
            setEditingRow(null); fetchDepartures();
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = value;
        if (type === 'number') { finalValue = name === 'max_slots' ? parseInt(value) || 0 : parseFloat(value) || 0; }
        setEditingRow(prev => ({ ...prev, [name]: finalValue }));
    };
    // Hàm format tiền tệ (cần thiết cho hiển thị)
    const formatCurrency = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
    };

    return (
        <div className="border-t pt-4 dark:border-neutral-700">
             <div className="flex justify-between items-center mb-2">
                 <h4 className="text-lg font-semibold dark:text-white">Lịch khởi hành & Slots *</h4>
                 <button type="button" onClick={handleAddNew} disabled={!!editingRow} className="modal-button-primary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-50">
                     <CalendarPlus size={16} /> Thêm ngày
                 </button>
             </div>
             {loading && <div className="flex justify-center p-4"><CircleNotch size={24} className="animate-spin text-sky-500" /></div>}
             {error && <div className="text-red-500 p-4 text-center">{error}</div>}
             {!loading && !error && (
                 <div className="overflow-x-auto max-h-[300px] overflow-y-auto border dark:border-neutral-600 rounded-md">
                     <table className="min-w-full text-sm">
                         <thead className="bg-gray-100 dark:bg-neutral-700 sticky top-0">
                             <tr>
                                 <th className="px-3 py-2 text-left">Ngày đi</th>
                                 <th className="px-3 py-2 text-left">Giá Lớn</th>
                                 <th className="px-3 py-2 text-left">Giá Trẻ</th>
                                 <th className="px-3 py-2 text-left">Slots</th>
                                 <th className="px-3 py-2 text-left">Đã đặt</th>
                                 <th className="px-3 py-2 text-right">Hành động</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y dark:divide-neutral-600">
                             {editingRow && (
                                 <tr className="bg-sky-50 dark:bg-sky-900/30">
                                     <td className="p-2"><input type="date" name="departure_date" value={editingRow.departure_date} onChange={handleFormChange} className="input-style !p-1.5"/></td>
                                     <td className="p-2"><input type="number" name="adult_price" value={editingRow.adult_price} onChange={handleFormChange} className="input-style !p-1.5" min="0"/></td>
                                     <td className="p-2"><input type="number" name="child_price" value={editingRow.child_price} onChange={handleFormChange} className="input-style !p-1.5" min="0"/></td>
                                     <td className="p-2"><input type="number" name="max_slots" value={editingRow.max_slots} onChange={handleFormChange} className="input-style !p-1.5" min="0"/></td>
                                     <td className="p-2 text-gray-500 italic">{editingRow.id === 'new' ? '0' : (editingRow.booked_slots || 0)}</td>
                                     <td className="p-2 text-right space-x-1 whitespace-nowrap">
                                         <button type="button" onClick={handleSave} className="button-icon-green" title="Lưu"><FloppyDisk size={14}/></button>
                                         <button type="button" onClick={handleCancel} className="button-icon-gray" title="Hủy"><X size={14}/></button>
                                     </td>
                                 </tr>
                             )}
                             {departures.map(dep => (
                                 <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                     <td className="px-3 py-2">{dep.departure_date}</td>
                                     <td className="px-3 py-2">{formatCurrency(dep.adult_price)}</td>
                                     <td className="px-3 py-2">{formatCurrency(dep.child_price)}</td>
                                     <td className="px-3 py-2 font-medium">{dep.max_slots || 0}</td>
                                     <td className="px-3 py-2 font-medium">{dep.booked_slots || 0}</td>
                                     <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                                         <button type="button" onClick={() => handleEdit(dep)} disabled={!!editingRow} className="button-icon-sky" title="Sửa"><PencilLine size={14}/></button>
                                         <button type="button" onClick={() => handleDelete(dep.id)} disabled={!!editingRow} className="button-icon-red" title="Xóa"><Trash size={14}/></button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                     {departures.length === 0 && !editingRow && (
                         <div className="p-4 text-center text-gray-500 italic">Chưa có lịch khởi hành nào. Hãy nhấn "Thêm ngày".</div>
                     )}
                 </div>
             )}
             {departures.length === 0 && !loading && !error && (
                 <div className="mt-2 p-2.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
                     <WarningCircle weight="bold" size={18} />
                     Tour phải có ít nhất 1 lịch khởi hành (còn slots) mới có thể đăng và hiển thị cho khách.
                 </div>
             )}
        </div>
    );
};
// --- KẾT THÚC KHÔI PHỤC ---


// --- (KHÔI PHỤC ĐẦY ĐỦ) Modal Chỉnh sửa Tour ---
const EditTourModal = ({ tour, onClose, onSuccess, suppliers }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', price: 0, location: '', duration: '',
        supplier_id: '', image_url: '', tour_code: '',
        itinerary: [],
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setFormData({
            name: tour.name || '', description: tour.description || '', price: tour.price || 0,
            location: tour.location || '', duration: tour.duration || '', supplier_id: tour.supplier_id || '',
            image_url: tour.image_url || '', tour_code: tour.tour_code || '',
            itinerary: Array.isArray(tour.itinerary) ? tour.itinerary.map((item, index) => (
                typeof item === 'string' ? { title: `Ngày ${index + 1}`, content: item } : { title: item.title || `Ngày ${index + 1}`, content: item.content || item }
            )) : [{ title: 'Ngày 1', content: '' }],
        });
    }, [tour]);

    const handleChange = (e) => { /* ... */ };
    const handleItineraryChange = (index, field, value) => { /* ... */ };
    const addItineraryItem = () => { /* ... */ };
    const removeItineraryItem = (index) => { /* ... */ };
    const handleImageUpload = async (e) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <motion.div
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white">
                        {tour.is_published ? 'Chỉnh sửa Tour đã đăng' : 'Hoàn thiện & Đăng Tour'}
                    </h3>
                    <button onClick={onClose} disabled={loading || uploading} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"><X size={20}/></button>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <form id="main-tour-form" onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
                        {/* Thông tin cơ bản */}
                        <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {/* ... Inputs cho name, tour_code, price, location, duration, supplier_id ... */}
                        </fieldset>
                        {/* Ảnh */}
                        <div>
                           {/* ... Input URL + Nút Tải lên + Ảnh preview ... */}
                        </div>
                        {/* Mô tả */}
                        <div> {/* ... Textarea Mô tả ... */} </div>
                        {/* Lịch trình */}
                        <div className="border-t pt-4 dark:border-neutral-700">
                           {/* ... JSX Lịch trình (map, input, textarea, nút xóa/thêm) ... */}
                        </div>
                        {/* Quản lý Lịch khởi hành */}
                        <div className="border-t pt-4 dark:border-neutral-700">
                            <DeparturesManager tourId={tour.id} />
                        </div>
                    </form>
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                        {/* ... Nút Hủy và Lưu/Đăng ... */}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
// --- KẾT THÚC KHÔI PHỤC ---


// --- Component chính: Quản lý Sản phẩm (Tour) ---
export default function AdminManageProducts() {
    // ... (state giữ nguyên) ...
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    // ... (các state khác)

    // --- fetchProducts (Giữ nguyên) ---
    const fetchProducts = useCallback(async (isInitialLoad = false) => { /* ... */ }, [currentPage, debouncedSearch, suppliers.length, ITEMS_PER_PAGE]);

    // --- useEffects (Giữ nguyên) ---
    useEffect(() => { fetchProducts(true); }, [fetchProducts]);
    useEffect(() => { /* ... reset page ... */ }, [debouncedSearch]);

    // --- Handlers (Giữ nguyên) ---
    const handleSetStatus = async (id, newStatus) => { /* ... */ };
    const handleDelete = async (tour) => { /* ... */ };
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // --- (SỬA) JSX cho Nút bấm Actions ---
    const ActionButtons = ({ product }) => (
        <div className="flex items-center justify-end gap-2 flex-wrap">
            {/* ... JSX các nút Duyệt, Từ chối, Sửa & Đăng, Đặt lại chờ, Xóa ... */}
            {/* Sửa nút Sửa: */}
            {product.approval_status === 'approved' && (
                <button
                    onClick={() => setModalTour(product)} // Đảm bảo gọi setModalTour
                    disabled={isFetchingPage}
                    className="button-sky text-xs flex items-center gap-1.5 !px-3 !py-1.5"
                    title="Sửa thông tin & Lịch khởi hành"
                >
                    <PencilLine weight="bold" size={14}/> Sửa
                </button>
            )}
            {/* ... (Các nút khác giữ nguyên) ... */}
        </div>
    );
    // --- KẾT THÚC SỬA ---

    // --- SỬA Ở ĐÂY: KHÔI PHỤC JSX Card ---
    const TourCard = ({ product }) => (
        <div className="flex flex-col bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border dark:border-slate-700 transition-all duration-300 hover:shadow-xl">
            <div className="relative h-48 w-full flex-shrink-0">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover"
                         onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Error'; }} />
                ) : (
                    <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <FaImage className="text-4xl text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90"></div>
                <div className="absolute top-2 right-2 z-10"><ApprovalStatus status={product.approval_status} /></div>
                <div className="absolute bottom-2 left-2 z-10"><SlotSummary departures={product.Departures} /></div>
                {product.approval_status === 'approved' && (
                    <div className="absolute top-2 left-2 z-10">
                        {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 line-clamp-2" title={product.name}>
                    {product.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    NCC: <Link to={`/admin/suppliers?search=${product.supplier?.name}`} className="font-medium hover:underline">{product.supplier?.name || 'N/A'}</Link>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Mã: {product.tour_code || "N/A"}
                </p>
                <div className="mt-auto pt-3 border-t dark:border-slate-700">
                    <ActionButtons product={product} />
                </div>
            </div>
        </div>
    );
    // --- KẾT THÚC KHÔI PHỤC ---

    // --- SỬA Ở ĐÂY: KHÔI PHỤC JSX List Item ---
    const TourListItem = ({ product }) => (
        <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-12 w-16 object-cover rounded-md flex-shrink-0"
                             onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}/>
                    ) : (
                        <div className="h-12 w-16 bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-md flex-shrink-0">
                            <FaImage className="text-2xl text-slate-400 dark:text-slate-500" />
                        </div>
                    )}
                    <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{product.tour_code || "N/A"}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                 <Link to={`/admin/suppliers?search=${product.supplier?.name}`} className="link-style hover:text-sky-500" title={`Xem NCC ${product.supplier?.name}`}>
                    {product.supplier?.name || "N/A"}
                 </Link>
            </td>
            <td className="px-6 py-4 text-sm"><SlotSummary departures={product.Departures} /></td>
            <td className="px-6 py-4 text-sm"><ApprovalStatus status={product.approval_status} /></td>
            <td className="px-6 py-4 text-sm">
                {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>}
            </td>
            <td className="px-6 py-4 text-right text-sm">
                <ActionButtons product={product} />
            </td>
        </tr>
    );
    // --- KẾT THÚC KHÔI PHỤC ---

    // --- JSX Chính (Giữ nguyên) ---
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
                         <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên tour, NCC, mã..." className="search-input"/>
                     </div>
                     {/* Nút đổi View */}
                     <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`} title="Xem dạng danh sách"><FaThList /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`} title="Xem dạng lưới"><FaThLarge /></button>
                     </div>
                     <button onClick={() => fetchProducts(true)} disabled={loading || isFetchingPage} className={`button-secondary flex items-center gap-2 flex-shrink-0 ${isFetchingPage ? 'opacity-50 cursor-not-allowed' : ''}`}> <FaSyncAlt className={isFetchingPage ? "animate-spin" : ""} /> Làm mới </button>
                </div>
            </div>

            {/* Hiển thị Grid hoặc List */}
            {loading ? (
                <div className="flex justify-center items-center h-[calc(100vh-250px)]">
                    <CircleNotch size={48} className="animate-spin text-sky-500" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">{error}</div>
            ) : products.length === 0 ? (
                 <div className="text-center py-20 text-gray-500 dark:text-gray-400 italic">
                    {debouncedSearch ? "Không tìm thấy tour nào khớp." : "Chưa có tour nào."}
                 </div>
            ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <TourCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                // List View (Table)
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                    <div className="overflow-x-auto relative">
                        {isFetchingPage && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="th-style">Tên Tour</th>
                                    <th className="th-style">Nhà Cung Cấp</th>
                                    <th className="th-style">Tồn kho (Slots)</th>
                                    <th className="th-style">Trạng thái Duyệt</th>
                                    <th className="th-style">Trạng thái Đăng</th>
                                    <th className="th-style text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {products.map((product) => (
                                    <TourListItem key={product.id} product={product} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


{/* Pagination UI */}
                {!loading && totalItems > ITEMS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                      {/* Phần hiển thị số lượng */}
                      <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> tours </div>
                      {/* Phần nút bấm */}
                      <div className="flex items-center gap-1 mt-3 sm:mt-0">
                           <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
                           {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
                               <button
                                   key={pageNumber}
                                   onClick={() => setCurrentPage(pageNumber)}
                                   disabled={isFetchingPage}
                                   // Đảm bảo dùng currentPage ở đây
                                   className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}
                               >
                                   {pageNumber}
                               </button>
                           ))}
                           <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
                      </div>
                  </div>
             )}
            {/* Kết thúc Pagination UI */}
            {/* Modal Edit */}
            {modalTour && ( <EditTourModal tour={modalTour} onClose={() => setModalTour(null)} onSuccess={() => fetchProducts(false)} suppliers={suppliers} /> )}

            {/* CSS */}
            <style jsx>{`
                /* (CSS cũ giữ nguyên) */
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .link-style { @apply hover:underline; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }

                /* (CSS trong Modal giữ nguyên) */
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }

                /* (SỬA/THÊM) Badge & Nút bấm */
                .badge-base { @apply px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }

                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-green { @apply button-icon-base text-green-500 hover:bg-green-100 hover:text-green-600 dark:text-green-400 dark:hover:bg-green-900/30 focus:ring-green-400; }
                .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
                .button-icon-sky { @apply button-icon-base text-sky-500 hover:bg-sky-100 hover:text-sky-600 dark:text-sky-400 dark:hover:bg-sky-900/30 focus:ring-sky-400; }
                .button-icon-gray { @apply button-icon-base text-gray-500 hover:bg-gray-200 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 focus:ring-gray-300; }

                /* (SỬA) Nút bấm có chữ */
                .button-base-text { @apply px-3 py-1.5 text-xs rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5; }
                .button-blue { @apply button-base-text bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400; }
                .button-sky { @apply button-base-text bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-400; } /* Class mới cho nút Sửa */

            `}</style>
        </div>
    );
}
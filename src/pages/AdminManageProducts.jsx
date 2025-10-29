// src/pages/AdminManageProducts.jsx
// (V3: Khôi phục EditTourModal + Nâng cấp nút Sửa)

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
const getPaginationWindow = (currentPage, totalPages, width = 2) => { /* ... */ };

// --- Component Trạng thái Phê duyệt (Giữ nguyên) ---
const ApprovalStatus = ({ status }) => { /* ... */ };

// --- Component Tóm tắt Slot (Giữ nguyên) ---
const SlotSummary = ({ departures }) => { /* ... */ };

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
    const [uploading, setUploading] = useState(false); // Thêm state uploading

    useEffect(() => {
        setFormData({
            name: tour.name || '',
            description: tour.description || '',
            price: tour.price || 0,
            location: tour.location || '',
            duration: tour.duration || '',
            supplier_id: tour.supplier_id || '',
            image_url: tour.image_url || '',
            tour_code: tour.tour_code || '',
            itinerary: Array.isArray(tour.itinerary) ? tour.itinerary.map((item, index) => (
                typeof item === 'string'
                    ? { title: `Ngày ${index + 1}`, content: item }
                    : { title: item.title || `Ngày ${index + 1}`, content: item.content || item }
            )) : [{ title: 'Ngày 1', content: '' }], // Fallback nếu itinerary không phải array
        });
    }, [tour]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };
    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index] = { ...newItinerary[index], [field]: value };
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };
    const addItineraryItem = () => {
        setFormData(prev => ({ ...prev, itinerary: [...prev.itinerary, { title: `Ngày ${prev.itinerary.length + 1}`, content: '' }] }));
    };
    const removeItineraryItem = (index) => {
        setFormData(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== index) }));
    };

    // Hàm Upload ảnh (Thêm từ ProductModal cũ)
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const toastId = toast.loading("Đang tải ảnh lên...");
        const fileName = `tour_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from("product-images").upload(fileName, file);
        if (error) { toast.error("Lỗi upload ảnh: " + error.message, { id: toastId }); }
        else {
            const url = `${supabase.storageUrl}/object/public/product-images/${fileName}`;
            setFormData((prev) => ({ ...prev, image_url: url }));
            toast.success("Tải ảnh thành công!", { id: toastId });
        }
        setUploading(false);
    };

    // Hàm Submit (logic giữ nguyên)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Đang xử lý...");

        const { data: departuresData, error: departuresError } = await supabase
            .from("Departures").select("id, max_slots, booked_slots").eq("product_id", tour.id);

        if (departuresError) {
             toast.error("Lỗi kiểm tra lịch: " + departuresError.message, { id: toastId });
             setLoading(false); return;
        }
        const hasValidDepartures = departuresData && departuresData.some(d => (d.max_slots || 0) > (d.booked_slots || 0));

        const dataToUpdate = {
            name: formData.name, description: formData.description, price: parseFloat(formData.price),
            location: formData.location, duration: formData.duration, supplier_id: formData.supplier_id,
            image_url: formData.image_url, tour_code: formData.tour_code,
            itinerary: formData.itinerary,
            is_published: true, approval_status: 'approved'
        };
        // Xóa các trường JSON cũ nếu còn
        delete dataToUpdate.departure_months; delete dataToUpdate.departures;

        if (!dataToUpdate.name || !dataToUpdate.supplier_id) {
            toast.error("Vui lòng điền Tên tour và chọn NCC.", { id: toastId }); setLoading(false); return;
        }
        if (!hasValidDepartures) {
             toast.error("Tour phải có ít nhất 1 lịch khởi hành còn chỗ.", { id: toastId });
             dataToUpdate.is_published = false;
             toast.warn("Tour đã lưu nhưng BỊ TẮT ĐĂNG.", { id: toastId, duration: 4000 });
        }

        const { error } = await supabase.from("Products").update(dataToUpdate).eq("id", tour.id);

        if (error) { toast.error("Lỗi cập nhật: " + error.message, { id: toastId }); }
        else {
            if (dataToUpdate.is_published) { toast.success(tour.is_published ? "Đã cập nhật!" : "Đã lưu và đăng!", { id: toastId }); }
            else { toast.success("Đã cập nhật (chưa đăng).", { id: toastId }); }
            onSuccess(); onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <motion.div
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
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
                            <div> <label className="label-style">Tên Tour *</label> <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" /> </div>
                            <div> <label className="label-style">Mã Tour (Nội bộ)</label> <input type="text" name="tour_code" value={formData.tour_code} onChange={handleChange} className="input-style" /> </div>
                            <div> <label className="label-style">Giá (Từ) (VNĐ) *</label> <input type="number" name="price" value={formData.price} onChange={handleChange} required className="input-style" min="0"/> </div>
                            <div> <label className="label-style">Địa điểm</label> <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" /> </div>
                            <div> <label className="label-style">Thời lượng (VD: 3N2Đ)</label> <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" /> </div>
                            <div>
                                <label className="label-style">Nhà cung cấp *</label>
                                <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style">
                                    <option value="" disabled>-- Chọn NCC --</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </fieldset>
                        {/* Ảnh */}
                        <div>
                            <label className="label-style">Ảnh minh họa (URL hoặc Tải lên)</label>
                            <div className="flex items-center gap-2">
                                <input type="text" name="image_url" placeholder="https://..." value={formData.image_url} onChange={handleChange} className="input-style flex-1"/>
                                <label className="modal-button-secondary px-3 py-2 cursor-pointer whitespace-nowrap flex items-center gap-2">
                                    <UploadSimple size={18} />
                                    {uploading ? <CircleNotch size={18} className="animate-spin" /> : "Tải lên"}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                                </label>
                            </div>
                            {formData.image_url && ( <img src={formData.image_url} alt="Xem trước" className="mt-2 rounded-lg w-40 h-28 object-cover border dark:border-neutral-600 shadow-sm"/> )}
                        </div>
                        {/* Mô tả */}
                        <div> <label className="label-style">Mô tả Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="input-style"></textarea> </div>
                        {/* Lịch trình */}
                        <div className="border-t pt-4 dark:border-neutral-700">
                            <h4 className="text-lg font-semibold mb-2 dark:text-white">Lịch trình chi tiết</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {formData.itinerary.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 border rounded-md dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700/50">
                                        <input type="text" placeholder="Tiêu đề (VD: Ngày 1)" value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} className="input-style sm:w-1/3 font-medium !py-1.5" />
                                        <textarea placeholder="Nội dung hoạt động..." value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} rows="2" className="input-style flex-1 resize-y !py-1.5"></textarea>
                                        <button type="button" onClick={() => removeItineraryItem(index)} className="button-icon-red self-center" title="Xóa ngày"><Minus size={14} /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addItineraryItem} className="mt-2 text-sm text-sky-600 flex items-center gap-1 hover:underline"><Plus size={14} /> Thêm ngày</button>
                        </div>
                        {/* Quản lý Lịch khởi hành */}
                        <div className="border-t pt-4 dark:border-neutral-700">
                            <DeparturesManager tourId={tour.id} />
                        </div>
                    </form>
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={loading || uploading} className="modal-button-secondary">Hủy</button>
                        <button type="submit" form="main-tour-form" disabled={loading || uploading} className="modal-button-primary flex items-center gap-1.5">
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : (tour.is_published ? <PencilLine size={18} /> : <UploadSimple size={18} />) }
                            {tour.is_published ? 'Lưu thay đổi' : 'Hoàn tất & Đăng tour'}
                        </button>
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
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [modalTour, setModalTour] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [viewMode, setViewMode] = useState('list');
    const ITEMS_PER_PAGE = viewMode === 'grid' ? 12 : 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;


    // --- fetchProducts (Giữ nguyên) ---
    const fetchProducts = useCallback(async (isInitialLoad = false) => { /* ... */ }, [currentPage, debouncedSearch, suppliers.length, ITEMS_PER_PAGE]);

    // --- useEffects (Giữ nguyên) ---
    useEffect(() => { fetchProducts(true); }, [fetchProducts]);
    useEffect(() => { if (currentPage !== 1) { setCurrentPage(1); } }, [debouncedSearch]);

    // --- Handlers (Giữ nguyên) ---
    const handleSetStatus = async (id, newStatus) => { /* ... */ };
    const handleDelete = async (tour) => { /* ... */ };
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // --- (SỬA) JSX cho Nút bấm Actions ---
    const ActionButtons = ({ product }) => (
        <div className="flex items-center justify-end gap-2 flex-wrap"> {/* Tăng gap */}
            {product.approval_status === 'pending' && (
                <>
                <button onClick={() => handleSetStatus(product.id, 'approved')} disabled={isFetchingPage} className="button-icon-green" title="Duyệt tour"><CheckSquare weight="bold" size={16}/></button>
                <button onClick={() => handleSetStatus(product.id, 'rejected')} disabled={isFetchingPage} className="button-icon-red" title="Từ chối tour"><XCircle weight="bold" size={16}/></button>
                </>
            )}
            {/* Nút Sửa & Đăng */}
            {product.approval_status === 'approved' && !product.is_published && (
                <button
                    onClick={() => setModalTour(product)}
                    disabled={isFetchingPage}
                    className="button-blue text-xs flex items-center gap-1.5 !px-3 !py-1.5" // Tăng padding
                >
                    <UploadSimple size={14}/> Sửa & Đăng
                </button>
            )}
             {/* Nút Sửa (luôn hiển thị nếu đã duyệt) */}
            {product.approval_status === 'approved' && (
                <button
                    onClick={() => setModalTour(product)}
                    disabled={isFetchingPage}
                    className="button-sky text-xs flex items-center gap-1.5 !px-3 !py-1.5" // Dùng class mới button-sky
                    title="Sửa thông tin & Lịch khởi hành"
                >
                    <PencilLine weight="bold" size={14}/> Sửa
                </button>
            )}
            {/* Nút Đặt lại chờ */}
             {(product.approval_status === 'approved' || product.approval_status === 'rejected') && (
                <button onClick={() => handleSetStatus(product.id, 'pending')} disabled={isFetchingPage} className="button-icon-gray" title="Đặt lại chờ duyệt"> ↩️ </button>
             )}
             {/* Nút Xóa */}
            <button onClick={() => handleDelete(product)} disabled={isFetchingPage} className="button-icon-red" title="Xóa tour"> <Trash weight="bold" size={16}/> </button>
        </div>
    );
    // --- KẾT THÚC SỬA ---

    // --- JSX Card (Giữ nguyên) ---
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
    // --- JSX List Item (Giữ nguyên) ---
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
    // --- JSX Chính (Giữ nguyên) ---
    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header + Search + Refresh */}
            {/* ... JSX Header giữ nguyên ... */}

            {/* Hiển thị Grid hoặc List */}
            {/* ... JSX Loading, Error, Grid/List giữ nguyên ... */}

            {/* Pagination UI */}
            {/* ... JSX Pagination giữ nguyên ... */}

            {/* Modal Edit */}
            {modalTour && ( <EditTourModal tour={modalTour} onClose={() => setModalTour(null)} onSuccess={() => fetchProducts(false)} suppliers={suppliers} /> )}

            {/* CSS */}
            <style jsx>{`
                /* (CSS cũ giữ nguyên) */
                /* ... */

                /* (SỬA/THÊM) Badge & Nút bấm */
                .badge-base { @apply px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap; }
                /* ... (các màu badge giữ nguyên) ... */
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }


                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                /* ... (các màu button icon giữ nguyên) ... */
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
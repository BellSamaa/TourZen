// src/pages/AdminManageProducts.jsx
// (NÂNG CẤP: Đã tích hợp bảng "Departures" mới để quản lý slots)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaSpinner, FaCheck, FaTimes, FaEdit, FaTrash, FaRegSave, FaPlus, FaMinus, FaSyncAlt } from "react-icons/fa";
import { CheckSquare, Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, CalendarPlus, PencilLine, UploadSimple, WarningCircle } from "@phosphor-icons/react";

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


// --- (MỚI) Component con để quản lý Lịch khởi hành (Departures) ---
const DeparturesManager = ({ tourId }) => {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRow, setEditingRow] = useState(null); // Lưu { id, date, adult_price, child_price, max_slots }

    // Tải danh sách lịch khởi hành của tour này
    const fetchDepartures = useCallback(async () => {
        setLoading(true); setError(null);
        const { data, error } = await supabase
            .from("Departures")
            .select("*")
            .eq("product_id", tourId)
            .order("departure_date", { ascending: true });
        
        if (error) {
            console.error("Lỗi tải departures:", error);
            setError(error.message);
            toast.error("Lỗi tải lịch khởi hành: " + error.message);
        } else {
            setDepartures(data);
        }
        setLoading(false);
    }, [tourId]);

    useEffect(() => {
        fetchDepartures();
    }, [fetchDepartures]);

    // Bắt đầu thêm mới (tạo 1 hàng rỗng để điền)
    const handleAddNew = () => {
        if (editingRow) return; // Không cho thêm khi đang sửa
        setEditingRow({
            id: 'new', // Đánh dấu là hàng mới
            departure_date: '',
            adult_price: 0,
            child_price: 0,
            max_slots: 20 // Mặc định
        });
    };

    // Bắt đầu chỉnh sửa hàng đã có
    const handleEdit = (row) => {
        if (editingRow) return; // Không cho sửa khi đang thêm
        setEditingRow({ ...row }); // Copy data của hàng vào form
    };

    // Hủy thêm/sửa
    const handleCancel = () => {
        setEditingRow(null);
    };

    // Xóa một lịch khởi hành
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc muốn XÓA lịch khởi hành này? Chỗ đã đặt (nếu có) cũng sẽ mất thông tin.")) return;
        
        const { error } = await supabase.from("Departures").delete().eq("id", id);
        if (error) {
            toast.error("Lỗi xóa: " + error.message);
        } else {
            toast.success("Đã xóa lịch khởi hành.");
            fetchDepartures(); // Tải lại danh sách
        }
    };

    // Xử lý lưu (cho cả Thêm mới và Cập nhật)
    const handleSave = async () => {
        if (!editingRow.departure_date || editingRow.adult_price <= 0 || editingRow.max_slots <= 0) {
            toast.error("Vui lòng điền Ngày đi, Giá người lớn (>0) và Tổng số chỗ (>0).");
            return;
        }

        const dataToSave = {
            product_id: tourId,
            departure_date: editingRow.departure_date,
            adult_price: parseFloat(editingRow.adult_price),
            child_price: parseFloat(editingRow.child_price) || 0,
            max_slots: parseInt(editingRow.max_slots),
        };

        let error = null;
        if (editingRow.id === 'new') {
            // Thêm mới
            const { error: insertError } = await supabase.from("Departures").insert(dataToSave);
            error = insertError;
        } else {
            // Cập nhật
            const { error: updateError } = await supabase.from("Departures").update(dataToSave).eq("id", editingRow.id);
            error = updateError;
        }

        if (error) {
            if (error.code === '23505') { // Lỗi unique (trùng ngày)
                toast.error("Lỗi: Ngày khởi hành này đã tồn tại cho tour.");
            } else {
                toast.error("Lỗi lưu: " + error.message);
            }
        } else {
            toast.success(editingRow.id === 'new' ? "Đã thêm lịch khởi hành!" : "Đã cập nhật!");
            setEditingRow(null); // Thoát chế độ edit
            fetchDepartures(); // Tải lại danh sách
        }
    };

    // Cập nhật state của form đang sửa
    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = value;
        if (type === 'number') {
            finalValue = name === 'max_slots' ? parseInt(value) || 0 : parseFloat(value) || 0;
        }
        setEditingRow(prev => ({ ...prev, [name]: finalValue }));
    };

    // --- JSX cho Bảng quản lý Lịch khởi hành ---
    return (
        <div className="border-t pt-4 dark:border-neutral-700">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold dark:text-white">Lịch khởi hành & Slots *</h4>
                <button 
                    type="button" 
                    onClick={handleAddNew}
                    disabled={!!editingRow}
                    className="modal-button-primary text-sm px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                >
                    <CalendarPlus size={16} /> Thêm ngày
                </button>
            </div>
            
            {loading && <div className="flex justify-center p-4"><FaSpinner className="animate-spin text-sky-500" /></div>}
            {error && <div className="text-red-500 p-4 text-center">{error}</div>}
            
            {!loading && !error && (
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto border dark:border-neutral-600 rounded-md">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-neutral-700 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left">Ngày đi</th>
                                <th className="px-3 py-2 text-left">Giá Người lớn</th>
                                <th className="px-3 py-2 text-left">Giá Trẻ em</th>
                                <th className="px-3 py-2 text-left">Tổng Slots</th>
                                <th className="px-3 py-2 text-left">Đã đặt</th>
                                <th className="px-3 py-2 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-neutral-600">
                            {/* Hàng để Thêm mới / Sửa */}
                            {editingRow && (
                                <tr className="bg-sky-50 dark:bg-sky-900/30">
                                    <td className="p-2"><input type="date" name="departure_date" value={editingRow.departure_date} onChange={handleFormChange} className="input-style !p-1.5"/></td>
                                    <td className="p-2"><input type="number" name="adult_price" value={editingRow.adult_price} onChange={handleFormChange} className="input-style !p-1.5" min="0" step="1000"/></td>
                                    <td className="p-2"><input type="number" name="child_price" value={editingRow.child_price} onChange={handleFormChange} className="input-style !p-1.5" min="0" step="1000"/></td>
                                    <td className="p-2"><input type="number" name="max_slots" value={editingRow.max_slots} onChange={handleFormChange} className="input-style !p-1.5" min="0" step="1"/></td>
                                    <td className="p-2 text-gray-500 italic">{editingRow.id === 'new' ? '0' : editingRow.booked_slots}</td>
                                    <td className="p-2 text-right space-x-1 whitespace-nowrap">
                                        <button type="button" onClick={handleSave} className="button-icon-green" title="Lưu"><FaRegSave size={14}/></button>
                                        <button type="button" onClick={handleCancel} className="button-icon-gray" title="Hủy"><FaTimes size={14}/></button>
                                    </td>
                                </tr>
                            )}

                            {/* Danh sách các hàng đã có */}
                            {departures.map(dep => (
                                <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                    <td className="px-3 py-2">{dep.departure_date}</td>
                                    <td className="px-3 py-2">{dep.adult_price?.toLocaleString('vi-VN')}</td>
                                    <td className="px-3 py-2">{dep.child_price?.toLocaleString('vi-VN')}</td>
                                    <td className="px-3 py-2 font-medium">{dep.max_slots}</td>
                                    <td className="px-3 py-2 font-medium">{dep.booked_slots}</td>
                                    <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                                        <button type="button" onClick={() => handleEdit(dep)} disabled={!!editingRow} className="button-icon-sky" title="Sửa"><PencilLine size={14}/></button>
                                        <button type="button" onClick={() => handleDelete(dep.id)} disabled={!!editingRow} className="button-icon-red" title="Xóa"><FaTrash size={14}/></button>
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
            
            {/* Cảnh báo quan trọng */}
            {departures.length === 0 && !loading && (
                <div className="mt-2 p-2.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
                    <WarningCircle weight="bold" size={18} />
                    Tour phải có ít nhất 1 lịch khởi hành (còn slots) mới có thể đăng và hiển thị cho khách.
                </div>
            )}
        </div>
    );
};


// --- (SỬA) Modal Chỉnh sửa Tour ---
// (ĐÃ XÓA logic quản lý departures cũ, thay bằng <DeparturesManager />)
const EditTourModal = ({ tour, onClose, onSuccess, suppliers }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', price: 0, location: '', duration: '',
        supplier_id: '',
        itinerary: [], // [{ title: string, content: string }]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load data từ tour prop
        setFormData({
            name: tour.name || '',
            description: tour.description || '',
            price: tour.price || 0, // Giá gốc (có thể không còn dùng, nhưng giữ lại)
            location: tour.location || '',
            duration: tour.duration || '',
            supplier_id: tour.supplier_id || '',
            itinerary: Array.isArray(tour.itinerary)
                ? tour.itinerary.map((item, index) => (typeof item === 'string'
                    ? { title: `Ngày ${index + 1}`, content: item }
                    : { title: item.title || `Ngày ${index + 1}`, content: item.content || item }
                )) : [],
            // KHÔNG CẦN load departures ở đây nữa, component con sẽ tự load
        });
    }, [tour]);

    // Các hàm handleChange, handleItineraryChange, add/remove item... (Giữ nguyên)
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
    // KHÔNG CẦN các hàm handleDepartureChange, add/remove departure nữa

    // Hàm Submit (Lưu & Đăng)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // 1. Kiểm tra xem tour này có lịch khởi hành hợp lệ không
        const { data: departuresData, error: departuresError } = await supabase
            .from("Departures")
            .select("id, max_slots, booked_slots")
            .eq("product_id", tour.id);

        if (departuresError) {
             toast.error("Lỗi kiểm tra lịch khởi hành: " + departuresError.message);
             setLoading(false); return;
        }

        const hasValidDepartures = departuresData.some(d => d.max_slots > d.booked_slots);

        // 2. Chuẩn bị data để update bảng Products
        const dataToUpdate = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price), // Giá này có thể là giá "từ", hoặc không dùng
            location: formData.location,
            duration: formData.duration,
            supplier_id: formData.supplier_id,
            itinerary: formData.itinerary,
            is_published: true, // Mặc định là đăng
            approval_status: 'approved'
        };
        
        // Xóa 2 cột JSON cũ (nếu còn) để dọn dẹp
        delete dataToUpdate.departure_months;
        delete dataToUpdate.departures; 

        if (!dataToUpdate.name || !dataToUpdate.supplier_id) {
            toast.error("Vui lòng điền Tên tour và chọn NCC."); setLoading(false); return;
        }
        
        // Cảnh báo nếu đăng mà không có lịch
        if (!hasValidDepartures) {
             toast.error("Tour phải có ít nhất 1 lịch khởi hành còn chỗ.");
             dataToUpdate.is_published = false; // Nếu không có lịch, ép về "Chưa đăng"
             toast.warn("Tour đã được lưu nhưng BỊ TẮT ĐĂNG vì không có lịch khởi hành.");
        }

        // 3. Update bảng Products
        const { error } = await supabase.from("Products").update(dataToUpdate).eq("id", tour.id);
        
        if (error) { toast.error("Lỗi cập nhật tour: " + error.message); }
        else {
            if (dataToUpdate.is_published) {
                toast.success(tour.is_published ? "Đã cập nhật tour!" : "Đã lưu và đăng tour thành công!");
            } else {
                toast.success("Đã cập nhật thông tin tour (chưa đăng).");
            }
            onSuccess(); // Gọi hàm onSuccess để fetch lại data
            onClose();   // Đóng modal
        }
        setLoading(false);
    };

    // JSX của Modal (Đã thay đổi phần Lịch khởi hành)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 flex-shrink-0">
                     <h3 className="text-xl font-semibold dark:text-white">
                        {tour.is_published ? 'Chỉnh sửa Tour đã đăng' : 'Hoàn thiện & Đăng Tour'}
                    </h3>
                    <button onClick={onClose} disabled={loading} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"><X size={20}/></button>
                </div>
                
                {/* LƯU Ý: Không dùng <form> bọc cả 2 nữa, vì component con tự xử lý save.
                  Chúng ta sẽ dùng 1 <form> cho thông tin chung, và component con tự quản lý form của nó.
                  Nút "Lưu" ở cuối sẽ chỉ trigger handleSubmit cho thông tin chung.
                */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-y-auto p-6 space-y-4">
                        {/* Thông tin cơ bản (Form 1) */}
                        <form id="main-tour-form" onSubmit={handleSubmit}>
                            <h4 className="text-lg font-semibold mb-2 dark:text-white border-b pb-1">Thông tin cơ bản</h4>
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
                                <div> <label className="label-style">Giá (để hiển thị, VD: "từ")</label> <input type="number" name="price" value={formData.price} onChange={handleChange} className="input-style" /> </div>
                            </div>
                            <div> <label className="label-style">Mô tả chi tiết Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="input-style"></textarea> </div>
                        </form>

                        {/* Quản lý Lịch trình (Giữ nguyên) */}
                        <div className="border-t pt-4 dark:border-neutral-700">
                            <h4 className="text-lg font-semibold mb-2 dark:text-white">Lịch trình chi tiết (Theo ngày)</h4>
                            {formData.itinerary.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 p-3 border rounded-md dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700/50">
                                    <input type="text" placeholder="Tiêu đề (VD: Ngày 1: TP.HCM - Đà Lạt)" value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} className="input-style sm:w-1/3 font-medium" />
                                    <textarea placeholder="Nội dung hoạt động, thời gian dự kiến..." value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} rows="3" className="input-style flex-1 resize-y"></textarea>
                                    <button type="button" onClick={() => removeItineraryItem(index)} className="p-2 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 self-center sm:self-start mt-2 sm:mt-0" title="Xóa ngày"><FaMinus /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addItineraryItem} className="mt-1 text-sm text-sky-600 flex items-center gap-1 hover:underline"><FaPlus /> Thêm ngày vào lịch trình</button>
                        </div>

                        {/* (MỚI) Quản lý Lịch khởi hành */}
                        <DeparturesManager tourId={tour.id} />
                        
                    </div>
                    
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                        {/* Nút này sẽ submit cái form "main-tour-form" */}
                        <button 
                            type="submit" 
                            form="main-tour-form" 
                            disabled={loading} 
                            className="modal-button-primary flex items-center gap-1.5"
                        >
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : (tour.is_published ? <PencilLine size={18} /> : <UploadSimple size={18} />) }
                            {tour.is_published ? 'Lưu thay đổi' : 'Hoàn tất & Đăng tour'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component chính: Quản lý Sản phẩm (Tour) ---
// (FIXED: Cập nhật lại query để dọn dẹp các cột JSON cũ)
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

    // --- (FIXED) Fetch data ---
    const fetchProducts = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE; const to = from + ITEMS_PER_PAGE - 1;

            // <<< FIXED: Query không cần lấy departures hay departure_months nữa >>>
            const selectQuery = `
                id, name, price, location, duration, supplier_id,
                approval_status, is_published, created_at,
                description, itinerary,
                supplier:Suppliers(id, name)
            `; // Đã xóa cột departures và departure_months

            let query = supabase.from("Products").select(selectQuery, { count: 'exact' })
                            .eq('product_type', 'tour');

            if (debouncedSearch.trim() !== "") {
                const searchTermLike = `%${debouncedSearch.trim()}%`;
                 query = query.or(`name.ilike.${searchTermLike},supplier.name.ilike.${searchTermLike}`);
            }
            query = query.order('approval_status', { ascending: true })
                         .order('is_published', { ascending: true })
                         .order("created_at", { ascending: false })
                         .range(from, to);

            const { data, count, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            const processedData = data?.map(p => ({
                ...p,
                supplier_name: p.supplier?.name
            })) || [];

            setProducts(processedData);
            setTotalItems(count || 0);

            if (isInitialLoad && suppliers.length === 0) {
                const { data: sData } = await supabase.from("Suppliers").select("id, name");
                if (sData) setSuppliers(sData);
            }

            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
                setCurrentPage(1);
            }
        } catch (err) {
            console.error("Lỗi tải tour:", err);
            setError(err); 
            toast.error(`Lỗi tải danh sách tour: ${err.message}`);
            setProducts([]); setTotalItems(0);
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch, suppliers.length]); // Dependencies

    // --- (Các phần còn lại: useEffect, handlers, JSX... giữ nguyên) ---
    useEffect(() => { const isInitial = products.length === 0 && loading; fetchProducts(isInitial); }, [fetchProducts, products.length, loading]);
    useEffect(() => { if (currentPage !== 1) { setCurrentPage(1); } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSetStatus = async (id, currentStatus, newStatus) => {
        const actionText = newStatus === 'approved' ? 'Duyệt' : (newStatus === 'rejected' ? 'Từ chối' : 'Đặt lại chờ');
        const confirmMsg = newStatus === 'approved'
            ? `Duyệt tour này? (Tour sẽ cần thêm 1 bước 'Sửa & Đăng' để hiển thị)`
            : `Bạn chắc muốn ${actionText} tour này?`;
        if (!window.confirm(confirmMsg)) return;

        setIsFetchingPage(true);
        const updateData = {
            approval_status: newStatus,
            is_published: false // Luôn set là false khi thay đổi status này
        };
        const { error } = await supabase.from("Products").update(updateData).eq("id", id);
        setIsFetchingPage(false);
        if (error) { toast.error("Lỗi: " + error.message); }
        else { toast.success(`Đã ${actionText} tour!`); fetchProducts(false); }
    };
    const handleDelete = async (tour) => {
         // (LƯU Ý: Do có ON DELETE CASCADE, xóa tour sẽ tự động xóa các Departures liên quan)
         if (!window.confirm(`XÓA VĨNH VIỄN tour "${tour.name}"?\nTất cả lịch khởi hành và slots của tour này cũng sẽ bị xóa!\nThao tác này không thể hoàn tác!`)) return;
         setIsFetchingPage(true);
         const { error } = await supabase.from("Products").delete().eq("id", tour.id);
         setIsFetchingPage(false);
         if (error) { toast.error("Lỗi xóa: " + error.message); }
         else { toast.success("Đã xóa tour."); fetchProducts(false); }
    };

    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

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

            {/* Bảng dữ liệu (Giữ nguyên) */}
             <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && ( <div className="loading-overlay"> <FaSpinner className="animate-spin text-sky-500 text-3xl" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="th-style">Tên Tour</th>
                                <th className="th-style">Nhà Cung Cấp</th>
                                <th className="th-style">Trạng thái Duyệt</th>
                                <th className="th-style">Trạng thái Đăng</th>
                                <th className="th-style text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                             {error && !isFetchingPage && ( <tr><td colSpan="5" className="td-center text-red-500">{`Lỗi: ${error.message}`}</td></tr> )}
                             {!error && loading && products.length === 0 && ( <tr><td colSpan="5" className="td-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr> )}
                             {!error && !loading && !isFetchingPage && products.length === 0 && ( <tr><td colSpan="5" className="td-center text-gray-500 italic">{debouncedSearch ? "Không tìm thấy tour." : "Chưa có tour."}</td></tr> )}
                             {!error && products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="td-style font-medium dark:text-white">{product.name}</td>
                                    <td className="td-style text-gray-600 dark:text-gray-300">
                                        {product.supplier ? (
                                            <Link to={`/admin/suppliers?search=${product.supplier.name}`} className="link-style hover:text-sky-500" title={`Xem NCC ${product.supplier.name}`}>
                                                {product.supplier.name}
                                            </Link>
                                        ) : "N/A"}
                                    </td>
                                    <td className="td-style">
                                        {product.approval_status === 'approved' && <span className="badge-green">Đã duyệt</span>}
                                        {product.approval_status === 'pending' && <span className="badge-yellow">Chờ duyệt</span>}
                                        {product.approval_status === 'rejected' && <span className="badge-red">Bị từ chối</span>}
                                    </td>
                                    <td className="td-style">
                                        {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>}
                                    </td>
                                    <td className="td-style text-right space-x-1">
                                        {product.approval_status === 'pending' && (
                                            <>
                                            <button onClick={() => handleSetStatus(product.id, product.approval_status, 'approved')} disabled={isFetchingPage} className="button-icon-green" title="Duyệt tour (chưa đăng)"><FaCheck size={14}/></button>
                                            <button onClick={() => handleSetStatus(product.id, product.approval_status, 'rejected')} disabled={isFetchingPage} className="button-icon-red" title="Từ chối tour"><FaTimes size={14}/></button>
                                            </>
                                        )}
                                        {product.approval_status === 'approved' && !product.is_published && (
                                            <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-blue text-xs flex items-center gap-1"> <UploadSimple size={14}/> Sửa & Đăng </button>
                                        )}
                                        {product.approval_status === 'approved' && product.is_published && (
                                            <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-icon-sky" title="Sửa lại thông tin tour"> <PencilLine size={14}/> </button>
                                        )}
                                         {(product.approval_status === 'approved' || product.approval_status === 'rejected') && (
                                            <button onClick={() => handleSetStatus(product.id, product.approval_status, 'pending')} disabled={isFetchingPage} className="button-icon-gray" title="Đặt lại trạng thái chờ duyệt (sẽ ẩn tour)"> ↩️ </button>
                                         )}
                                        <button onClick={() => handleDelete(product)} disabled={isFetchingPage} className="button-icon-red" title="Xóa vĩnh viễn tour"> <FaTrash size={14}/> </button>
                                    </td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI (Giữ nguyên) */}
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

            {/* Modal Edit (Giữ nguyên) */}
            {modalTour && ( <EditTourModal tour={modalTour} onClose={() => setModalTour(null)} onSuccess={() => fetchProducts(false)} suppliers={suppliers} /> )}

            {/* CSS (Giữ nguyên) */}
            <style jsx>{`
                /* (Giữ nguyên toàn bộ CSS) */
                 .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm whitespace-nowrap; }
                .td-center { @apply px-6 py-10 text-center; }
                .badge-base { @apply px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-green { @apply button-icon-base bg-green-500 hover:bg-green-600 text-white focus:ring-green-400; }
                .button-icon-red { @apply button-icon-base bg-red-500 hover:bg-red-600 text-white focus:ring-red-400; }
                .button-icon-sky { @apply button-icon-base bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400; }
                .button-icon-gray { @apply button-icon-base bg-gray-400 hover:bg-gray-500 text-white focus:ring-gray-300; }
                .button-blue { @apply px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .link-style { @apply hover:underline; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                /* Modal Styles */
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
            `}</style>
        </div>
    );
}
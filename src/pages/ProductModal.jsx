// src/pages/ProductModal.jsx
// (V5: Sửa lỗi 'map' undefined, Nâng cấp UI, Đã Fix lỗi 400 Upsert)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, FloppyDisk, CircleNotch, Plus, Trash, CalendarBlank, Ticket, CurrencyDollar as CurrencyIcon, Users,
    Image as ImageIcon, CloudArrowUp, ListDashes, Minus,
    Package, MapPin, Clock as ClockIcon, Briefcase
} from '@phosphor-icons/react';

const supabase = getSupabase();

// --- Hàm format tiền tệ ---
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};

// --- Component con: Quản lý Lịch khởi hành (Editable - Nâng cấp UI) ---
const DeparturesManager = ({ productId, initialDepartures = [], onDeparturesChange }) => {
    // SỬA LỖI 1: Khởi tạo state với mảng rỗng []
    const [departures, setDepartures] = useState([]);
    const [newDep, setNewDep] = useState({ date: '', adult_price: '', child_price: '', max_slots: 20 });
    const [loading, setLoading] = useState(false);

    // Fetch departures (Đã thêm kiểm tra Array.isArray)
    useEffect(() => {
        const initial = Array.isArray(initialDepartures) ? initialDepartures : [];
        if (productId) {
            const fetchDepartures = async () => {
                setLoading(true);
                const today = new Date().toISOString().split('T')[0];
                try {
                    const { data, error } = await supabase
                        .from('Departures')
                        .select('*')
                        .eq('product_id', productId)
                        .gte('departure_date', today)
                        .order('departure_date', { ascending: true });

                    if (error) throw error;
                    setDepartures(data || []);
                    onDeparturesChange(data || []);
                } catch (e) {
                    toast.error("Lỗi tải lịch khởi hành.");
                    setDepartures([]);
                    onDeparturesChange([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchDepartures();
        } else {
            // Nếu là tour mới, dùng initialDepartures
            setDepartures(initial);
        }
    }, [productId, onDeparturesChange]); // Loại bỏ initialDepartures khỏi dependency

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        setNewDep(prev => ({ ...prev, [name]: value }));
    };

    // Thêm Lịch mới (Giữ nguyên logic)
    const handleAddDeparture = () => {
        // ... (Logic validation và tạo newEntry) ...
        const adultPrice = parseFloat(newDep.adult_price || 0);
        const maxSlots = parseInt(newDep.max_slots || 0, 10);

        if (!newDep.date || maxSlots <= 0 || adultPrice <= 0) {
            toast.error("Vui lòng nhập Ngày, Giá NCC (lớn) > 0, và Slots > 0."); return;
        }
        if (departures.some(d => d.departure_date === newDep.date)) { toast.error("Ngày khởi hành này đã tồn tại."); return; }

        const newEntry = {
            id: `temp-${Date.now()}`, departure_date: newDep.date,
            adult_price: adultPrice, child_price: parseFloat(newDep.child_price || 0),
            max_slots: maxSlots, booked_slots: 0,
        };
        const updatedDepartures = [...departures, newEntry].sort((a,b) => a.departure_date.localeCompare(b.departure_date));
        setDepartures(updatedDepartures);
        onDeparturesChange(updatedDepartures);
        setNewDep({ date: '', adult_price: '', child_price: '', max_slots: 20 });
    };

    // Xóa Lịch (Giữ nguyên logic)
    const handleRemoveDeparture = (id) => {
        const updatedDepartures = departures.filter(d => d.id !== id);
        setDepartures(updatedDepartures);
        onDeparturesChange(updatedDepartures);
    };

    return (
        <div className="border-t pt-5 dark:border-neutral-700">
             <h4 className="text-lg font-semibold dark:text-white mb-3 flex items-center gap-2"><CalendarBlank weight="duotone"/> Quản lý Lịch khởi hành & Slots *</h4>
             {loading && <div className="flex justify-center p-4"><CircleNotch size={24} className="animate-spin text-sky-500" /></div>}

             <AnimatePresence>
                 <motion.div layout className="overflow-x-auto max-h-[250px] overflow-y-auto border dark:border-neutral-600 rounded-md bg-gray-50 dark:bg-neutral-700/30 mb-4">
                     <table className="min-w-full text-sm">
                         <thead className="bg-gray-100 dark:bg-neutral-700 sticky top-0 z-10">
                             <tr>
                                 <th className="th-dep">Ngày đi</th>
                                 <th className="th-dep">Giá Lớn (NCC)</th>
                                 <th className="th-dep">Giá Trẻ (NCC)</th>
                                 <th className="th-dep"><Users size={14}/> Slots</th>
                                 <th className="th-dep">Đã đặt</th>
                                 <th className="th-dep text-right"></th>
                             </tr>
                         </thead>
                         <tbody className="divide-y dark:divide-neutral-600">
                            <AnimatePresence initial={false}> {/* Thêm initial={false} */}
                             {/* SỬA LỖI 2: Đảm bảo 'departures' là mảng */}
                             {(Array.isArray(departures) ? departures : []).map(dep => (
                                 <motion.tr
                                    key={dep.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="hover:bg-gray-100 dark:hover:bg-neutral-600/50"
                                >
                                     <td className="td-dep">{dep.departure_date}</td>
                                     <td className="td-dep">{formatCurrency(dep.adult_price)}</td>
                                     <td className="td-dep">{formatCurrency(dep.child_price)}</td>
                                     <td className="td-dep font-medium">{dep.max_slots || 0}</td>
                                     <td className="td-dep font-medium">{dep.booked_slots || 0}</td>
                                     <td className="td-dep text-right">
                                         <button type="button" onClick={() => handleRemoveDeparture(dep.id)} className="button-icon-red !p-1" title="Xóa lịch này"> <Trash size={14} /> </button>
                                     </td>
                                 </motion.tr>
                             ))}
                             </AnimatePresence>
                             {departures.length === 0 && !loading && ( <tr><td colSpan="6" className="p-4 text-center text-gray-500 italic">Chưa có lịch khởi hành.</td></tr> )}
                         </tbody>
                     </table>
                 </motion.div>
             </AnimatePresence>

            {/* Form Thêm mới */}
            <motion.div layout className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 border dark:border-neutral-600 rounded-md bg-gray-50 dark:bg-neutral-900/50 items-end">
                <div> <label className="label-style !text-xs !mb-0.5 flex items-center gap-1"><CalendarBlank size={12}/>Ngày đi *</label> <input type="date" name="date" value={newDep.date} onChange={handleNewChange} className="input-style !text-xs !p-1.5" min={new Date().toISOString().split('T')[0]}/> </div>
                <div> <label className="label-style !text-xs !mb-0.5 flex items-center gap-1"><CurrencyIcon size={12}/>Giá Lớn (NCC) *</label> <input type="number" name="adult_price" value={newDep.adult_price} onChange={handleNewChange} placeholder="VD: 500000" className="input-style !text-xs !p-1.5" min="0"/> </div>
                <div> <label className="label-style !text-xs !mb-0.5 flex items-center gap-1"><CurrencyIcon size={12}/>Giá Trẻ (NCC)</label> <input type="number" name="child_price" value={newDep.child_price} onChange={handleNewChange} placeholder="VD: 300000" className="input-style !text-xs !p-1.5" min="0"/> </div>
                <div> <label className="label-style !text-xs !mb-0.5 flex items-center gap-1"><Ticket size={12}/>Max Slots *</label> <input type="number" name="max_slots" value={newDep.max_slots} onChange={handleNewChange} placeholder="VD: 20" className="input-style !text-xs !p-1.5" min="1"/> </div>
                <div className="col-span-2 md:col-span-1"> <button type="button" onClick={handleAddDeparture} className="button-green w-full !py-1.5 !text-xs"> <Plus size={14}/> Thêm Lịch </button> </div>
            </motion.div>
             <p className="text-xs text-orange-600 mt-2">* Bạn phải thêm ít nhất 1 lịch khởi hành.</p>
        </div>
    );
};


// ====================================================================
// --- Modal Chính (ProductModal) ---
// ====================================================================
export default function ProductModal({ show, onClose, onSuccess, productToEdit, productType, suppliers, forceSupplierId }) {

    const initialData = { /* ... */ };
    const [formData, setFormData] = useState(initialData);
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { /* ... (Logic load data vào form) ... */ }, [productToEdit, forceSupplierId]);

    const handleChange = (e) => { /* ... */ };
    const handleItineraryChange = (index, field, value) => { /* ... */ };
    const addItineraryItem = () => { /* ... */ };
    const removeItineraryItem = (index) => { /* ... */ };
    const handleImageUpload = async (e) => { /* ... */ };

    // --- Xử lý Submit của NCC (ĐÃ FIX LỖI 400 VÀ LOGIC MAP) ---
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        // ... (Validation giữ nguyên) ...

        setLoading(true);
        const toastId = toast.loading(productToEdit ? "Đang cập nhật..." : "Đang tạo tour...");

        const productPayload = {
            name: formData.name, description: formData.description,
            supplier_price_adult: formData.supplier_price_adult, supplier_price_child: formData.supplier_price_child, supplier_price_infant: formData.supplier_price_infant,
            price: formData.supplier_price_adult, child_price: formData.supplier_price_child, infant_price: formData.supplier_price_infant, // Giữ lại cho tương thích ngược
            location: formData.location, duration: formData.duration, supplier_id: formData.supplier_id, image_url: formData.image_url, tour_code: formData.tour_code,
            itinerary: formData.itinerary, product_type: productType, approval_status: 'pending', is_published: false,
        };

        try {
            let productId = productToEdit?.id;
            let originalDepIds = [];

            // 1. Lưu/Cập nhật Sản phẩm (Tour)
            if (productId) { /* ... (Update logic) ... */ }
            else { /* ... (Insert logic) ... */ }

            // 2. Đồng bộ Lịch khởi hành (Departures)
            if (productId) {
                // Lấy ID gốc để xóa (Nếu không có productToEdit.Departures, dùng mảng rỗng)
                originalDepIds = Array.isArray(productToEdit?.Departures) ? productToEdit.Departures.map(d => d.id) : [];

                const newDepIds = departures.map(d => d.id).filter(id => !String(id).startsWith('temp-'));

                // Lịch cần xóa
                const departuresToDelete = originalDepIds.filter(id => !newDepIds.includes(id));
                if (departuresToDelete.length > 0) { /* ... (Delete logic) ... */ }

                // Lịch cần Thêm/Cập nhật (Upsert)
                const departuresToUpsert = departures.map(dep => ({
                    id: String(dep.id).startsWith('temp-') ? undefined : dep.id,
                    product_id: productId,
                    departure_date: dep.departure_date,
                    adult_price: dep.adult_price,
                    child_price: dep.child_price,
                    max_slots: dep.max_slots,
                    booked_slots: dep.booked_slots || 0,
                }));

                if (departuresToUpsert.length > 0) {
                     // FIX LỖI 400: Thêm .select()
                     const { error: upsertError } = await supabase.from('Departures').upsert(departuresToUpsert, { onConflict: 'id' }).select();
                     if (upsertError) throw upsertError;
                 }

                 toast.success(productToEdit ? "Cập nhật tour thành công!" : "Thêm tour thành công!", { id: toastId });
                 toast('Tour của bạn đã được gửi chờ Admin phê duyệt.', { icon: '⏳' });
                 onSuccess();
                 onClose();

            } else { throw new Error("Không lấy được Product ID sau khi lưu."); }

        } catch (error) {
            console.error("Lỗi lưu tour:", error);
            toast.error("Lỗi: " + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    }, [formData, departures, productToEdit, productType, forceSupplierId, suppliers, onSuccess, onClose, loading, uploading]);


    if (!show) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white flex items-center gap-2"> <Package weight="duotone"/> {productToEdit ? "Chỉnh sửa Tour" : "Thêm Tour mới (Chi tiết)"} </h3>
                    <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} disabled={loading || uploading} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"> <X size={20}/> </motion.button>
                </div>

                {/* Form Body */}
                <form id="supplier-tour-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Thông tin cơ bản */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-2"> <label className="label-style">Tên Tour *</label> <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" placeholder="VD: Khám phá Vịnh Hạ Long 2N1Đ"/> </div>
                       <div> <label className="label-style">Mã Tour (Tùy chọn)</label> <input type="text" name="tour_code" value={formData.tour_code} onChange={handleChange} className="input-style" placeholder="VD: HL001"/> </div>
                       <div> <label className="label-style">Địa điểm</label> <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" placeholder="VD: Hạ Long, Quảng Ninh"/> </div>
                       <div> <label className="label-style">Thời lượng</label> <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" placeholder="VD: 2N1Đ"/> </div>
                       <div> <label className="label-style">Nhà cung cấp *</label> <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style" disabled={!!forceSupplierId}> <option value="">-- Chọn NCC --</option> {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)} </select> </div>
                    </fieldset>

                    {/* Phần Giá NCC */}
                    <fieldset className="border dark:border-neutral-600 p-4 rounded-md bg-blue-50/50 dark:bg-blue-900/10">
                        <legend className="text-base font-semibold mb-3 px-2 dark:text-white flex items-center gap-2"><CurrencyIcon weight="bold"/> Giá Nhà Cung Cấp (Giá gốc)</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div> <label className="label-style text-blue-700 dark:text-blue-400">Giá NCC Người lớn *</label> <input type="number" name="supplier_price_adult" value={formData.supplier_price_adult} onChange={handleChange} required className="input-style border-blue-300 dark:border-blue-600 focus:ring-blue-500" min="0" placeholder="VD: 1,500,000"/> </div>
                            <div> <label className="label-style text-blue-700 dark:text-blue-400">Giá NCC Trẻ em</label> <input type="number" name="supplier_price_child" value={formData.supplier_price_child} onChange={handleChange} className="input-style border-blue-300 dark:border-blue-600 focus:ring-blue-500" min="0" placeholder="VD: 1,000,000"/> </div>
                            <div> <label className="label-style text-blue-700 dark:text-blue-400">Giá NCC Sơ sinh</label> <input type="number" name="supplier_price_infant" value={formData.supplier_price_infant} onChange={handleChange} className="input-style border-blue-300 dark:border-blue-600 focus:ring-blue-500" min="0" placeholder="VD: 0 (Thường miễn phí)"/> </div>
                        </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">* Đây là giá gốc bạn cung cấp. Admin sẽ duyệt và đặt giá bán sau.</p>
                    </fieldset>

                    {/* Ảnh */}
                    <div> {/* ... (Logic tải ảnh, preview, animation) ... */} </div>

                    {/* Mô tả */}
                    <div> <label className="label-style">Mô tả Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="input-style" placeholder="Giới thiệu về tour, điểm nhấn, dịch vụ bao gồm/không bao gồm..."/> </div>

                    {/* Lịch trình */}
                    <div className="border-t pt-4 dark:border-neutral-700"> {/* ... (Logic lịch trình) ... */} </div>

                    {/* Lịch khởi hành (Editable) */}
                    <DeparturesManager
                        productId={productToEdit?.id}
                        initialDepartures={productToEdit?.Departures || []}
                        onDeparturesChange={(newDeps) => setDepartures(newDeps)}
                    />

                </form>

                {/* Footer Modal - Nút bấm */}
                <div className="p-4 border-t dark:border-neutral-700 flex justify-end items-center gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                    <motion.button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Hủy</motion.button>
                    <motion.button type="submit" form="supplier-tour-form" disabled={loading || uploading} className="modal-button-primary flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {loading ? <CircleNotch size={18} className="animate-spin" /> : <FloppyDisk size={18} />}
                        {loading ? "Đang lưu..." : "Lưu & Gửi duyệt"}
                    </motion.button>
                </div>
            </motion.div>

            {/* CSS nội bộ */}
            <style jsx>{`
                /* ... (Giữ nguyên CSS) ... */
                .th-dep { @apply px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-dep { @apply px-3 py-2 whitespace-nowrap; }
                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(150, 150, 150, 0.4); border-radius: 10px; border: 3px solid transparent; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(90, 90, 90, 0.6); }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(150, 150, 150, 0.4) transparent; }
                /* Thêm CSS cho ảnh preview */
                .h-24 { height: 6rem; }
            `}</style>
        </motion.div>
    );
}
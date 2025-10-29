// src/pages/ProductModal.jsx
// (V4: Nâng cấp UI, Icons, Hiệu ứng Animation)

import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // Thêm AnimatePresence
import {
    X, FloppyDisk, CircleNotch, Plus, Trash, CalendarBlank, Ticket, CurrencyDollar as CurrencyIcon, Users, // Đổi tên CurrencyCny
    Image as ImageIcon, CloudArrowUp, ListDashes, Minus,
    Package, MapPin, Clock as ClockIcon, Briefcase // Thêm icons cho labels
} from '@phosphor-icons/react';

const supabase = getSupabase();

// --- Hàm format tiền tệ ---
const formatCurrency = (num) => { /* ... (Giữ nguyên) ... */ };

// --- Component con: Quản lý Lịch khởi hành (Editable - Nâng cấp UI) ---
const DeparturesManager = ({ productId, initialDepartures = [], onDeparturesChange }) => {
    const [departures, setDepartures] = useState([]);
    const [newDep, setNewDep] = useState({ date: '', adult_price: '', child_price: '', max_slots: 20 }); // Để trống giá trị ban đầu cho input number
    const [loading, setLoading] = useState(false);

    // Fetch departures (Giữ nguyên logic)
    useEffect(() => { /* ... */ }, [productId]);
    // Sync state (Giữ nguyên logic)
    useEffect(() => { /* ... */ }, [initialDepartures, productId]);

    const handleNewChange = (e) => {
        const { name, value, type } = e.target;
        // Cho phép input number rỗng nhưng chuyển thành 0 khi xử lý
        setNewDep(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Thêm Lịch mới (Giữ nguyên logic, parse giá trị)
    const handleAddDeparture = () => {
        const adultPrice = parseFloat(newDep.adult_price || 0);
        const childPrice = parseFloat(newDep.child_price || 0);
        const maxSlots = parseInt(newDep.max_slots || 0, 10);

        if (!newDep.date || maxSlots <= 0 || adultPrice <= 0) {
            toast.error("Vui lòng nhập Ngày, Giá NCC (lớn) > 0, và Slots > 0.");
            return;
        }
        if (departures.some(d => d.departure_date === newDep.date)) {
             toast.error("Ngày khởi hành này đã tồn tại."); return;
        }
        const newEntry = {
            id: `temp-${Date.now()}`, departure_date: newDep.date,
            adult_price: adultPrice, child_price: childPrice,
            max_slots: maxSlots, booked_slots: 0,
        };
        const updatedDepartures = [...departures, newEntry].sort((a,b) => a.departure_date.localeCompare(b.departure_date));
        setDepartures(updatedDepartures);
        onDeparturesChange(updatedDepartures);
        setNewDep({ date: '', adult_price: '', child_price: '', max_slots: 20 }); // Reset form
    };

    // Xóa Lịch (Giữ nguyên logic)
    const handleRemoveDeparture = (id) => { /* ... */ };

    return (
        <div className="border-t pt-5 dark:border-neutral-700">
             <h4 className="text-lg font-semibold dark:text-white mb-3 flex items-center gap-2"><CalendarBlank weight="duotone"/> Quản lý Lịch khởi hành & Slots *</h4>
             {loading && <div className="flex justify-center p-4"><CircleNotch size={24} className="animate-spin text-sky-500" /></div>}

             {/* Bảng Lịch trình */}
             <AnimatePresence>
                 <motion.div
                    layout // Cho phép animation khi thêm/xóa
                    className="overflow-x-auto max-h-[250px] overflow-y-auto border dark:border-neutral-600 rounded-md bg-gray-50 dark:bg-neutral-700/30 mb-4"
                 >
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
                            <AnimatePresence>
                             {departures.map(dep => (
                                 <motion.tr
                                    key={dep.id}
                                    layout // Animation khi xóa
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
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
                             {departures.length === 0 && !loading && ( <tr><td colSpan="6" className="p-4 text-center text-gray-500 italic">Chưa có lịch khởi hành. Thêm ở dưới.</td></tr> )}
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

    const initialData = { /* ... (Giữ nguyên) ... */ };
    const [formData, setFormData] = useState(initialData);
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { /* ... (Logic load data vào form giữ nguyên) ... */ }, [productToEdit, forceSupplierId]);

    const handleChange = (e) => { /* ... (Giữ nguyên) ... */ };
    const handleItineraryChange = (index, field, value) => { /* ... (Giữ nguyên) ... */ };
    const addItineraryItem = () => { /* ... (Giữ nguyên) ... */ };
    const removeItineraryItem = (index) => { /* ... (Giữ nguyên) ... */ };
    const handleImageUpload = async (e) => { /* ... (Giữ nguyên logic tải ảnh) ... */ };

    // --- Xử lý Submit của NCC (Giữ nguyên logic, đã fix lỗi 400) ---
    const handleSubmit = useCallback(async (e) => { /* ... (Giữ nguyên toàn bộ logic submit) ... */ }, [formData, departures, productToEdit, productType, forceSupplierId, suppliers, onSuccess, onClose, loading, uploading]);


    if (!show) return null;

    return (
        // --- (SỬA) Thêm div overlay với animation ---
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
            onClick={onClose} // Đóng khi click nền
        >
            {/* --- (SỬA) Thêm animation cho modal content --- */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Ngăn click xuyên thấu
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white flex items-center gap-2">
                        <Package weight="duotone"/> {productToEdit ? "Chỉnh sửa Tour" : "Thêm Tour mới (Chi tiết)"}
                    </h3>
                    <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} disabled={loading || uploading} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50">
                        <X size={20}/>
                    </motion.button>
                </div>

                {/* Form Body */}
                <form id="supplier-tour-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6"> {/* Tăng space */}
                    {/* Thông tin cơ bản */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-2"> <label className="label-style flex items-center gap-1"><Package size={14}/>Tên Tour *</label> <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" placeholder="VD: Khám phá Vịnh Hạ Long 2N1Đ"/> </div>
                       <div> <label className="label-style">Mã Tour (Tùy chọn)</label> <input type="text" name="tour_code" value={formData.tour_code} onChange={handleChange} className="input-style" placeholder="VD: HL001"/> </div>
                       <div> <label className="label-style flex items-center gap-1"><MapPin size={14}/>Địa điểm</label> <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" placeholder="VD: Hạ Long, Quảng Ninh"/> </div>
                       <div> <label className="label-style flex items-center gap-1"><ClockIcon size={14}/>Thời lượng</label> <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" placeholder="VD: 2N1Đ"/> </div>
                       <div> <label className="label-style flex items-center gap-1"><Briefcase size={14}/>Nhà cung cấp *</label>
                           <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style" disabled={!!forceSupplierId}>
                               <option value="" disabled>-- Chọn NCC --</option>
                               {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                       </div>
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
                    <div>
                        <label className="label-style flex items-center gap-1"><ImageIcon size={14}/>Ảnh minh họa</label>
                        <div className="flex items-center gap-2">
                            <input type="text" name="image_url" placeholder="Dán URL ảnh hoặc tải lên..." value={formData.image_url} onChange={handleChange} className="input-style flex-1"/>
                            <motion.label whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="modal-button-secondary cursor-pointer !py-2 !px-3 flex items-center gap-1.5">
                                <CloudArrowUp size={18}/> {uploading ? <CircleNotch className="animate-spin"/> : "Tải lên"}
                                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" disabled={uploading}/>
                            </motion.label>
                        </div>
                        <AnimatePresence>
                        {formData.image_url && (
                            <motion.img
                                initial={{ height: 0, opacity: 0 }} animate={{ height: '6rem', opacity: 1 }} exit={{ height: 0, opacity: 0 }} // 6rem = h-24
                                src={formData.image_url} alt="Preview"
                                className="mt-2 w-auto rounded-md object-cover border dark:border-neutral-600 shadow-sm"
                                onError={(e) => e.target.style.display='none'} // Ẩn nếu lỗi
                            />
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Mô tả */}
                    <div> <label className="label-style">Mô tả Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="input-style" placeholder="Giới thiệu về tour, điểm nhấn, dịch vụ bao gồm/không bao gồm..."/> </div>

                    {/* Lịch trình */}
                    <div className="border-t pt-5 dark:border-neutral-700">
                        <h4 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2"><ListDashes weight="duotone"/> Lịch trình chi tiết</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar"> {/* Tăng max-h, thêm custom scrollbar */}
                            <AnimatePresence>
                            {formData.itinerary.map((item, index) => (
                                <motion.div
                                    key={`itinerary-${index}`} // Key cố định hơn
                                    layout // Animation khi thêm/xóa
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-neutral-700/40 rounded-md border dark:border-neutral-700"
                                >
                                    <input value={item.title || ''} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} placeholder={`Ngày ${index + 1}`} className="input-style !w-32 !text-sm font-medium"/>
                                    <textarea value={item.content || ''} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} placeholder="Nội dung lịch trình..." rows={3} className="input-style flex-1 !text-sm h-auto resize-y"/>
                                    <motion.button type="button" onClick={() => removeItineraryItem(index)} className="button-icon-red mt-1" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Minus/>
                                    </motion.button>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                        <motion.button type="button" onClick={addItineraryItem} className="button-secondary !text-xs !py-1 mt-3" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Plus size={12}/> Thêm ngày
                        </motion.button>
                    </div>

                    {/* Lịch khởi hành (Editable) */}
                    <DeparturesManager
                        productId={productToEdit?.id}
                        initialDepartures={productToEdit?.Departures || []} // Lấy từ productToEdit nếu sửa
                        onDeparturesChange={(newDeps) => setDepartures(newDeps)}
                    />
                </form>

                {/* Footer Modal - Nút bấm */}
                <div className="p-4 border-t dark:border-neutral-700 flex justify-end items-center gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                    <motion.button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        Hủy
                    </motion.button>
                    <motion.button
                        type="submit" form="supplier-tour-form"
                        disabled={loading || uploading}
                        className="modal-button-primary flex items-center gap-2"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        {loading ? <CircleNotch size={18} className="animate-spin" /> : <FloppyDisk size={18} />}
                        {loading ? "Đang lưu..." : "Lưu & Gửi duyệt"}
                    </motion.button>
                </div>
            </motion.div>

            {/* CSS nội bộ */}
            <style jsx>{`
                /* Label Style */
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                /* Input Style */
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500; }
                /* Buttons */
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-neutral-800 dark:text-neutral-100 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
                .button-green { @apply bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1; }
                .button-secondary { @apply bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-200 font-semibold px-3 py-1.5 rounded-md transition-colors text-sm disabled:opacity-50; }
                /* Icon Buttons */
                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-neutral-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
                /* Departures Table Styles */
                .th-dep { @apply px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-dep { @apply px-3 py-2 whitespace-nowrap; }
                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(150, 150, 150, 0.4); border-radius: 10px; border: 3px solid transparent; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(90, 90, 90, 0.6); }
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(150, 150, 150, 0.4) transparent; }
            `}</style>
        </div>
    );
}
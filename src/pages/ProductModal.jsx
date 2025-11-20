// src/pages/ProductModal.jsx
// (Đã xóa cột Giá và input Giá trong phần Quản lý Lịch khởi hành)

import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
    X, FloppyDisk, CircleNotch, Plus, Trash, CalendarBlank, Ticket, CurrencyCny, Users, 
    Image as ImageIcon, CloudArrowUp, ListDashes,
    Minus
} from '@phosphor-icons/react';

const supabase = getSupabase();

// --- Component con: Quản lý Lịch khởi hành (Editable) ---
const DeparturesManager = ({ productId, initialDepartures = [], onDeparturesChange }) => {
    const [departures, setDepartures] = useState(Array.isArray(initialDepartures) ? initialDepartures : []);
    // SỬA: Bỏ state giá tiền, chỉ giữ date và slots
    const [newDep, setNewDep] = useState({ date: '', max_slots: 20 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productId) {
            const fetchDepartures = async () => {
                setLoading(true);
                const today = new Date().toISOString().split('T')[0];
                // SỬA: Không cần select adult_price, child_price nữa
                const { data, error } = await supabase
                    .from('Departures')
                    .select('id, departure_date, max_slots, booked_slots') 
                    .eq('product_id', productId)
                    .gte('departure_date', today)
                    .order('departure_date', { ascending: true });
                
                if (error) { toast.error("Lỗi tải lịch khởi hành."); }
                else { 
                    const fetchedData = Array.isArray(data) ? data : [];
                    setDepartures(fetchedData); 
                    onDeparturesChange(fetchedData); 
                }
                setLoading(false);
            };
            fetchDepartures();
        } else {
            setDepartures(Array.isArray(initialDepartures) ? initialDepartures : []);
        }
    }, [productId, onDeparturesChange, initialDepartures]); 

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        setNewDep(prev => ({ ...prev, [name]: value }));
    };

    // Thêm Lịch mới
    const handleAddDeparture = () => {
        // SỬA: Bỏ validate giá tiền (newDep.adult_price <= 0)
        if (!newDep.date || newDep.max_slots <= 0) {
            toast.error("Vui lòng nhập Ngày và Slots > 0.");
            return;
        }
        const newEntry = {
            id: `temp-${Date.now()}`, 
            product_id: productId,
            departure_date: newDep.date,
            // SỬA: Mặc định giá bằng 0 (ẩn khỏi UI nhưng giữ cấu trúc DB)
            adult_price: 0,
            child_price: 0,
            max_slots: parseInt(newDep.max_slots || 0, 10),
            booked_slots: 0, 
        };
        const updatedDepartures = [...departures, newEntry];
        setDepartures(updatedDepartures);
        onDeparturesChange(updatedDepartures); 
        
        // Reset form
        setNewDep({ date: '', max_slots: 20 });
    };

    const handleRemoveDeparture = (id) => {
        const updatedDepartures = departures.filter(d => d.id !== id);
        setDepartures(updatedDepartures);
        onDeparturesChange(updatedDepartures); 
    };
    
    return (
        <div className="border-t pt-4 dark:border-neutral-700">
             <h4 className="text-base font-semibold dark:text-white mb-3">Quản lý Lịch khởi hành & Slots</h4>
             {loading && <div className="flex justify-center p-4"><CircleNotch size={24} className="animate-spin text-sky-500" /></div>}
             
             <div className="overflow-x-auto max-h-[250px] overflow-y-auto border dark:border-neutral-600 rounded-md bg-gray-50 dark:bg-neutral-700/30">
                 <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-neutral-700 sticky top-0">
                          <tr>
                              <th className="px-3 py-2 text-left">Ngày đi</th>
                              {/* ĐÃ XÓA TH GIÁ LỚN / TRẺ */}
                              <th className="px-3 py-2 text-left">Slots</th>
                              <th className="px-3 py-2 text-left">Đã đặt</th>
                              <th className="px-3 py-2 text-right"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-neutral-600">
                          {departures?.map(dep => (
                              <tr key={dep.id}>
                                  <td className="px-3 py-2">{dep.departure_date}</td>
                                  {/* ĐÃ XÓA TD GIÁ LỚN / TRẺ */}
                                  <td className="px-3 py-2 font-medium">{dep.max_slots || 0}</td>
                                  <td className="px-3 py-2 font-medium">{dep.booked_slots || 0}</td>
                                  <td className="px-3 py-2 text-right">
                                      <button type="button" onClick={() => handleRemoveDeparture(dep.id)} className="button-icon-red !p-1" title="Xóa lịch này">
                                          <Trash size={14} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                           {departures.length === 0 && !loading && (
                                <tr><td colSpan="4" className="p-4 text-center text-gray-500 italic">Chưa có lịch khởi hành.</td></tr>
                           )}
                      </tbody>
                 </table>
             </div>

             {/* Form Thêm mới - Layout mới gọn hơn */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 p-3 border dark:border-neutral-600 rounded-md bg-gray-50 dark:bg-neutral-900/50">
                 <div>
                     <label className="label-style !text-xs">Ngày đi *</label>
                     <input type="date" name="date" value={newDep.date} onChange={handleNewChange} className="input-style !text-xs !p-1.5" min={new Date().toISOString().split('T')[0]}/>
                 </div>
                 {/* ĐÃ XÓA INPUT GIÁ LỚN / TRẺ */}
                 <div>
                     <label className="label-style !text-xs">Max Slots *</label>
                     <input type="number" name="max_slots" value={newDep.max_slots} onChange={handleNewChange} className="input-style !text-xs !p-1.5" min="1"/>
                 </div>
                 <div>
                      <label className="label-style !text-xs">&nbsp;</label>
                      <button type="button" onClick={handleAddDeparture} className="button-green w-full !py-1.5 !text-xs"> <Plus/> Thêm Lịch </button>
                 </div>
             </div>
        </div>
    );
};


// ====================================================================
// --- Modal Chính (ProductModal) ---
// ====================================================================
export default function ProductModal({ show, onClose, onSuccess, productToEdit, productType, suppliers, forceSupplierId }) {
    
    const initialData = {
        name: '', description: '',
        supplier_price_adult: 0, supplier_price_child: 0, supplier_price_infant: 0,
        location: '', duration: '', supplier_id: forceSupplierId || '', 
        image_url: '', tour_code: '',
        itinerary: [{ title: 'Ngày 1', content: '' }],
    };
    
    const [formData, setFormData] = useState(initialData);
    const [departures, setDepartures] = useState([]); 

    const handleDeparturesChange = useCallback((newDeps) => {
        setDepartures(newDeps);
    }, []); 

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name || '',
                description: productToEdit.description || '',
                supplier_price_adult: productToEdit.supplier_price_adult || productToEdit.price || 0,
                supplier_price_child: productToEdit.supplier_price_child || productToEdit.child_price || 0,
                supplier_price_infant: productToEdit.supplier_price_infant || productToEdit.infant_price || 0,
                location: productToEdit.location || '',
                duration: productToEdit.duration || '',
                supplier_id: forceSupplierId || productToEdit.supplier_id || '',
                image_url: productToEdit.image_url || '',
                tour_code: productToEdit.tour_code || '',
                itinerary: Array.isArray(productToEdit.itinerary) && productToEdit.itinerary.length > 0
                    ? productToEdit.itinerary.map((item, index) => ({
                          title: item?.title || `Ngày ${index + 1}`,
                          content: item?.content || (typeof item === 'string' ? item : '')
                      }))
                    : [{ title: 'Ngày 1', content: '' }],
            });
        } else {
            setFormData(initialData); 
            setDepartures([]); 
        }
    }, [productToEdit, forceSupplierId]);

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

    const handleImageUpload = async (e) => { 
        // ... Logic upload ảnh (Giữ nguyên logic cũ nếu có)
    };

    // --- (QUAN TRỌNG) Xử lý Submit của NCC ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.supplier_id) {
            toast.error("Tên tour và Nhà cung cấp là bắt buộc."); return;
        }
        if (formData.supplier_price_adult <= 0) {
             toast.error("Giá NCC (Người lớn) phải lớn hơn 0."); return;
        }
        if (departures.length === 0) {
             toast.error("Bạn phải thêm ít nhất 1 Lịch khởi hành (Slot)."); return;
        }

        setLoading(true);

        const productPayload = {
            name: formData.name,
            description: formData.description,
            price: formData.supplier_price_adult, 
            child_price: formData.supplier_price_child, 
            infant_price: formData.supplier_price_infant, 
            supplier_price_adult: formData.supplier_price_adult,
            supplier_price_child: formData.supplier_price_child,
            supplier_price_infant: formData.supplier_price_infant,
            
            location: formData.location,
            duration: formData.duration,
            supplier_id: formData.supplier_id,
            image_url: formData.image_url,
            tour_code: formData.tour_code,
            itinerary: formData.itinerary,
            product_type: productType,
            
            approval_status: 'pending',
            is_published: false, 
        };

        try {
            let productId = productToEdit?.id;
            
            // 1. Lưu Tour
            if (productId) {
                const { error: productError } = await supabase.from('Products').update(productPayload).eq('id', productId);
                if (productError) throw productError;
            } else {
                const { data: productData, error: productError } = await supabase.from('Products').insert(productPayload).select('id').single();
                if (productError) throw productError;
                productId = productData.id; 
            }
            
            // 2. Lưu Lịch trình (Departures)
            if (productId) {
                const originalDepIds = Array.isArray(productToEdit?.Departures) ? productToEdit.Departures.map(d => d.id) : [];
                const newDepIds = departures.map(d => d.id);

                const departuresToDelete = originalDepIds.filter(id => !newDepIds.includes(id));
                if (departuresToDelete.length > 0) {
                    await supabase.from('Departures').delete().in('id', departuresToDelete);
                }

                const departuresToUpsert = departures.map(dep => ({
                    id: String(dep.id).startsWith('temp-') ? undefined : dep.id, 
                    product_id: productId, 
                    departure_date: dep.departure_date,
                    adult_price: 0, // Luôn set 0 vì đã ẩn UI
                    child_price: 0, // Luôn set 0 vì đã ẩn UI
                    max_slots: dep.max_slots,
                    booked_slots: dep.booked_slots || 0,
                }));

                if (departuresToUpsert.length > 0) {
                    for (const departure of departuresToUpsert) {
                        const { error: upsertError } = await supabase.from('Departures').upsert(departure, { onConflict: 'id' });
                        if (upsertError) throw upsertError;
                    }
                }
            }

            toast.success(productToEdit ? "Cập nhật tour thành công!" : "Thêm tour thành công!");
            toast('Tour của bạn đã được gửi chờ Admin phê duyệt.', { icon: '⏳' });
            onSuccess(); 
            onClose(); 

        } catch (error) {
            console.error("Chi tiết lỗi Supabase:", error); 
            toast.error(`Lỗi: ${error.details || error.message}`); 
        } finally {
            setLoading(false);
        }
    };


    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
            <motion.div
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold dark:text-white">
                        {productToEdit ? "Chỉnh sửa Tour" : "Thêm Tour mới (Chi tiết)"}
                    </h3>
                    <button onClick={onClose} disabled={loading || uploading} className="text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"><X size={20}/></button>
                </div>

                {/* Form */}
                <form id="supplier-tour-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Thông tin cơ bản */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-2"> <label className="label-style">Tên Tour *</label> <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" /> </div>
                       <div> <label className="label-style">Mã Tour (Tùy chọn)</label> <input type="text" name="tour_code" value={formData.tour_code} onChange={handleChange} className="input-style" /> </div>
                       <div> <label className="label-style">Địa điểm</label> <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" /> </div>
                       <div> <label className="label-style">Thời lượng</label> <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" /> </div>
                       <div> <label className="label-style">Nhà cung cấp *</label> 
                            <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style" disabled={!!forceSupplierId}> 
                                <option value="">-- Chọn NCC --</option> 
                                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)} 
                            </select> 
                       </div>
                    </fieldset>

                    {/* Phần Giá NCC (Vẫn giữ ở cấp Tour để làm giá gốc) */}
                    <fieldset className="border dark:border-neutral-600 p-4 rounded-md">
                        <legend className="text-base font-semibold mb-3 px-2 dark:text-white flex items-center gap-2"><CurrencyCny weight="bold"/> Giá Nhà Cung Cấp (Giá gốc)</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div> <label className="label-style text-blue-700 dark:text-blue-400">Giá NCC Người lớn *</label> <input type="number" name="supplier_price_adult" value={formData.supplier_price_adult} onChange={handleChange} required className="input-style border-blue-300 dark:border-blue-600 focus:ring-blue-500" min="0" /> </div>
                            <div> <label className="label-style text-blue-700 dark:text-blue-400">Giá NCC Trẻ em</label> <input type="number" name="supplier_price_child" value={formData.supplier_price_child} onChange={handleChange} className="input-style border-blue-300 dark:border-blue-600 focus:ring-blue-500" min="0" /> </div>
                            <div> <label className="label-style text-blue-700 dark:text-blue-400">Giá NCC Sơ sinh</label> <input type="number" name="supplier_price_infant" value={formData.supplier_price_infant} onChange={handleChange} className="input-style border-blue-300 dark:border-blue-600 focus:ring-blue-500" min="0" /> </div>
                        </div>
                         <p className="text-xs text-gray-500 mt-3 italic">* Đây là giá gốc bạn cung cấp. Admin sẽ duyệt và đặt giá bán sau.</p>
                    </fieldset>
                    
                    {/* Ảnh & Mô tả & Lịch trình (Giữ nguyên) */}
                    <div> <label className="label-style">Ảnh minh họa</label> <div className="flex items-center gap-2"> <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} className="input-style flex-1"/> <label className="modal-button-secondary cursor-pointer !py-2.5 !px-3"><CloudArrowUp/> {uploading ? <CircleNotch/> : "Tải lên"} <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*"/> </label> </div> {formData.image_url && ( <img src={formData.image_url} alt="Preview" className="mt-2 h-24 w-auto rounded-md object-cover"/> )} </div>
                    <div> <label className="label-style">Mô tả Tour</label> <textarea name="description" value={formData.description} onChange={handleChange} className="input-style h-24"/> </div>
                    <div className="border-t pt-4 dark:border-neutral-700"> 
                        <h4 className="text-base font-semibold mb-2 dark:text-white flex items-center gap-2"><ListDashes/> Lịch trình chi tiết</h4> 
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2"> 
                             {formData.itinerary?.map((item, index) => ( 
                                 <div key={index} className="flex gap-2 items-start"> 
                                     <input value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} placeholder="Tiêu đề (VD: Ngày 1)" className="input-style !w-32 !text-sm"/> 
                                     <textarea value={item.content} onChange={(e) => handleItineraryChange(index, 'content', e.target.value)} placeholder="Nội dung lịch trình..." className="input-style flex-1 !text-sm h-16"/> 
                                     <button type="button" onClick={() => removeItineraryItem(index)} className="button-icon-red mt-1"><Minus/></button> 
                                 </div> 
                             ))} 
                        </div> 
                        <button type="button" onClick={addItineraryItem} className="button-secondary !text-xs !py-1 mt-2"><Plus/> Thêm ngày</button> 
                    </div>

                    {/* Lịch khởi hành (Đã cập nhật UI bên trên) */}
                    <DeparturesManager 
                        productId={productToEdit?.id}
                        initialDepartures={productToEdit?.Departures || []} 
                        onDeparturesChange={handleDeparturesChange} 
                    />

                </form>

                {/* Footer */}
                <div className="p-4 border-t dark:border-neutral-700 flex justify-end items-center gap-3 bg-gray-50 dark:bg-neutral-800 rounded-b-lg flex-shrink-0">
                    <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                    <button type="submit" form="supplier-tour-form" disabled={loading || uploading} className="modal-button-primary flex items-center gap-2"> 
                        {loading && <CircleNotch size={18} className="animate-spin" />} 
                        {loading ? "Đang lưu..." : "Lưu & Gửi duyệt"} 
                    </button>
                </div>
            </motion.div>
            
            <style jsx>{`
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
                .button-green { @apply bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5; }
                .button-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50; }
            `}</style>
        </div>
    );
}
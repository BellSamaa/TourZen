// src/pages/ProductModal.jsx
// (NÂNG CẤP: Thêm giá Trẻ em/Sơ sinh + Luôn set "Chờ duyệt" khi lưu)

import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { 
    X, CircleNotch, FloppyDisk, CloudArrowUp, CalendarPlus, 
    PencilLine, Trash, Plus, Minus, Info
} from "@phosphor-icons/react";
import { motion } from "framer-motion"; // Import motion

const supabase = getSupabase();

// --- Hàm format tiền tệ ---
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};

// --- (Giữ nguyên) Component con DeparturesManager ---
const DeparturesManager = ({ tourId }) => {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRow, setEditingRow] = useState(null);

    const fetchDepartures = useCallback(async () => {
        setLoading(true); setError(null);
        const { data, error } = await supabase
            .from("Departures").select("*").eq("product_id", tourId)
            .order("departure_date", { ascending: true });
        
        if (error) { console.error("Lỗi tải departures:", error); setError(error.message); } 
        else { setDepartures(data || []); }
        setLoading(false);
    }, [tourId]);

    useEffect(() => { fetchDepartures(); }, [fetchDepartures]);

    const handleAddNew = () => { /* ... */ };
    const handleEdit = (row) => { /* ... */ };
    const handleCancel = () => { /* ... */ };
    const handleDelete = async (id) => { /* ... */ };
    const handleSave = async () => { /* ... */ };
    const handleFormChange = (e) => { /* ... */ };

    // (Copy logic từ AdminManageProducts)
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold dark:text-white">Lịch khởi hành & Slots</h4>
                <button type="button" onClick={handleAddNew} disabled={!!editingRow} className="button-blue text-xs flex items-center gap-1"> 
                    <CalendarPlus size={14}/> Thêm ngày
                </button>
            </div>
            {loading && <div className="flex justify-center p-4"><CircleNotch size={24} className="animate-spin text-sky-500" /></div>}
            {error && <div className="text-red-500 p-4 text-center">{error}</div>}
            
            {!loading && !error && (
                <div className="overflow-x-auto max-h-[250px] overflow-y-auto border dark:border-neutral-600 rounded-md">
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
                                    <td className="p-2 text-right space-x-1">
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
                                    <td className="px-3 py-2 text-right space-x-1">
                                        <button type="button" onClick={() => handleEdit(dep)} disabled={!!editingRow} className="button-icon-sky" title="Sửa"><PencilLine size={14}/></button>
                                        <button type="button" onClick={() => handleDelete(dep.id)} disabled={!!editingRow} className="button-icon-red" title="Xóa"><Trash size={14}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {departures.length === 0 && !editingRow && (
                        <div className="p-4 text-center text-gray-500 italic">Chưa có lịch khởi hành.</div>
                    )}
                </div>
            )}
        </div>
    );
};
// --- KẾT THÚC COMPONENT CON ---


export default function ProductModal({
  show,
  onClose,
  onSuccess,
  productToEdit,
  productType,
  suppliers,
  forceSupplierId // (MỚI) Nhận ID của NCC đã đăng nhập
}) {
  
  const [formData, setFormData] = useState({
    name: "", tour_code: "",
    price: 0, child_price: 0, infant_price: 0, // <-- (SỬA) Thêm giá
    supplier_id: forceSupplierId || (suppliers.length > 0 ? suppliers[0].id : ""),
    location: "", duration: "", description: "", image_url: "",
    itinerary: [], 
    approval_status: "pending",
    product_type: productType,
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        tour_code: productToEdit.tour_code || "",
        price: productToEdit.price || 0,
        child_price: productToEdit.child_price || 0, // (SỬA)
        infant_price: productToEdit.infant_price || 0, // (SỬA)
        supplier_id: forceSupplierId || productToEdit.supplier_id || "",
        location: productToEdit.location || "",
        duration: productToEdit.duration || "",
        description: productToEdit.description || "",
        image_url: productToEdit.image_url || "",
        itinerary: Array.isArray(productToEdit.itinerary) && productToEdit.itinerary.length > 0
            ? productToEdit.itinerary.map((item, index) => {
                if (typeof item === 'string') return { title: `Ngày ${index + 1}`, content: item };
                return { title: item.title || `Ngày ${index + 1}`, content: item.content || '' };
            })
            : [{ title: 'Ngày 1', content: '' }],
        approval_status: productToEdit.approval_status || "pending",
        product_type: productToEdit.product_type || productType,
      });
    } else {
      // Reset form cho tour mới
      setFormData({
        name: "", tour_code: "",
        price: 0, child_price: 0, infant_price: 0, // (SỬA)
        supplier_id: forceSupplierId || (suppliers.length > 0 ? suppliers[0].id : ""),
        location: "", duration: "", description: "", image_url: "",
        itinerary: [{ title: 'Ngày 1', content: '' }], 
        approval_status: "pending", product_type: productType,
      });
    }
  }, [productToEdit, productType, suppliers, forceSupplierId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  // --- (MỚI) Các hàm xử lý Lịch trình ---
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

  // --- Upload ảnh (Giữ nguyên) ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const toastId = toast.loading("Đang tải ảnh lên...");
    const fileName = `tour_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);
    if (error) {
      toast.error("Lỗi upload ảnh: " + error.message, { id: toastId });
    } else {
      const url = `${supabase.storageUrl}/object/public/product-images/${fileName}`;
      setFormData((prev) => ({ ...prev, image_url: url }));
      toast.success("Tải ảnh thành công!", { id: toastId });
    }
    setUploading(false);
  };

  // --- (SỬA) handleSubmit (Luôn set "Chờ duyệt") ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.supplier_id) {
        toast.error("Vui lòng điền Tên Tour và Nhà cung cấp.");
        return;
    }
    setSubmitting(true);
    const toastId = toast.loading(productToEdit ? "Đang cập nhật..." : "Đang tạo tour...");

    const dataToSave = {
        ...formData,
        // (SỬA) Theo yêu cầu: NCC sửa/thêm luôn phải "chờ duyệt"
        approval_status: 'pending',
        is_published: false,
    };

    let error;
    if (productToEdit) {
      const { error: updateError } = await supabase
        .from("Products").update(dataToSave).eq("id", productToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("Products").insert(dataToSave);
      error = insertError;
    }

    if (error) {
      toast.error("Lỗi: " + error.message, { id: toastId });
    } else {
      toast.success(productToEdit ? "Cập nhật thành công!" : "Thêm tour mới thành công!", { id: toastId });
      toast.success("Tour sẽ cần Admin duyệt lại.", { icon: 'ℹ️' });
      onSuccess(); // Tải lại danh sách
      onClose(); // Đóng modal
    }
    setSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <motion.div 
        className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-4xl relative flex flex-col max-h-[90vh]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-gray-400 p-2 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <X size={24}/>
        </button>
        <h2 className="text-2xl font-bold mb-5 dark:text-white">
          {productToEdit ? "Chỉnh sửa Tour Du lịch" : "Thêm Tour Du lịch mới"}
        </h2>

        {/* (SỬA) Form mới với giá mới */}
        <form onSubmit={handleSubmit} id="tour-form" className="flex-1 overflow-y-auto pr-3 space-y-5">
          
          <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label-style">Tên Tour *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
            </div>
            <div>
              <label className="label-style">Mã Tour (Nội bộ)</label>
              <input type="text" name="tour_code" value={formData.tour_code} onChange={handleChange} className="input-style" />
            </div>
            
            {/* (SỬA) Thêm 3 trường giá */}
            <div>
              <label className="label-style">Giá Người lớn (VNĐ) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="input-style" min="0" />
            </div>
            <div>
              <label className="label-style">Giá Trẻ em (VNĐ)</label>
              <input type="number" name="child_price" value={formData.child_price} onChange={handleChange} className="input-style" min="0" />
            </div>
            <div>
              <label className="label-style">Giá Sơ sinh (VNĐ)</label>
              <input type="number" name="infant_price" value={formData.infant_price} onChange={handleChange} className="input-style" min="0" />
               <p className="text-xs text-neutral-500 mt-1">Lưu ý: Trẻ dưới 40cm thường được miễn phí.</p>
            </div>

            <div>
              <label className="label-style">Địa điểm</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-style" />
            </div>
            <div>
              <label className="label-style">Thời lượng (VD: 3N2Đ)</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input-style" />
            </div>
            <div>
              <label className="label-style">Nhà cung cấp *</label>
              <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className="input-style" disabled={!!forceSupplierId}>
                {suppliers.length === 0 ? <option disabled>Chưa có NCC</option> : (
                  suppliers.map((s) => ( <option key={s.id} value={s.id}>{s.name}</option> ))
                )}
              </select>
            </div>
          </fieldset>

          {/* --- Ảnh minh họa --- */}
          <div>
            <label className="label-style">Ảnh minh họa (URL hoặc Tải lên)</label>
            <div className="flex items-center gap-2">
                <input type="text" name="image_url" placeholder="https://..." value={formData.image_url} onChange={handleChange} className="input-style flex-1"/>
                <label className="modal-button-secondary px-3 py-2 cursor-pointer whitespace-nowrap flex items-center gap-2">
                    <CloudArrowUp size={18} />
                    {uploading ? <CircleNotch size={18} className="animate-spin" /> : "Tải lên"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
            </div>
            {formData.image_url && ( <img src={formData.image_url} alt="Preview" className="mt-2 rounded-lg w-40 h-28 object-cover border dark:border-neutral-600 shadow-sm"/> )}
          </div>

          {/* --- Mô tả --- */}
          <div>
            <label className="label-style">Mô tả Tour</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-style h-24" placeholder="Mô tả ngắn gọn về lịch trình, điểm nổi bật..."/>
          </div>

          {/* --- (MỚI) Lịch trình --- */}
          <div className="border-t pt-4 dark:border-neutral-700">
            <h4 className="text-lg font-semibold mb-2 dark:text-white">Lịch trình chi tiết (Theo ngày)</h4>
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
          
          {/* --- Quản lý Lịch khởi hành --- */}
          {productToEdit ? (
            <div className="border-t pt-4 dark:border-neutral-700">
                <DeparturesManager tourId={productToEdit.id} />
            </div>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md flex items-center gap-3">
                <Info size={20} weight="bold" />
                <span className="text-sm font-medium">Bạn cần "Lưu Tour" trước khi có thể thêm Lịch khởi hành & Slots.</span>
            </div>
          )}

        </form>

        {/* --- Buttons --- */}
        <div className="flex justify-end space-x-3 pt-5 border-t dark:border-neutral-700">
          <button type="button" onClick={onClose} disabled={submitting} className="modal-button-secondary"> Hủy </button>
          <button type="submit" form="tour-form" disabled={submitting || uploading} className="modal-button-primary flex items-center gap-2">
            {submitting ? <CircleNotch size={18} className="animate-spin" /> : <FloppyDisk size={18} />}
            {submitting ? "Đang lưu..." : (productToEdit ? "Lưu thay đổi" : "Tạo Tour mới")}
          </button>
        </div>
      </motion.div>

      {/* CSS toàn cục cho modal */}
      <style>{`
        .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
        .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors duration-200 text-sm; }
        .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
        .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
        .button-blue { @apply px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50; }
        
        .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50; }
        .button-icon-green { @apply button-icon-base text-green-500 hover:bg-green-100 hover:text-green-600 dark:text-green-400 dark:hover:bg-green-900/30 focus:ring-green-400; }
        .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
        .button-icon-sky { @apply button-icon-base text-sky-500 hover:bg-sky-100 hover:text-sky-600 dark:text-sky-400 dark:hover:bg-sky-900/30 focus:ring-sky-400; }
        .button-icon-gray { @apply button-icon-base text-gray-500 hover:bg-gray-200 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 focus:ring-gray-300; }
      `}</style>
    </div>
  );
}
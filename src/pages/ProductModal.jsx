import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();

export default function ProductModal({
  show,
  onClose,
  onSuccess,
  productToEdit,
  productType,
  suppliers,
}) {
  const [formData, setFormData] = useState({
    name: "",
    tour_code: "",
    price: 0,
    inventory: 10,
    supplier_id: "",
    destination: "",
    start_date: "",
    end_date: "",
    transport: "",
    category: "",
    description: "",
    image_url: "",
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
        inventory: productToEdit.inventory || 0,
        supplier_id: productToEdit.supplier_id || "",
        destination: productToEdit.destination || "",
        start_date: productToEdit.start_date || "",
        end_date: productToEdit.end_date || "",
        transport: productToEdit.transport || "",
        category: productToEdit.category || "",
        description: productToEdit.description || "",
        image_url: productToEdit.image_url || "",
        approval_status: productToEdit.approval_status || "pending",
        product_type: productToEdit.product_type || productType,
      });
    } else {
      setFormData({
        name: "",
        tour_code: "",
        price: 0,
        inventory: 10,
        supplier_id: suppliers.length > 0 ? suppliers[0].id : "",
        destination: "",
        start_date: "",
        end_date: "",
        transport: "",
        category: "",
        description: "",
        image_url: "",
        approval_status: "pending",
        product_type: productType,
      });
    }
  }, [productToEdit, productType, suppliers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Upload ảnh lên Supabase Storage ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileName = `tour_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);
    if (error) {
      alert("Lỗi upload ảnh: " + error.message);
    } else {
      const url = `${supabase.storageUrl}/object/public/product-images/${fileName}`;
      setFormData((prev) => ({ ...prev, image_url: url }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let query;
    if (productToEdit) {
      query = supabase.from("Products").update(formData).eq("id", productToEdit.id);
    } else {
      query = supabase.from("Products").insert(formData);
    }

    const { error } = await query;

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      alert(productToEdit ? "Cập nhật tour thành công!" : "Thêm tour mới thành công!");
      onSuccess();
      onClose();
    }
    setSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          {productToEdit ? "Chỉnh sửa Tour Du lịch" : "Thêm Tour Du lịch mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* --- Tên & Mã Tour --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tên Tour
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mã Tour
              </label>
              <input
                type="text"
                name="tour_code"
                value={formData.tour_code}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
                required
              />
            </div>
          </div>

          {/* --- Điểm đến & Phương tiện --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Điểm đến
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phương tiện di chuyển
              </label>
              <select
                name="transport"
                value={formData.transport}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
              >
                <option value="">-- Chọn --</option>
                <option value="Xe">Xe du lịch</option>
                <option value="Máy bay">Máy bay</option>
                <option value="Tàu">Tàu hỏa</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          {/* --- Ngày đi & Ngày về --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ngày khởi hành
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ngày kết thúc
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
              />
            </div>
          </div>

          {/* --- Giá & Chỗ trống --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Giá Tour (VNĐ)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Số chỗ trống
              </label>
              <input
                type="number"
                name="inventory"
                value={formData.inventory}
                onChange={handleChange}
                className="mt-1 block w-full input-field"
                required
              />
            </div>
          </div>

          {/* --- Phân loại tour --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Loại hình du lịch
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full input-field"
            >
              <option value="">-- Chọn loại --</option>
              <option value="Trong nước">Trong nước</option>
              <option value="Quốc tế">Quốc tế</option>
              <option value="Nghỉ dưỡng">Nghỉ dưỡng</option>
              <option value="Khám phá">Khám phá</option>
              <option value="Văn hóa">Văn hóa</option>
            </select>
          </div>

          {/* --- Mô tả --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mô tả Tour
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full input-field h-24"
              placeholder="Mô tả ngắn gọn về lịch trình, điểm nổi bật..."
            />
          </div>

          {/* --- Ảnh minh họa --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ảnh minh họa
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-700 dark:text-gray-300"
            />
            {uploading && <p className="text-xs text-sky-500 mt-1">Đang tải ảnh lên...</p>}
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="mt-2 rounded-lg w-40 h-28 object-cover border"
              />
            )}
          </div>

          {/* --- Nhà cung cấp --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nhà cung cấp
            </label>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="mt-1 block w-full input-field"
            >
              {suppliers.length === 0 ? (
                <option disabled>Chưa có nhà cung cấp</option>
              ) : (
                suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* --- Buttons --- */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu Tour"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-field {
          padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; width: 100%; background-color: white;
        }
        .dark .input-field {
          background-color: #404040; border-color: #525252; color: white;
        }
      `}</style>
    </div>
  );
}

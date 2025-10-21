// src/pages/ProductModal.jsx
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
    product_type: productType,
  });
  const [submitting, setSubmitting] = useState(false);

  // Khi `productToEdit` thay đổi (chế độ Sửa), điền form
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        tour_code: productToEdit.tour_code || "",
        price: productToEdit.price || 0,
        inventory: productToEdit.inventory || 0,
        supplier_id: productToEdit.supplier_id || "",
        product_type: productToEdit.product_type || productType,
      });
    } else {
      // Chế độ Thêm mới
      setFormData({
        name: "",
        tour_code: "",
        price: 0,
        inventory: 10,
        supplier_id: suppliers.length > 0 ? suppliers[0].id : "",
        product_type: productType,
      });
    }
  }, [productToEdit, productType, suppliers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let query;
    if (productToEdit) {
      // Chế độ Sửa (UPDATE)
      query = supabase
        .from("Products")
        .update(formData)
        .eq("id", productToEdit.id);
    } else {
      // Chế độ Thêm mới (INSERT)
      query = supabase.from("Products").insert(formData);
    }

    const { error } = await query;

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      alert(productToEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
      onSuccess(); // Tải lại danh sách
      onClose(); // Đóng modal
    }
    setSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          {productToEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Form fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên sản phẩm</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mã (Tour Code / SKU)</label>
            <input
              type="text"
              name="tour_code"
              value={formData.tour_code}
              onChange={handleChange}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giá (VNĐ)</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tồn kho</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loại sản phẩm</label>
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              className="mt-1 block w-full input-field"
            >
              <option value="tour">Tour du lịch</option>
              <option value="hotel">Khách sạn</option>
              <option value="flight">Chuyến bay</option>
              <option value="car_rental">Thuê xe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nhà cung cấp</label>
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
              {submitting ? "Đang lưu..." : "Lưu"}
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
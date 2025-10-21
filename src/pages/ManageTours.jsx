// src/pages/ManageTours.jsx
import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaPlus } from "react-icons/fa";

const supabase = getSupabase();

// --- Component Modal để Thêm Mới Tour ---
const AddTourModal = ({ show, onClose, onSuccess, suppliers }) => {
  const [name, setName] = useState("");
  const [tourCode, setTourCode] = useState("");
  const [price, setPrice] = useState(0);
  const [inventory, setInventory] = useState(10);
  const [supplierId, setSupplierId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set supplierId mặc định khi danh sách suppliers được tải
  useEffect(() => {
    if (suppliers.length > 0) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("Tours").insert({
      name: name,
      tour_code: tourCode,
      price: price,
      inventory: inventory,
      supplier_id: supplierId,
    });

    if (error) {
      alert("Lỗi thêm tour: " + error.message);
    } else {
      alert("Thêm tour thành công!");
      onSuccess(); // Tải lại danh sách
      onClose(); // Đóng modal
    }
    setSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Thêm Sản Phẩm Tour Mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên Tour</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mã Tour (Phải là duy nhất)</label>
            <input
              type="text"
              value={tourCode}
              onChange={(e) => setTourCode(e.target.value)}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giá (VNĐ)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng tồn (Inventory)</label>
            <input
              type="number"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              className="mt-1 block w-full input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nhà cung cấp</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="mt-1 block w-full input-field"
            >
              {suppliers.length === 0 ? (
                <option disabled>Vui lòng thêm nhà cung cấp trước</option>
              ) : (
                suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || suppliers.length === 0}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
      {/* Định nghĩa style cho input-field (nếu cần) */}
      <style>{`
        .input-field {
          padding: 0.5rem 0.75rem;
          border: 1px solid #D1D5DB; /* gray-300 */
          border-radius: 0.375rem; /* rounded-md */
          width: 100%;
          background-color: white; /* bg-white */
        }
        .dark .input-field {
          background-color: #404040; /* dark:bg-neutral-700 */
          border-color: #525252; /* dark:border-gray-600 */
          color: white; /* dark:text-white */
        }
      `}</style>
    </div>
  );
};


// --- Component Trang Chính ---
export default function ManageTours() {
  const [tours, setTours] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Hàm fetch dữ liệu
  async function fetchData() {
    setLoading(true);
    setError(null);

    // Dùng Promise.all để tải cả 2 dữ liệu song song
    const [tourResponse, supplierResponse] = await Promise.all([
      // 1. Lấy danh sách tour, JOIN với tên nhà cung cấp
      supabase.from("Tours").select(`
        id,
        tour_code,
        name,
        price,
        inventory,
        Suppliers ( name ) 
      `),
      // 2. Lấy danh sách nhà cung cấp (để dùng cho modal)
      supabase.from("Suppliers").select("id, name"),
    ]);

    if (tourResponse.error) {
      setError("Lỗi fetch tour: " + tourResponse.error.message);
    } else {
      setTours(tourResponse.data);
    }

    if (supplierResponse.error) {
      setError("Lỗi fetch nhà cung cấp: " + supplierResponse.error.message);
    } else {
      setSuppliers(supplierResponse.data);
    }

    setLoading(false);
  }

  // Chạy hàm fetch khi component được tải
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-sky-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Lỗi: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Quản lý Sản Phẩm Tour
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
        >
          <FaPlus />
          <span>Thêm Tour Mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mã Tour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tên Tour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nhà cung cấp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Giá (VNĐ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tồn kho
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tours.map((tour) => (
              <tr key={tour.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {tour.tour_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {tour.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {/* Dữ liệu join từ bảng Suppliers */}
                  {tour.Suppliers ? tour.Suppliers.name : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {tour.price.toLocaleString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {tour.inventory}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTourModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData} // Tải lại toàn bộ dữ liệu khi thêm thành công
        suppliers={suppliers} // Truyền danh sách NCC vào modal
      />
    </div>
  );
}
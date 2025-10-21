// src/pages/ManageSuppliers.jsx
import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaPlus } from "react-icons/fa";

const supabase = getSupabase();

// --- Component Modal để Thêm Mới ---
const AddSupplierModal = ({ show, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("hotel");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { error } = await supabase.from("Suppliers").insert({
      name: name,
      email: email,
      phone: phone,
      service_type: serviceType,
    });

    if (error) {
      alert("Lỗi thêm nhà cung cấp: " + error.message);
    } else {
      alert("Thêm thành công!");
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setServiceType("hotel");
      // Gọi hàm onSuccess để tải lại danh sách
      onSuccess();
      onClose();
    }
    setSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Thêm Nhà Cung Cấp Mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên nhà cung cấp</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loại dịch vụ</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-700 dark:border-gray-600 dark:text-white"
            >
              <option value="hotel">Khách sạn</option>
              <option value="flight">Chuyến bay</option>
              <option value="car_rental">Thuê xe</option>
              <option value="restaurant">Nhà hàng</option>
              <option value="other">Khác</option>
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
              disabled={submitting}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Component Trang Chính ---
export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Hàm fetch dữ liệu
  async function fetchSuppliers() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("Suppliers").select("*");

    if (error) {
      console.error("Lỗi fetch nhà cung cấp:", error);
      setError(error.message);
    } else {
      setSuppliers(data);
    }
    setLoading(false);
  }

  // Chạy hàm fetch khi component được tải
  useEffect(() => {
    fetchSuppliers();
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
          Quản lý Nhà Cung Cấp
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
        >
          <FaPlus />
          <span>Thêm Mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Loại Dịch Vụ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {supplier.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {supplier.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {supplier.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {supplier.service_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddSupplierModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Khi thêm thành công, fetch lại danh sách
          fetchSuppliers();
        }}
      />
    </div>
  );
}
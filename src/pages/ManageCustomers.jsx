// src/pages/ManageCustomers.jsx
import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner } from "react-icons/fa";

const supabase = getSupabase();

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm fetch dữ liệu khách hàng
  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("Users").select("*");

    if (error) {
      console.error("Lỗi fetch khách hàng:", error);
      setError(error.message);
    } else {
      setCustomers(data);
    }
    setLoading(false);
  }

  // Chạy hàm fetch khi component được tải
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Hàm thay đổi vai trò
  const handleRoleChange = async (id, newRole) => {
    const { error } = await supabase
      .from("Users")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
      alert("Lỗi cập nhật vai trò: " + error.message);
    } else {
      // Cập nhật lại UI ngay lập tức
      setCustomers(
        customers.map((cust) =>
          cust.id === id ? { ...cust, role: newRole } : cust
        )
      );
      alert("Cập nhật vai trò thành công!");
    }
  };

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
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Quản lý Khách hàng (Tài khoản)
      </h1>
      <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tên đầy đủ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vai trò (Role)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {customer.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {customer.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {/* Dùng select để dễ dàng thay đổi vai trò */}
                  <select
                    value={customer.role}
                    onChange={(e) => handleRoleChange(customer.id, e.target.value)}
                    className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-red-600 hover:text-red-900">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
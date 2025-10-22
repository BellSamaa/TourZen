// src/pages/AdminManageProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
} from "react-icons/fa";

const supabase = getSupabase();

export default function AdminManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Lấy danh sách sản phẩm ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("Products")
        .select(`*, supplier_name:Suppliers(name)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Lỗi fetch products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Hàm xử lý phê duyệt / từ chối ---
  const handleApproval = async (id, status) => {
    try {
      const { error } = await supabase
        .from("Products")
        .update({ approval_status: status })
        .eq("id", id);

      if (error) throw error;

      alert(
        status === "approved"
          ? "✅ Tour đã được phê duyệt!"
          : "❌ Tour đã bị từ chối!"
      );
      fetchProducts();
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + err.message);
    }
  };

  // --- Render trạng thái phê duyệt ---
  const renderApprovalStatus = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full dark:bg-green-800/30 dark:text-green-300">
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full dark:bg-red-800/30 dark:text-red-300">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full dark:bg-yellow-800/30 dark:text-yellow-300">
            Đang chờ duyệt
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FaSyncAlt className="text-sky-600" /> Quản lý Tour & Phê duyệt
        </h1>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center gap-2 transition-all"
        >
          <FaSyncAlt className="animate-spin-slow" />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-sky-600" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          Lỗi: {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tên Tour
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nhà Cung Cấp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {products.length > 0 ? (
                  products.map((tour) => (
                    <tr
                      key={tour.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                        {tour.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {tour.supplier_name?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-semibold">
                        {tour.price
                          ? tour.price.toLocaleString("vi-VN") + " VNĐ"
                          : "0 VNĐ"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {renderApprovalStatus(tour.approval_status)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {tour.approval_status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleApproval(tour.id, "approved")
                              }
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                              title="Phê duyệt"
                            >
                              <FaCheckCircle size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleApproval(tour.id, "rejected")
                              }
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              title="Từ chối"
                            >
                              <FaTimesCircle size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                      Không có tour nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

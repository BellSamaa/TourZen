// src/pages/AdminManageProducts.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaUmbrellaBeach,
  FaSyncAlt,
} from "react-icons/fa";

const supabase = getSupabase();

export default function AdminManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("Products")
        .select(`*, supplier_name:Suppliers(name)`)
        .eq("product_type", "tour")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách tour: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Phê duyệt tour ---
  const handleApprove = async (id) => {
    if (!window.confirm("Xác nhận phê duyệt tour này?")) return;
    const { error } = await supabase
      .from("Products")
      .update({ approval_status: "approved" })
      .eq("id", id);
    if (error) alert("Lỗi khi phê duyệt: " + error.message);
    else {
      alert("✅ Tour đã được phê duyệt!");
      fetchData();
    }
  };

  // --- Từ chối tour ---
  const handleReject = async (id) => {
    if (!window.confirm("Bạn có chắc muốn từ chối tour này?")) return;
    const { error } = await supabase
      .from("Products")
      .update({ approval_status: "rejected" })
      .eq("id", id);
    if (error) alert("Lỗi khi từ chối: " + error.message);
    else {
      alert("❌ Tour đã bị từ chối!");
      fetchData();
    }
  };

  // --- Reset trạng thái (nếu cần) ---
  const handleReset = async (id) => {
    const { error } = await supabase
      .from("Products")
      .update({ approval_status: "pending" })
      .eq("id", id);
    if (error) alert("Lỗi khi đặt lại trạng thái: " + error.message);
    else {
      alert("Trạng thái đã được đặt lại thành 'pending'.");
      fetchData();
    }
  };

  // --- Giao diện hiển thị trạng thái ---
  const ApprovalBadge = ({ status }) => {
    const base =
      "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
    switch (status) {
      case "approved":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            <FaCheckCircle /> Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            <FaTimesCircle /> Từ chối
          </span>
        );
      default:
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            <FaSyncAlt className="animate-spin-slow" /> Đang chờ
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FaUmbrellaBeach className="text-sky-600" />
          Quản lý Tour (Phê duyệt)
        </h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
        >
          <FaSyncAlt /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-sky-600" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center bg-red-50 p-6 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Mã Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Tên Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Nhà Cung Cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Giá (VNĐ)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {p.tour_code || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {p.supplier_name?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {p.price ? p.price.toLocaleString("vi-VN") : 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <ApprovalBadge status={p.approval_status} />
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-3">
                        {p.approval_status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReset(p.id)}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Đặt lại
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                      Không có tour nào cần phê duyệt.
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

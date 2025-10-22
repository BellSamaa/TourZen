// src/pages/SupplierManageProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import {
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUmbrellaBeach,
} from "react-icons/fa";
import ProductModal from "./ProductModal";

const supabase = getSupabase();

const InventoryStatus = ({ inventory }) => {
  const inv = parseInt(inventory, 10);
  return inv > 0 ? (
    <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300">
      Còn chỗ ({inv})
    </span>
  ) : (
    <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300">
      Hết chỗ
    </span>
  );
};

// Trạng thái phê duyệt
const ApprovalStatus = ({ status }) => {
  switch (status) {
    case "approved":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300">
          Đã duyệt
        </span>
      );
    case "rejected":
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300">
          Bị từ chối
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300">
          Đang chờ duyệt
        </span>
      );
  }
};

export default function SupplierManageProducts() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productRes, supplierRes] = await Promise.all([
        supabase
          .from("Products")
          .select(`*, supplier_name:Suppliers(name)`)
          .eq("product_type", "tour")
          .order("created_at", { ascending: false }),
        supabase.from("Suppliers").select("id, name"),
      ]);

      if (productRes.error) throw productRes.error;
      if (supplierRes.error) throw supplierRes.error;

      setProducts(productRes.data || []);
      setSuppliers(supplierRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Lỗi khi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNew = () => {
    setProductToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    const normalized = {
      ...product,
      start_date: product.start_date ? product.start_date.split("T")[0] : null,
      end_date: product.end_date ? product.end_date.split("T")[0] : null,
    };
    setProductToEdit(normalized);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tour này?")) return;
    const { error } = await supabase.from("Products").delete().eq("id", id);
    if (error) alert("Lỗi khi xóa tour: " + error.message);
    else {
      alert("Xóa tour thành công!");
      fetchData();
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FaUmbrellaBeach size={24} className="text-sky-600" />
          <span>Quản lý Tour của Nhà Cung Cấp</span>
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-500"
        >
          <FaPlus /> Thêm Tour mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-sky-600" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mã Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số chỗ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">
                        {p.tour_code || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-semibold">
                        {p.price ? p.price.toLocaleString("vi-VN") : 0} VNĐ
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <InventoryStatus inventory={p.inventory || 0} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <ApprovalStatus status={p.approval_status} />
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-3">
                        {p.approval_status !== "approved" && (
                          <>
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                            >
                              <FaTrash size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                      Không có tour nào được tìm thấy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
          productToEdit={productToEdit}
          productType="tour"
          suppliers={suppliers}
        />
      )}
    </div>
  );
}

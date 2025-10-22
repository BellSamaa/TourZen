// src/pages/ManageProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import {
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUmbrellaBeach, // Chỉ giữ lại icon cho Tour
} from "react-icons/fa";
import ProductModal from "./ProductModal"; // Đảm bảo bạn đã có file này

const supabase = getSupabase();

// --- Component con hiển thị Tồn kho (Chỗ còn trống) ---
const InventoryStatus = ({ inventory }) => {
  const inv = parseInt(inventory, 10); // Đảm bảo là số
  return inv > 0 ? (
    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300">
      Còn chỗ ({inv})
    </span>
  ) : (
    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300">
      Hết chỗ
    </span>
  );
};

// --- Component chính ---
export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // const currentProductDetails = getProductTypeDetails(selectedType); // Không cần nữa

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    // --- Query cố định cho "tour" ---
    let productQuery = supabase
      .from("Products")
      .select(`*, supplier_name:Suppliers(name)`) // Dùng alias supplier_name
      .eq("product_type", "tour") // Chỉ lấy sản phẩm là Tour
      .order("created_at", { ascending: false });

    const [productResponse, supplierResponse] = await Promise.all([
      productQuery,
      supabase.from("Suppliers").select("id, name"), // Vẫn cần suppliers cho modal
    ]);

    if (productResponse.error) {
      setError("Lỗi fetch danh sách tour: " + productResponse.error.message);
    } else {
      setProducts(productResponse.data || []);
    }
    if (supplierResponse.error) {
      console.error("Lỗi fetch suppliers:", supplierResponse.error);
      setSuppliers([]);
    } else {
      setSuppliers(supplierResponse.data || []);
    }

    setLoading(false);
  }, []); // Không còn phụ thuộc vào selectedType

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNew = () => {
    setProductToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setProductToEdit(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    // Sử dụng modal tùy chỉnh thay vì window.confirm
    // (Đây là ví dụ, bạn nên thay thế bằng modal/toast của riêng bạn)
    const confirmed = window.confirm("Bạn có chắc muốn xóa tour này?");
    
    if (confirmed) {
      const { error } = await supabase.from("Products").delete().eq("id", productId);
      if (error) {
        alert("Lỗi xóa tour: " + error.message);
      } else {
        alert("Xóa tour thành công!");
        fetchData();
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Thanh Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FaUmbrellaBeach size={24} className="text-sky-600" />
          <span>Quản lý Tour Du lịch</span>
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          <FaPlus />
          <span>Thêm Tour mới</span>
        </button>
      </div>

      {/* --- ĐÃ XÓA BỎ PHẦN TABS LỌC --- */}

      {/* Bảng Dữ liệu */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-sky-600" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          Lỗi: {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
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
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Số chỗ
                  </th>
                  {/* Bạn có thể thêm cột "Trạng thái" (Phê duyệt) ở đây nếu cần */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th> */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                        {product.tour_code || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {product.supplier_name?.name ? (
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {product.supplier_name.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {product.price ? product.price.toLocaleString("vi-VN") : 0} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <InventoryStatus inventory={product.inventory || 0} />
                      </td>
                      {/* <td> ... Trạng thái ... </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6} // Tăng ColSpan nếu bạn thêm cột trạng thái
                      className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                      Không có tour nào được tìm thấy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
          productToEdit={productToEdit}
          productType="tour" // Cố định là "tour"
          suppliers={suppliers}
        />
      )}
    </div>
  );
}

// src/pages/ManageProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import {
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaHotel,
  FaPlane,
  FaCar,
  FaUmbrellaBeach,
  FaTags,
} from "react-icons/fa";
import ProductModal from "./ProductModal"; // Đảm bảo bạn đã có file này

const supabase = getSupabase();

// --- Dữ liệu Tabs ---
const productTypes = [
  { type: "tour", label: "Tours", icon: FaUmbrellaBeach },
  { type: "hotel", label: "Khách sạn", icon: FaHotel },
  { type: "flight", label: "Chuyến bay", icon: FaPlane },
  { type: "car_rental", label: "Thuê xe", icon: FaCar },
  // { type: 'all', label: 'Tất cả', icon: FaTags },
];

// Helper để lấy Icon/Title
const getProductTypeDetails = (type) => {
  const details = productTypes.find((pt) => pt.type === type);
  return details || { icon: FaUmbrellaBeach, label: "Sản phẩm" };
};

// --- Component con hiển thị Tồn kho ---
const InventoryStatus = ({ inventory }) => {
  const inv = parseInt(inventory, 10); // Đảm bảo là số
  return inv > 0 ? (
    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300">
      Còn hàng ({inv})
    </span>
  ) : (
    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300">
      Hết hàng
    </span>
  );
};

// --- Component chính ---
export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("tour");
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const currentProductDetails = getProductTypeDetails(selectedType);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    let productQuery = supabase
      .from("Products")
      .select(`*, supplier_name:Suppliers(name)`) // Dùng alias supplier_name
      .order("created_at", { ascending: false });

    if (productTypes.some((pt) => pt.type === selectedType)) {
      productQuery = productQuery.eq("product_type", selectedType);
    }

    const [productResponse, supplierResponse] = await Promise.all([
      productQuery,
      supabase.from("Suppliers").select("id, name"),
    ]);

    if (productResponse.error) {
      setError("Lỗi fetch sản phẩm: " + productResponse.error.message);
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
  }, [selectedType]);

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
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      const { error } = await supabase.from("Products").delete().eq("id", productId);
      if (error) {
        alert("Lỗi xóa sản phẩm: " + error.message);
      } else {
        alert("Xóa thành công!");
        fetchData();
      }
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Thanh Header và Tabs Lọc */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FaTags size={24} className="text-sky-600" />
          <span>Quản lý Sản phẩm</span>
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
        >
          <FaPlus />
          <span>Thêm Sản phẩm mới</span>
        </button>
      </div>

      {/* Tabs Lọc */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {productTypes.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = selectedType === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => setSelectedType(tab.type)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }`}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

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
                    Mã SP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nhà cung cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tồn kho
                  </th>
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
                        {/* --- ĐÃ XÓA DÒNG COMMENT LỖI Ở ĐÂY --- */}
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                    t     onClick={() => handleEdit(product)}
                          className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                    t   <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
t                     </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
s                     className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                t     Không có sản phẩm nào thuộc loại "
                      {currentProductDetails.label}".
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
    fs     onClose={() => setShowModal(false)}
          onSuccess={fetchData}
          productToEdit={productToEdit}
          productType={selectedType !== "all" ? selectedType : "tour"}
          suppliers={suppliers}
        />
      )}
    </div>
  );
}
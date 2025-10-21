// src/pages/ManageProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaHotel, FaPlane, FaCar, FaUmbrellaBeach } from "react-icons/fa";
import ProductModal from "./ProductModal"; // Import modal

const supabase = getSupabase();

// Helper để lấy Icon và Title
const getProductTypeDetails = (type) => {
  switch (type) {
    case 'hotel': return { icon: <FaHotel />, title: 'Khách sạn' };
    case 'flight': return { icon: <FaPlane />, title: 'Chuyến bay' };
    case 'car_rental': return { icon: <FaCar />, title: 'Thuê xe' };
    default: return { icon: <FaUmbrellaBeach />, title: 'Tour' };
  }
}

export default function ManageProducts({ productType = "tour" }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const { icon, title } = getProductTypeDetails(productType);

  // Hàm fetch dữ liệu (dùng useCallback)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [productResponse, supplierResponse] = await Promise.all([
      supabase
        .from("Products")
        // 👇 SỬA Ở ĐÂY: Đổi tên cột name của Suppliers thành supplier_name 👇
        .select(`*, supplier_name:Suppliers(name)`)
        .eq("product_type", productType),
      supabase.from("Suppliers").select("id, name"),
    ]);

    if (productResponse.error) {
       // Kiểm tra lỗi ambiguous và đưa ra gợi ý cụ thể
       if (productResponse.error.code === '42702') { // Postgres ambiguous column code
            setError("Lỗi truy vấn: Cột 'name' bị trùng lặp giữa Products và Suppliers. Hãy kiểm tra lại câu lệnh select.");
            console.error("Ambiguous column error details:", productResponse.error);
       } else {
            setError("Lỗi fetch sản phẩm: " + productResponse.error.message);
       }
      setProducts([]); // Set rỗng nếu có lỗi
    } else {
      setProducts(productResponse.data || []);
    }

    // Luôn set suppliers dù có lỗi ở product hay không
    if (supplierResponse.error) {
         console.error("Lỗi fetch suppliers:", supplierResponse.error);
         // Không cần set lỗi chính ở đây, ưu tiên lỗi product
         setSuppliers([]);
    } else {
         setSuppliers(supplierResponse.data || []);
    }

    setLoading(false);
  }, [productType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HÀNH ĐỘNG THÊM / SỬA / XÓA ---
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

  // --- RENDER ---
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          {icon} <span>Quản lý {title}</span>
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 transition-colors"
        >
          <FaPlus />
          <span>Thêm {title} mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã SP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nhà cung cấp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{product.tour_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {/* 👇 SỬA Ở ĐÂY: Dùng tên mới là supplier_name 👇 */}
                    {product.supplier_name ? product.supplier_name : <span className="text-red-500">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.price.toLocaleString("vi-VN")} VNĐ</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.inventory > 0 ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Còn hàng ({product.inventory})
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Hết hàng
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
          productToEdit={productToEdit}
          productType={productType}
          suppliers={suppliers}
        />
      )}
    </div>
  );
}
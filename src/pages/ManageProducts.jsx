// src/pages/ManageProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaHotel, FaPlane, FaCar, FaUmbrellaBeach, FaTags } from "react-icons/fa"; // Thêm FaTags
import ProductModal from "./ProductModal";

const supabase = getSupabase();

// --- Dữ liệu Tabs ---
const productTypes = [
    { type: 'tour', label: 'Tours', icon: FaUmbrellaBeach },
    { type: 'hotel', label: 'Khách sạn', icon: FaHotel },
    { type: 'flight', label: 'Chuyến bay', icon: FaPlane },
    { type: 'car_rental', label: 'Thuê xe', icon: FaCar },
    // { type: 'all', label: 'Tất cả', icon: FaTags }, // Tùy chọn: Thêm tab "Tất cả"
];

// Helper để lấy Icon/Title (Giữ nguyên)
const getProductTypeDetails = (type) => { /* ... giữ nguyên ... */ };

// --- Component chính ---
export default function ManageProducts() { // Bỏ prop productType
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State MỚI: Loại sản phẩm đang chọn ---
    const [selectedType, setSelectedType] = useState('tour'); // Mặc định là 'tour'

    // State cho Modal (Giữ nguyên)
    const [showModal, setShowModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    // Lấy thông tin chi tiết dựa trên selectedType
    const { icon, title } = getProductTypeDetails(selectedType);

    // --- Hàm fetch dữ liệu (Đã sửa) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setProducts([]); // Xóa list cũ trước khi fetch

        // Xây dựng query dựa trên selectedType
        let productQuery = supabase.from("Products")
                            .select(`*, supplier_name:Suppliers(name)`)
                            .order('created_at', { ascending: false }); // Sắp xếp mới nhất lên đầu

        // Chỉ lọc nếu không phải là 'all' (nếu bạn thêm tab 'all')
        // if (selectedType !== 'all') {
             productQuery = productQuery.eq("product_type", selectedType);
        // }

        // Fetch song song
        const [productResponse, supplierResponse] = await Promise.all([
            productQuery,
            supabase.from("Suppliers").select("id, name") // Vẫn cần fetch suppliers cho modal
        ]);

        // Xử lý kết quả (Giữ nguyên logic xử lý lỗi)
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
     // Bỏ productType, thêm selectedType vào dependency array
    }, [selectedType]);

    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData chỉ thay đổi khi selectedType thay đổi


    // --- Các hàm xử lý Thêm/Sửa/Xóa (Giữ nguyên) ---
    const handleAddNew = () => { /* ... */ };
    const handleEdit = (product) => { /* ... */ };
    const handleDelete = async (productId) => { /* ... */ };

    // --- RENDER ---
    return (
        <div className="p-4 md:p-6 space-y-6"> {/* Tăng padding, thêm space-y */}

            {/* --- Thanh Header và Tabs Lọc --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <FaTags size={24} className="text-sky-600"/> {/* Icon chung */}
                    <span>Quản lý Sản phẩm</span>
                </h1>
                <button
                    onClick={handleAddNew}
                    className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 transition-colors self-end md:self-center" // Căn chỉnh nút
                >
                    <FaPlus />
                    {/* Tiêu đề nút linh hoạt */}
                    <span>Thêm Sản phẩm mới</span>
                </button>
            </div>

            {/* --- Tabs Lọc --- */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {productTypes.map((tab) => {
                        const TabIcon = tab.icon; // Lấy component Icon
                        const isActive = selectedType === tab.type;
                        return (
                            <button
                                key={tab.type}
                                onClick={() => setSelectedType(tab.type)}
                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                                isActive
                                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <TabIcon size={16} /> {/* Render Icon */}
                                {tab.label}
                            </button>
                        );
                     })}
                </nav>
            </div>


            {/* --- Bảng Dữ liệu --- */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-sky-600" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">Lỗi: {error}</div>
            ) : (
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã SP</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên sản phẩm</th>
                                     {/* Thêm cột Loại SP nếu cần (khi xem tab 'Tất cả') */}
                                     {/* {selectedType === 'all' && (
                                         <th className="px-6 py-3 text-left text-xs font-medium ...">Loại SP</th>
                                     )} */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nhà cung cấp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tồn kho</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {products.length > 0 ? products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{product.tour_code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">{product.name}</td>
                                        {/* {selectedType === 'all' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm ...">{product.product_type}</td>
                                        )} */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {product.supplier_name ? product.supplier_name : <span className="text-gray-400 italic">N/A</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.price.toLocaleString("vi-VN")} VNĐ</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                             {/* ... JSX hiển thị tồn kho ... */}
                                             {product.inventory > 0 ? ( /* ... Còn hàng ... */ ) : ( /* ... Hết hàng ... */)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                             {/* ... JSX nút Sửa/Xóa ... */}
                                             <button onClick={() => handleEdit(product)} /* ... */><FaEdit size={18} /></button>
                                             <button onClick={() => handleDelete(product.id)} /* ... */><FaTrash size={18} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                     <tr>
                                         {/* Thông báo khi không có sản phẩm */}
                                         <td colSpan={selectedType === 'all' ? 7 : 6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic">
                                             Không có sản phẩm nào thuộc loại "{title}".
                                         </td>
                                     </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Thêm/Sửa (Truyền selectedType để modal biết loại mặc định khi thêm mới) */}
            {showModal && (
                <ProductModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchData} // Tải lại khi thành công
                    productToEdit={productToEdit}
                    // Truyền selectedType để modal biết loại mặc định
                    productType={selectedType !== 'all' ? selectedType : 'tour'}
                    suppliers={suppliers}
                />
            )}
        </div>
    );
}

// Giữ lại JSX cho phần tồn kho (đã có sẵn)
const InventoryStatus = ({ inventory }) => {
    return inventory > 0 ? (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Còn hàng ({inventory})
        </span>
    ) : (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Hết hàng
        </span>
    );
};
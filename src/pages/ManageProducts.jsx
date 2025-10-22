// src/pages/ManageProducts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaHotel, FaPlane, FaCar, FaUmbrellaBeach, FaTags } from "react-icons/fa";
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

// Helper để lấy Icon/Title
const getProductTypeDetails = (type) => {
    // Tìm trong mảng productTypes hoặc trả về mặc định là Tour
    const details = productTypes.find(pt => pt.type === type);
    return details || { icon: FaUmbrellaBeach, title: 'Sản phẩm không xác định' };
};


// --- Component con hiển thị Tồn kho --- (Đưa lên đầu cho rõ)
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


// --- Component chính ---
export default function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('tour');
    const [showModal, setShowModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    // Lấy tiêu đề động dựa trên selectedType
    const currentProductDetails = getProductTypeDetails(selectedType);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setProducts([]);

        let productQuery = supabase.from("Products")
                            .select(`*, supplier_name:Suppliers(name)`) // Dùng alias supplier_name
                            .order('created_at', { ascending: false });

        // Chỉ lọc nếu type hợp lệ trong danh sách
        if (productTypes.some(pt => pt.type === selectedType)) {
             productQuery = productQuery.eq("product_type", selectedType);
        } // else: Nếu selectedType là 'all' hoặc không hợp lệ, lấy tất cả (hoặc bạn có thể báo lỗi)

        const [productResponse, supplierResponse] = await Promise.all([
            productQuery,
            supabase.from("Suppliers").select("id, name")
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
            if (error) { alert("Lỗi xóa sản phẩm: " + error.message); }
            else { alert("Xóa thành công!"); fetchData(); }
        }
    };

    return ( // Mở return
        <div className="p-4 md:p-6 space-y-6"> {/* Mở div chính */}

            {/* Thanh Header và Tabs Lọc */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                     <FaTags size={24} className="text-sky-600"/>
                     <span>Quản lý Sản phẩm</span>
                 </h1>
                 <button onClick={handleAddNew} /* ... */ >
                     <FaPlus />
                     <span>Thêm Sản phẩm mới</span>
                 </button>
            </div>

            {/* Tabs Lọc */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {productTypes.map((tab) => { // Mở map
                        const TabIcon = tab.icon;
                        const isActive = selectedType === tab.type;
                        return ( // Mở return button
                            <button key={tab.type} onClick={() => setSelectedType(tab.type)} /* ... */ >
                                <TabIcon size={16} />
                                {tab.label}
                            </button>
                        ); // Đóng return button
                     })} {/* Đóng map */}
                </nav>
            </div>

            {/* Bảng Dữ liệu */}
            {loading ? ( // Mở loading ternary
                <div className="flex justify-center items-center h-64"> <FaSpinner /* ... */ /> </div>
            ) : error ? ( // Mở error ternary
                <div className="text-red-500 ...">Lỗi: {error}</div>
            ) : ( // Mở else (hiển thị bảng)
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700"> {/* Mở table container */}
                    <div className="overflow-x-auto"> {/* Mở overflow div */}
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700"> {/* Mở table */}
                            <thead className="bg-gray-50 dark:bg-slate-700"> {/* Mở thead */}
                                <tr> {/* Mở tr */}
                                    {/* Các th */}
                                    <th /* ... */>Mã SP</th>
                                    <th /* ... */>Tên sản phẩm</th>
                                    <th /* ... */>Nhà cung cấp</th>
                                    <th /* ... */>Giá</th>
                                    <th /* ... */>Tồn kho</th>
                                    <th /* ... */>Hành động</th>
                                </tr> {/* Đóng tr */}
                            </thead> {/* Đóng thead */}
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700"> {/* Mở tbody */}
                                {products.length > 0 ? products.map((product) => ( // Mở map products
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"> {/* Mở tr product */}
                                        <td /* ... */>{product.tour_code}</td>
                                        <td /* ... */>{product.name}</td>
                                        <td /* ... */>
                                            {/* Dùng supplier_name từ alias */}
                                            {product.supplier_name ? product.supplier_name : <span className="text-gray-400 italic">N/A</span>}
                                        </td>
                                        <td /* ... */>{product.price.toLocaleString("vi-VN")} VNĐ</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"> {/* Mở td inventory */}
                                            {/* 👇 SỬA LẠI Ở ĐÂY: Dùng component InventoryStatus 👇 */}
                                            <InventoryStatus inventory={product.inventory} />
                                        </td> {/* Đóng td inventory */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3"> {/* Mở td actions */}
                                             <button onClick={() => handleEdit(product)} /* ... */><FaEdit size={18} /></button>
                                             <button onClick={() => handleDelete(product.id)} /* ... */><FaTrash size={18} /></button>
                                        </td> {/* Đóng td actions */}
                                    </tr> // Đóng tr product
                                )) : ( // Mở else (không có product)
                                     <tr> {/* Mở tr empty */}
                                         <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic">
                                             Không có sản phẩm nào thuộc loại "{currentProductDetails.title}". {/* Dùng title động */}
                                         </td>
                                     </tr> // Đóng tr empty
                                )} {/* Đóng map products ternary */}
                            </tbody> {/* Đóng tbody */}
                        </table> {/* Đóng table */}
                    </div> {/* Đóng overflow div */}
                </div> // Đóng table container
            )} {/* Đóng loading/error ternary */}

            {/* Modal Thêm/Sửa */}
            {showModal && ( // Mở showModal
                <ProductModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchData}
                    productToEdit={productToEdit}
                    productType={selectedType !== 'all' ? selectedType : 'tour'}
                    suppliers={suppliers}
                />
            )} {/* Đóng showModal */}

        </div> // Đóng div chính
    ); // Đóng return
} // <--- 🚨 ĐÂY LÀ DẤU NGOẶC NHỌN CUỐI CÙNG, ĐẢM BẢO NÓ CÓ TỒN TẠI!
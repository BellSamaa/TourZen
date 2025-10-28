// src/pages/SupplierManageProducts.jsx
// (NÂNG CẤP GIAO DIỆN: Dạng Card, thêm hình ảnh, icon và tóm tắt Slot)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext"; // (MỚI) Dùng AuthContext
import {
  FaSpinner,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUmbrellaBeach,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
  FaTicketAlt,
  FaThList, // Icon xem dạng List
  FaThLarge, // Icon xem dạng Grid
  FaImage // Icon ảnh
} from "react-icons/fa";
import ProductModal from "./ProductModal"; // <-- TÔI CẦN FILE NÀY ĐỂ SỬA MODAL

const supabase = getSupabase();

// --- (MỚI) Component Trạng thái Phê duyệt (có icon) ---
const ApprovalStatus = ({ status }) => {
  switch (status) {
    case "approved":
      return (
        <span className="badge-green"><FaCheckCircle /> Đã duyệt</span>
      );
    case "rejected":
      return (
        <span className="badge-red"><FaTimesCircle /> Bị từ chối</span>
      );
    default:
      return (
        <span className="badge-yellow"><FaClock /> Chờ duyệt</span>
      );
  }
};

// --- (MỚI) Component Tóm tắt Slot (đọc từ Departures) ---
const SlotSummary = ({ departures }) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Chỉ tính các lịch khởi hành trong tương lai
    const upcomingDepartures = useMemo(() => 
        departures.filter(d => d.departure_date >= today),
    [departures, today]);

    if (upcomingDepartures.length === 0) {
        return <span className="badge-gray"><FaExclamationTriangle /> Chưa có lịch</span>;
    }

    const totalRemaining = upcomingDepartures.reduce((sum, d) => {
        return sum + (d.max_slots - d.booked_slots);
    }, 0);

    return (
        <span className={totalRemaining > 0 ? "badge-blue" : "badge-red"}>
            <FaTicketAlt /> {totalRemaining > 0 ? `Còn ${totalRemaining} chỗ` : 'Hết chỗ'}
            <span className="font-normal opacity-75">({upcomingDepartures.length} lịch)</span>
        </span>
    );
};

export default function SupplierManageProducts() {
  const { user } = useAuth(); // (MỚI)
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // (Cần cho Modal)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [loggedInSupplierId, setLoggedInSupplierId] = useState(null); // (MỚI)
  const [viewMode, setViewMode] = useState('grid'); // (MỚI) 'grid' or 'list'

  const fetchData = useCallback(async () => {
    if (!user) { // (MỚI) Nếu chưa đăng nhập, không làm gì cả
        setLoading(false);
        setError("Vui lòng đăng nhập với tài khoản Nhà cung cấp.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // (MỚI) Bước 1: Lấy supplier_id của user đang đăng nhập
      const { data: supplierData, error: supplierError } = await supabase
          .from('Suppliers')
          .select('id')
          .eq('user_id', user.id)
          .single();

      if (supplierError || !supplierData) {
          throw new Error("Không tìm thấy thông tin Nhà cung cấp cho tài khoản này.");
      }
      
      const supplierId = supplierData.id;
      setLoggedInSupplierId(supplierId);

      // (MỚI) Bước 2: Lấy tour CHỈ CỦA nhà cung cấp này
      // (MỚI) Lấy thêm bảng Departures
      const { data: productData, error: productError } = await supabase
        .from("Products")
        .select(`
            *,
            Departures (id, departure_date, max_slots, booked_slots)
        `)
        .eq("product_type", "tour")
        .eq("supplier_id", supplierId) // <-- (MỚI) Chỉ lấy tour của NCC này
        .order("created_at", { ascending: false });

      if (productError) throw productError;
      
      // (MỚI) Lấy danh sách NCC (vẫn cần cho Modal)
      const { data: suppliersData, error: suppliersError } = await supabase.from("Suppliers").select("id, name");
      if (suppliersError) throw suppliersError;

      setProducts(productData || []);
      setSuppliers(suppliersData || []);

    } catch (err) {
      console.error("Fetch error:", err);
      setError("Lỗi khi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]); // (MỚI) Phụ thuộc vào user

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNew = () => {
    setProductToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    // (MỚI) Không cần chuẩn hóa date nữa vì modal sẽ tự làm
    setProductToEdit(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tour này? Tất cả lịch khởi hành cũng sẽ bị xóa vĩnh viễn.")) return;
    const { error } = await supabase.from("Products").delete().eq("id", id);
    if (error) {
        toast.error("Lỗi khi xóa tour: " + error.message);
    } else {
      toast.success("Xóa tour thành công!");
      fetchData();
    }
  };

  // (MỚI) JSX cho Card tour
  const TourCard = ({ product }) => (
    <div className="flex flex-col bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border dark:border-slate-700 transition-all duration-300 hover:shadow-xl">
        {/* Hình ảnh */}
        <div className="relative h-48 w-full flex-shrink-0">
            {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <FaImage className="text-4xl text-slate-400 dark:text-slate-500" />
                </div>
            )}
            <div className="absolute top-2 right-2">
                <ApprovalStatus status={product.approval_status} />
            </div>
        </div>
        
        {/* Nội dung */}
        <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2" title={product.name}>
                {product.name}
            </h3>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-3">
                Mã: {product.tour_code || "N/A"}
            </p>
            
            <div className="text-2xl font-extrabold text-red-600 mb-4">
                {product.price ? product.price.toLocaleString("vi-VN") : 0} VNĐ
            </div>
            
            {/* (MỚI) Tóm tắt Slot */}
            <div className="mb-4">
                <SlotSummary departures={product.Departures || []} />
            </div>

            {/* Actions */}
            <div className="mt-auto pt-4 border-t dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                    onClick={() => handleEdit(product)}
                    className="button-icon-sky"
                    title="Sửa thông tin & Lịch khởi hành"
                >
                    <FaEdit size={14} />
                </button>
                <button
                    onClick={() => handleDelete(product.id)}
                    className="button-icon-red"
                    title="Xóa tour"
                >
                    <FaTrash size={14} />
                </button>
            </div>
        </div>
    </div>
  );
  
  // (MỚI) JSX cho List Item
  const TourListItem = ({ product }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-12 w-16 object-cover rounded-md flex-shrink-0" />
                ) : (
                    <div className="h-12 w-16 bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-md flex-shrink-0">
                        <FaImage className="text-2xl text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{product.name}</div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{product.tour_code || "N/A"}</div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
            {product.price ? product.price.toLocaleString("vi-VN") : 0} VNĐ
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
            <SlotSummary departures={product.Departures || []} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
            <ApprovalStatus status={product.approval_status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
            <button
                onClick={() => handleEdit(product)}
                className="button-icon-sky"
                title="Sửa thông tin & Lịch khởi hành"
            >
                <FaEdit size={14} />
            </button>
            <button
                onClick={() => handleDelete(product.id)}
                className="button-icon-red"
                title="Xóa tour"
            >
                <FaTrash size={14} />
            </button>
        </td>
    </tr>
  );


  // (MỚI) JSX chính
  return (
    <>
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <FaUmbrellaBeach size={24} className="text-sky-600" />
          <span>Quản lý Tour</span>
        </h1>
        <div className="flex items-center gap-3">
            {/* (MỚI) Nút đổi View */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}
                    title="Xem dạng lưới"
                >
                    <FaThLarge />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}
                    title="Xem dạng danh sách"
                >
                    <FaThList />
                </button>
            </div>
        
            <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-sky-700 focus:ring-2 focus:ring-sky-500"
            >
                <FaPlus /> Thêm Tour mới
            </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-sky-600" />
        </div>
      )}
      
      {!loading && error && (
        <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </div>
      )}
      
      {!loading && !error && products.length === 0 && (
         <div className="text-center py-20 text-gray-500 italic">
            Không có tour nào được tìm thấy.
            <br/>
            Nhấn "Thêm Tour mới" hoặc "Thêm nhanh Tour mẫu" để bắt đầu.
         </div>
      )}

      {/* (MỚI) Hiển thị Grid hoặc List */}
      {!loading && !error && products.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <TourCard key={p.id} product={p} />)}
        </div>
      )}

      {!loading && !error && products.length > 0 && viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="th-style">Tên Tour</th>
                  <th className="th-style">Giá (Từ)</th>
                  <th className="th-style">Tồn kho (Slots)</th>
                  <th className="th-style">Trạng thái</th>
                  <th className="th-style text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {products.map((p) => <TourListItem key={p.id} product={p} />)}
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
          // (MỚI) Truyền ID của NCC vào Modal
          forceSupplierId={loggedInSupplierId} 
        />
      )}
    </div>
    
    {/* (MỚI) Thêm CSS cho các Badge và Nút */}
    <style jsx>{`
        .badge-base { @apply px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap; }
        .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
        .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
        .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
        .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
        .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
        
        .button-icon-base { @apply p-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
        .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
        .button-icon-sky { @apply button-icon-base text-sky-500 hover:bg-sky-100 hover:text-sky-600 dark:text-sky-400 dark:hover:bg-sky-900/30 focus:ring-sky-400; }
        
        .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
    `}</style>
    </>
  );
}
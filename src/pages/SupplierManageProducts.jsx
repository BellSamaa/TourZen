// src/pages/SupplierManageProducts.jsx
// (File này đã loại bỏ hiển thị Giá NCC theo yêu cầu)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FaImage } from "react-icons/fa"; // Giữ lại icon placeholder
import {
    CircleNotch, Package, PencilLine, Trash, Plus, List, GridFour,
    CheckCircle, Clock, XCircle, Triangle, Ticket // Icons Phosphor
} from "@phosphor-icons/react";
import ProductModal from "./ProductModal"; // Modal phiên bản NCC

const supabase = getSupabase();

// --- Component Trạng thái Phê duyệt ---
const ApprovalStatus = ({ status }) => {
  switch (status) {
    case "approved":
      return <span className="badge-green"><CheckCircle weight="bold"/> Đã duyệt</span>;
    case "rejected":
      return <span className="badge-red"><XCircle weight="bold"/> Bị từ chối</span>;
    default:
      return <span className="badge-yellow"><Clock weight="bold"/> Chờ duyệt</span>;
  }
};

// --- Component Tóm tắt Slot ---
const SlotSummary = ({ departures }) => {
    if (!Array.isArray(departures)) {
        return <span className="badge-gray"><Triangle weight="bold" /> Lỗi slot</span>;
    }
    const today = new Date().toISOString().split('T')[0];
    const upcomingDepartures = useMemo(() =>
        departures.filter(d => d.departure_date >= today),
    [departures, today]);

    if (upcomingDepartures.length === 0) {
        return <span className="badge-gray"><Triangle weight="bold" /> Chưa có lịch</span>;
    }

    const totalRemaining = upcomingDepartures.reduce((sum, d) => {
        const remaining = (d.max_slots || 0) - (d.booked_slots || 0);
        return sum + Math.max(0, remaining);
    }, 0);

    return (
        <span className={totalRemaining > 0 ? "badge-blue" : "badge-red"}>
            <Ticket weight="bold"/> {totalRemaining > 0 ? `Còn ${totalRemaining} chỗ` : 'Hết chỗ'}
            <span className="font-normal opacity-75">({upcomingDepartures.length} lịch)</span>
        </span>
    );
};

// --- Hàm format tiền tệ (Giữ lại nếu cần dùng ở chỗ khác, dù UI đã ẩn) ---
const formatCurrency = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
};


export default function SupplierManageProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Cần cho modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [loggedInSupplierId, setLoggedInSupplierId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Fetch Supplier ID và Tours của họ
  const fetchData = useCallback(async () => {
    if (!user) {
        setLoading(false);
        setError("Vui lòng đăng nhập với tài khoản Nhà cung cấp.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
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

      // Fetch CHỈ tour của NCC này
      const { data: productData, error: productError } = await supabase
        .from("Products")
        .select(`
            *,
            supplier_price_adult:price, supplier_price_child:child_price, supplier_price_infant:infant_price,
            Departures (id, departure_date, max_slots, booked_slots, adult_price, child_price)
        `)
        .eq("product_type", "tour") // Đảm bảo chỉ lấy tour
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false });
      if (productError) throw productError;

      // Fetch tất cả NCC (cần cho dropdown trong modal)
      const { data: suppliersData, error: suppliersError } = await supabase.from("Suppliers").select("id, name");
      if (suppliersError) throw suppliersError;

      setProducts(productData || []);
      setSuppliers(suppliersData || []); // Lưu tất cả NCC cho modal

    } catch (err) {
      console.error("Lỗi fetch:", err);
      setError("Lỗi khi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers cho Modal và Xóa
  const handleAddNew = () => {
    setProductToEdit(null); // Xóa trạng thái sửa để thêm mới
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setProductToEdit(product); // Đặt tour cần sửa
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    toast((t) => ( // Dùng toast confirm
        <div>
            <p className="mb-2">Xóa tour <b>{name}</b>?<br/> <span className="text-xs text-orange-600">(Lịch khởi hành liên quan cũng sẽ bị xóa)</span></p>
            <div className="flex justify-end gap-2">
                <button
                    className="modal-button-danger !py-1 !px-3"
                    onClick={async () => {
                        toast.dismiss(t.id);
                        const { error } = await supabase.from("Products").delete().eq("id", id);
                        if (error) { toast.error("Lỗi khi xóa tour: " + error.message); }
                        else { toast.success("Xóa tour thành công!"); fetchData(); } // Tải lại danh sách
                    }}
                > Xóa </button>
                <button className="modal-button-secondary !py-1 !px-3" onClick={() => toast.dismiss(t.id)}> Hủy </button>
            </div>
        </div>
    ), { icon: '🤔', duration: Infinity }); // Giữ mở đến khi người dùng bấm
  };

  // --- JSX cho Card tour ---
  const TourCard = ({ product }) => (
    <div className="flex flex-col bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border dark:border-slate-700 transition-all duration-300 hover:shadow-xl h-full">
        <div className="relative h-48 w-full flex-shrink-0">
            {/* Hiển thị ảnh */}
            {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Img'; }} />
            ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <FaImage className="text-4xl text-slate-400 dark:text-slate-500" />
                </div>
            )}
            {/* Badge Trạng thái duyệt */}
            <div className="absolute top-2 right-2 z-10">
                <ApprovalStatus status={product.approval_status} />
            </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
            {/* Thông tin Tour */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2" title={product.name}>
                {product.name}
            </h3>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-3">
                Mã: {product.tour_code || "N/A"}
            </p>

            {/* ĐÃ XÓA PHẦN HIỂN THỊ GIÁ Ở ĐÂY */}

            {/* Thông tin Slot */}
            <div className="mb-4 mt-auto">
                <SlotSummary departures={product.Departures || []} />
            </div>

            {/* Nút Hành động */}
            <div className="mt-4 pt-4 border-t dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                    onClick={() => handleEdit(product)}
                    className="button-icon-sky"
                    title="Sửa thông tin & Lịch khởi hành"
                >
                    <PencilLine size={16} />
                </button>
                <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="button-icon-red"
                    title="Xóa tour"
                >
                    <Trash size={16} />
                </button>
            </div>
        </div>
    </div>
  );

  // --- JSX cho List Item ---
  const TourListItem = ({ product }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
        {/* Tên Tour & Ảnh */}
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-12 w-16 object-cover rounded-md flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}/>
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
        
        {/* ĐÃ XÓA CỘT GIÁ NCC Ở ĐÂY */}

        {/* Slots */}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
            <SlotSummary departures={product.Departures || []} />
        </td>
        {/* Trạng thái duyệt */}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
            <ApprovalStatus status={product.approval_status} />
        </td>
        {/* Hành động */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
            <button
                onClick={() => handleEdit(product)}
                className="button-icon-sky"
                title="Sửa thông tin & Lịch khởi hành"
            >
                <PencilLine size={16} />
            </button>
            <button
                onClick={() => handleDelete(product.id, product.name)}
                className="button-icon-red"
                title="Xóa tour"
            >
                <Trash size={16} />
            </button>
        </td>
    </tr>
  );


  return (
    <>
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      {/* Header và Nút Hành động */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Package size={28} weight="duotone" className="text-sky-600" />
          <span>Quản lý Tour</span>
        </h1>

        <div className="flex items-center gap-3">
            {/* Nút Chuyển Đổi View */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`} title="Xem dạng lưới"> <GridFour /> </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`} title="Xem dạng danh sách"> <List /> </button>
            </div>
            {/* Link Thêm Nhanh */}
            <Link to="/supplier/add-quick-tour" className="button-green flex items-center gap-2 !py-2.5" > <Plus size={18}/> Thêm Nhanh Tour Mẫu </Link>
            {/* Nút Thêm Chi Tiết */}
            <button onClick={handleAddNew} className="button-primary flex items-center gap-2 !py-2.5" > <Plus size={18}/> Thêm Tour (Chi tiết) </button>
        </div>
      </div>

      {/* Trạng thái Loading */}
      {loading && ( <div className="flex justify-center items-center h-64"> <CircleNotch size={40} className="animate-spin text-sky-600" /> </div> )}
      {/* Trạng thái Lỗi */}
      {!loading && error && ( <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg"> {error} </div> )}
      {/* Trạng thái Rỗng */}
      {!loading && !error && products.length === 0 && ( <div className="text-center py-20 text-gray-500 italic"> Không có tour nào được tìm thấy. <br/> Nhấn nút "Thêm" để bắt đầu. </div> )}

      {/* Grid View */}
      {!loading && !error && products.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => <TourCard key={p.id} product={p} />)}
        </div>
      )}
      {/* List View */}
      {!loading && !error && products.length > 0 && viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="th-style">Tên Tour</th>
                  {/* ĐÃ XÓA TH GIÁ NCC Ở ĐÂY */}
                  <th className="th-style">Slots</th>
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

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData} // Tải lại dữ liệu khi thành công
          productToEdit={productToEdit}
          productType="tour"
          suppliers={suppliers} // Truyền danh sách NCC
          forceSupplierId={loggedInSupplierId} // Ép ID NCC hiện tại
        />
      )}
    </div>

    {/* CSS Styles */}
    <style jsx>{`
        /* Styles badges */
        .badge-base { @apply px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap; }
        .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
        .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
        .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
        .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
        .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
        /* Styles nút icon */
        .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
        .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
        .button-icon-sky { @apply button-icon-base text-sky-500 hover:bg-sky-100 hover:text-sky-600 dark:text-sky-400 dark:hover:bg-sky-900/30 focus:ring-sky-400; }
        /* Styles nút chung */
        .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
        .button-green { @apply bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
        .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
        .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50; }
        /* Styles bảng */
        .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
    `}</style>
    </>
  );
}
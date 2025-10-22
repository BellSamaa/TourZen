// src/pages/HotelPage.jsx
import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
import HotelCard from "../components/HotelCard";
import { FaSpinner, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ProductModal from "./ProductModal";
// --- SỬA LỖI ĐƯỜNG DẪN IMPORT ---
import { ApprovalBadge } from './AdminProductApproval'; // Bỏ dấu './' nếu chúng cùng cấp
// --- KẾT THÚC SỬA ---

const supabase = getSupabase();

export default function HotelPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  // Fetch hotels (Đã sửa để lọc theo status)
  async function fetchHotels() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("Products")
        .select("*")
        .eq("product_type", "hotel");

      // Nếu KHÔNG phải Admin, chỉ lấy 'approved'
      if (!isAdmin) {
        query = query.eq("approval_status", "approved");
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setHotels(data || []);

    } catch (fetchError) {
        setError("Lỗi tải danh sách khách sạn.");
        console.error(fetchError);
    } finally {
        setLoading(false);
    }
  }

  // Fetch suppliers (chỉ khi là admin)
  async function fetchSuppliersForModal() {
    if (!isAdmin) return;
    const { data, error: supplierError } = await supabase.from("Suppliers").select("id, name");
    if (supplierError) {
        console.error("Lỗi fetch suppliers cho modal:", supplierError);
    } else {
        setSuppliers(data || []);
    }
  }

  useEffect(() => {
    fetchHotels();
    fetchSuppliersForModal();
  }, [isAdmin]);


  // --- Các hàm xử lý Modal ---
  const handleAddNew = () => {
    setProductToEdit(null);
    setShowModal(true);
  };
  const handleEdit = (hotel) => {
    setProductToEdit(hotel);
    setShowModal(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen pt-24"><FaSpinner className="animate-spin text-4xl text-sky-500" /></div>;
  }
  if (error) {
     return <div className="text-center text-red-500 pt-24">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen pt-24">
      {/* Thanh công cụ Admin */}
      {isAdmin && (
        <div className="bg-sky-100 dark:bg-sky-900/50 border-l-4 border-sky-500 text-sky-800 dark:text-sky-200 p-4 mb-8 rounded-lg flex justify-between items-center shadow-md">
          <p className="font-bold">Chế độ Quản trị viên</p>
          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700"
          >
            <FaPlus />
            <span>Thêm Khách sạn Mới</span>
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Danh sách Khách sạn</h1>

      {hotels.length === 0 ? (
          <p className="text-center text-gray-500 italic mt-10">Không tìm thấy khách sạn nào.</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="relative group">
                {/* Hiển thị Badge trạng thái cho Admin */}
                {isAdmin && (
                  <div className="absolute top-3 left-3 z-10">
                    <ApprovalBadge status={hotel.approval_status} />
                  </div>
                )}
                <HotelCard hotel={hotel} onEdit={handleEdit} />
              </div>
            ))}
          </div>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchHotels(); fetchSuppliersForModal(); }}
          productToEdit={productToEdit}
          productType="hotel"
          suppliers={suppliers}
        />
      )}
    </div>
  );
}
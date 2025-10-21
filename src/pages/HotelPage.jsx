// src/pages/HotelPage.jsx
// (Nội dung file được tải lên)
import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient"; // <- Import đúng 👍
import HotelCard from "../components/HotelCard"; // Import Card
import { FaSpinner } from "react-icons/fa";
// Giả sử bạn muốn thêm nút Edit/Add cho Admin ở đây
import { useAuth } from "../context/AuthContext"; // Import useAuth 👍
import { FaPlus } from "react-icons/fa";
import ProductModal from "./ProductModal"; // Import Modal 👍

const supabase = getSupabase(); // <- Khai báo đúng 👍

export default function HotelPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth(); // Lấy trạng thái admin 👍

  // State cho Modal (nếu admin)
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [suppliers, setSuppliers] = useState([]); // Modal cần suppliers 👍

  // Fetch hotels
  async function fetchHotels() { // Đổi tên hàm thành fetchHotels
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("Products")
      .select("*") // Lấy tất cả cột cần thiết cho HotelCard
      .eq("product_type", "hotel"); // Lọc khách sạn 👍

    if (fetchError) {
      setError("Lỗi tải danh sách khách sạn.");
      console.error(fetchError);
    } else {
      setHotels(data || []);
    }
    setLoading(false);
  }

   // Fetch suppliers (chỉ khi là admin)
   async function fetchSuppliersForModal() {
     if (!isAdmin) return; // Chỉ fetch nếu là admin 👍
     const { data, error: supplierError } = await supabase.from("Suppliers").select("id, name");
     if (supplierError) {
         console.error("Lỗi fetch suppliers cho modal:", supplierError);
     } else {
         setSuppliers(data || []);
     }
   }

   // Chạy fetch khi component mount hoặc khi trạng thái admin thay đổi
   useEffect(() => {
     fetchHotels();
     fetchSuppliersForModal(); // Fetch suppliers nếu là admin
   }, [isAdmin]); // Thêm isAdmin vào dependency array 👍


  // --- Các hàm xử lý Modal (Tương tự TourList.jsx) ---
  const handleAddNew = () => {
    setProductToEdit(null);
    setShowModal(true);
  };

  const handleEdit = (hotel) => {
    setProductToEdit(hotel); // Truyền hotel vào đây
    setShowModal(true);
  };


  if (loading) { /* ... Loading spinner ... */ }
  if (error) { /* ... Hiển thị lỗi ... */ }

  return (
    <div className="container mx-auto p-4 min-h-screen pt-24"> {/* Thêm pt-24 để không bị Navbar che */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {hotels.map((hotel) => (
          // Truyền hàm handleEdit vào HotelCard
          <HotelCard key={hotel.id} hotel={hotel} onEdit={handleEdit} />
        ))}
      </div>

       {/* Modal Thêm/Sửa */}
      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          // Truyền lại fetchHotels VÀ fetchSuppliers khi thành công
          onSuccess={() => { fetchHotels(); fetchSuppliersForModal(); }}
          productToEdit={productToEdit}
          productType="hotel" // Quan trọng: chỉ định type là hotel
          suppliers={suppliers}
        />
      )}
    </div>
  );
}
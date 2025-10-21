// src/pages/TourList.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

// --- Tích hợp Supabase & Auth ---
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

// --- Import Components ---
import TourCard from "../components/TourCard.jsx";
import ProductModal from "./ProductModal"; // Modal để Sửa/Thêm
import { FaPlus, FaSpinner } from "react-icons/fa";

const supabase = getSupabase();

export default function TourList() {
  const { isAdmin } = useAuth(); // Lấy trạng thái Admin

  // --- State quản lý dữ liệu ---
  const [tours, setTours] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Cần cho Modal
  const [loading, setLoading] = useState(true);
  
  // --- State cho bộ lọc ---
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");

  // --- State cho Modal ---
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Hàm fetch dữ liệu từ Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Lấy danh sách tour
    const { data: tourData, error: tourError } = await supabase
      .from("Products")
      .select("*")
      .eq("product_type", "tour");

    if (tourError) {
      console.error("Lỗi fetch tour:", tourError);
    } else {
      setTours(tourData || []);
    }

    // Nếu là admin, tải luôn danh sách nhà cung cấp để dùng cho Modal
    if (isAdmin) {
      const { data: supplierData } = await supabase.from("Suppliers").select("id, name");
      if (supplierData) setSuppliers(supplierData);
    }

    setLoading(false);
  }, [isAdmin]); // Chạy lại hàm này nếu trạng thái admin thay đổi

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lọc và sắp xếp dữ liệu
  const filteredTours = useMemo(() => {
    let arr = [...tours];

    // Lọc theo từ khóa (tìm kiếm cả Tên và Mã tour)
    if (q) {
      arr = arr.filter(
        (t) =>
          t.name.toLowerCase().includes(q.toLowerCase()) ||
          t.tour_code.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    // Sắp xếp
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    // Lưu ý: Cần thêm cột `sold` vào bảng Products nếu muốn dùng sort 'popular'
    // if (sort === "popular") arr.sort((a, b) => (b.sold || 0) - (a.sold || 0));

    return arr;
  }, [q, sort, tours]);

  // --- Các hàm xử lý Modal ---
  const handleAddNew = () => {
    setProductToEdit(null); // Chế độ Thêm mới
    setShowModal(true);
  };

  const handleEdit = (tour) => {
    setProductToEdit(tour); // Chế độ Sửa
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-5xl text-sky-500" />
      </div>
    );
  }

  return (
    <main className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
            Tất Cả Tour Du Lịch
          </h1>
        </div>
        
        {/* THANH CÔNG CỤ ADMIN */}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sky-100 dark:bg-sky-900/50 border-l-4 border-sky-500 text-sky-800 dark:text-sky-200 p-4 mb-8 rounded-lg flex justify-between items-center shadow-md"
          >
            <div>
              <p className="font-bold">Chế độ Quản trị viên</p>
              <p className="text-sm">Bạn có thể thêm hoặc chỉnh sửa tour ngay tại đây.</p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 transition-colors"
            >
              <FaPlus />
              <span>Thêm Tour Mới</span>
            </button>
          </motion.div>
        )}

        {/* BỘ LỌC */}
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-md mb-12 flex flex-col md:flex-row items-center gap-4">
          <input
            className="w-full md:flex-grow border border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            placeholder="Tìm kiếm theo tên hoặc mã tour..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="w-full md:w-48 border border-gray-300 dark:border-gray-600 dark:bg-neutral-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="popular">Phổ biến</option>
            <option value="price-asc">Giá: Thấp → Cao</option>
            <option value="price-desc">Giá: Cao → Thấp</option>
          </select>
        </div>

        {/* DANH SÁCH TOUR */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour, i) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {/* Truyền hàm handleEdit vào TourCard */}
                <TourCard tour={tour} onEdit={handleEdit} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Không tìm thấy tour nào phù hợp.
            </p>
          </div>
        )}
      </div>

      {/* MODAL THÊM/SỬA (chỉ render khi cần) */}
      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData} // Tải lại danh sách sau khi lưu
          productToEdit={productToEdit}
          productType="tour"
          suppliers={suppliers}
        />
      )}
    </main>
  );
}
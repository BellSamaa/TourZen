// src/pages/TourList.jsx
// (Chỉ cập nhật hàm fetchData)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import TourCard from "../components/TourCard.jsx";
import ProductModal from "./ProductModal"; 
import { FaPlus, FaSpinner } from "react-icons/fa";

const supabase = getSupabase();

export default function TourList() {
  const { isAdmin } = useAuth(); 
  const [tours, setTours] = useState([]);
  const [suppliers, setSuppliers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // <<< SỬA ĐỔI TẠI ĐÂY ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Lấy danh sách tour
    let query = supabase
      .from("Products")
      .select("*")
      .eq("product_type", "tour")
      .eq("approval_status", "approved"); // Phải được duyệt

    // --- THAY ĐỔI CHÍNH ---
    // Nếu không phải Admin, chỉ lấy tour đã ĐĂNG (is_published)
    if (!isAdmin) {
        query = query.eq("is_published", true);
    }
    // (Admin sẽ thấy cả tour 'approved' nhưng 'chưa đăng' để tiện review)

    const { data: tourData, error: tourError } = await query;

    if (tourError) {
      console.error("Lỗi fetch tour:", tourError);
    } else {
      setTours(tourData || []);
    }
    // --- KẾT THÚC SỬA ĐỔI ---

    if (isAdmin) {
      const { data: supplierData } = await supabase.from("Suppliers").select("id, name");
      if (supplierData) setSuppliers(supplierData);
    }

    setLoading(false);
  }, [isAdmin]); 
// ... (Phần còn lại của file giữ nguyên) ...

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTours = useMemo(() => {
    // ...
    let arr = [...tours];
    if (q) {
      arr = arr.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q.toLowerCase())) ||
          (t.tour_code && t.tour_code.toLowerCase().includes(q.toLowerCase()))
      );
    }
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [q, sort, tours]);

  const handleAddNew = () => {
    setProductToEdit(null); 
    setShowModal(true);
  };

  const handleEdit = (tour) => {
    setProductToEdit(tour); 
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
        
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sky-100 dark:bg-sky-900/50 border-l-4 border-sky-500 text-sky-800 dark:text-sky-200 p-4 mb-8 rounded-lg flex justify-between items-center shadow-md"
          >
            {/* ... */}
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
V              whileInView={{ opacity: 1, y: 0 }}
        _B     transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
              >
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

      {showModal && (
        <ProductModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData} 
          productToEdit={productToEdit}
          productType="tour"
          suppliers={suppliers}
        />
      )}
    </main>
  );
}
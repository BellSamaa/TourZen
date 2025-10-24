// src/pages/ManageCustomers.jsx
// (Nâng cấp UI, Sửa lỗi Pagination, Thêm Debounced Search từ file ManageCustomers EDIT)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSearch, FaPlus, FaSpinner } from "react-icons/fa";
import { UsersThree, Pencil, Trash } from "@phosphor-icons/react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const supabase = getSupabase();

// --- Hook (MỚI): Debounce (Trì hoãn) ---
// Hook này giúp trì hoãn việc tìm kiếm cho đến khi người dùng ngừng gõ
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper (MỚI): Tạo cửa sổ phân trang ---
// Sửa lỗi hiển thị quá nhiều trang
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
  if (totalPages <= 1) return [];
  // Nếu tổng số trang ít, hiển thị tất cả
  if (totalPages <= 5 + width * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();
  pages.add(1); // Luôn thêm trang 1

  // Thêm các trang xung quanh trang hiện tại
  for (let i = 0; i <= width; i++) {
    if (currentPage - i > 1) pages.add(currentPage - i);
    if (currentPage + i < totalPages) pages.add(currentPage + i);
  }

  pages.add(totalPages); // Luôn thêm trang cuối

  const sortedPages = [...pages].sort((a, b) => a - b);
  const finalPages = [];

  // Thêm "..." vào các khoảng trống
  let lastPage = 0;
  for (const page of sortedPages) {
    if (lastPage !== 0 && page - lastPage > 1) {
      finalPages.push("...");
    }
    finalPages.push(page);
    lastPage = page;
  }
  return finalPages;
};

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Search (ĐÃ CẬP NHẬT) ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400); // Trì hoãn 400ms

  // --- Pagination (ĐÃ CẬP NHẬT) ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // Giữ nguyên 5
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // --- Modals ---
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ TenKH: "", DiaChi: "", Email: "", SDT: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state loading cho form

  // --- Fetch data (ĐÃ CẬP NHẬT) ---
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("KhachHang")
        .select("*", { count: "exact" });

      // Áp dụng tìm kiếm nếu có
      if (debouncedSearch.trim() !== "") {
        query = query.ilike("TenKH", `%${debouncedSearch.trim()}%`);
      }

      // Sắp xếp và phân trang
      query = query
        .order("MaKH", { ascending: true })
        .range(from, to);

      const { data, count, error } = await query;
      
      if (error) throw error;
      
      setCustomers(data || []);
      setTotalCount(count || 0);

      // Nếu trang hiện tại không còn dữ liệu (do xóa/tìm kiếm), quay về trang 1
      if (data.length === 0 && count > 0 && page > 1) {
        setPage(1);
      }

    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
      toast.error("Không thể tải dữ liệu khách hàng.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]); // <= Phụ thuộc vào trang, cỡ trang, và TÌM KIẾM

  // Trigger fetch khi các dependencies thay đổi
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset về trang 1 khi tìm kiếm
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedSearch]);


  // --- Form ---
  const openForm = (customer = null) => {
    setFormError("");
    setIsSubmitting(false);
    if (customer) {
      setSelectedCustomer(customer);
      setForm({
        TenKH: customer.TenKH,
        DiaChi: customer.DiaChi,
        Email: customer.Email,
        SDT: customer.SDT,
      });
    } else {
      setSelectedCustomer(null);
      setForm({ TenKH: "", DiaChi: "", Email: "", SDT: "" });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
  };

  const validateForm = () => {
    if (!form.TenKH.trim()) return "Tên không được trống.";
    if (!form.DiaChi.trim()) return "Địa chỉ không được trống.";
    if (!form.Email.trim()) return "Email không được trống.";
    if (!form.SDT.trim()) return "Số điện thoại không được trống.";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    
    setIsSubmitting(true);
    setFormError("");
    
    try {
      if (selectedCustomer) {
        // --- Sửa ---
        const { error } = await supabase
          .from("KhachHang")
          .update(form)
          .eq("MaKH", selectedCustomer.MaKH);
        if (error) throw error;
        toast.success("Cập nhật khách hàng thành công!");
      } else {
        // --- Thêm ---
        const { error } = await supabase.from("KhachHang").insert(form);
        if (error) throw error;
        toast.success("Thêm khách hàng thành công!");
      }
      fetchCustomers();
      closeForm();
    } catch (err) {
      console.error("Lỗi lưu:", err);
      setFormError("Không thể lưu dữ liệu: " + err.message);
      toast.error("Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete (ĐÃ CẬP NHẬT) ---
  const openDeleteConfirm = (c) => {
    setSelectedCustomer(c);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => setShowDeleteConfirm(false);

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const { error } = await supabase.from("KhachHang").delete().eq("MaKH", selectedCustomer.MaKH);
      if (error) throw error;
      toast.success(`Đã xóa khách hàng ${selectedCustomer.TenKH}.`);
      fetchCustomers();
      closeDeleteConfirm();
    } catch (err) {
      toast.error("Xóa thất bại: " + err.message);
    }
  };

  // --- Pagination controls (ĐÃ CẬP NHẬT) ---
  const handlePageChange = (newPage) => {
    if (typeof newPage === 'number') {
      setPage(newPage);
    }
  };
  
  // Tạo cửa sổ phân trang
  const paginationWindow = useMemo(
    () => getPaginationWindow(page, totalPages, 2),
    [page, totalPages]
  );

  return (
    <div className="p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
        <UsersThree size={30} weight="duotone" className="text-sky-600" />
        Quản lý Khách hàng (CRUD)
      </h1>

      {/* --- Thanh tìm kiếm + thêm (ĐÃ CẬP NHẬT) --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-auto">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên khách hàng..."
            className="w-full md:w-80 pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
          />
        </div>
        <button
          onClick={() => openForm()}
          className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all"
        >
          <FaPlus /> Thêm khách hàng
        </button>
      </div>

      {/* --- Bảng dữ liệu (ĐÃ CẬP NHẬT) --- */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">SĐT</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">
                  {searchTerm ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu khách hàng."}
                </td></tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={c.MaKH} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.TenKH}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.DiaChi}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.Email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.SDT}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                      <button 
                          onClick={() => openForm(c)}
                          className="p-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-all rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30" 
                          title="Sửa">
                          <Pencil size={18} weight="bold" />
                      </button>
                      <button 
                          onClick={() => openDeleteConfirm(c)}
                          className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30" 
                          title="Xóa">
                          <Trash size={18} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Phân trang (ĐÃ CẬP NHẬT) --- */}
      {customers.length > 0 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 dark:bg-slate-700 dark:text-gray-300 dark:disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-slate-600"
          >
            Trang trước
          </button>
          
          {paginationWindow.map((p, idx) => 
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-4 py-2 text-gray-500 dark:text-gray-400">...</span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 rounded-md font-semibold ${
                  page === p
                    ? "bg-sky-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {p}
              </button>
            )
          )}
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 dark:bg-slate-700 dark:text-gray-300 dark:disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-slate-600"
          >
            Trang tiếp
          </button>
        </div>
      )}

      {/* --- Modal form (ĐÃ CẬP NHẬT) --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-4">
              {selectedCustomer ? "Sửa thông tin Khách hàng" : "Thêm Khách hàng mới"}
            </h3>
            {formError && (
              <p className="text-sm text-red-500 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded-md text-center">{formError}</p>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên khách hàng</label>
                <input
                  value={form.TenKH}
                  onChange={(e) => setForm({ ...form, TenKH: e.target.value })}
                  className="border border-gray-300 p-2 rounded-md w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ</label>
                <input
                  value={form.DiaChi}
                  onChange={(e) => setForm({ ...form, DiaChi: e.target.value })}
                  className="border border-gray-300 p-2 rounded-md w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.Email}
                  onChange={(e) => setForm({ ...form, Email: e.target.value })}
                  className="border border-gray-300 p-2 rounded-md w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SĐT</label>
                <input
                  value={form.SDT}
                  onChange={(e) => setForm({ ...form, SDT: e.target.value })}
                  className="border border-gray-300 p-2 rounded-md w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500"
                  onClick={closeForm}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : null}
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal xác nhận xóa (ĐÃ CẬP NHẬT) --- */}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
            <h4 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
              Xác nhận xóa
            </h4>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Bạn có chắc muốn xóa khách hàng{" "}
              <b className="dark:text-white">{selectedCustomer.TenKH}</b> không?
              <br/>
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500"
                onClick={closeDeleteConfirm}
              >
                Hủy
              </button>
              <button
                className="bg-red-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700"
                onClick={handleDelete}
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
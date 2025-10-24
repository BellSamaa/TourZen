// src/pages/ManageCustomers.jsx
// (Đã thêm Pagination và Debounced Search - Code đầy đủ)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSearch, FaPlus, FaSpinner } from "react-icons/fa";
// <<< THÊM: Import icons cần thiết >>>
import { UsersThree, Pencil, Trash, CaretLeft, CaretRight, CircleNotch, X } from "@phosphor-icons/react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const supabase = getSupabase();

// --- Hook Debounce ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
  if (totalPages <= 1) return [];
  if (totalPages <= 5 + width * 2) { return Array.from({ length: totalPages }, (_, i) => i + 1); }
  const pages = new Set([1]);
  for (let i = Math.max(2, currentPage - width); i <= Math.min(totalPages - 1, currentPage + width); i++) { pages.add(i); }
  pages.add(totalPages);
  const sortedPages = [...pages].sort((a, b) => a - b);
  const finalPages = []; let lastPage = 0;
  for (const page of sortedPages) { if (lastPage !== 0 && page - lastPage > 1) { finalPages.push("..."); } finalPages.push(page); lastPage = page; }
  return finalPages;
};


export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading ban đầu
  const [isFetchingPage, setIsFetchingPage] = useState(false); // Loading chuyển trang/search
  const [error, setError] = useState(null); // <<< Thêm state Error

  // --- Search & Pagination ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const ITEMS_PER_PAGE = 10; // <<< Số khách hàng mỗi trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // --- Modals ---
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ TenKH: "", DiaChi: "", Email: "", SDT: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch data ---
  const fetchCustomers = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsFetchingPage(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("KhachHang")
        .select("*", { count: "exact" });

      if (debouncedSearch.trim() !== "") {
        const searchTermLike = `%${debouncedSearch.trim()}%`;
        query = query.or(`TenKH.ilike.${searchTermLike},Email.ilike.${searchTermLike},DiaChi.ilike.${searchTermLike},SDT.ilike.${searchTermLike}`);
      }

      query = query
        .order("MaKH", { ascending: true })
        .range(from, to);

      const { data, count, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setCustomers(data || []);
      setTotalItems(count || 0);

      if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
        setCurrentPage(1);
      }

    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
      setError("Không thể tải dữ liệu khách hàng.");
      toast.error("Không thể tải dữ liệu khách hàng.");
      setCustomers([]);
      setTotalItems(0);
    } finally {
      if (isInitialLoad) setLoading(false);
      setIsFetchingPage(false);
    }
  }, [currentPage, debouncedSearch]);

  // Trigger fetch
  useEffect(() => {
    const isInitial = customers.length === 0 && loading;
    fetchCustomers(isInitial);
  }, [fetchCustomers, customers.length, loading]);

  // Reset page on search
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);


  // --- Form Handlers ---
  const openForm = (customer = null) => {
    setFormError(""); setIsSubmitting(false);
    if (customer) { setSelectedCustomer(customer); setForm({ TenKH: customer.TenKH, DiaChi: customer.DiaChi, Email: customer.Email, SDT: customer.SDT }); }
    else { setSelectedCustomer(null); setForm({ TenKH: "", DiaChi: "", Email: "", SDT: "" }); }
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setSelectedCustomer(null); };
  const validateForm = () => {
    if (!form.TenKH.trim()) return "Tên không được trống.";
    if (!form.DiaChi.trim()) return "Địa chỉ không được trống.";
    // Basic email validation
    if (!form.Email.trim() || !/\S+@\S+\.\S+/.test(form.Email)) return "Email không hợp lệ.";
    // Basic phone validation (numbers and possibly +, -, space, brackets)
    if (!form.SDT.trim() || !/^[0-9+()\-\s]+$/.test(form.SDT)) return "Số điện thoại không hợp lệ.";
    return "";
  };


  const handleSave = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    setIsSubmitting(true); setFormError("");
    try {
      if (selectedCustomer) {
        const { error } = await supabase.from("KhachHang").update(form).eq("MaKH", selectedCustomer.MaKH);
        if (error) throw error; toast.success("Cập nhật thành công!");
      } else {
        const { error } = await supabase.from("KhachHang").insert(form);
        if (error) throw error; toast.success("Thêm thành công!");
      }
      fetchCustomers(false);
      closeForm();
    } catch (err) {
        console.error("Lỗi lưu:", err);
        let displayError = "Không thể lưu dữ liệu.";
        if (err.message?.includes('duplicate key value violates unique constraint "KhachHang_Email_key"')) {
            displayError = "Email này đã tồn tại trong hệ thống.";
        } else if (err.message) {
            displayError += `: ${err.message}`;
        }
        setFormError(displayError);
        toast.error(displayError);
    } finally { setIsSubmitting(false); }
  };

  // --- Delete Handlers ---
  const openDeleteConfirm = (c) => { setSelectedCustomer(c); setShowDeleteConfirm(true); };
  const closeDeleteConfirm = () => { setShowDeleteConfirm(false); setSelectedCustomer(null); };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("KhachHang").delete().eq("MaKH", selectedCustomer.MaKH);
      if (error) throw error;
      toast.success(`Đã xóa khách hàng ${selectedCustomer.TenKH}.`);
      fetchCustomers(false);
      closeDeleteConfirm();
    } catch (err) { toast.error("Xóa thất bại: " + err.message); }
    finally { setIsSubmitting(false); }
  };

  // --- Pagination Controls ---
  const paginationWindow = useMemo(
    () => getPaginationWindow(currentPage, totalPages, 2),
    [currentPage, totalPages]
  );

   // --- Loading ban đầu ---
   if (loading) {
     return (
       <div className="flex justify-center items-center h-[calc(100vh-150px)]">
         <FaSpinner className="animate-spin text-4xl text-sky-500" />
       </div>
     );
   }

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
        <UsersThree size={30} weight="duotone" className="text-sky-600" />
        Quản lý Khách hàng
      </h1>

      {/* --- Thanh tìm kiếm + thêm --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-auto flex-grow">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên, Email, Địa chỉ, SĐT..."
            className="w-full md:min-w-[300px] pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
          />
        </div>
        <button
          onClick={() => openForm()}
          className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all flex-shrink-0"
        >
          <FaPlus /> Thêm khách hàng
        </button>
      </div>

      {/* --- Bảng dữ liệu --- */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="overflow-x-auto relative">
           {/* Loading overlay */}
           {isFetchingPage && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10">
                    <FaSpinner className="animate-spin text-sky-500 text-3xl" />
                </div>
            )}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">SĐT</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {error && !isFetchingPage && ( <tr><td colSpan="6" className="p-8 text-center text-red-500">{error}</td></tr> )}
              {!error && loading && customers.length === 0 && ( <tr><td colSpan="6" className="p-8 text-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr> )}
              {!error && !loading && !isFetchingPage && customers.length === 0 && ( <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">{debouncedSearch ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu khách hàng."}</td></tr> )}
              {!error && customers.map((c, i) => (
                <tr key={c.MaKH} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.TenKH}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.DiaChi}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.Email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.SDT}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap space-x-1">
                    <button onClick={() => openForm(c)} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa"><Pencil size={16} weight="bold" /></button>
                    {/* <button onClick={() => { setSelectedCustomer(c); setShowHistoryModal(true); }} className="action-button text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" title="Lịch sử"><FaHistory size={14} /></button> */}
                    <button onClick={() => openDeleteConfirm(c)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa"><Trash size={16} weight="bold" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Phân trang UI --- */}
      {!loading && totalItems > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
              <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> khách hàng </div>
              <div className="flex items-center gap-1 mt-3 sm:mt-0">
                  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
                  {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
                      <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} disabled={isFetchingPage} className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}>{pageNumber}</button>
                  ))}
                  <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
              </div>
          </div>
      )}

      {/* --- Modals (Form & Delete Confirm - Đã sửa lỗi cuộn và style) --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
           <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100">
             <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
               {/* Header Modal */}
               <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10 flex-shrink-0">
                 <h3 className="text-xl font-semibold dark:text-white">
                   {selectedCustomer ? "Sửa thông tin Khách hàng" : "Thêm Khách hàng mới"}
                 </h3>
                 <button type="button" onClick={closeForm} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                   <X size={20} weight="bold"/>
                 </button>
               </div>
               {/* Body Modal (cho phép cuộn) */}
               <div className="p-6 space-y-4 overflow-y-auto flex-1">
                 {formError && ( <p className="error-message text-center">{formError}</p> )}
                 <div>
                   <label className="label-style">Tên khách hàng *</label>
                   <input value={form.TenKH} onChange={(e) => setForm({ ...form, TenKH: e.target.value })} required className="input-style" />
                 </div>
                 <div>
                   <label className="label-style">Địa chỉ *</label>
                   <input value={form.DiaChi} onChange={(e) => setForm({ ...form, DiaChi: e.target.value })} required className="input-style" />
                 </div>
                 <div>
                   <label className="label-style">Email *</label>
                   <input type="email" value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} required className="input-style" />
                 </div>
                 <div>
                   <label className="label-style">SĐT *</label>
                   <input type="tel" value={form.SDT} onChange={(e) => setForm({ ...form, SDT: e.target.value })} required className="input-style" />
                 </div>
               </div>
               {/* Footer Modal */}
               <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800 z-10 flex-shrink-0">
                 <button type="button" className="button-secondary" onClick={closeForm} disabled={isSubmitting}> Hủy </button>
                 <button type="submit" className="button-primary flex items-center gap-2" disabled={isSubmitting}>
                   {isSubmitting ? <CircleNotch className="animate-spin" size={18}/> : null} {isSubmitting ? "Đang lưu..." : "Lưu"}
                 </button>
               </div>
             </form>
           </div>
         </div>
      )}
      {showDeleteConfirm && selectedCustomer && (
         <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center transform transition-transform duration-300 scale-100">
             <h4 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3"> Xác nhận xóa </h4>
             <p className="mb-6 text-gray-700 dark:text-gray-300"> Bạn có chắc muốn xóa khách hàng <b className="dark:text-white">{selectedCustomer.TenKH}</b> không?<br/> Hành động này không thể hoàn tác. </p>
             <div className="flex justify-center gap-4">
               <button className="button-secondary px-5" onClick={closeDeleteConfirm} disabled={isSubmitting}> Hủy </button>
               <button className="bg-red-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors text-sm flex items-center gap-1.5 disabled:opacity-50" onClick={handleDelete} disabled={isSubmitting}>
                    {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
                    {isSubmitting ? 'Đang xóa...' : 'Xác nhận Xóa'}
               </button>
             </div>
           </div>
         </div>
       )}

       {/* --- CSS --- */}
       <style jsx>{`
        .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800; }
        .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
        .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
        .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
        .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; } /* <<< Cập nhật text-sm */
        .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
        .error-message { @apply text-sm text-red-500 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded-md text-center; }
        .button-secondary { @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500 transition-colors duration-200 text-sm disabled:opacity-50; }
        .button-primary { @apply bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50; }
      `}</style>

    </div>
  );
}
// ManageCustomersSupabase.jsx
// (UPGRADED: Giao diện và chức năng giống ManageAccounts, dùng bảng Users)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSpinner, FaSearch, FaEdit, FaTrash, FaFilter, FaUsers, FaUserCog, FaBuilding } from "react-icons/fa"; // Giữ lại icons cần thiết
import { UserList, CaretLeft, CaretRight, CircleNotch, X, Lock, LockOpen } from "@phosphor-icons/react"; // <<< THÊM Icons mới
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';

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

// --- Badge + Icon theo vai trò ---
const getRoleStyle = (role) => {
    switch (role) {
      case "admin": return { label: "Admin", icon: <FaUserCog className="text-red-500" size={14}/>, badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", };
      case "supplier": return { label: "Supplier", icon: <FaBuilding className="text-blue-500" size={14} />, badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", };
      default: return { label: "User", icon: <FaUsers className="text-green-500" size={14} />, badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", };
    }
};

export default function ManageCustomersSupabase() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [filterRole, setFilterRole] = useState("all");
  const [filterActive, setFilterActive] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15; // Tăng số lượng hiển thị
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ full_name: "", address: "", email: "", phone_number: "" });
  const [formError, setFormError] = useState("");

  // Fetch customers (logic tương tự ManageAccounts)
  const fetchCustomers = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsFetchingPage(true);
    setError(null);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from("Users").select("*", { count: 'exact' });

      // Apply Filters
      if (filterRole !== "all") { query = query.eq('role', filterRole); }
      if (filterActive !== "all") {
          if (filterActive === 'active') { query = query.or('is_active.is.true,is_active.is.null'); } // Bao gồm cả null (dữ liệu cũ)
          else { query = query.eq('is_active', false); }
      }
      // Apply Search
      if (debouncedSearch.trim() !== "") {
        const searchTerm = `%${debouncedSearch.trim()}%`;
        query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm},phone_number.ilike.${searchTerm}`);
      }
      // Apply Order & Pagination
      query = query.order("full_name", { ascending: true }).range(from, to);

      const { data, count, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setCustomers(data || []);
      setTotalItems(count || 0);

      if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
          setCurrentPage(1); // Reset về trang 1 nếu trang hiện tại trống
      }
    } catch (err) {
      console.error("Lỗi fetch tài khoản:", err);
      const errorMsg = err.message || "Không thể tải danh sách tài khoản.";
      setError(errorMsg);
      toast.error(`Lỗi tải danh sách: ${errorMsg}`);
      setCustomers([]);
      setTotalItems(0);
    } finally {
      if (isInitialLoad) setLoading(false);
      setIsFetchingPage(false);
    }
  }, [currentPage, debouncedSearch, filterRole, filterActive]);

  // --- Trigger fetch ---
  useEffect(() => {
      const isInitial = customers.length === 0 && loading;
      fetchCustomers(isInitial);
  }, [fetchCustomers, customers.length, loading]);

  // --- Reset page on search/filter ---
  useEffect(() => {
      if (currentPage !== 1) { setCurrentPage(1); }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterRole, filterActive]);


  // --- Form Handlers ---
  const openForm = (customer) => { // Chỉ mở form để SỬA
    if (!customer) return; // Không cho mở form thêm mới
    setFormError("");
    setSelectedCustomer(customer);
    setForm({
        full_name: customer.full_name || '',
        address: customer.address || '',
        email: customer.email || '', // Email không cho sửa
        phone_number: customer.phone_number || '',
    });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    setForm({ full_name: "", address: "", email: "", phone_number: "" });
    setFormError("");
  };
  const validateForm = () => {
    if (!form.full_name?.trim()) return "Tên không được trống.";
    return "";
  };
  const handleSave = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    setFormError("");
    if (!selectedCustomer) return; // Chỉ cho phép lưu khi đang sửa

    const updateData = {
        full_name: form.full_name.trim(),
        address: form.address.trim(),
        phone_number: form.phone_number.trim(),
    };

    // Kiểm tra xem có thay đổi gì không
    if (updateData.full_name === selectedCustomer.full_name &&
        updateData.address === selectedCustomer.address &&
        updateData.phone_number === selectedCustomer.phone_number) {
        toast("Không có thay đổi để lưu.");
        closeForm();
        return;
    }

    try {
      const { error } = await supabase
        .from("Users")
        .update(updateData)
        .eq("id", selectedCustomer.id);
       if (error) throw error;
       toast.success("Cập nhật khách hàng thành công!");
       fetchCustomers(); // Tải lại danh sách
       closeForm();
    } catch (err) {
      console.error("Lỗi lưu:", err);
      setFormError(`Không thể lưu dữ liệu: ${err.message}`);
      toast.error(`Lỗi lưu: ${err.message}`);
    }
  };

  // --- Delete Handlers ---
  const openDeleteConfirm = (c) => {
    setSelectedCustomer(c);
    setShowDeleteConfirm(true);
  };
  const closeDeleteConfirm = () => {
    setSelectedCustomer(null);
    setShowDeleteConfirm(false);
  };
  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const { error } = await supabase.from("Users").delete().eq("id", selectedCustomer.id);
      if (error) throw error;
      toast.success(`Đã xóa hồ sơ "${selectedCustomer.full_name || selectedCustomer.email}"!`);
      // Nếu trang hiện tại trống sau khi xóa, quay về trang trước (hoặc trang 1)
       if (customers.length === 1 && currentPage > 1) {
           setCurrentPage(currentPage - 1);
       } else {
           fetchCustomers(); // Tải lại trang hiện tại
       }
      closeDeleteConfirm();
    } catch (err) {
      console.error("Lỗi xóa:", err);
      toast.error(`Xóa thất bại: ${err.message}`);
    }
  };

  // --- (MỚI) Toggle Active Handler (Giống ManageAccounts) ---
   const handleToggleActive = async (user) => {
      const nextIsActive = !(user.is_active ?? true); // Mặc định là active nếu null/undefined
      const action = nextIsActive ? "MỞ KHÓA" : "KHÓA";
      if (!window.confirm(`${action} tài khoản "${user.full_name || user.email}"?`)) return;

      setIsFetchingPage(true); // Bật loading tạm thời
      const { error } = await supabase
          .from("Users")
          .update({ is_active: nextIsActive })
          .eq("id", user.id);
      setIsFetchingPage(false); // Tắt loading

      if (error) {
          toast.error("Lỗi cập nhật trạng thái.");
          console.error("Toggle active error:", error);
      } else {
          toast.success(`${action} tài khoản thành công!`);
          // Cập nhật lại list ngay lập tức (optimistic UI) hoặc fetch lại
          // fetchCustomers(); // Hoặc cập nhật state trực tiếp
           setCustomers(prev => prev.map(c => c.id === user.id ? { ...c, is_active: nextIsActive } : c));
      }
  };


  // --- Pagination Window ---
  const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

  // --- Loading ban đầu ---
   if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-24 text-center">
        <FaSpinner className="animate-spin text-sky-500" size={40} />
        <p className="text-slate-500 mt-3 font-medium"> Đang tải danh sách khách hàng... </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <UserList size={30} weight="duotone" className="text-sky-600" />
          Quản lý Khách hàng
        </h1>
         {/* Bỏ nút Thêm */}
      </div>

      {/* Thanh tìm kiếm và lọc */}
       <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-200 dark:border-slate-700">
        <div className="relative flex-grow w-full md:w-auto">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm tên, email, địa chỉ, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
          <FaFilter className="text-gray-400 hidden sm:block" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
            <option value="all">Tất cả vai trò</option> <option value="user">User</option> <option value="supplier">Supplier</option> <option value="admin">Admin</option>
          </select>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="filter-select">
            <option value="all">Tất cả trạng thái</option> <option value="active">Hoạt động</option> <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
       <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
         <div className="overflow-x-auto relative">
            {isFetchingPage && ( <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/40">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Địa chỉ</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">SĐT</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Vai trò</th>
                         <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {error && !isFetchingPage && ( <tr><td colSpan="8" className="p-8 text-center text-red-500">{error}</td></tr> )}
                    {!error && !loading && !isFetchingPage && customers.length === 0 && ( <tr><td colSpan="8" className="p-8 text-center text-gray-500 italic">{debouncedSearch || filterRole !== 'all' || filterActive !== 'all' ? "Không tìm thấy khách hàng." : "Chưa có dữ liệu."}</td></tr> )}
                    {!error && customers.map((c, index) => {
                        const roleStyle = getRoleStyle(c.role);
                        const isActive = c.is_active ?? true; // Mặc định là active nếu null/undefined
                        const isLocked = !isActive;
                        return (
                            <tr key={c.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isLocked ? "opacity-60 bg-red-50 dark:bg-red-900/10" : ""}`} >
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.full_name || <span className="italic text-gray-400">Chưa cập nhật</span>}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{c.address || <span className="italic text-gray-400">Chưa có</span>}</td> {/* Bỏ nowrap cho địa chỉ */}
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.phone_number || <span className="italic text-gray-400">Chưa có</span>}</td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${roleStyle.badge}`}>
                                        {roleStyle.icon}
                                        {roleStyle.label}
                                    </span>
                                </td>
                                 {/* Cột trạng thái */}
                                 <td className="px-6 py-4 text-sm whitespace-nowrap">
                                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isLocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                         {isLocked ? 'Đã khóa' : 'Hoạt động'}
                                     </span>
                                 </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap space-x-1">
                                    <button onClick={() => openForm(c)} disabled={isFetchingPage} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa thông tin"><FaEdit size={14} /></button>
                                    {/* Nút Khóa/Mở Khóa */}
                                    <button onClick={() => handleToggleActive(c)} disabled={isFetchingPage} className={`action-button ${isLocked ? "text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30" : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/40"}`} title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}>
                                        {isLocked ? <LockOpen size={16}/> : <Lock size={16}/>}
                                     </button>
                                    <button onClick={() => openDeleteConfirm(c)} disabled={isFetchingPage} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa hồ sơ"><FaTrash size={14} /></button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
         </div>
      </div>

      {/* --- Pagination UI --- */}
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

      {/* --- Modals --- */}
      {showForm && (
         <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4"> {/* Tăng z-index */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold">Sửa thông tin khách hàng</h3>
                 <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"> <X size={20}/> </button>
            </div>
            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded text-center">{formError}</p>
            )}
            <form onSubmit={handleSave} className="space-y-4"> {/* Tăng space */}
              <div>
                <label className="label-style">Tên khách hàng *</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-style" required />
              </div>
              <div>
                <label className="label-style">Địa chỉ</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-style" />
              </div>
               <div>
                  <label className="label-style">Email (Không thể sửa)</label>
                  <input value={form.email} className="input-style bg-gray-100 dark:bg-slate-700 cursor-not-allowed" disabled />
              </div>
              <div>
                <label className="label-style">SĐT</label>
                <input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input-style" />
              </div>
              <div className="flex justify-end gap-3 pt-3"> {/* Tăng gap */}
                <button type="button" className="modal-button-secondary" onClick={closeForm} > Hủy </button>
                <button type="submit" className="modal-button-primary" > Lưu </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && selectedCustomer && (
         <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"> {/* Tăng z-index */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
            <h4 className="text-lg font-semibold text-red-600 mb-3"> Xác nhận xóa hồ sơ </h4>
            <p className="mb-4">
              Bạn có chắc muốn xóa hồ sơ của{" "}
              <b>{selectedCustomer.full_name || selectedCustomer.email}</b>?
              <br/>
              <span className="text-sm text-orange-600 dark:text-orange-400">(Hành động này không xóa tài khoản đăng nhập.)</span>
            </p>
            <div className="flex justify-center gap-3"> {/* Tăng gap */}
              <button className="modal-button-secondary" onClick={closeDeleteConfirm} > Hủy </button>
              <button className="modal-button-danger" onClick={handleDelete} > Xóa hồ sơ </button>
            </div>
          </div>
        </div>
      )}

       {/* --- CSS --- */}
       <style jsx>{`
        .filter-select { @apply px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition appearance-none; }
        .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
        .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
        .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
        /* Modal styles */
         .input-style { @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition; }
         .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
         .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm; }
         .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm; }
         .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm; }
      `}</style>

    </div>
  );
}
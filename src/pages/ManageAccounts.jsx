// src/pages/ManageAccounts.jsx
// (Pagination + Debounced Search - Rà soát lại)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { FaSpinner, FaUsers, FaUserCog, FaBuilding, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { UserList, CaretLeft, CaretRight, CircleNotch, X } from "@phosphor-icons/react";

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
    case "admin": return { label: "Admin", icon: <FaUserCog className="text-red-500" />, badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", };
    case "supplier": return { label: "Supplier", icon: <FaBuilding className="text-blue-500" />, badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", };
    default: return { label: "User", icon: <FaUsers className="text-green-500" />, badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", };
  }
};


export default function ManageAccounts() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [filterRole, setFilterRole] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  // --- Fetch data ---
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
          if (filterActive === 'active') { query = query.or('is_active.is.true,is_active.is.null'); }
          else { query = query.eq('is_active', false); }
      }
      // Apply Search
      if (debouncedSearch.trim() !== "") {
        const searchTerm = `%${debouncedSearch.trim()}%`;
        query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm},phone_number.ilike.${searchTerm}`);
      }
      // Apply Order & Pagination
      query = query.order("created_at", { ascending: false }).range(from, to);

      const { data, error: fetchError, count } = await query;
      if (fetchError) throw fetchError;

      setCustomers(data || []);
      setTotalItems(count || 0);

      // Go back to page 1 if current page becomes empty (and not initial load)
      if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
          setCurrentPage(1);
      }
    } catch (err) {
      console.error("Lỗi fetch tài khoản:", err);
      setError("Không thể tải danh sách tài khoản.");
      toast.error("Lỗi tải danh sách tài khoản.");
      // Reset state on error
      setCustomers([]);
      setTotalItems(0);
    } finally {
      if (isInitialLoad) setLoading(false);
      setIsFetchingPage(false);
    }
  }, [currentPage, debouncedSearch, filterRole, filterActive]); // Ensure ITEMS_PER_PAGE is constant or included if dynamic

  // --- Trigger fetch ---
  useEffect(() => {
      const isInitial = customers.length === 0 && loading;
      fetchCustomers(isInitial);
  }, [fetchCustomers, customers.length, loading]); // Added missing dependencies

  // --- Reset page on search/filter ---
  useEffect(() => {
      if (currentPage !== 1) { setCurrentPage(1); }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterRole, filterActive]);

  // --- Event Handlers ---
  const handleRoleChange = async (customerId, currentRole, newRole) => {
      if (!window.confirm(`Đổi vai trò từ '${currentRole}' thành '${newRole}'?`)) return;
      const { error } = await supabase.from("Users").update({ role: newRole }).eq("id", customerId);
      if (error) { toast.error("Lỗi cập nhật vai trò."); }
      else { toast.success("Cập nhật vai trò thành công!"); fetchCustomers(false); }
  };
  const handleDeleteUser = async (userId, userName) => {
      if (!window.confirm(`XÓA HỒ SƠ "${userName}"?\n(Chỉ xóa hồ sơ.)`)) return;
      setIsFetchingPage(true);
      const { error } = await supabase.from("Users").delete().eq("id", userId);
      setIsFetchingPage(false);
      if (error) { toast.error("Lỗi xóa hồ sơ."); }
      else { toast.success(`Đã xóa hồ sơ "${userName}"!`); fetchCustomers(false); }
  };
   const handleEditUser = async (user) => {
      const newName = prompt("Tên mới:", user.full_name || "");
      const newAddress = prompt("Địa chỉ mới:", user.address || "");
      const newPhone = prompt("SĐT mới:", user.phone_number || "");
      if (newName === null && newAddress === null && newPhone === null) return;
      // Use ?? to keep existing value if prompt returns null or empty string
      const updates = {
          full_name: newName !== null ? (newName.trim() || user.full_name) : user.full_name,
          address: newAddress !== null ? (newAddress.trim() || user.address) : user.address,
          phone_number: newPhone !== null ? (newPhone.trim() || user.phone_number) : user.phone_number
      };
      // Only update if there are actual changes
      if (updates.full_name === user.full_name && updates.address === user.address && updates.phone_number === user.phone_number) return;

      setIsFetchingPage(true);
      const { error } = await supabase.from("Users").update(updates).eq("id", user.id);
      setIsFetchingPage(false);
      if (error) { toast.error("Lỗi cập nhật hồ sơ."); }
      else { toast.success("Cập nhật hồ sơ thành công!"); fetchCustomers(false); }
  };
  const handleToggleActive = async (user) => {
      const next = user.is_active === false; // Handles null/true as active
      const action = next ? "MỞ KHÓA" : "KHÓA";
      if (!window.confirm(`${action} tài khoản "${user.full_name || user.email}"?`)) return;
      setIsFetchingPage(true); // Show loading
      const { error } = await supabase.from("Users").update({ is_active: next }).eq("id", user.id);
      setIsFetchingPage(false); // Hide loading
      if (error) { toast.error("Lỗi cập nhật trạng thái."); }
      else { toast.success(`${action} tài khoản thành công!`); fetchCustomers(false); }
  };

  // --- Pagination Window ---
  const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

  // --- Loading ban đầu ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-24 text-center">
        <FaSpinner className="animate-spin text-sky-500" size={40} />
        <p className="text-slate-500 mt-3 font-medium"> Đang tải danh sách tài khoản... </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <UserList size={30} weight="duotone" className="text-sky-600" />
          Quản lý Tài khoản
        </h1>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-gray-200 dark:border-slate-700">
        <div className="relative flex-grow w-full md:w-auto">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm theo tên, email, địa chỉ, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition" />
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

      {/* Bảng khách hàng */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
         <div className="overflow-x-auto relative">
            {isFetchingPage && ( <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10"> <FaSpinner className="animate-spin text-sky-500 text-3xl" /> </div> )}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/40">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Địa chỉ</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">SĐT</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Vai trò</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {error && !isFetchingPage && ( <tr><td colSpan="7" className="p-8 text-center text-red-500">{error}</td></tr> )}
                    {!error && loading && customers.length === 0 && ( <tr><td colSpan="7" className="p-8 text-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr> )}
                    {!error && !loading && !isFetchingPage && customers.length === 0 && ( <tr><td colSpan="7" className="p-8 text-center text-gray-500 italic">{debouncedSearch || filterRole !== 'all' || filterActive !== 'all' ? "Không tìm thấy tài khoản." : "Chưa có dữ liệu."}</td></tr> )}
                    {!error && customers.map((c, index) => {
                        const role = getRoleStyle(c.role);
                        const isLocked = c.is_active === false;
                        return (
                            <tr key={c.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isLocked ? "opacity-60 bg-red-50 dark:bg-red-900/10" : ""}`} >
                                <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.full_name || <span className="italic text-gray-400">Chưa cập nhật</span>}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.address || <span className="italic text-gray-400">Chưa có</span>}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.phone_number || <span className="italic text-gray-400">Chưa có</span>}</td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {role.icon}
                                        <select value={c.role || 'user'} onChange={(e) => handleRoleChange(c.id, c.role, e.target.value)} disabled={isLocked} className={`role-select ${role.badge} ${isLocked ? "cursor-not-allowed" : ""}`} >
                                            <option value="user">User</option> <option value="supplier">Supplier</option> <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    {isLocked && ( <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-semibold">Đã khóa</div> )}
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap space-x-1">
                                    <button onClick={() => handleEditUser(c)} disabled={isFetchingPage} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa">✏️</button>
                                    <button onClick={() => handleToggleActive(c)} disabled={isFetchingPage} className={`action-button ${isLocked ? "text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30" : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/40"}`} title={isLocked ? "Mở khóa" : "Khóa"}>{isLocked ? "🔓" : "🔒"}</button>
                                    <button onClick={() => handleDeleteUser(c.id, c.full_name || c.email)} disabled={isFetchingPage} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa"><FaTrash size={14} /></button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
         </div>
      </div>

       {/* Pagination UI */}
      {!loading && totalItems > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
              <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> tài khoản </div>
              <div className="flex items-center gap-1 mt-3 sm:mt-0">
                  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
                  {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
                      <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} disabled={isFetchingPage} className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}>{pageNumber}</button>
                  ))}
                  <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
              </div>
          </div>
      )}

      {/* CSS */}
      <style jsx>{`
        .filter-select { @apply px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition appearance-none; }
        .role-select { @apply rounded-lg px-2 py-1 text-sm border-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800 transition appearance-none cursor-pointer disabled:cursor-not-allowed; }
        .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; } /* Added disabled styles */
        .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
        .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
        .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
      `}</style>

    </div>
  );
}
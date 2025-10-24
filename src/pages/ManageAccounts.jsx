// src/pages/ManageAccounts.jsx
// (UPGRADED: Giao diện đồng bộ, Modal Sửa, Toast Confirm)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { FaSpinner, FaUsers, FaUserCog, FaBuilding, FaSearch, FaFilter } from "react-icons/fa";
// <<< Sửa/Thêm icons >>>
import { UserList, CaretLeft, CaretRight, CircleNotch, X, Pencil, Trash, Lock, LockOpen, WarningCircle } from "@phosphor-icons/react";

const supabase = getSupabase();

// --- Hook Debounce (Giữ nguyên) ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window (Giữ nguyên) ---
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
    case "supplier": return { label: "Supplier", icon: <FaBuilding className="text-blue-500" size={14}/>, badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", };
    default: return { label: "User", icon: <FaUsers className="text-green-500" size={14}/>, badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", };
  }
};

// --- (MỚI) Modal Sửa Thông Tin User ---
const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        address: user?.address || '',
        phone_number: user?.phone_number || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.full_name.trim()) {
            setError('Tên không được để trống.');
            return;
        }
        // Kiểm tra xem có thay đổi không
        if (formData.full_name.trim() === (user.full_name || '') &&
            formData.address.trim() === (user.address || '') &&
            formData.phone_number.trim() === (user.phone_number || '')) {
            toast("Không có thay đổi để lưu.");
            onClose();
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave({ // Gọi hàm onSave được truyền từ component cha
                full_name: formData.full_name.trim(),
                address: formData.address.trim(),
                phone_number: formData.phone_number.trim()
            });
            // onClose(); // onClose sẽ được gọi trong onSave nếu thành công
        } catch (err) {
            setError(err.message || "Lỗi không xác định khi lưu.");
            // Giữ modal mở khi có lỗi
        } finally {
             setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Sửa thông tin người dùng</h3>
                    <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"> <X size={20}/> </button>
                </div>
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 p-2 rounded text-center">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="label-style">Tên *</label>
                        <input name="full_name" value={formData.full_name} onChange={handleChange} required className="input-style" />
                     </div>
                     <div>
                        <label className="label-style">Địa chỉ</label>
                        <input name="address" value={formData.address} onChange={handleChange} className="input-style" />
                     </div>
                     <div>
                        <label className="label-style">Số điện thoại</label>
                        <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="input-style" />
                     </div>
                     <div className="flex justify-end gap-3 pt-3">
                        <button type="button" className="modal-button-secondary" onClick={onClose} disabled={isSubmitting}> Hủy </button>
                        <button type="submit" className="modal-button-primary" disabled={isSubmitting}>
                           {isSubmitting ? <CircleNotch size={18} className="animate-spin" /> : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Component chính ---
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

  // State cho modal sửa
  const [editingUser, setEditingUser] = useState(null);

  // Fetch data (Giữ nguyên logic fetch đã sửa)
  const fetchCustomers = useCallback(async (isInitialLoad = false) => {
    // ... (code fetchCustomers giữ nguyên)
      if (!isInitialLoad) setIsFetchingPage(true);
      setError(null);
      try {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        let query = supabase.from("Users").select("*", { count: 'exact' });

        if (filterRole !== "all") { query = query.eq('role', filterRole); }
        if (filterActive !== "all") {
            if (filterActive === 'active') { query = query.or('is_active.is.true,is_active.is.null'); }
            else { query = query.eq('is_active', false); }
        }
        if (debouncedSearch.trim() !== "") {
          const searchTerm = `%${debouncedSearch.trim()}%`;
          query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},address.ilike.${searchTerm},phone_number.ilike.${searchTerm}`);
        }
        query = query.order("full_name", { ascending: true }).range(from, to);

        const { data, error: fetchError, count } = await query;
        if (fetchError) throw fetchError;

        setCustomers(data || []);
        setTotalItems(count || 0);

        if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
            setCurrentPage(1);
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

  // UseEffects (Giữ nguyên)
  useEffect(() => { /* Trigger fetch */ }, [fetchCustomers, customers.length, loading]);
  useEffect(() => { /* Reset page */ }, [debouncedSearch, filterRole, filterActive]);

  // --- (SỬA) Event Handlers ---

  // Đổi vai trò với Toast Confirm
  const handleRoleChange = (customerId, currentRole, newRole) => {
    if (currentRole === newRole) return;
    toast((t) => (
      <span>
        Đổi vai trò từ <b>{currentRole || 'user'}</b> thành <b>{newRole}</b>?
        <button
          className="ml-3 px-3 py-1 bg-green-500 text-white rounded text-sm font-semibold hover:bg-green-600"
          onClick={async () => {
            toast.dismiss(t.id);
            setIsFetchingPage(true);
            const { error } = await supabase.from("Users").update({ role: newRole }).eq("id", customerId);
            setIsFetchingPage(false);
            if (error) {
                toast.error("Lỗi cập nhật vai trò.");
                console.error("Role change error:", error)
            } else {
                toast.success("Đổi vai trò thành công!");
                // Cập nhật UI ngay lập tức hoặc fetch lại
                setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, role: newRole } : c));
                // fetchCustomers(false);
            }
          }}
        > Xác nhận </button>
        <button className="ml-2 px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400" onClick={() => toast.dismiss(t.id)}> Hủy </button>
      </span>
    ), { duration: 6000 }); // Tăng thời gian hiển thị toast
  };

  // Lưu thông tin từ Modal Sửa
  const handleSaveUser = async (updatedData) => {
      if (!editingUser) throw new Error("Không tìm thấy người dùng để lưu."); // Lỗi logic nếu xảy ra

      // setIsFetchingPage(true); // Modal đã có loading riêng
      const { error } = await supabase
          .from("Users")
          .update(updatedData)
          .eq("id", editingUser.id);

      if (error) {
          toast.error("Lỗi cập nhật hồ sơ.");
          console.error("Update profile error:", error);
          throw error; // Ném lỗi để modal hiển thị
      } else {
          toast.success("Cập nhật hồ sơ thành công!");
          setEditingUser(null); // Đóng modal
          // Cập nhật UI ngay lập tức hoặc fetch lại
          setCustomers(prev => prev.map(c => c.id === editingUser.id ? { ...c, ...updatedData } : c));
          // fetchCustomers(false);
      }
      //setIsFetchingPage(false); // Modal tự xử lý
  };


  // Khóa/Mở khóa với Toast Confirm
  const handleToggleActive = (user) => {
      const nextIsActive = !(user.is_active ?? true);
      const action = nextIsActive ? "MỞ KHÓA" : "KHÓA";

      toast((t) => (
        <span>
            {action} tài khoản <b>{user.full_name || user.email}</b>?
           <button
            className={`ml-3 px-3 py-1 ${nextIsActive ? 'bg-green-500' : 'bg-orange-500'} text-white rounded text-sm font-semibold hover:bg-opacity-80`}
            onClick={async () => {
                toast.dismiss(t.id);
                setIsFetchingPage(true);
                const { error } = await supabase.from("Users").update({ is_active: nextIsActive }).eq("id", user.id);
                setIsFetchingPage(false);
                if (error) {
                    toast.error("Lỗi cập nhật trạng thái.");
                    console.error("Toggle active error:", error);
                } else {
                    toast.success(`${action} tài khoản thành công!`);
                    setCustomers(prev => prev.map(c => c.id === user.id ? { ...c, is_active: nextIsActive } : c));
                }
            }}
          > Xác nhận </button>
          <button className="ml-2 px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400" onClick={() => toast.dismiss(t.id)}> Hủy </button>
        </span>
      ), { icon: <WarningCircle size={20} className={nextIsActive ? 'text-green-500' : 'text-orange-500'}/>, duration: 6000 });
  };


  // Xóa User với Toast Confirm
  const handleDeleteUser = (userId, userName) => {
     toast((t) => (
        <div className="flex flex-col items-center">
            <span className="text-center">
                Xóa hồ sơ của <b>{userName}</b>?<br/>
                <span className="text-xs text-orange-600">(Chỉ xóa hồ sơ, không xóa tài khoản đăng nhập)</span>
            </span>
           <div className="mt-3">
             <button
                className="px-3 py-1 bg-red-500 text-white rounded text-sm font-semibold hover:bg-red-600"
                onClick={async () => {
                    toast.dismiss(t.id);
                    setIsFetchingPage(true);
                    const { error } = await supabase.from("Users").delete().eq("id", userId);
                    setIsFetchingPage(false);
                    if (error) {
                        toast.error("Lỗi xóa hồ sơ.");
                        console.error("Delete user error:", error);
                    } else {
                        toast.success(`Đã xóa hồ sơ "${userName}"!`);
                         if (customers.length === 1 && currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                         } else {
                            fetchCustomers(false); // Fetch lại
                         }
                    }
                }}
              > Xác nhận Xóa </button>
              <button className="ml-2 px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400" onClick={() => toast.dismiss(t.id)}> Hủy </button>
           </div>
        </div>
      ), { icon: <WarningCircle size={24} className="text-red-500"/>, duration: 8000 });
  };


  // --- Pagination Window ---
  const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

  // --- Loading ban đầu ---
   if (loading) {
     return (
       <div className="flex flex-col justify-center items-center p-24 text-center">
         <CircleNotch size={40} className="animate-spin text-sky-500" />
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
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /> {/* Thêm pointer-events-none */}
          <input type="text" placeholder="Tìm tên, email, địa chỉ, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" /> {/* Dùng class CSS */}
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
            {isFetchingPage && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/40">
                    <tr>
                        <th className="th-style px-4">STT</th>
                        <th className="th-style">Tên</th>
                        <th className="th-style">Email</th>
                        <th className="th-style">Địa chỉ</th>
                        <th className="th-style">SĐT</th>
                        <th className="th-style">Vai trò</th>
                        <th className="th-style">Trạng thái</th> {/* Thêm cột trạng thái */}
                        <th className="th-style text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {error && !isFetchingPage && ( <tr><td colSpan="8" className="td-center text-red-500">{error}</td></tr> )}
                    {!error && !isFetchingPage && customers.length === 0 && ( <tr><td colSpan="8" className="td-center text-gray-500 italic">{debouncedSearch || filterRole !== 'all' || filterActive !== 'all' ? "Không tìm thấy tài khoản." : "Chưa có dữ liệu."}</td></tr> )}
                    {!error && customers.map((c, index) => {
                        const roleStyle = getRoleStyle(c.role);
                        const isActive = c.is_active ?? true; // Default to active if null/undefined
                        const isLocked = !isActive;
                        return (
                            <tr key={c.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isLocked ? "opacity-60 bg-red-50 dark:bg-red-900/10" : ""}`} >
                                <td className="td-style px-4 text-gray-500 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td className="td-style font-medium text-gray-900 dark:text-white">{c.full_name || <span className="italic text-gray-400">Chưa cập nhật</span>}</td>
                                <td className="td-style text-gray-600 dark:text-gray-300">{c.email}</td>
                                <td className="td-style text-gray-600 dark:text-gray-300">{c.address || <span className="italic text-gray-400">Chưa có</span>}</td>
                                <td className="td-style text-gray-600 dark:text-gray-300">{c.phone_number || <span className="italic text-gray-400">Chưa có</span>}</td>
                                <td className="td-style">
                                    <select
                                        value={c.role || 'user'}
                                        onChange={(e) => handleRoleChange(c.id, c.role, e.target.value)}
                                        disabled={isLocked || isFetchingPage}
                                        className={`role-select ${roleStyle.badge} ${isLocked ? "cursor-not-allowed" : ""}`}
                                    >
                                        <option value="user">User</option>
                                        <option value="supplier">Supplier</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                 {/* Cột trạng thái */}
                                 <td className="td-style">
                                     <span className={`status-badge ${isLocked ? 'badge-red' : 'badge-green'}`}>
                                         {isLocked ? 'Đã khóa' : 'Hoạt động'}
                                     </span>
                                     {isLocked && <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-semibold">Tài khoản bị khóa</div>}
                                 </td>
                                <td className="td-style text-center space-x-1">
                                    <button onClick={() => setEditingUser(c)} disabled={isFetchingPage} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa thông tin"><Pencil size={16} /></button>
                                    <button onClick={() => handleToggleActive(c)} disabled={isFetchingPage} className={`action-button ${isLocked ? "text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30" : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/40"}`} title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}>
                                        {isLocked ? <LockOpen size={16}/> : <Lock size={16}/>}
                                     </button>
                                    <button onClick={() => handleDeleteUser(c.id, c.full_name || c.email)} disabled={isFetchingPage} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa hồ sơ"><Trash size={16} /></button>
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

      {/* Modal Sửa */}
      {editingUser && (
          <EditUserModal
              user={editingUser}
              onClose={() => setEditingUser(null)}
              onSave={handleSaveUser}
          />
      )}

      {/* CSS */}
      <style jsx>{`
        /* Thêm các class CSS mới và giữ lại các class cũ */
        .search-input { @apply w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
        .filter-select { @apply px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition appearance-none disabled:opacity-50; }
        .role-select { @apply rounded-lg px-2 py-1 text-sm border-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800 transition appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed; }
        .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
        .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
        .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
        .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
        .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
        .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; } /* Thêm whitespace-nowrap */
        .td-style { @apply px-6 py-4 text-sm whitespace-nowrap; } /* Thêm whitespace-nowrap */
        .td-center { @apply px-6 py-10 text-center; } /* Tăng padding */
        .badge-base { @apply px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap; }
        .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
        .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
        /* Modal Styles */
        .input-style { @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm; }
        .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
        .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50; }
        .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 flex items-center justify-center; } /* Thêm flex center */
        .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50; }
        .status-badge { @apply px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap; }

      `}</style>

    </div>
  );
}
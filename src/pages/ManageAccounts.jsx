import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    UsersThree, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass,
    PencilLine, ArrowsClockwise, WarningCircle, Trash, UserPlus, UserCircleMinus, UserCircleCheck
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const supabase = getSupabase();

// --- Hook Debounce (Giữ nguyên) ---
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

// --- Helper Pagination Window (Giữ nguyên) ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
    if (totalPages <= 1) return [];
    if (totalPages <= 5 + width) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let pages = [];
    pages.push(1);

    let start = Math.max(2, currentPage - width);
    let end = Math.min(totalPages - 1, currentPage + width);

    if (currentPage - width > 2) {
        pages.push('...');
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (currentPage + width < totalPages - 1) {
        pages.push('...');
    }

    pages.push(totalPages);
    return pages;
};

// --- (NEW) Modal Thêm/Sửa Tài Khoản ---
const AccountModal = ({ account, onClose, onSuccess }) => {
    const isEdit = !!account; // Kiểm tra xem đây là modal Sửa hay Thêm
    
    // Định nghĩa các vai trò
    const ROLES = [
        { id: 'admin', name: 'Admin' },
        { id: 'manager', name: 'Manager' },
        { id: 'staff', name: 'Staff' },
        { id: 'user', name: 'User' },
    ];

    const [formData, setFormData] = useState({
        email: isEdit ? account.email : '',
        password: '',
        username: isEdit ? account.username : '',
        full_name: isEdit ? account.full_name : '',
        role: isEdit ? account.role : 'staff',
        is_active: isEdit ? account.is_active : true,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                // --- Logic Sửa Tài Khoản ---
                // Chỉ cập nhật public.profiles
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        username: formData.username,
                        full_name: formData.full_name,
                        role: formData.role,
                        is_active: formData.is_active,
                    })
                    .eq('id', account.id);

                if (updateError) throw updateError;
                toast.success('Cập nhật tài khoản thành công!');

            } else {
                // --- Logic Thêm Tài Khoản ---
                // 1. Tạo user trong auth.users
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });

                if (authError) throw authError;
                if (!authData.user) throw new Error('Không thể tạo user trong Auth.');

                // 2. Tạo profile trong public.profiles
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id, // Liên kết với auth.users
                        email: formData.email,
                        username: formData.username,
                        full_name: formData.full_name,
                        role: formData.role,
                        is_active: formData.is_active,
                        // created_at sẽ tự động được thêm bởi Supabase
                    });
                
                if (profileError) {
                    // Nếu tạo profile lỗi, cố gắng xóa user auth vừa tạo
                    // Cần 1 Edge Function để làm việc này an toàn
                    console.error("Lỗi tạo profile, user auth đã được tạo:", authData.user.id);
                    throw new Error(`Tạo profile thất bại: ${profileError.message}. (User auth đã được tạo, cần xử lý riêng)`);
                }

                toast.success('Thêm tài khoản mới thành công!');
            }
            
            onSuccess(); // Tải lại danh sách
            onClose(); // Đóng modal
        
        } catch (error) {
            console.error("Lỗi Thêm/Sửa tài khoản:", error);
            toast.error(error.message || 'Đã xảy ra lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {isEdit ? 'Chỉnh sửa Tài khoản' : 'Thêm Tài khoản mới'}
                    </h3>
                    <button onClick={onClose} disabled={loading} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"> <X size={20}/> </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-y-auto p-6 space-y-4">
                        
                        {/* Email (Read-only khi Edit) */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <label className="label-style">Email *</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                disabled={isEdit} // Không cho sửa email
                                className="input-style disabled:bg-slate-100 dark:disabled:bg-slate-700" 
                                placeholder="example@tourmanager.com"
                            />
                        </motion.div>

                        {/* Password (Chỉ khi Thêm mới) */}
                        {!isEdit && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <label className="label-style">Mật khẩu *</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required 
                                        minLength="6"
                                        className="input-style"
                                        placeholder="Tối thiểu 6 ký tự"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <PencilLine size={18} /> : <PencilLine size={18} />} {/* Thay icon nếu muốn */}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <label className="label-style">Tên đăng nhập *</label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={formData.username} 
                                    onChange={handleChange} 
                                    required 
                                    className="input-style"
                                    placeholder="admin01"
                                />
                            </motion.div>

                            {/* Họ và Tên */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <label className="label-style">Họ và Tên *</label>
                                <input 
                                    type="text" 
                                    name="full_name" 
                                    value={formData.full_name} 
                                    onChange={handleChange} 
                                    required 
                                    className="input-style"
                                    placeholder="Nguyễn Văn An"
                                />
                            </motion.div>
                        </div>

                        {/* Vai trò */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <label className="label-style">Vai trò *</label>
                            <select 
                                name="role" 
                                value={formData.role} 
                                onChange={handleChange} 
                                required 
                                className="input-style"
                            >
                                {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </motion.div>

                        {/* Trạng thái (Chỉ khi Sửa) */}
                        {isEdit && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                <label className="label-style">Trạng thái</label>
                                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <input 
                                        type="checkbox" 
                                        name="is_active"
                                        id="is_active_toggle"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                                    />
                                    <label htmlFor="is_active_toggle" className="text-sm dark:text-white">
                                        {formData.is_active ? 'Đang Hoạt động' : 'Đã Ngừng'}
                                    </label>
                                </div>
                            </motion.div>
                        )}
                        
                    </div>
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={loading} className="modal-button-primary flex items-center justify-center gap-1.5 min-w-[120px]">
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : (isEdit ? <PencilLine size={18} /> : <UserPlus size={18} />) }
                            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// --- Component chính: Quản lý Tài Khoản ---
export default function AdminManageAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [modalAccount, setModalAccount] = useState(null); // null, 'new', hoặc {account_data}
    
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // --- Fetch data ---
    const fetchAccounts = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true);
        setError(null);
        
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            // Query từ bảng 'profiles'
            const selectQuery = `
                id, username, full_name, email, role, is_active, created_at
            `;
            
            let query = supabase.from("profiles")
                                .select(selectQuery, { count: 'exact' });

            // Logic tìm kiếm
            if (debouncedSearch.trim() !== "") {
                const searchStr = `%${debouncedSearch.trim()}%`;
                query = query.or(`full_name.ilike.${searchStr},email.ilike.${searchStr},username.ilike.${searchStr}`);
            }

            // Sắp xếp và Phân trang
            query = query.order("created_at", { ascending: false })
                         .range(from, to);

            const { data, count, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            
            setAccounts(data || []);
            setTotalItems(count || 0);

            // Xử lý chuyển trang nếu trang hiện tại không còn data
            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
                setCurrentPage(1); // Quay về trang 1
            }

        } catch (err) {
            console.error("Lỗi fetch accounts:", err);
            setError(err);
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch]);

    // --- UseEffects ---
    useEffect(() => {
        fetchAccounts(true);
    }, [fetchAccounts]); // Chỉ chạy 1 lần khi mount (do fetchAccounts đã có dependencies)

    // Reset về trang 1 khi tìm kiếm
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearch]); // Bỏ currentPage khỏi dependency

    
    // --- (NEW) Event Handlers ---

    // Xử lý "Xóa" (thực chất là Ngừng tài khoản)
    const handleSuspend = (account) => {
        toast((t) => (
            <div className="flex flex-col items-center p-1">
                 <span className="text-center">
                    Ngừng hoạt động tài khoản <b>{account.username}</b>?<br/>
                    <span className="text-xs text-orange-600">Tài khoản sẽ không thể đăng nhập.</span>
                 </span>
                <div className="mt-3 flex gap-2">
                 <button
                    className="modal-button-danger text-sm"
                    onClick={async () => {
                        toast.dismiss(t.id);
                        setIsFetchingPage(true);
                        
                        const { error: updateError } = await supabase
                            .from("profiles")
                            .update({ is_active: false })
                            .eq("id", account.id);
                            
                        setIsFetchingPage(false);
                        if (updateError) {
                            toast.error("Lỗi: " + updateError.message);
                        } else {
                            toast.success("Đã ngừng tài khoản.");
                            fetchAccounts(false); // Tải lại
                        }
                    }}
                  > Xác nhận Ngừng </button>
                  <button className="modal-button-secondary text-sm" onClick={() => toast.dismiss(t.id)}> Hủy </button>
                </div>
            </div>
          ), { icon: <WarningCircle size={24} className="text-red-500"/>, duration: 8000 });
    };

    // Định dạng ngày
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return "Invalid Date";
        }
    };
    
    // Hiển thị tên Vai trò
    const getRoleName = (roleId) => {
        const rolesMap = {
            admin: 'Admin',
            manager: 'Manager',
            staff: 'Staff',
            user: 'User'
        };
        return rolesMap[roleId] || 'Không xác định';
    };

    // --- Pagination Window (Giữ nguyên) ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     // --- Loading ban đầu ---
     if (loading && accounts.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen dark:bg-slate-900">
                <CircleNotch size={40} className="animate-spin text-sky-600" />
            </div>
        );
    }

    // --- JSX (Nâng cấp UI theo hình ảnh) ---
    return (
        <motion.div
            className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header + Nút Thêm */}
             <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <UsersThree weight="duotone" className="text-sky-600" size={30} />
                        Quản lý Tài khoản
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Quản lý tài khoản người dùng hệ thống
                    </p>
                </div>
                <button 
                    onClick={() => setModalAccount('new')} // 'new' để phân biệt với edit
                    className="button-primary flex items-center gap-1.5"
                >
                    <UserPlus size={18} weight="bold" />
                    Thêm Tài Khoản
                </button>
            </div>

            {/* Box Bảng + Search */}
            <motion.div
                className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Header Bảng (Tiêu đề + Search) */}
                <div className="p-4 flex flex-wrap justify-between items-center gap-3 border-b dark:border-slate-700">
                     <h2 className="text-lg font-semibold dark:text-white">
                        Danh Sách Tài Khoản
                     </h2>
                     <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                placeholder="Tìm kiếm tài khoản..." 
                                className="search-input"
                            />
                        </div>
                        <button onClick={() => fetchAccounts(false)} disabled={isFetchingPage} className={`p-2 button-secondary ${isFetchingPage ? 'opacity-50 cursor-wait' : ''}`} title="Làm mới">
                            <ArrowsClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Bảng Dữ Liệu */}
                <div className="overflow-x-auto relative">
                    {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th className="th-style w-[15%]">Tên đăng nhập</th>
                                <th className="th-style w-[20%]">Họ và Tên</th>
                                <th className="th-style w-[25%]">Email</th>
                                <th className="th-style w-[10%]">Vai trò</th>
                                <th className="th-style w-[10%]">Trạng thái</th>
                                <th className="th-style w-[10%]">Ngày tạo</th>
                                <th className="th-style text-center w-[10%]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                             {/* Lỗi */}
                             {error && !isFetchingPage && ( <tr><td colSpan="7" className="td-center text-red-500">{`Lỗi: ${error.message}`}</td></tr> )}
                             
                             {/* Không có dữ liệu */}
                             {!error && !loading && !isFetchingPage && accounts.length === 0 && ( 
                                <tr><td colSpan="7" className="td-center text-gray-500">
                                    {debouncedSearch ? `Không tìm thấy tài khoản cho "${debouncedSearch}"` : "Chưa có tài khoản nào."}
                                </td></tr> 
                             )}
                             
                             {/* Render Dữ Liệu */}
                             {!error && accounts.map((account) => (
                                <motion.tr
                                    key={account.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <td className="td-style font-medium dark:text-white">{account.username}</td>
                                    <td className="td-style text-gray-700 dark:text-gray-200">{account.full_name}</td>
                                    <td className="td-style text-gray-600 dark:text-gray-300">{account.email}</td>
                                    <td className="td-style">
                                        {/* Badge Vai trò */}
                                        {account.role === 'admin' && <span className="badge-role-admin">{getRoleName(account.role)}</span>}
                                        {account.role === 'manager' && <span className="badge-role-manager">{getRoleName(account.role)}</span>}
                                        {account.role === 'staff' && <span className="badge-role-staff">{getRoleName(account.role)}</span>}
                                        {account.role === 'user' && <span className="badge-role-user">{getRoleName(account.role)}</span>}
                                    </td>
                                    <td className="td-style">
                                        {/* Badge Trạng thái */}
                                        {account.is_active ? <span className="badge-green">Hoạt động</span> : <span className="badge-gray">Ngừng</span>}
                                    </td>
                                    <td className="td-style text-gray-500">{formatDate(account.created_at)}</td>
                                    <td className="td-style text-center space-x-2">
                                        {/* Nút Sửa */}
                                        <button 
                                            onClick={() => setModalAccount(account)} 
                                            disabled={isFetchingPage} 
                                            className="action-button text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/30" 
                                            title="Sửa tài khoản"
                                        > <PencilLine size={18}/> </button>
                                        
                                        {/* Nút Ngừng/Xóa */}
                                        {account.is_active ? (
                                            <button 
                                                onClick={() => handleSuspend(account)} 
                                                disabled={isFetchingPage} 
                                                className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" 
                                                title="Ngừng tài khoản"
                                            > <UserCircleMinus size={18}/> </button>
                                        ) : (
                                            // Icon khác cho tài khoản đã ngừng (VD: Kích hoạt lại)
                                            <button 
                                                onClick={() => setModalAccount(account)} // Mở modal sửa để kích hoạt
                                                disabled={isFetchingPage} 
                                                className="action-button text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" 
                                                title="Kích hoạt lại (trong Sửa)"
                                            > <UserCircleCheck size={18}/> </button>
                                        )}
                                    </td>
                                </motion.tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

             {/* Pagination UI */}
             {!loading && totalItems > ITEMS_PER_PAGE && (
                <motion.div
                    className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div>
                        Hiển thị <b>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</b> - <b>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</b> trên <b>{totalItems}</b> tài khoản
                    </div>
                    <nav className="flex items-center gap-1 mt-3 sm:mt-0">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow"> <CaretLeft size={16} weight="bold" /> </button>
                        {paginationWindow.map((page, index) =>
                            typeof page === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={currentPage === page || isFetchingPage}
                                    className={`pagination-number ${currentPage === page ? 'pagination-active' : ''}`}
                                > {page} </button>
                            ) : (
                                <span key={index} className="pagination-dots"> ... </span>
                            )
                        )}
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow"> <CaretRight size={16} weight="bold" /> </button>
                    </nav>
                </motion.div>
             )}

            {/* Modal Edit/Add */}
            <AnimatePresence>
                {modalAccount && (
                    <AccountModal
                        key={modalAccount.id || 'new'} // Key để re-render modal
                        account={modalAccount === 'new' ? null : modalAccount}
                        onClose={() => setModalAccount(null)}
                        onSuccess={() => fetchAccounts(false)} // Tải lại danh sách sau khi thành công
                    />
                )}
            </AnimatePresence>

            {/* CSS (Tái sử dụng và chỉnh sửa từ file gốc) */}
            <style jsx>{`
                /* Các class dùng chung */
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .th-style { @apply px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; } /* Tăng padding */
                .td-style { @apply px-5 py-3 text-sm; } /* Tăng padding, bỏ whitespace-nowrap */
                .td-center { @apply px-6 py-10 text-center; }
                
                /* Badges chung */
                .badge-base { @apply px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center gap-1 whitespace-nowrap; } /* Đổi sang rounded-md */
                
                /* Badges Trạng thái */
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-gray { @apply badge-base bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300; }

                /* Badges Vai trò (Theo hình ảnh) */
                .badge-role-admin { @apply badge-base bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300; }
                .badge-role-manager { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-role-staff { @apply badge-base bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300; }
                .badge-role-user { @apply badge-base bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300; }

                /* Buttons */
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-primary { @apply bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; } /* <<< Đổi màu nút Thêm mới */

                /* Pagination */
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                
                /* Modal Styles */
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm disabled:opacity-70; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50 transition-colors; }
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
            `}</style>
        </motion.div>
    );
}

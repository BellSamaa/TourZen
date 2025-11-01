// ManageAccounts.jsx
/* *** (SỬA LỖI v20) Sửa lỗi Logic + Crash ***
  1. (Logic) Xóa TẤT CẢ các tham chiếu đến 'username' (vì nó không tồn tại
     trong CSDL 'Users' của bạn). Đã xóa khỏi:
     - State
     - Hàm handleSubmit (Thêm mới & Sửa)
     - Hàm fetchAccounts (selectQuery & searchQuery)
  2. (Logic) ĐỊNH NGHĨA LẠI 'pageVariants' và 'itemVariant' để fix lỗi crash
     "pageVariants is not defined".
  3. (UI) Xóa dòng "ID: {account.username}" (ví dụ: "ID: default_user")
     khỏi cột "Họ và Tên" trong bảng (đáp ứng v17).
*/
/* *** (Nâng cấp v18 - Giữ lại) ***
  1. (UI/Logic) Giữ lại Nút Xóa, Modal Xóa, và hàm handleDeleteAccount.
*/

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    UsersThree, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass,
    PencilLine, ArrowsClockwise, WarningCircle, UserPlus, UserCircleMinus, UserCircleCheck,
    Eye, EyeSlash, CheckCircle, XCircle, User, At, ShieldCheck, CalendarBlank, Hourglass,
    Archive, Key, IdentificationBadge, Trash 
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
    let pages = [1];
    let start = Math.max(2, currentPage - width);
    let end = Math.min(totalPages - 1, currentPage + width);
    if (currentPage - width > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage + width < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
};

// --- Variants cho Modal (Giữ nguyên) ---
const modalFormVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.07
      }
    }
};
const fieldVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

// --- (SỬA v13 & v14) Modal Thêm/Sửa Tài Khoản (Nâng cấp UI & Lọc Role) ---
const AccountModal = ({ account, onClose, onSuccess }) => {
    const isEdit = !!account;
    
    // (SỬA v14) Bỏ Manager và Staff
    const ROLES = [
        { id: 'admin', name: 'Admin', color: 'bg-purple-500' },
        { id: 'supplier', name: 'Supplier', color: 'bg-orange-500' },
        { id: 'user', name: 'User', color: 'bg-slate-500' },
    ];

    const [formData, setFormData] = useState({
        email: isEdit ? account.email : '',
        password: '', 
        confirm_password: '', 
        // username: isEdit ? (account.username || '') : '', // <<< SỬA v19: Xóa username
        full_name: isEdit ? account.full_name : '',
        role: isEdit ? account.role : 'admin', 
        is_active: isEdit ? account.is_active : true,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // --- (SỬA v12) Logic handleSubmit (Giữ nguyên) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Kiểm tra mật khẩu (cho cả Thêm mới và Reset)
            if (formData.password) {
                 if (formData.password.length < 6) {
                    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
                 }
                 if (formData.password !== formData.confirm_password) {
                    throw new Error("Mật khẩu xác nhận không khớp.");
                 }
            } else if (!isEdit) {
                 // Bắt buộc mật khẩu khi Thêm mới
                 throw new Error("Mật khẩu là bắt buộc khi thêm tài khoản mới.");
            }

            if (isEdit) {
                // --- (SỬA v12) CHỈNH SỬA: Gọi Edge Function ---
                const { data, error: functionError } = await supabase.functions.invoke('admin-update-user', {
                    body: {
                        user_id: account.id,
                        // username: formData.username, // <<< SỬA v19: Xóa username
                        full_name: formData.full_name,
                        role: formData.role,
                        is_active: formData.is_active,
                        password: formData.password || null 
                    }
                });
                
                if (functionError) throw functionError;
                if (data && data.error) throw new Error(data.error);

                toast.success('Cập nhật tài khoản thành công!');

            } else {
                // --- THÊM MỚI (Giữ nguyên logic cũ) ---
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    // (SỬA v19) Thêm full_name vào meta_data khi đăng ký
                    // (Mặc dù admin-create-user có thể không dùng trigger,
                    // nhưng đây là best practice)
                    options: {
                        data: {
                            full_name: formData.full_name
                            // (SỬA v19) Xóa username
                        }
                    }
                });
                if (authError) throw authError;
                if (!authData.user) throw new Error('Không thể tạo user trong Auth.');

                const { error: profileError } = await supabase
                    .from('Users')
                    .insert({
                        id: authData.user.id,
                        email: formData.email,
                        // username: formData.username, // <<< SỬA v19: Xóa username
                        full_name: formData.full_name,
                        role: formData.role,
                        is_active: formData.is_active,
                        created_at: new Date().toISOString(),
                    });
                if (profileError) throw profileError;
                toast.success('Thêm tài khoản mới thành công!');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi Thêm/Sửa tài khoản:", error);
            const errorMessage = error.message.includes("Edge Function") 
                ? "Lỗi server: " + error.message
                : (error.message || 'Đã xảy ra lỗi không xác định.');
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col font-inter"
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 25 }}
            >
                {/* === (SỬA v13) Header màu mè, bo góc === */}
                <div className="flex justify-between items-center p-5 border-b border-indigo-700/50 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-t-2xl">
                    <h3 className="text-lg font-sora font-semibold text-white">
                        {isEdit ? 'Chỉnh sửa Tài khoản' : 'Thêm Tài khoản mới'}
                    </h3>
                    <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }} 
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose} 
                        disabled={loading} 
                        className="text-indigo-100 p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/20 disabled:opacity-50"
                    > <X size={20}/> </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <motion.div 
                        className="overflow-y-auto p-6 space-y-5"
                        variants={modalFormVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Email */}
                        <motion.div variants={fieldVariant}>
                            <label className="label-style flex items-center gap-2" htmlFor="email">
                                <At size={18} className="text-indigo-500" />
                                <span>Email *</span>
                            </label>
                            <input 
                                id="email"
                                type="email" name="email" value={formData.email} onChange={handleChange} 
                                required disabled={isEdit} 
                                className="input-style-pro disabled:opacity-50" 
                                placeholder="example@tourmanager.com"
                            />
                        </motion.div>

                        {/* --- Mật khẩu mới --- */}
                        <motion.div variants={fieldVariant}>
                            <label className="label-style flex items-center gap-2" htmlFor="password">
                                <Key size={18} className="text-indigo-500" />
                                <span>{isEdit ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu *'}</span>
                            </label>
                            <div className="relative">
                                <input 
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password" value={formData.password} onChange={handleChange} 
                                    required={!isEdit} // Chỉ bắt buộc khi Thêm mới
                                    minLength="6"
                                    className="input-style-pro pr-10"
                                    placeholder="Tối thiểu 6 ký tự"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle-btn"
                                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* --- Xác nhận Mật khẩu --- */}
                        {(formData.password || !isEdit) && (
                            <motion.div variants={fieldVariant}>
                                <label className="label-style flex items-center gap-2" htmlFor="confirm_password">
                                    <Key size={18} className="text-indigo-500" />
                                    <span>Xác nhận Mật khẩu {isEdit ? '' : '*'}</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        id="confirm_password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password" value={formData.confirm_password} onChange={handleChange} 
                                        required={!isEdit || !!formData.password} // Bắt buộc nếu gõ mật khẩu
                                        className="input-style-pro pr-10"
                                        placeholder="Nhập lại mật khẩu"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="password-toggle-btn"
                                        title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* (SỬA v19) Xóa Username, chỉ còn Full Name */}
                        <motion.div variants={fieldVariant}>
                            <label className="label-style flex items-center gap-2" htmlFor="full_name">
                                <User size={18} className="text-indigo-500" />
                                <span>Họ và Tên *</span>
                            </label>
                            <input 
                                id="full_name"
                                type="text" name="full_name" value={formData.full_name} onChange={handleChange} 
                                required className="input-style-pro" placeholder="Nguyễn Văn An"
                            />
                        </motion.div>

                        {/* Role */}
                        <motion.div variants={fieldVariant}>
                            <label className="label-style flex items-center gap-2" htmlFor="role">
                                <ShieldCheck size={18} className="text-indigo-500" />
                                <span>Vai trò *</span>
                            </label>
                            <div className="relative">
                                <select 
                                    id="role"
                                    name="role" value={formData.role} onChange={handleChange} 
                                    required 
                                    className="input-style-pro appearance-none"
                                >
                                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                    <CaretLeft size={16} weight="bold" />
                                </div>
                                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center px-3.5`}>
                                    <span className={`w-2.5 h-2.5 rounded-full ${ROLES.find(r => r.id === formData.role)?.color || 'bg-slate-400'}`}></span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Status (Edit only) */}
                        {isEdit && (
                            <motion.div variants={fieldVariant}>
                                <label className="label-style flex items-center gap-2">
                                    <CheckCircle size={18} className="text-indigo-500" />
                                    <span>Trạng thái</span>
                                </label>
                                <div className="flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <input 
                                        type="checkbox" name="is_active" id="is_active_toggle"
                                        checked={formData.is_active} onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_active_toggle" className="text-sm dark:text-white cursor-pointer font-medium">
                                        {formData.is_active ? 'Đang Hoạt động' : 'Đã Ngừng'}
                                    </label>
                                </div>
                            </motion.div>
                        )}
                        
                    </motion.div>
                    
                    {/* Modal Footer Buttons */}
                    <div className="p-5 border-t border-slate-200/80 dark:border-slate-700/50 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                        <motion.button 
                            type="button" onClick={onClose} disabled={loading} 
                            className="modal-button-secondary-pro"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >Hủy</motion.button>
                        
                        <motion.button 
                            type="submit" disabled={loading} 
                            className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[120px]"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : (isEdit ? <PencilLine size={18} /> : <UserPlus size={18} />) }
                            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// --- (SỬA v20) ĐỊNH NGHĨA LẠI CÁC BIẾN BỊ MẤT ---
// Các biến này phải được định nghĩa ở ngoài component
const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
};
const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};
// --- KẾT THÚC SỬA v20 ---


// --- Component chính: Quản lý Tài Khoản ---
export default function AdminManageAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [modalAccount, setModalAccount] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(null); 
    const [isDeleting, setIsDeleting] = useState(false); 
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // --- (SỬA v19) Fetch data (Đã xóa 'username') ---
    const fetchAccounts = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true);
        setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            
            // (SỬA v19) Xóa 'username' khỏi select
            const selectQuery = `id, full_name, email, role, is_active, created_at, customer_code, account_code`;
            
            let query = supabase.from("Users").select(selectQuery, { count: 'exact' });

            if (debouncedSearch.trim() !== "") {
                const searchStr = `%${debouncedSearch.trim()}%`;
                // (SỬA v19) Xóa 'username' khỏi search
                const searchQuery = `customer_code.ilike.${searchStr},account_code.ilike.${searchStr},full_name.ilike.${searchStr},email.ilike.${searchStr}`;
                query = query.or(searchQuery);
            }
            
            query = query.order("created_at", { ascending: false }).range(from, to);
            
            const { data, count, error: fetchError } = await query;

            if (fetchError) {
                if (fetchError.message.includes("policy")) {
                    throw new Error(`Lỗi RLS (Row Level Security): ${fetchError.message}. Hãy kiểm tra RLS trên bảng Users.`);
                }
                throw fetchError;
            }
            
            // (SỬA v19) Không cần map 'username' nữa
            setAccounts(data || []);
            setTotalItems(count || 0);
            
            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
                setCurrentPage(1); 
            }
        } catch (err) {
            console.error("Lỗi fetch accounts:", err);
            setError(err); 
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch]);

    // --- UseEffects (Giữ nguyên) ---
    useEffect(() => {
        fetchAccounts(true);
    }, [fetchAccounts]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearch]);
    
    // --- (SỬA v12) Sửa logic handleSuspend để gọi Edge Function ---
    const handleSuspend = (account) => {
        // (SỬA v19) Dùng 'full_name' thay 'username'
        toast((t) => (
            <div className="flex flex-col items-center p-1">
                 <span className="text-center font-inter">
                    Ngừng hoạt động tài khoản <b className="font-sora">{account.full_name || account.email}</b>?<br/>
                    <span className="text-xs text-orange-600">Tài khoản sẽ không thể đăng nhập.</span>
                 </span>
                <div className="mt-3 flex gap-2">
                 <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="modal-button-danger-pro text-sm"
                    onClick={async () => {
                        toast.dismiss(t.id);
                        setIsFetchingPage(true);
                        
                        const { data, error: functionError } = await supabase.functions.invoke('admin-update-user', {
                            body: {
                                user_id: account.id,
                                is_active: false, 
                                // (SỬA v19) Xóa 'username'
                                // username: undefined,
                                full_name: undefined,
                                role: undefined,
                                password: null
                            }
                        });
                        
                        setIsFetchingPage(false);
                        if (functionError || (data && data.error)) {
                            toast.error("Lỗi: " + (functionError?.message || data?.error));
                        } else {
                            toast.success("Đã ngừng tài khoản.");
                            fetchAccounts(false);
                        }
                    }}
                  > Xác nhận Ngừng </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="modal-button-secondary-pro text-sm"
                    onClick={() => toast.dismiss(t.id)}
                  > Hủy </motion.button>
                </div>
            </div>
          ), { icon: <WarningCircle size={24} className="text-red-500"/>, duration: 8000 });
    };

    // <<< THÊM v18: Hàm Xử lý Xóa Tài Khoản Vĩnh Viễn >>>
    const handleDeleteAccount = async () => {
        if (!deletingAccount || isDeleting) return;

        setIsDeleting(true);
        setIsFetchingPage(true); 
        
        try {
            const { data, error: functionError } = await supabase.functions.invoke('admin-delete-user', {
                body: {
                    user_id: deletingAccount.id
                }
            });

            if (functionError) throw functionError;
            if (data && data.error) throw new Error(data.error);

            toast.success(`Đã xóa vĩnh viễn tài khoản: ${deletingAccount.full_name || deletingAccount.email}`);
            setDeletingAccount(null);
            fetchAccounts(false); // Tải lại danh sách

        } catch (error) {
            console.error("Lỗi xóa tài khoản:", error);
            toast.error(`Xóa thất bại: ${error.message}. (Lưu ý: Bạn cần tạo Edge Function 'admin-delete-user'.)`);
        } finally {
            setIsDeleting(false);
            setIsFetchingPage(false);
        }
    };
    // <<< KẾT THÚC v18 >>>

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
    
    // (SỬA v14) Bỏ Manager/Staff khỏi map này
    const getRoleInfo = (roleId) => {
        const rolesMap = { 
            admin: { name: 'Admin', color: 'bg-purple-500' }, 
            supplier: { name: 'Supplier', color: 'bg-orange-500' }, 
            user: { name: 'User', color: 'bg-slate-500' }
        };
        return rolesMap[roleId] || { name: roleId, color: 'bg-gray-400' };
    };

    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     if (loading && accounts.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <CircleNotch size={40} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    // --- JSX (Giữ nguyên) ---
    return (
        <motion.div
            className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-900 font-inter"
            initial="hidden"
            animate="visible"
        >
            {/* (SỬA v19) Sử dụng 'pageVariants' */}
            <motion.div 
                className="space-y-6"
                variants={pageVariants}
            >
                {/* (SỬA v19) Sử dụng 'itemVariant' */}
                <motion.div variants={itemVariant} className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-sora font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <UsersThree weight="duotone" className="text-indigo-600" size={36} />
                            Quản lý Tài khoản
                        </h1>
                        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                            Quản lý tài khoản người dùng hệ thống (Bao gồm Admin, Supplier, User).
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 20px -10px rgb(99 102 241 / 50%)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalAccount('new')}
                        className="button-primary-pro flex items-center gap-2"
                    >
                        <UserPlus size={18} weight="bold" />
                        Thêm Tài Khoản
                    </motion.button>
                </motion.div>

                {/* Bảng */}
                {/* (SỬA v19) Sử dụng 'itemVariant' */}
                <motion.div
                    variants={itemVariant}
                    className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/50"
                >
                    <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-sora font-semibold text-slate-800 dark:text-slate-100">
                            Danh Sách Tài Khoản
                        </h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-72">
                                {/* ================== SỬA LỖI ICON TẠI ĐÂY ================== */}
                                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                {/* ========================================================== */}
                                <input 
                                    type="text" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    placeholder="Tìm Mã, Tên, Email..." // (SỬA v19) Xóa Username
                                    className="search-input-pro"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => fetchAccounts(false)} disabled={isFetchingPage} 
                                className="button-secondary-pro"
                                title="Làm mới"
                            >
                                <ArrowsClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative">
                        {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-indigo-500" /> </div> )}
                        <table className="min-w-full">
                            <thead className="border-b-2 border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="th-style-pro w-[10%]"><div className="flex items-center gap-1.5"><Archive size={14}/>Mã ID</div></th>
                                    <th className="th-style-pro w-[25%]"><div className="flex items-center gap-1.5"><User size={14}/>Họ và Tên</div></th>
                                    <th className="th-style-pro w-[20%]"><div className="flex items-center gap-1.5"><At size={14}/>Email</div></th>
                                    <th className="th-style-pro w-[15%]"><div className="flex items-center gap-1.5"><ShieldCheck size={14}/>Vai trò</div></th>
                                    <th className="th-style-pro w-[10%]"><div className="flex items-center gap-1.5"><Hourglass size={14}/>Trạng thái</div></th>
                                    <th className="th-style-pro w-[10%]"><div className="flex items-center gap-1.5"><CalendarBlank size={14}/>Ngày tạo</div></th>
                                    <th className="th-style-pro text-center w-[10%]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                <AnimatePresence>
                                    {error && !isFetchingPage && ( 
                                        <tr><td colSpan="7" className="td-center py-20 text-red-500">
                                            {`Lỗi: ${error.message}`}
                                        </td></tr> 
                                    )}
                                    
                                    {!error && !loading && !isFetchingPage && accounts.length === 0 && ( 
                                        <tr><td colSpan="7" className="td-center py-20 text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <Archive size={48} className="text-slate-400 mb-4" weight="light" />
                                                <span className="font-sora font-semibold text-lg text-slate-600 dark:text-slate-300">Không tìm thấy tài khoản</span>
                                                <span className="text-sm mt-1">{debouncedSearch ? `Không có kết quả cho "${debouncedSearch}"` : "Chưa có dữ liệu."}</span>
                                            </div>
                                        </td></tr> 
                                    )}
                                    
                                    {!error && accounts.map((account) => {
                                        const roleInfo = getRoleInfo(account.role);
                                        const displayCode = account.role === 'user' ? account.customer_code : account.account_code;
                                        
                                        return (
                                        <motion.tr
                                            key={account.id}
                                            layout
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                            className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                        >
                                            <td className="td-style-pro">
                                                <span className="font-sora font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                                                    {displayCode || <span className="italic text-slate-400">N/A</span>}
                                                </span>
                                            </td>

                                            {/* === (SỬA v19) Xóa "ID: {username}" === */}
                                            <td className="td-style-pro">
                                                <div className="font-sora font-semibold text-slate-800 dark:text-slate-100">{account.full_name}</div>
                                            </td>
                                            
                                            <td className="td-style-pro font-inter text-slate-600 dark:text-slate-400">{account.email}</td>
                                            <td className="td-style-pro">
                                                <span className="badge-pro">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${roleInfo.color}`}></span>
                                                    <span className="font-medium">{roleInfo.name}</span>
                                                </span>
                                            </td>
                                            <td className="td-style-pro">
                                                {account.is_active ? 
                                                    <span className="badge-green-pro"><CheckCircle size={14} weight="bold"/>Hoạt động</span> : 
                                                    <span className="badge-gray-pro"><XCircle size={14} weight="bold"/>Ngừng</span>}
                                            </td>
                                            <td className="td-style-pro font-inter text-slate-500 text-sm">{formatDate(account.created_at)}</td>
                                            <td className="td-style-pro text-center">
                                                <div className="flex justify-center gap-1">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                        onClick={() => setModalAccount(account)} 
                                                        disabled={isFetchingPage} 
                                                        className="action-button-pro text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/40" 
                                                        title="Sửa tài khoản"
                                                    > <PencilLine size={18}/> </motion.button>
                                                    
                                                    {account.is_active ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleSuspend(account)} 
                                                            disabled={isFetchingPage} 
                                                            className="action-button-pro text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                                                            title="Ngừng tài khoản"
                                                        > <UserCircleMinus size={18}/> </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => setModalAccount(account)}
                                                            disabled={isFetchingPage} 
                                                            className="action-button-pro text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40"
                                                            title="Kích hoạt lại (trong Sửa)"
                                                        > <UserCircleCheck size={18}/> </motion.button>
                                                    )}
                                                    
                                                    {/* === (THÊM v18) Nút Xóa === */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                        onClick={() => setDeletingAccount(account)} // Mở modal xác nhận
                                                        disabled={isFetchingPage} 
                                                        className="action-button-pro text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
                                                        title="Xóa vĩnh viễn tài khoản"
                                                    >
                                                        <Trash size={18}/>
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )})}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Pagination UI */}
                {/* (SỬA v19) Sử dụng 'itemVariant' */}
                {!loading && totalItems > ITEMS_PER_PAGE && (
                    <motion.div
                        variants={itemVariant}
                        className="flex flex-col sm:flex-row justify-between items-center mt-5 text-sm text-slate-600 dark:text-slate-400"
                    >
                        <div>
                            Hiển thị <b>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</b> - <b>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</b> trên <b>{totalItems}</b> tài khoản
                        </div>
                        <nav className="flex items-center gap-1 mt-3 sm:mt-0">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow-pro"> <CaretLeft size={16} weight="bold" /> </motion.button>
                            {paginationWindow.map((page, index) =>
                                typeof page === 'number' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        key={index}
                                        onClick={() => setCurrentPage(page)}
                                        disabled={currentPage === page || isFetchingPage}
                                        className={`pagination-number-pro ${currentPage === page ? 'pagination-active-pro' : ''}`}
                                    > {page} </motion.button>
                                ) : (
                                    <span key={index} className="pagination-dots-pro"> ... </span>
                                )
                            )}
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow-pro"> <CaretRight size={16} weight="bold" /> </motion.button>
                        </nav>
                    </motion.div>
                )}
            </motion.div>

            {/* Modal Thêm/Sửa */}
            <AnimatePresence>
                {modalAccount && (
                    <AccountModal
                        key={modalAccount.id || 'new'}
                        account={modalAccount === 'new' ? null : modalAccount}
                        onClose={() => setModalAccount(null)}
                        onSuccess={() => fetchAccounts(false)}
                    />
                )}
            </AnimatePresence>

            {/* <<< THÊM v18: Modal Xác nhận Xóa >>> */}
            <AnimatePresence>
                {deletingAccount && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-red-600"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 25 }}
                        >
                            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-sora font-semibold text-red-600 dark:text-red-500 flex items-center gap-2">
                                    <WarningCircle size={22} />
                                    Xác nhận Xóa Tài Khoản
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => setDeletingAccount(null)}
                                    disabled={isDeleting}
                                    className="text-slate-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                > <X size={20} /> </motion.button>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-700 dark:text-slate-300 text-base">
                                    Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản:
                                    <br />
                                    <strong className="font-sora text-slate-900 dark:text-white">{deletingAccount.full_name}</strong>
                                    <br />
                                    <span className="text-sm">({deletingAccount.email})</span>?
                                </p>
                                <p className="mt-4 text-sm text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa khỏi hệ thống đăng nhập và toàn bộ dữ liệu liên quan.
                                </p>
                            </div>
                            <div className="p-5 border-t border-slate-200/80 dark:border-slate-700/50 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                                <motion.button
                                    type="button" onClick={() => setDeletingAccount(null)} disabled={isDeleting}
                                    className="modal-button-secondary-pro"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Hủy
                                </motion.button>
                                <motion.button
                                    type="button" onClick={handleDeleteAccount} disabled={isDeleting}
                                    className="modal-button-danger-pro flex items-center justify-center gap-2 min-w-[140px]"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isDeleting ? <CircleNotch size={18} className="animate-spin" /> : <Trash size={18} />}
                                    Xác nhận Xóa
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* <<< KẾT THÚC v18 >>> */}

            {/* <<< UPGRADE: Toàn bộ CSS mới */}
            <style jsx>{`
                /* <<< UPGRADE: Import Phông chữ */
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
                
                .font-sora { font-family: 'Sora', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }

                /* === (SỬA v13) Tăng bo góc === */
                .search-input-pro { 
                    @apply w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border-transparent 
                           bg-slate-100 dark:bg-slate-700/60 
                           text-slate-800 dark:text-slate-200
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           focus:bg-white dark:focus:bg-slate-800 
                           focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                           outline-none transition-all duration-300;
                }
                
                /* === (SỬA v13) Tăng bo góc === */
                .button-secondary-pro {
                    @apply h-[42px] w-[42px] flex items-center justify-center
                           bg-slate-100 hover:bg-slate-200 
                           dark:bg-slate-700/60 dark:hover:bg-slate-700
                           text-slate-600 dark:text-slate-300
                           font-semibold rounded-xl transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed;
                }
                
                /* === (SỬA v13) Tăng bo góc === */
                .button-primary-pro {
                    @apply bg-indigo-600 hover:bg-indigo-700 
                           text-white font-semibold 
                           px-5 py-2.5 rounded-xl transition-all duration-300 
                           shadow-md hover:shadow-lg 
                           disabled:opacity-50 disabled:cursor-not-allowed;
                }

                /* <<< UPGRADE: Tiêu đề Bảng Pro */
                .th-style-pro { 
                    @apply px-6 py-4 text-left text-sm font-semibold 
                           text-slate-500 dark:text-slate-400 
                           uppercase tracking-wider; 
                }
                
                /* <<< UPGRADE: Ô Bảng Pro */
                .td-style-pro { 
                    @apply px-6 py-4 text-sm align-top; /* align-top để username/fullname thẳng hàng */
                }
                .td-center { 
                    @apply px-6 text-center;
                }
                
                /* <<< UPGRADE: Badge Chấm Màu Pro */
                .badge-pro {
                    @apply px-3 py-1 text-sm rounded-full inline-flex items-center gap-2
                           bg-slate-100 dark:bg-slate-700
                           text-slate-800 dark:text-slate-100;
                }
                
                /* <<< UPGRADE: Badge Trạng thái Pro (nhạt hơn) */
                .badge-green-pro { 
                    @apply px-3 py-1 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 
                           bg-green-100/60 dark:bg-green-500/10 
                           text-green-700 dark:text-green-300; 
                }
                .badge-gray-pro { 
                    @apply px-3 py-1 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 
                           bg-slate-100 dark:bg-slate-700
                           text-slate-600 dark:text-slate-300; 
                }

                /* <<< UPGRADE: Phân trang Pro */
                .pagination-arrow-pro { @apply p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number-pro { @apply w-9 h-9 rounded-md font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active-pro { @apply bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-600; }
                .pagination-dots-pro { @apply px-2 py-1 text-slate-500 dark:text-slate-400; }

                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                
                /* === (SỬA v13) Tăng bo góc === */
                .input-style-pro { 
                    @apply border border-slate-200 dark:border-slate-700 
                           p-3 rounded-xl w-full 
                           bg-slate-100 dark:bg-slate-800/60
                           text-slate-800 dark:text-slate-100
                           focus:bg-white dark:focus:bg-slate-900 
                           focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                           outline-none transition text-sm disabled:opacity-50;
                }
                .input-style-pro::placeholder {
                    @apply text-slate-400 dark:text-slate-500;
                }
                /* <<< UPGRADE: Custom select cho role */
                .input-style-pro.appearance-none {
                    @apply pl-10; /* Chừa chỗ cho chấm màu */
                }

                .label-style { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5; }
                
                /* === (SỬA v13) Tăng bo góc === */
                .modal-button-secondary-pro { 
                    @apply px-5 py-2.5 bg-slate-100 hover:bg-slate-200 
                           dark:bg-slate-700 dark:hover:bg-slate-600 
                           text-slate-800 dark:text-slate-100
                           rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors;
                }
                /* === (SỬA v13) Tăng bo góc === */
                .modal-button-primary-pro { 
                    @apply px-5 py-2.5 bg-indigo-600 text-white 
                           rounded-xl font-semibold hover:bg-indigo-700 
                           text-sm disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30;
                }
                /* === (SỬA v13) Tăng bo góc === */
                .modal-button-danger-pro { 
                    @apply px-5 py-2.5 bg-red-600 text-white 
                           rounded-xl font-semibold hover:bg-red-700 
                           text-sm disabled:opacity-50 transition-colors shadow-lg shadow-red-500/30;
                }
                
                /* <<< (SỬA UI) Nút hành động Pro (trong bảng) - Xóa hover chung */
                .action-button-pro { 
                    @apply p-2 rounded-lg transition-colors duration-150 
                           /* hover:bg-slate-100 dark:hover:bg-slate-700 (XÓA) - Đã chuyển hover vào class cụ thể */
                           focus:outline-none focus:ring-1 focus:ring-offset-1 
                           dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; 
                }
                
                .password-toggle-btn {
                    @apply absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors;
                }
            `}</style>
        </motion.div>
    );
}
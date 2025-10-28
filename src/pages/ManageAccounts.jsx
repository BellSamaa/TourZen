import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    UsersThree, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass,
    PencilLine, ArrowsClockwise, WarningCircle, UserPlus, UserCircleMinus, UserCircleCheck,
    Eye, EyeSlash, CheckCircle, XCircle, User, At, ShieldCheck, CalendarBlank, Hourglass,
    Inbox 
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

// --- (STYLE UPGRADE) Modal Thêm/Sửa Tài Khoản ---
const AccountModal = ({ account, onClose, onSuccess }) => {
    const isEdit = !!account;
    
    const ROLES = [
        { id: 'admin', name: 'Admin', color: 'bg-purple-500' },
        { id: 'manager', name: 'Manager', color: 'bg-blue-500' },
        { id: 'staff', name: 'Staff', color: 'bg-cyan-500' },
        { id: 'supplier', name: 'Supplier', color: 'bg-orange-500' },
        { id: 'user', name: 'User', color: 'bg-slate-500' },
    ];

    const [formData, setFormData] = useState({
        email: isEdit ? account.email : '',
        password: '',
        username: isEdit ? (account.username || '') : '',
        full_name: isEdit ? account.full_name : '',
        role: isEdit ? account.role : 'staff',
        is_active: isEdit ? account.is_active : true,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ... (Logic handleChange, handleSubmit giữ nguyên) ...
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
                const { error: updateError } = await supabase
                    .from('Users')
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
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });
                if (authError) throw authError;
                if (!authData.user) throw new Error('Không thể tạo user trong Auth.');

                const { error: profileError } = await supabase
                    .from('Users')
                    .insert({
                        id: authData.user.id,
                        email: formData.email,
                        username: formData.username,
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
            const errorMessage = error.message.includes("Password") 
                ? "Mật khẩu quá yếu (cần ít nhất 6 ký tự)."
                : (error.message || 'Đã xảy ra lỗi không xác định.');
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center p-4" // <<< UPGRADE: Tăng độ mờ backdrop
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col font-inter" // <<< UPGRADE: Nền modal dark
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 25 }}
            >
                {/* <<< UPGRADE: Header Modal với Gradient */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 rounded-t-lg">
                    <h3 className="text-lg font-sora font-semibold text-slate-800 dark:text-white">
                        {isEdit ? 'Chỉnh sửa Tài khoản' : 'Thêm Tài khoản mới'}
                    </h3>
                    <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }} 
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose} 
                        disabled={loading} 
                        className="text-slate-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    > <X size={20}/> </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <motion.div 
                        className="overflow-y-auto p-6 space-y-5" // <<< UPGRADE: Tăng space-y-5
                        variants={modalFormVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Email */}
                        <motion.div variants={fieldVariant}>
                            <label className="label-style" htmlFor="email">Email *</label>
                            <input 
                                id="email"
                                type="email" name="email" value={formData.email} onChange={handleChange} 
                                required disabled={isEdit} 
                                className="input-style-pro disabled:opacity-50" 
                                placeholder="example@tourmanager.com"
                            />
                        </motion.div>

                        {/* Password */}
                        {!isEdit && (
                            <motion.div variants={fieldVariant}>
                                <label className="label-style" htmlFor="password">Mật khẩu *</label>
                                <div className="relative">
                                    <input 
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password" value={formData.password} onChange={handleChange} 
                                        required minLength="6"
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
                        )}
                        
                        {/* Username & Full Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> {/* <<< UPGRADE: Tăng gap-5 */}
                            <motion.div variants={fieldVariant}>
                                <label className="label-style" htmlFor="username">Tên đăng nhập *</label>
                                <input 
                                    id="username"
                                    type="text" name="username" value={formData.username} onChange={handleChange} 
                                    required className="input-style-pro" placeholder="admin01"
                                />
                            </motion.div>

                            <motion.div variants={fieldVariant}>
                                <label className="label-style" htmlFor="full_name">Họ và Tên *</label>
                                <input 
                                    id="full_name"
                                    type="text" name="full_name" value={formData.full_name} onChange={handleChange} 
                                    required className="input-style-pro" placeholder="Nguyễn Văn An"
                                />
                            </motion.div>
                        </div>

                        {/* Role */}
                        <motion.div variants={fieldVariant}>
                            <label className="label-style" htmlFor="role">Vai trò *</label>
                            {/* <<< UPGRADE: Custom Select với icon chấm màu */}
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
                                <label className="label-style">Trạng thái</label>
                                <div className="flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-800 rounded-md"> {/* <<< UPGRADE: Tăng p-3.5, gap-3 */}
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
                    <div className="p-5 border-t border-slate-200/80 dark:border-slate-700/50 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                        <motion.button 
                            type="button" onClick={onClose} disabled={loading} 
                            className="modal-button-secondary-pro" // <<< UPGRADE: Class mới
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >Hủy</motion.button>
                        
                        <motion.button 
                            type="submit" disabled={loading} 
                            className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[120px]" // <<< UPGRADE: Class mới
                            whileHover={{ scale: 1.05, y: -2 }} // <<< UPGRADE: Thêm hiệu ứng y
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


// --- Variants cho Stagger (Giữ nguyên) ---
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


// --- (STYLE UPGRADE) Component chính: Quản lý Tài Khoản ---
export default function AdminManageAccounts() {
    // ... (States giữ nguyên) ...
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [modalAccount, setModalAccount] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // --- Fetch data (Giữ nguyên logic) ---
    const fetchAccounts = useCallback(async (isInitialLoad = false) => {
        // ... (Logic giữ nguyên) ...
        if (!isInitialLoad) setIsFetchingPage(true);
        setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            const selectQuery = `id, username, full_name, email, role, is_active, created_at`;
            let query = supabase.from("Users").select(selectQuery, { count: 'exact' });
            if (debouncedSearch.trim() !== "") {
                const searchStr = `%${debouncedSearch.trim()}%`;
                query = query.or(`full_name.ilike.${searchStr},email.ilike.${searchStr},username.ilike.${searchStr}`);
            }
            query = query.order("created_at", { ascending: false }).range(from, to);
            const { data, count, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            const processedData = data.map(acc => ({...acc, username: acc.username || 'N/A'}));
            setAccounts(processedData || []);
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
    
    // --- Event Handlers (Gi..."(Giữ nguyên)
    const handleSuspend = (account) => {
        toast((t) => (
            <div className="flex flex-col items-center p-1">
                 <span className="text-center font-inter">
                    Ngừng hoạt động tài khoản <b className="font-sora">{account.username}</b>?<br/>
                    <span className="text-xs text-orange-600">Tài khoản sẽ không thể đăng nhập.</span>
                 </span>
                <div className="mt-3 flex gap-2">
                 <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="modal-button-danger-pro text-sm" // <<< UPGRADE: Class mới
                    onClick={async () => {
                        toast.dismiss(t.id);
                        setIsFetchingPage(true);
                        const { error: updateError } = await supabase.from("Users").update({ is_active: false }).eq("id", account.id);
                        setIsFetchingPage(false);
                        if (updateError) {
                            toast.error("Lỗi: " + updateError.message);
                        } else {
                            toast.success("Đã ngừng tài khoản.");
                            fetchAccounts(false);
                        }
                    }}
                  > Xác nhận Ngừng </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="modal-button-secondary-pro text-sm" // <<< UPGRADE: Class mới
                    onClick={() => toast.dismiss(t.id)}
                  > Hủy </motion.button>
                </div>
            </div>
          ), { icon: <WarningCircle size={24} className="text-red-500"/>, duration: 8000 });
    };

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
    
    // <<< UPGRADE: Thêm màu vào map
    const getRoleInfo = (roleId) => {
        const rolesMap = { 
            admin: { name: 'Admin', color: 'bg-purple-500' }, 
            manager: { name: 'Manager', color: 'bg-blue-500' }, 
            staff: { name: 'Staff', color: 'bg-cyan-500' }, 
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

    // --- JSX ---
    return (
        <motion.div
            className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-900 font-inter" // <<< UPGRADE: p-8, bg-slate-50, font-inter
            initial="hidden"
            animate="visible"
        >
            <motion.div 
                className="space-y-6"
                variants={pageVariants}
            >
                {/* Header */}
                <motion.div variants={itemVariant} className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-sora font-bold text-slate-900 dark:text-white flex items-center gap-3"> {/* <<< UPGRADE: text-3xl, font-sora, font-bold */}
                            <UsersThree weight="duotone" className="text-indigo-600" size={36} /> {/* <<< UPGRADE: text-indigo, size-36 */}
                            Quản lý Tài khoản
                        </h1>
                        <p className="mt-2 text-base text-slate-600 dark:text-slate-400"> {/* <<< UPGRADE: mt-2, text-base */}
                            Quản lý tài khoản người dùng hệ thống
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 20px -10px rgb(99 102 241 / 50%)' }} // <<< UPGRADE: Thêm shadow
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalAccount('new')}
                        className="button-primary-pro flex items-center gap-2" // <<< UPGRADE: Class mới
                    >
                        <UserPlus size={18} weight="bold" />
                        Thêm Tài Khoản
                    </motion.button>
                </motion.div>

                {/* Bảng */}
                <motion.div
                    variants={itemVariant}
                    className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-700/50" // <<< UPGRADE: shadow-xl
                >
                    <div className="p-6 flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700"> {/* <<< UPGRADE: p-6 */}
                        <h2 className="text-xl font-sora font-semibold text-slate-800 dark:text-slate-100"> {/* <<< UPGRADE: text-xl, font-sora */}
                            Danh Sách Tài Khoản
                        </h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-72"> {/* <<< UPGRADE: w-72 */}
                                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    placeholder="Tìm Tên, Email, Username..." 
                                    className="search-input-pro" // <<< UPGRADE: Class mới
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => fetchAccounts(false)} disabled={isFetchingPage} 
                                className="button-secondary-pro" // <<< UPGRADE: Class mới
                                title="Làm mới"
                            >
                                <ArrowsClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative">
                        {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-indigo-500" /> </div> )}
                        <table className="min-w-full">
                            {/* <<< UPGRADE: Thead mới */}
                            <thead className="border-b-2 border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="th-style-pro w-[20%]"><div className="flex items-center gap-1.5"><User size={14}/>Tên đăng nhập</div></th>
                                    <th className="th-style-pro w-[25%]"><div className="flex items-center gap-1.5"><At size={14}/>Email</div></th>
                                    <th className="th-style-pro w-[15%]"><div className="flex items-center gap-1.5"><ShieldCheck size={14}/>Vai trò</div></th>
                                    <th className="th-style-pro w-[15%]"><div className="flex items-center gap-1.5"><Hourglass size={14}/>Trạng thái</div></th>
                                    <th className="th-style-pro w-[15%]"><div className="flex items-center gap-1.5"><CalendarBlank size={14}/>Ngày tạo</div></th>
                                    <th className="th-style-pro text-center w-[10%]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                <AnimatePresence>
                                    {error && !isFetchingPage && ( 
                                        <tr><td colSpan="6" className="td-center py-20 text-red-500">{`Lỗi: ${error.message}`}</td></tr> 
                                    )}
                                    
                                    {!error && !loading && !isFetchingPage && accounts.length === 0 && ( 
                                        <tr><td colSpan="6" className="td-center py-20 text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <Inbox size={48} className="text-slate-400 mb-4" weight="light" />
                                                <span className="font-sora font-semibold text-lg text-slate-600 dark:text-slate-300">Không tìm thấy tài khoản</span>
                                                <span className="text-sm mt-1">{debouncedSearch ? `Không có kết quả cho "${debouncedSearch}"` : "Chưa có dữ liệu."}</span>
                                            </div>
                                        </td></tr> 
                                    )}
                                    
                                    {!error && accounts.map((account) => {
                                        const roleInfo = getRoleInfo(account.role);
                                        return (
                                        <motion.tr
                                            key={account.id}
                                            layout
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                            className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                        >
                                            {/* <<< UPGRADE: Phân cấp font */}
                                            <td className="td-style-pro">
                                                <div className="font-sora font-semibold text-slate-800 dark:text-slate-100">{account.username}</div>
                                                <div className="font-inter text-sm text-slate-500 dark:text-slate-400">{account.full_name}</div>
                                            </td>
                                            <td className="td-style-pro font-inter text-slate-600 dark:text-slate-400">{account.email}</td>
                                            <td className="td-style-pro">
                                                {/* <<< UPGRADE: Badge chấm màu mới */}
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
                                                        className="action-button-pro text-sky-600" 
                                                        title="Sửa tài khoản"
                                                    > <PencilLine size={18}/> </motion.button>
                                                    
                                                    {account.is_active ? (
                                                        <motion.button
                                                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleSuspend(account)} 
                                                            disabled={isFetchingPage} 
                                                            className="action-button-pro text-red-500"
                                                            title="Ngừng tài khoản"
                                                        > <UserCircleMinus size={18}/> </motion.button>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                                            onClick={() => setModalAccount(account)}
                                                            disabled={isFetchingPage} 
                                                            className="action-button-pro text-green-500"
                                                            title="Kích hoạt lại (trong Sửa)"
                                                        > <UserCircleCheck size={18}/> </motion.button>
                                                    )}
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

            {/* Modal */}
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

            {/* <<< UPGRADE: Toàn bộ CSS mới */}
            <style jsx>{`
                /* <<< UPGRADE: Import Phông chữ */
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
                
                .font-sora { font-family: 'Sora', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }

                /* <<< UPGRADE: Input tìm kiếm Pro */
                .search-input-pro { 
                    @apply w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border-transparent 
                           bg-slate-100 dark:bg-slate-700/60 
                           text-slate-800 dark:text-slate-200
                           placeholder:text-slate-400 dark:placeholder:text-slate-500
                           focus:bg-white dark:focus:bg-slate-800 
                           focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                           outline-none transition-all duration-300;
                }
                
                /* <<< UPGRADE: Nút Phụ Pro (Làm mới) */
                .button-secondary-pro {
                    @apply h-[42px] w-[42px] flex items-center justify-center
                           bg-slate-100 hover:bg-slate-200 
                           dark:bg-slate-700/60 dark:hover:bg-slate-700
                           text-slate-600 dark:text-slate-300
                           font-semibold rounded-lg transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed;
                }
                
                /* <<< UPGRADE: Nút Chính Pro (Thêm TK) */
                .button-primary-pro {
                    @apply bg-indigo-600 hover:bg-indigo-700 
                           text-white font-semibold 
                           px-5 py-2.5 rounded-lg transition-all duration-300 
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
                
                /* <<< UPGRADE: Input Modal Pro */
                .input-style-pro { 
                    @apply border border-slate-200 dark:border-slate-700 
                           p-3 rounded-md w-full 
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
                
                /* <<< UPGRADE: Nút Modal Pro */
                .modal-button-secondary-pro { 
                    @apply px-5 py-2.5 bg-slate-100 hover:bg-slate-200 
                           dark:bg-slate-700 dark:hover:bg-slate-600 
                           text-slate-800 dark:text-slate-100
                           rounded-md font-semibold text-sm disabled:opacity-50 transition-colors;
                }
                .modal-button-primary-pro { 
                    @apply px-5 py-2.5 bg-indigo-600 text-white 
                           rounded-md font-semibold hover:bg-indigo-700 
                           text-sm disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/30;
                }
                .modal-button-danger-pro { 
                    @apply px-5 py-2.5 bg-red-600 text-white 
                           rounded-md font-semibold hover:bg-red-700 
                           text-sm disabled:opacity-50 transition-colors shadow-lg shadow-red-500/30;
                }
                
                /* <<< UPGRADE: Nút hành động Pro (trong bảng) */
                .action-button-pro { 
                    @apply p-2 rounded-lg transition-colors duration-150 
                           hover:bg-slate-100 dark:hover:bg-slate-700
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


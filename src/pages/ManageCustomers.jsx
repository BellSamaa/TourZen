import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import {
    UsersThree, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass,
    PencilLine, ArrowsClockwise, WarningCircle, UserPlus, UserCircleMinus, UserCircleCheck,
    Eye, EyeSlash, CheckCircle, XCircle, User, At, ShieldCheck, CalendarBlank, Hourglass,
    Inbox // <<< UPGRADE: Thêm icon cho "No Data"
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

// --- Modal Thêm/Sửa Tài Khoản (Giữ nguyên logic, tinh chỉnh style) ---
const AccountModal = ({ account, onClose, onSuccess }) => {
    const isEdit = !!account;
    
    const ROLES = [
        { id: 'admin', name: 'Admin' },
        { id: 'manager', name: 'Manager' },
        { id: 'staff', name: 'Staff' },
        { id: 'user', name: 'User' },
        { id: 'supplier', name: 'Supplier' },
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
                // ... (Logic sửa giữ nguyên) ...
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
                // ... (Logic thêm giữ nguyên) ...
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
            className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" // Giữ shadow-xl cho modal
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 25 }}
            >
                <div className="flex justify-between items-center p-5 border-b dark:border-slate-700"> {/* <<< UPGRADE: Tăng padding P-5 */}
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {isEdit ? 'Chỉnh sửa Tài khoản' : 'Thêm Tài khoản mới'}
                    </h3>
                    <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }} 
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose} 
                        disabled={loading} 
                        className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    > <X size={20}/> </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <motion.div 
                        className="overflow-y-auto p-6 space-y-4" // <<< UPGRADE: Tăng P-6
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
                                className="input-style disabled:bg-slate-100 dark:disabled:bg-slate-700" 
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
                                        className="input-style pr-10"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div variants={fieldVariant}>
                                <label className="label-style" htmlFor="username">Tên đăng nhập *</label>
                                <input 
                                    id="username"
                                    type="text" name="username" value={formData.username} onChange={handleChange} 
                                    required className="input-style" placeholder="admin01"
                                />
                            </motion.div>

                            <motion.div variants={fieldVariant}>
                                <label className="label-style" htmlFor="full_name">Họ và Tên *</label>
                                <input 
                                    id="full_name"
                                    type="text" name="full_name" value={formData.full_name} onChange={handleChange} 
                                    required className="input-style" placeholder="Nguyễn Văn An"
                                />
                            </motion.div>
                        </div>

                        {/* Role */}
                        <motion.div variants={fieldVariant}>
                            <label className="label-style" htmlFor="role">Vai trò *</label>
                            <select 
                                id="role"
                                name="role" value={formData.role} onChange={handleChange} 
                                required className="input-style"
                            >
                                {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </motion.div>

                        {/* Status (Edit only) */}
                        {isEdit && (
                            <motion.div variants={fieldVariant}>
                                <label className="label-style">Trạng thái</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md"> {/* <<< UPGRADE: Tăng P-3 */}
                                    <input 
                                        type="checkbox" name="is_active" id="is_active_toggle"
                                        checked={formData.is_active} onChange={handleChange}
                                        className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                                    />
                                    <label htmlFor="is_active_toggle" className="text-sm dark:text-white cursor-pointer">
                                        {formData.is_active ? 'Đang Hoạt động' : 'Đã Ngừng'}
                                    </label>
                                </div>
                            </motion.div>
                        )}
                        
                    </motion.div>
                    
                    {/* Modal Footer Buttons */}
                    <div className="p-5 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800"> {/* <<< UPGRADE: Tăng P-5 */}
                        <motion.button 
                            type="button" onClick={onClose} disabled={loading} 
                            className="modal-button-secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >Hủy</motion.button>
                        
                        <motion.button 
                            type="submit" disabled={loading} 
                            className="modal-button-primary flex items-center justify-center gap-1.5 min-w-[120px]"
                            whileHover={{ scale: 1.05 }}
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


// --- Component chính: Quản lý Tài Khoản ---
export default function AdminManageAccounts() {
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

    
    // --- Event Handlers (Giữ nguyên) ---
    const handleSuspend = (account) => {
        toast((t) => (
            <div className="flex flex-col items-center p-1">
                 <span className="text-center">
                    Ngừng hoạt động tài khoản <b>{account.username}</b>?<br/>
                    <span className="text-xs text-orange-600">Tài khoản sẽ không thể đăng nhập.</span>
                 </span>
                <div className="mt-3 flex gap-2">
                 <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="modal-button-danger text-sm"
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
                    className="modal-button-secondary text-sm" onClick={() => toast.dismiss(t.id)}
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
    
    const getRoleName = (roleId) => {
        const rolesMap = { admin: 'Admin', manager: 'Manager', staff: 'Staff', user: 'User', supplier: 'Supplier' };
        return rolesMap[roleId] || roleId;
    };

    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     if (loading && accounts.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen dark:bg-slate-900">
                <CircleNotch size={40} className="animate-spin text-sky-600" />
            </div>
        );
    }

    // --- JSX ---
    return (
        <motion.div
            className="p-4 md:p-6 min-h-screen dark:bg-slate-900 dark:text-white"
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <UsersThree weight="duotone" className="text-sky-600" size={30} />
                            Quản lý Tài khoản
                        </h1>
                        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"> {/* <<< UPGRADE: Tăng mt-1.5 */}
                            Quản lý tài khoản người dùng hệ thống
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModalAccount('new')}
                        className="button-primary flex items-center gap-1.5"
                    >
                        <UserPlus size={18} weight="bold" />
                        Thêm Tài Khoản
                    </motion.button>
                </motion.div>

                {/* Bảng */}
                <motion.div
                    variants={itemVariant}
                    className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700" // <<< UPGRADE: shadow-lg, thêm border
                >
                    <div className="p-4 flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold dark:text-white">
                            Danh Sách Tài Khoản
                        </h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /> {/* <<< UPGRADE: left-3.5 */}
                                <input 
                                    type="text" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    placeholder="Tìm kiếm tài khoản..." 
                                    className="search-input"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => fetchAccounts(false)} disabled={isFetchingPage} 
                                className={`p-2.5 button-secondary ${isFetchingPage ? 'opacity-50' : ''}`} title="Làm mới" // <<< UPGRADE: p-2.5
                            >
                                <ArrowsClockwise size={18} className={isFetchingPage ? "animate-spin" : ""} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative">
                        {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/40">
                                <tr>
                                    <th className="th-style w-[15%]"><div className="flex items-center gap-1.5"><User size={14}/>Tên đăng nhập</div></th>
                                    <th className="th-style w-[20%]"><div className="flex items-center gap-1.5"><User size={14}/>Họ và Tên</div></th>
                                    <th className="th-style w-[25%]"><div className="flex items-center gap-1.5"><At size={14}/>Email</div></th>
                                    <th className="th-style w-[10%]"><div className="flex items-center gap-1.5"><ShieldCheck size={14}/>Vai trò</div></th>
                                    <th className="th-style w-[10%]"><div className="flex items-center gap-1.5"><Hourglass size={14}/>Trạng thái</div></th>
                                    <th className="th-style w-[10%]"><div className="flex items-center gap-1.5"><CalendarBlank size={14}/>Ngày tạo</div></th>
                                    <th className="th-style text-center w-[10%]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                <AnimatePresence>
                                    {error && !isFetchingPage && ( 
                                        <tr><td colSpan="7" className="td-center text-red-500 py-20">{`Lỗi: ${error.message}`}</td></tr> 
                                    )}
                                    
                                    {!error && !loading && !isFetchingPage && accounts.length === 0 && ( 
                                        <tr><td colSpan="7" className="td-center text-gray-500 py-20"> {/* <<< UPGRADE: Thêm Icon và style */}
                                            <div className="flex flex-col items-center">
                                                <Inbox size={40} className="text-gray-400 mb-3" />
                                                <span className="font-semibold">Không tìm thấy tài khoản</span>
                                                <span className="text-sm">{debouncedSearch ? `Không có kết quả cho "${debouncedSearch}"` : "Chưa có dữ liệu."}</span>
                                            </div>
                                        </td></tr> 
                                    )}
                                    
                                    {!error && accounts.map((account, index) => (
                                        <motion.tr
                                            key={account.id}
                                            layout
                                            initial={{ opacity: 0, y: -10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                            // <<< UPGRADE: Thêm Zebra Striping và hover rõ hơn
                                            className={`transition-colors 
                                                ${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} 
                                                hover:bg-sky-50 dark:hover:bg-slate-700
                                            `}
                                        >
                                            <td className="td-style font-medium text-slate-900 dark:text-white">{account.username}</td>
                                            <td className="td-style text-gray-700 dark:text-gray-200">{account.full_name}</td>
                                            <td className="td-style text-gray-600 dark:text-gray-300">{account.email}</td>
                                            <td className="td-style">
                                                {account.role === 'admin' && <span className="badge-role-admin">{getRoleName(account.role)}</span>}
                                                {account.role === 'manager' && <span className="badge-role-manager">{getRoleName(account.role)}</span>}
                                                {account.role === 'staff' && <span className="badge-role-staff">{getRoleName(account.role)}</span>}
                                                {account.role === 'user' && <span className="badge-role-user">{getRoleName(account.role)}</span>}
                                                {account.role === 'supplier' && <span className="badge-role-supplier">{getRoleName(account.role)}</span>}
                                            </td>
                                            <td className="td-style">
                                                {account.is_active ? 
                                                    <span className="badge-green"><CheckCircle size={14} weight="bold"/>Hoạt động</span> : 
                                                    <span className="badge-gray"><XCircle size={14} weight="bold"/>Ngừng</span>}
                                            </td>
                                            <td className="td-style text-gray-500 text-xs">{formatDate(account.created_at)}</td> {/* <<< UPGRADE: text-xs */}
                                            <td className="td-style text-center space-x-2">
                                                <motion.button 
                                                    whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => setModalAccount(account)} 
                                                    disabled={isFetchingPage} 
                                                    className="action-button text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/30" 
                                                    title="Sửa tài khoản"
                                                > <PencilLine size={18}/> </motion.button>
                                                
                                                {account.is_active ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleSuspend(account)} 
                                                        disabled={isFetchingPage} 
                                                        className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" 
                                                        title="Ngừng tài khoản"
                                                    > <UserCircleMinus size={18}/> </motion.button>
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
                                                        onClick={() => setModalAccount(account)}
                                                        disabled={isFetchingPage} 
                                                        className="action-button text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" 
                                                        title="Kích hoạt lại (trong Sửa)"
                                                    > <UserCircleCheck size={18}/> </motion.button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Pagination UI */}
                {!loading && totalItems > ITEMS_PER_PAGE && (
                    <motion.div
                        variants={itemVariant}
                        className="flex flex-col sm:flex-row justify-between items-center mt-5 text-sm text-gray-600 dark:text-gray-400" // <<< UPGRADE: mt-5
                    >
                        <div>
                            Hiển thị <b>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</b> - <b>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</b> trên <b>{totalItems}</b> tài khoản
                        </div>
                        <nav className="flex items-center gap-1 mt-3 sm:mt-0">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow"> <CaretLeft size={16} weight="bold" /> </motion.button>
                            {paginationWindow.map((page, index) =>
                                typeof page === 'number' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        key={index}
                                        onClick={() => setCurrentPage(page)}
                                        disabled={currentPage === page || isFetchingPage}
                                        className={`pagination-number ${currentPage === page ? 'pagination-active' : ''}`}
                                    > {page} </motion.button>
                                ) : (
                                    <span key={index} className="pagination-dots"> ... </span>
                                )
                            )}
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow"> <CaretRight size={16} weight="bold" /> </motion.button>
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

            {/* CSS */}
            <style jsx>{`
                /* <<< UPGRADE: Tăng padding, focus rõ hơn */
                .search-input { @apply w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition disabled:opacity-50; }
                
                /* <<< UPGRADE: Tăng padding */
                .th-style { @apply px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm; } /* Tăng py-4 */
                
                .td-center { @apply px-6 text-center; } /* Bỏ py-10 để dùng py-20 ở trên */
                
                /* <<< UPGRADE: Tăng padding */
                .badge-base { @apply px-3 py-1 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-gray { @apply badge-base bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300; }
                
                .badge-role-admin { @apply badge-base bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300; }
                .badge-role-manager { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-role-staff { @apply badge-base bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300; }
                .badge-role-user { @apply badge-base bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300; }
                .badge-role-supplier { @apply badge-base bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300; }

                /* <<< UPGRADE: Tăng padding */
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-primary { @apply bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-9 h-9 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; } /* <<< UPGRADE: w-9 h-9 */
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                
                /* <<< UPGRADE: Tăng padding, focus rõ hơn */
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-2.5 rounded-md w-full dark:bg-slate-700 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition text-sm disabled:opacity-70; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5; } /* <<< UPGRADE: mb-1.5 */
                
                /* <<< UPGRADE: Tăng padding */
                .modal-button-secondary { @apply px-5 py-2.5 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-primary { @apply px-5 py-2.5 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50 transition-colors; }
                .modal-button-danger { @apply px-5 py-2.5 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50 transition-colors; }
                
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                
                .password-toggle-btn {
                    @apply absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors;
                }
            `}</style>
        </motion.div>
    );
}
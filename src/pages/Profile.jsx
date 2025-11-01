// src/pages/Profile.jsx
/* *** (SỬA THEO YÊU CẦU) NÂNG CẤP v24 (Sửa Lỗi Upload 400) ***
  1. (Logic) Sửa hàm `uploadFile` trong `IdentityForm`.
  2. (Logic) Thêm tham số thứ 3 (fileOptions) vào lệnh `supabase.storage.upload()`.
  3. (Logic) Thêm `{ contentType: file.type }` để fix lỗi "Missing a Content-Type header".
*/
/* (Nâng cấp v23, v22 - Giữ nguyên) */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { 
    User, Envelope, Phone, House, CalendarBlank, Key, IdentificationCard, 
    UploadSimple, CircleNotch, PaperPlaneRight, Lock, Eye, EyeSlash, CheckCircle, 
    WarningCircle, ShieldCheck, FileArrowUp, XCircle, Info, Sparkle, Palette 
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = getSupabase();

// --- (v22) Component con: Cập nhật Thông tin ---
const ProfileInfoForm = ({ user, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: '', phone_number: '', address: '', ngay_sinh: '', 
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
                ngay_sinh: user.ngay_sinh ? user.ngay_sinh.split('T')[0] : '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updates = {
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                address: formData.address,
                ngay_sinh: formData.ngay_sinh || null,
            };

            const { error: updateError } = await supabase
                .from('Users')
                .update(updates)
                .eq('id', user.id);
            if (updateError) throw updateError;

            const { data: { user: authUser }, error: authUpdateError } = await supabase.auth.updateUser({
                data: updates
            });
            if (authUpdateError) throw authUpdateError;

            toast.success('Cập nhật thông tin thành công!');
            if (onProfileUpdate) onProfileUpdate(authUser); // Cập nhật context

        } catch (error) {
            toast.error(`Lỗi cập nhật: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Info size={24} className="text-indigo-600" /> Thông tin Cơ bản
            </h3>
            
            <InputGroup label="Email (Không thể đổi)">
                <Envelope className="input-icon text-pink-600" size={18} />
                <input type="email" value={user.email || ''} className="input-field" disabled />
            </InputGroup>

            <InputGroup label="Họ và Tên">
                <User className="input-icon text-green-600" size={18} />
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-field" required />
            </InputGroup>

            <InputGroup label="Số điện thoại">
                <Phone className="input-icon text-yellow-600" size={18} />
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="input-field" />
            </InputGroup>

            <InputGroup label="Địa chỉ">
                <House className="input-icon text-purple-600" size={18} />
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" required minLength={10} />
            </InputGroup>

            <InputGroup label="Ngày sinh">
                <CalendarBlank className="input-icon text-red-600" size={18} />
                <input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} className="input-field" />
            </InputGroup>

            <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                <motion.button 
                    type="submit" 
                    disabled={loading}
                    className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[150px] bg-gradient-to-r from-sky-500 to-indigo-500"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    {loading ? <CircleNotch size={18} className="animate-spin" /> : <Sparkle size={18} />}
                    Lưu thay đổi
                </motion.button>
            </div>
        </form>
    );
};

// --- (v22) Component con: Đổi Mật khẩu ---
const ChangePasswordForm = ({ user }) => {
    // ... (Giữ nguyên code ChangePasswordForm)
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [form, setForm] = useState({ otp: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const ADMIN_PHONE = "0912345678"; // (Giống Login.jsx)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSendRequest = async () => {
        setLoading(true);
        try {
            const { error: insertError } = await supabase
                .from('password_reset_requests')
                .insert({ 
                    email: user.email, 
                    is_resolved: false,
                    requested_at: new Date().toISOString()
                });
            if (insertError) throw insertError;
            
            toast.success(`Yêu cầu đã gửi! Vui lòng liên hệ Admin (SĐT: ${ADMIN_PHONE}) để nhận mã OTP.`);
            setIsOtpSent(true);
        } catch (error) {
            toast.error(`Lỗi gửi yêu cầu: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!form.otp || form.otp.length !== 6) throw new Error("Vui lòng nhập Mã OTP 6 số (do Admin cung cấp).");
            if (form.password.length < 6) throw new Error("Vui lòng nhập Mật khẩu mới (tối thiểu 6 ký tự).");
            if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
            
            const { data, error: functionError } = await supabase.functions.invoke('reset-password-with-admin-otp', {
                body: {
                    email: user.email,
                    otp: form.otp,
                    newPassword: form.password
                }
            });

            if (functionError) throw new Error(`Lỗi thực thi server: ${functionError.message}`);
            if (data && data.error) throw new Error(data.error);
            
            toast.success("Đổi mật khẩu thành công! 🎉");
            setForm({ otp: '', password: '', confirm: '' });
            setIsOtpSent(false);

        } catch (error) {
            toast.error(`Lỗi đổi mật khẩu: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <ShieldCheck size={24} className="text-orange-600" /> Bảo mật & Đăng nhập
            </h3>
            
            {!isOtpSent ? (
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800/60 to-indigo-900/30 p-5 rounded-2xl border dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Để đổi mật khẩu, bạn cần yêu cầu một mã OTP từ Admin (Quản trị viên) để xác thực.
                    </p>
                    <motion.button 
                        onClick={handleSendRequest}
                        disabled={loading}
                        className="modal-button-primary-pro bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 to-red-700 shadow-orange-500/30 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        {loading ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneRight size={18} />}
                        Gửi Yêu Cầu Đổi Mật Khẩu
                    </motion.button>
                </div>
            ) : (
                <form onSubmit={handleChangePassword} className="space-y-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800/60 to-indigo-900/30 p-5 rounded-2xl border dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Vui lòng liên hệ Admin (SĐT: <strong className="text-slate-800 dark:text-white">{ADMIN_PHONE}</strong>) để nhận Mã OTP.
                    </p>
                    <InputGroup label="Mã OTP 6 số">
                        <Key className="input-icon text-blue-600" size={18} />
                        <input type="text" name="otp" value={form.otp} onChange={handleChange} className="input-field" required />
                    </InputGroup>
                    
                    <InputGroup label="Mật khẩu mới (tối thiểu 6 ký tự)">
                        <Lock className="input-icon text-teal-600" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" value={form.password} onChange={handleChange} 
                            className="input-field pr-10" required 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                    </InputGroup>

                    <InputGroup label="Xác nhận mật khẩu mới">
                        <Lock className="input-icon text-cyan-600" size={18} />
                        <input 
                            type={showConfirm ? "text" : "password"} 
                            name="confirm" value={form.confirm} onChange={handleChange} 
                            className="input-field pr-10" required 
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="password-toggle-btn">
                            {showConfirm ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                    </InputGroup>

                    <div className="flex justify-end pt-4 border-t dark:border-slate-700 gap-3">
                         <motion.button 
                            type="button" 
                            onClick={() => setIsOtpSent(false)}
                            disabled={loading}
                            className="modal-button-secondary-pro bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 to-slate-700"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            Hủy
                        </motion.button>
                        <motion.button 
                            type="submit" 
                            disabled={loading}
                            className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[150px] bg-gradient-to-r from-green-500 to-teal-500"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            Xác nhận Đổi
                        </motion.button>
                    </div>
                </form>
            )}
        </div>
    );
};

// --- (v23) Component con: Xác thực CMND/CCCD (ĐÃ SỬA) ---
const IdentityForm = ({ user }) => {
    const [identity, setIdentity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    
    const fetchIdentity = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_identity')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (data) {
                setIdentity(data);
                setIsEditing(false); // Bắt đầu ở chế độ xem
            } else {
                setIdentity(null);
                setIsEditing(true); // Nếu chưa có, mở form chỉnh sửa (upload)
            }
            if (error && error.code !== 'PGRST116') throw error;
        } catch (error) {
            toast.error(`Lỗi tải thông tin CMND: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchIdentity();
    }, [fetchIdentity]);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'front') setFrontImage(file);
            if (type === 'back') setBackImage(file);
        }
    };

    // --- (SỬA v24) HÀM UPLOAD ĐÃ SỬA ---
    const uploadFile = async (file, type) => {
        if (!file) return null;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // (SỬA v24) Thêm fileOptions (tham số thứ 3)
        const fileOptions = {
            contentType: file.type || 'image/png' // Lấy MIME type của file
        };

        const { error: uploadError } = await supabase.storage
            .from('id-scans')
            .upload(filePath, file, fileOptions); // <<< ĐÃ THÊM fileOptions

        if (uploadError) throw uploadError;
        
        return filePath;
    };
    // --- KẾT THÚC SỬA v24 ---

    // (SỬA v23) handleSubmit đã được đơn giản hóa
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // (SỬA v23) Chỉ kiểm tra file, không cần kiểm tra formData
        if (!frontImage && !identity?.front_image_url) {
            toast.error("Vui lòng tải lên ảnh mặt trước.");
            return;
        }
        if (!backImage && !identity?.back_image_url) {
            toast.error("Vui lòng tải lên ảnh mặt sau.");
            return;
        }
        
        setIsUploading(true);
        try {
            // 1. Upload ảnh
            const front_image_path = await uploadFile(frontImage, 'front');
            const back_image_path = await uploadFile(backImage, 'back');

            const updates = {
                id: user.id,
                status: 'pending', // Luôn đặt là pending khi cập nhật
                // Chỉ cập nhật nếu có file mới
                ...(front_image_path && { front_image_url: front_image_path }),
                ...(back_image_path && { back_image_url: back_image_path }),
                
                // (SỬA v23) Xóa các trường tự nhập, admin sẽ điền sau
                // (SỬA v24) Set là null KHI lần đầu gửi, KHÔNG set là null khi CẬP NHẬT
                ...(!identity && { // Chỉ set là null nếu đây là lần đầu (chưa có identity)
                    id_number: null,
                    full_name: null,
                    dob: null,
                    issue_date: null,
                    issue_place: null,
                })
            };

            // 2. Upsert (Insert hoặc Update) thông tin
            const { error } = await supabase
                .from('user_identity')
                .upsert(updates, { onConflict: 'id' });
            
            if (error) throw error;

            toast.success('Đã gửi thông tin xác thực! Vui lòng chờ Admin duyệt.');
            setFrontImage(null);
            setBackImage(null);
            fetchIdentity(); // Tải lại dữ liệu
            setIsEditing(false); // Quay về chế độ View

        } catch (error) {
            toast.error(`Lỗi gửi thông tin: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-10"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>;
    }

    // (SỬA v23) Giao diện khi đã gửi (chế độ View)
    if (identity && !isEditing) {
        let statusBadge;
        switch (identity.status) {
            case 'approved':
                statusBadge = (
                    <div className="badge-status-pro bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 to-green-800/30 text-green-800 dark:text-green-300">
                        <CheckCircle weight="bold" className="text-green-600" /> Đã Xác Thực
                    </div>
                );
                break;
            case 'rejected':
                 statusBadge = (
                    <div className="badge-status-pro bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 to-red-800/30 text-red-800 dark:text-red-300">
                        <XCircle weight="bold" className="text-red-600" /> Bị Từ Chối
                    </div>
                );
                break;
            default: // pending
                statusBadge = (
                    <div className="badge-status-pro bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 to-yellow-800/30 text-yellow-800 dark:text-yellow-300">
                        <WarningCircle weight="bold" className="text-yellow-600" /> Đang Chờ Duyệt
                    </div>
                );
        }

        return (
            <div className="">
                <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Palette size={24} className="text-violet-600" /> Xác thực Danh tính (CMND/CCCD)
                </h3>
                <div className="bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-800/60 to-violet-900/30 p-5 rounded-2xl border dark:border-slate-700 space-y-3">
                    {statusBadge}
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 pt-2">
                        Trạng thái hồ sơ của bạn. Bạn có thể gửi lại thông tin nếu bị từ chối hoặc cần cập nhật.
                    </p>
                    
                    <motion.button 
                        onClick={() => setIsEditing(true)}
                        className="modal-button-secondary-pro mt-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        <Sparkle size={18} className="inline mr-2" /> Cập nhật / Gửi lại thông tin
                    </motion.button>
                </div>
            </div>
        );
    }

    // (SỬA v23) Giao diện Form (chỉ còn Upload)
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Palette size={24} className="text-violet-600" /> {identity ? 'Cập nhật Thông tin Xác thực' : 'Bổ sung Thông tin Xác thực (CMND/CCCD)'}
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 -mt-2">
                Vui lòng tải lên ảnh scan 2 mặt CMND/CCCD của bạn. Admin sẽ xem xét và điền thông tin giúp bạn.
            </p>

            {/* (v22) Upload Ảnh giống input-field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Ảnh Scan Mặt trước CMND/CCCD">
                    <label htmlFor="front-image-upload" className="input-file-label-pro relative flex items-center gap-2 cursor-pointer">
                        <FileArrowUp className="input-icon text-sky-600" size={18} />
                        <span className="w-full input-field flex items-center truncate">
                            {frontImage ? frontImage.name : (identity?.front_image_url ? "Đã tải lên (Mặt trước)" : 'Nhấp để tải lên')}
                        </span>
                    </label>
                    <input id="front-image-upload" type="file" onChange={(e) => handleFileChange(e, 'front')} className="hidden" accept="image/*" />
                </InputGroup>
                
                <InputGroup label="Ảnh Scan Mặt sau CMND/CCCD">
                    <label htmlFor="back-image-upload" className="input-file-label-pro relative flex items-center gap-2 cursor-pointer">
                        <FileArrowUp className="input-icon text-pink-600" size={18} />
                        <span className="w-full input-field flex items-center truncate">
                            {backImage ? backImage.name : (identity?.back_image_url ? "Đã tải lên (Mặt sau)" : 'Nhấp để tải lên')}
                        </span>
                    </label>
                    <input id="back-image-upload" type="file" onChange={(e) => handleFileChange(e, 'back')} className="hidden" accept="image/*" />
                </InputGroup>
            </div>


            <div className="flex justify-end pt-4 border-t dark:border-slate-700 gap-3">
                {identity && ( // Chỉ hiển thị nút Hủy nếu đang ở chế độ "Cập nhật" (đã có data)
                    <motion.button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        disabled={isUploading}
                        className="modal-button-secondary-pro bg-gradient-to-r from-red-500 to-rose-500 text-white"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        <XCircle size={18} className="inline mr-2" /> Hủy
                    </motion.button>
                )}
                <motion.button 
                    type="submit" 
                    disabled={isUploading}
                    className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[150px] bg-gradient-to-r from-lime-500 to-green-500"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    {isUploading ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneRight size={18} />}
                    Gửi thông tin
                </motion.button>
            </div>
        </form>
    );
};


// --- (v22) Component Helper: InputGroup ---
// (v22) Thay đổi cấu trúc: Bỏ label flex, thêm relative div, icon absolute, label riêng trên
const InputGroup = ({ label, children, icon }) => (
    <div className="space-y-1">
        <label className="label-style block">{label}</label>
        <div className="relative">
            {children}
        </div>
    </div>
);

// --- (v21) Component Helper: TabButton ---
const TabButton = ({ label, icon, isActive, onClick, colorClass }) => (
    <motion.button
        onClick={onClick}
        className={`tab-button ${isActive ? 'tab-button-active' : ''} ${colorClass}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span>{label}</span>
    </motion.button>
);


// --- (v22) Component Chính: Profile ---
export default function Profile() {
    const { user, loading, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'identity'

    // Chuyển hướng nếu chưa đăng nhập
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Hàm callback để cập nhật context sau khi profile được sửa
    const handleProfileUpdate = (updatedAuthUser) => {
        refreshUser(updatedAuthUser); // Gọi hàm refresh từ AuthContext
    };

    if (loading || !user) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900">
                <CircleNotch size={40} className="animate-spin text-sky-500" />
            </div>
        );
    }

    // (v22) Giao diện chính với style panel giống Login
    return (
        <div className="bg-gradient-to-br from-slate-100 to-sky-50 dark:from-slate-900 to-sky-950 min-h-screen font-inter">
            {/* Header (Giả, vì Navbar đã fixed) */}
            <div className="h-20" /> 
            
            <motion.div 
                className="max-w-6xl mx-auto p-4 md:p-8 space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Tiêu đề trang */}
                <div className="mb-8">
                    <h1 className="text-3xl font-sora font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <User weight="duotone" className="text-sky-600" size={36} />
                        Tài Khoản Của Tôi
                    </h1>
                    <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                        Quản lý thông tin tài khoản và xác thực danh tính của bạn.
                    </p>
                </div>

                {/* (v22) Layout 2 Cột */}
                <div className="md:flex md:gap-8">
                    
                    {/* (v22) Cột 1: Sidebar Tabs */}
                    <aside className="md:w-1/4 mb-6 md:mb-0">
                        <nav className="flex flex-col gap-2 sticky top-24">
                            <TabButton
                                label="Thông tin Chung"
                                icon={<Info className="text-indigo-600" />}
                                isActive={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                                colorClass="hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                            />
                            <TabButton
                                label="Bảo mật & Mật khẩu"
                                icon={<ShieldCheck className="text-orange-600" />}
                                isActive={activeTab === 'password'}
                                onClick={() => setActiveTab('password')}
                                colorClass="hover:bg-orange-100 dark:hover:bg-orange-900/50"
                            />
                            <TabButton
                                label="Xác thực CMND/CCCD"
                                icon={<IdentificationCard className="text-violet-600" />}
                                isActive={activeTab === 'identity'}
                                onClick={() => setActiveTab('identity')}
                                colorClass="hover:bg-violet-100 dark:hover:bg-violet-900/50"
                            />
                        </nav>
                    </aside>

                    {/* (v22) Cột 2: Content Panel giống Login */}
                    <main className="md:w-3/4">
                        <motion.div 
                            className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 shadow-xl rounded-3xl overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="p-6 md:p-8 text-slate-800 dark:text-white"
                                >
                                    {activeTab === 'profile' && (
                                        <ProfileInfoForm user={user} onProfileUpdate={handleProfileUpdate} />
                                    )}
                                    {activeTab === 'password' && (
                                        <ChangePasswordForm user={user} />
                                    )}
                                    {activeTab === 'identity' && (
                                        <IdentityForm user={user} />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </main>

                </div>
            </motion.div>

            {/* (v22) CSS giống Login */}
            <style jsx>{`
                .label-style { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5; }
                
                .input-field { 
                    @apply w-full pl-11 py-3 border border-white/30 dark:border-slate-700/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-slate-800 dark:text-white 
                           focus:border-sky-400 focus:bg-white/15 dark:focus:bg-slate-900/30 focus:ring-0 outline-none transition text-sm disabled:opacity-60 disabled:cursor-not-allowed backdrop-blur-sm;
                }
                .input-field::placeholder {
                    @apply text-slate-400 dark:text-slate-500;
                }
                
                /* (v22) Sửa lại cho khớp v22 */
                input[type="date"].input-field {
                    position: relative;
                    color-scheme: dark;
                }
                input[type="date"].input-field::-webkit-datetime-edit-text,
                input[type="date"].input-field::-webkit-datetime-edit-month-field,
                input[type="date"].input-field::-webkit-datetime-edit-day-field,
                input[type="date"].input-field::-webkit-datetime-edit-year-field {
                   color: rgba(255, 255, 255, 0.6);
                }
                input[type="date"].input-field:valid {
                   color: #FFFFFF;
                }

                .input-icon {
                    @apply absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none z-10;
                }
                
                .password-toggle-btn {
                    @apply absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors z-10;
                }

                /* (v22) Nút Tab Sidebar */
                .tab-button {
                    @apply flex items-center gap-3 w-full p-3 rounded-2xl text-base font-medium
                           text-slate-600 dark:text-slate-300
                           hover:bg-slate-100 dark:hover:bg-slate-700
                           transition-colors duration-200;
                }
                .tab-button-active {
                    @apply bg-white dark:bg-slate-700/50 text-sky-700 dark:text-sky-400 font-semibold shadow-sm;
                }

                /* (v22) Trạng thái xác thực (Badge) */
                .badge-status-pro {
                    @apply px-4 py-2 text-sm font-semibold rounded-2xl inline-flex items-center gap-2 border border-black/5 dark:border-white/5;
                }

                /* (v22) Upload "Giống input-field" */
                .input-file-label-pro {
                    @apply flex items-center justify-start gap-2 w-full py-3 pl-11 pr-3 border border-white/30 dark:border-slate-700/50 rounded-xl bg-white/10 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 
                           hover:border-sky-400 hover:bg-white/15 dark:hover:bg-slate-900/30 transition-all duration-300 cursor-pointer backdrop-blur-sm;
                }
                .input-file-label-pro .input-field {
                    @apply border-none bg-transparent p-0 m-0 backdrop-blur-none;
                }
                .input-file-label-pro .input-icon {
                    @apply top-[1.1rem]; /* Căn chỉnh lại icon */
                }


                .modal-button-secondary-pro { 
                    @apply px-5 py-2.5 bg-slate-100 hover:bg-slate-200 
                           dark:bg-slate-700 dark:hover:bg-slate-600 
                           text-slate-800 dark:text-slate-100
                           rounded-2xl font-semibold text-sm disabled:opacity-50 transition-colors;
                }
                .modal-button-primary-pro { 
                    @apply px-5 py-2.5 bg-sky-600 text-white 
                           rounded-2xl font-semibold hover:bg-sky-700 
                           text-sm disabled:opacity-50 transition-colors shadow-lg shadow-sky-500/30;
                }
            `}</style>
        </div>
    );
}
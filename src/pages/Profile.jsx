// src/pages/Profile.jsx
// (NÂNG CẤP v20) "ĐỈNH NÓC" - Thiết kế lại toàn bộ giao diện
// 1. Layout 2 cột (Sidebar Tabs + Content)
// 2. Thêm hiệu ứng Framer Motion mượt mà khi chuyển tab
// 3. Thêm nhiều icon màu mè
// 4. Thiết kế lại khu vực Upload File (Scan CMND) thành dạng Dropzone "xịn xò"

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { 
    User, Envelope, Phone, House, CalendarBlank, Key, IdentificationCard, 
    UploadSimple, CircleNotch, PaperPlaneRight, Lock, Eye, EyeSlash, CheckCircle, 
    WarningCircle, ShieldCheck, FileArrowUp, XCircle // Thêm icon
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = getSupabase();

// --- (v19) Component con: Cập nhật Thông tin ---
// (v20) Sửa lại: Bỏ thẻ <form>, <h3
const ProfileInfoForm = ({ user, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: '', phone_number: '', address: '', ngay_sinh: '', username: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
                ngay_sinh: user.ngay_sinh ? user.ngay_sinh.split('T')[0] : '',
                username: user.username || 'N/A'
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
            <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6">Thông tin Cơ bản</h3>
            
            <InputGroup icon={<User />} label="Tên đăng nhập (Không thể đổi)">
                <input type="text" value={formData.username} className="input-style-pro" disabled />
            </InputGroup>
            
            <InputGroup icon={<Envelope />} label="Email (Không thể đổi)">
                <input type="email" value={user.email || ''} className="input-style-pro" disabled />
            </InputGroup>

            <InputGroup icon={<User />} label="Họ và Tên">
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-style-pro" required />
            </InputGroup>

            <InputGroup icon={<Phone />} label="Số điện thoại">
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="input-style-pro" />
            </InputGroup>

            <InputGroup icon={<House />} label="Địa chỉ">
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-style-pro" required minLength={10} />
            </InputGroup>

            <InputGroup icon={<CalendarBlank />} label="Ngày sinh">
                <input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} className="input-style-pro" />
            </InputGroup>

            <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                <motion.button 
                    type="submit" 
                    disabled={loading}
                    className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[150px]"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    {loading ? <CircleNotch size={18} className="animate-spin" /> : 'Lưu thay đổi'}
                </motion.button>
            </div>
        </form>
    );
};

// --- (v19) Component con: Đổi Mật khẩu (Giống Login.jsx) ---
// (v20) Sửa lại: Bỏ thẻ <form>, <h3
const ChangePasswordForm = ({ user }) => {
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
            <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6">Bảo mật & Đăng nhập</h3>
            
            {!isOtpSent ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Để đổi mật khẩu, bạn cần yêu cầu một mã OTP từ Admin (Quản trị viên) để xác thực.
                    </p>
                    <motion.button 
                        onClick={handleSendRequest}
                        disabled={loading}
                        className="modal-button-primary-pro bg-orange-600 hover:bg-orange-700 shadow-orange-500/30 flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        {loading ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneRight size={18} />}
                        Gửi Yêu Cầu Đổi Mật Khẩu
                    </motion.button>
                </div>
            ) : (
                <form onSubmit={handleChangePassword} className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Vui lòng liên hệ Admin (SĐT: <strong className="text-slate-800 dark:text-white">{ADMIN_PHONE}</strong>) để nhận Mã OTP.
                    </p>
                    <InputGroup icon={<Key />} label="Mã OTP 6 số">
                        <input type="text" name="otp" value={form.otp} onChange={handleChange} className="input-style-pro" required />
                    </InputGroup>
                    
                    <InputGroup icon={<Lock />} label="Mật khẩu mới (tối thiểu 6 ký tự)">
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" value={form.password} onChange={handleChange} 
                                className="input-style-pro pr-10" required 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </InputGroup>

                    <InputGroup icon={<Lock />} label="Xác nhận mật khẩu mới">
                        <div className="relative">
                            <input 
                                type={showConfirm ? "text" : "password"} 
                                name="confirm" value={form.confirm} onChange={handleChange} 
                                className="input-style-pro pr-10" required 
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="password-toggle-btn">
                                {showConfirm ? <EyeSlash size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </InputGroup>

                    <div className="flex justify-end pt-4 border-t dark:border-slate-700 gap-3">
                         <motion.button 
                            type="button" 
                            onClick={() => setIsOtpSent(false)}
                            disabled={loading}
                            className="modal-button-secondary-pro"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            Hủy
                        </motion.button>
                        <motion.button 
                            type="submit" 
                            disabled={loading}
                            className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[150px]"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            {loading ? <CircleNotch size={18} className="animate-spin" /> : 'Xác nhận Đổi'}
                        </motion.button>
                    </div>
                </form>
            )}
        </div>
    );
};

// --- (v19) Component con: Xác thực CMND/CCCD ---
// (v20) Sửa lại: Bỏ thẻ <form>, <h3, nâng cấp UI Upload
const IdentityForm = ({ user }) => {
    const [identity, setIdentity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        id_number: '', full_name: '', dob: '', issue_date: '', issue_place: ''
    });
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
                setFormData({
                    id_number: data.id_number || '',
                    full_name: data.full_name || user.full_name || '',
                    dob: data.dob ? data.dob.split('T')[0] : (user.ngay_sinh ? user.ngay_sinh.split('T')[0] : ''),
                    issue_date: data.issue_date ? data.issue_date.split('T')[0] : '',
                    issue_place: data.issue_place || '',
                });
                setIsEditing(false); // Bắt đầu ở chế độ xem
            } else {
                setIdentity(null);
                setFormData({
                    id_number: '', 
                    full_name: user.full_name || '', 
                    dob: user.ngay_sinh ? user.ngay_sinh.split('T')[0] : '', 
                    issue_date: '', 
                    issue_place: ''
                });
                setIsEditing(true); 
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

    const uploadFile = async (file, type) => {
        if (!file) return null;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('id-scans') // Tên bucket đã tạo ở SQL
            .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Trả về đường dẫn để lưu vào DB (dùng để tạo signedURL sau)
        return filePath;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            // 1. Upload ảnh (nếu có)
            // (v20) Sửa lại logic: Chỉ upload khi có file mới
            let front_image_url = identity?.front_image_url || null;
            if (frontImage) {
                front_image_url = await uploadFile(frontImage, 'front');
            }

            let back_image_url = identity?.back_image_url || null;
            if (backImage) {
                back_image_url = await uploadFile(backImage, 'back');
            }
            
            const updates = {
                ...formData,
                id: user.id,
                status: 'pending', // Luôn đặt là pending khi cập nhật
                front_image_url: front_image_url,
                back_image_url: back_image_url,
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
            setIsEditing(false);

        } catch (error) {
            toast.error(`Lỗi gửi thông tin: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-10"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>;
    }

    // (v20) Giao diện khi đã gửi và đang chờ duyệt
    if (identity && !isEditing) {
        let statusBadge;
        switch (identity.status) {
            case 'approved':
                statusBadge = (
                    <div className="badge-status-pro bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        <CheckCircle weight="bold" /> Đã Xác Thực
                    </div>
                );
                break;
            case 'rejected':
                 statusBadge = (
                    <div className="badge-status-pro bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                        <XCircle weight="bold" /> Bị Từ Chối
                    </div>
                );
                break;
            default: // pending
                statusBadge = (
                    <div className="badge-status-pro bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        <WarningCircle weight="bold" /> Đang Chờ Duyệt
                    </div>
                );
        }

        return (
            <div className="">
                <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6">Xác thực Danh tính (CMND/CCCD)</h3>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border dark:border-slate-700 space-y-3">
                    {statusBadge}
                    <p className="text-sm text-slate-600 dark:text-slate-300 pt-2"><strong>Số CMND/CCCD:</strong> {identity.id_number}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Họ và tên:</strong> {identity.full_name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Ngày sinh:</strong> {new Date(identity.dob).toLocaleDateString('vi-VN')}</p>
                    
                    <motion.button 
                        onClick={() => setIsEditing(true)}
                        className="modal-button-secondary-pro mt-4"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        Cập nhật / Gửi lại thông tin
                    </motion.button>
                </div>
            </div>
        );
    }

    // (v20) Giao diện Form (khi chưa có, hoặc khi bấm "Cập nhật")
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6">
                {identity ? 'Cập nhật Thông tin Xác thực' : 'Bổ sung Thông tin Xác thực (CMND/CCCD)'}
            </h3>
            
            <InputGroup icon={<IdentificationCard />} label="Số CMND/CCCD">
                <input type="text" name="id_number" value={formData.id_number} onChange={(e) => setFormData({...formData, id_number: e.target.value})} className="input-style-pro" required />
            </InputGroup>

            <InputGroup icon={<User />} label="Họ và Tên (Trên CMND)">
                <input type="text" name="full_name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="input-style-pro" required />
            </InputGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup icon={<CalendarBlank />} label="Ngày sinh (Trên CMND)">
                    <input type="date" name="dob" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="input-style-pro" required />
                </InputGroup>
                <InputGroup icon={<CalendarBlank />} label="Ngày cấp">
                    <input type="date" name="issue_date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} className="input-style-pro" required />
                </InputGroup>
            </div>

            <InputGroup icon={<House />} label="Nơi cấp">
                <input type="text" name="issue_place" value={formData.issue_place} onChange={(e) => setFormData({...formData, issue_place: e.target.value})} className="input-style-pro" required />
            </InputGroup>

            {/* (v20) Upload Ảnh "Xịn Xò" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup icon={<FileArrowUp />} label="Ảnh Scan Mặt trước CMND/CCCD">
                    <label htmlFor="front-image-upload" className="input-file-label-pro">
                        <UploadSimple size={20} />
                        <span>{frontImage ? frontImage.name : 'Nhấp để tải lên'}</span>
                    </label>
                    <input id="front-image-upload" type="file" onChange={(e) => handleFileChange(e, 'front')} className="hidden" accept="image/*" />
                </InputGroup>
                
                <InputGroup icon={<FileArrowUp />} label="Ảnh Scan Mặt sau CMND/CCCD">
                     <label htmlFor="back-image-upload" className="input-file-label-pro">
                        <UploadSimple size={20} />
                        <span>{backImage ? backImage.name : 'Nhấp để tải lên'}</span>
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
                        className="modal-button-secondary-pro"
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        Hủy
                    </motion.button>
                )}
                <motion.button 
                    type="submit" 
                    disabled={isUploading}
                    className="modal-button-primary-pro flex items-center justify-center gap-2 min-w-[150px]"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    {isUploading ? <CircleNotch size={18} className="animate-spin" /> : 'Gửi thông tin'}
                </motion.button>
            </div>
        </form>
    );
};


// --- (v19) Component Helper: InputGroup ---
const InputGroup = ({ icon, label, children }) => (
    <div>
        <label className="label-style flex items-center gap-2">
            {React.cloneElement(icon, { size: 18, className: "text-sky-600 dark:text-sky-500" })}
            <span>{label}</span>
        </label>
        {children}
    </div>
);

// --- (v20) Component Helper: TabButton ---
const TabButton = ({ label, icon, isActive, onClick }) => (
    <motion.button
        onClick={onClick}
        className={`tab-button ${isActive ? 'tab-button-active' : ''}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span>{label}</span>
    </motion.button>
);


// --- (v20) Component Chính: Profile (Đã thiết kế lại) ---
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

    // (v20) Giao diện chính "Đỉnh Nóc"
    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-inter">
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

                {/* (v20) Layout 2 Cột */}
                <div className="md:flex md:gap-8">
                    
                    {/* (v20) Cột 1: Sidebar Tabs */}
                    <aside className="md:w-1/4 mb-6 md:mb-0">
                        <nav className="flex flex-col gap-2 sticky top-24">
                            <TabButton
                                label="Thông tin Chung"
                                icon={<IdentificationCard />}
                                isActive={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                            />
                            <TabButton
                                label="Bảo mật & Mật khẩu"
                                icon={<ShieldCheck />}
                                isActive={activeTab === 'password'}
                                onClick={() => setActiveTab('password')}
                            />
                            <TabButton
                                label="Xác thực CMND/CCCD"
                                icon={<User />}
                                isActive={activeTab === 'identity'}
                                onClick={() => setActiveTab('identity')}
                            />
                        </nav>
                    </aside>

                    {/* (v20) Cột 2: Content Panel */}
                    <main className="md:w-3/4">
                        <motion.div 
                            className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/50"
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
                                    className="p-6 md:p-8"
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

            {/* (v20) CSS "Xịn" */}
            <style jsx>{`
                .label-style { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5; }
                
                .input-style-pro { 
                    @apply border border-slate-200 dark:border-slate-700 
                           p-3 rounded-xl w-full 
                           bg-slate-100 dark:bg-slate-800/60
                           text-slate-800 dark:text-slate-100
                           focus:bg-white dark:focus:bg-slate-900 
                           focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500
                           outline-none transition text-sm disabled:opacity-60 disabled:cursor-not-allowed;
                }
                
                /* (v20) Nút Tab Sidebar */
                .tab-button {
                    @apply flex items-center gap-3 w-full p-3 rounded-lg text-base font-medium
                           text-slate-600 dark:text-slate-300
                           hover:bg-slate-100 dark:hover:bg-slate-700
                           transition-colors duration-200;
                }
                .tab-button-active {
                    @apply bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 font-semibold;
                }

                /* (v20) Trạng thái xác thực (Badge) */
                .badge-status-pro {
                    @apply px-4 py-2 text-sm font-semibold rounded-lg inline-flex items-center gap-2;
                }

                /* (v20) Upload "Xịn" */
                .input-file-label-pro {
                    @apply flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 
                           text-slate-500 dark:text-slate-400 cursor-pointer 
                           hover:border-sky-500 hover:text-sky-600 dark:hover:border-sky-500 dark:hover:text-sky-400 
                           hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all duration-300;
                }

                .modal-button-secondary-pro { 
                    @apply px-5 py-2.5 bg-slate-100 hover:bg-slate-200 
                           dark:bg-slate-700 dark:hover:bg-slate-600 
                           text-slate-800 dark:text-slate-100
                           rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors;
                }
                .modal-button-primary-pro { 
                    @apply px-5 py-2.5 bg-sky-600 text-white 
                           rounded-xl font-semibold hover:bg-sky-700 
                           text-sm disabled:opacity-50 transition-colors shadow-lg shadow-sky-500/30;
                }
                .password-toggle-btn {
                    @apply absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors;
                }
            `}</style>
        </div>
    );
}
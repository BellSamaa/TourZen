// src/pages/Profile.jsx
/* *** (SỬA LỖI v38 - THEO YÊU CẦU) ***
  1. (Fix) THÊM LOGIC FETCH MỚI: Trang Profile giờ sẽ tự động fetch
     dữ liệu đầy đủ (SĐT, địa chỉ, v.v.) từ bảng 'Users'
     thay vì chỉ dựa vào 'useAuth()'.
  2. (Fix) ProfileInfoForm giờ sẽ nhận 'fullUserProfile' để
     hiển thị đúng dữ liệu SĐT, địa chỉ, ngày sinh.
  3. (Sửa) AnimatedNameDisplay giờ sẽ hiển thị 'customer_tier'
     (ví dụ: "Tiêu chuẩn") thay vì 'role' (ví dụ: "user").
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import Cropper from 'react-easy-crop'; // (Vẫn giữ lại phòng khi component khác cần)
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { getSupabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import {
  User, Envelope, Phone, House, CalendarBlank, Key, IdentificationCard,
  UploadSimple, CircleNotch, PaperPlaneRight, Lock, Eye, EyeSlash, CheckCircle,
  WarningCircle, ShieldCheck, FileArrowUp, XCircle, Info, Sparkle, Palette,
  Camera, Image, PaintBrush, TrashSimple, MagnifyingGlassPlus, Warning
  // (Đã xóa các icon không còn dùng cho Avatar/Banner)
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = getSupabase();
// (Thêm SĐT Admin từ Login.jsx)
const ADMIN_PHONE = "0912345678"; 

/* ------------------ Helper: getPublicUrlSafe (Vẫn giữ) ------------------ */
const getPublicUrlSafe = (bucket, path) => {
  if (!path) return null;
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    return null;
  }
};

/* ------------------ Crop Utility (Vẫn giữ) ------------------ */
async function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = () => resolve(image);
    image.onerror = error => reject(error);
    image.src = url;
  });
}
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

/* ------------------ UI Helpers ------------------ */
const InputGroup = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    <div className="relative">{children}</div>
  </div>
);

const TabButton = ({ label, icon, isActive, onClick, disabled = false }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-base font-medium
                ${isActive ? 'bg-white dark:bg-slate-700/50 text-sky-700 dark:text-sky-400 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
    whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
  >
    {React.cloneElement(icon, { size: 18 })}
    <span className="ml-2">{label}</span>
  </motion.button>
);

/* ------------------ ProfileInfoForm (GIỮ NGUYÊN) ------------------ */
// (Component này đã đọc/ghi đúng bảng 'Users' như bạn yêu cầu)
// (SỬA v38: Giờ nó sẽ nhận 'user' đầy đủ từ state của cha)
const ProfileInfoForm = ({ user, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: '', phone_number: '', address: '', ngay_sinh: '',
  });
  const [loading, setLoading] = useState(false);
  const { session } = useAuth(); // Lấy session để biết là user "thật" hay "ảo"

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

      // (Tắt RLS thì lệnh này sẽ chạy được)
      const { error: updateError } = await supabase
        .from('Users')
        .update(updates)
        .eq('id', user.id);
      if (updateError) throw updateError;

      // Cập nhật Auth (nếu là user "thật" - có session)
      if (session) {
         const { data: { user: authUser }, error: authUpdateError } = await supabase.auth.updateUser({
            data: { full_name: updates.full_name }
         });
         if (authUpdateError) throw authUpdateError;
         // (SỬA v38) Gọi onProfileUpdate để fetch lại dữ liệu
         if (onProfileUpdate) onProfileUpdate(authUser);
      } else {
         // Cập nhật localStorage cho user "ảo" (nếu có)
         const localUser = JSON.parse(localStorage.getItem('user'));
         if (localUser) {
           const updatedLocalUser = { ...localUser, ...updates };
           localStorage.setItem('user', JSON.stringify(updatedLocalUser));
           // (SỬA v38) Gọi onProfileUpdate để fetch lại dữ liệu
           if (onProfileUpdate) onProfileUpdate(updatedLocalUser);
         }
      }
      toast.success('Cập nhật thông tin thành công!');
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
        <Info size={22} className="text-sky-600" /> Thông tin Cơ bản
      </h3>
      <InputGroup label="Email (Không thể đổi)">
        <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-600" size={18} />
        <input type="email" value={user.email || ''} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" disabled />
      </InputGroup>
      <InputGroup label="Họ và Tên">
        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600" size={18} />
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" required />
      </InputGroup>
      <InputGroup label="Số điện thoại">
        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-600" size={18} />
        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" />
      </InputGroup>
      <InputGroup label="Địa chỉ">
        <House className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" size={18} />
        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" required minLength={10} />
      </InputGroup>
      <InputGroup label="Ngày sinh">
        <CalendarBlank className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-600" size={18} />
        <input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" />
      </InputGroup>
      <div className="flex justify-end pt-4 border-t dark:border-slate-700">
        <motion.button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-[#22d3ee] to-[#6366f1] text-white rounded-2xl font-semibold hover:scale-105 transition-transform inline-flex items-center gap-2"
        >
          {loading ? <CircleNotch size={18} className="animate-spin" /> : <Sparkle size={18} />}
          Lưu thay đổi
        </motion.button>
      </div>
    </form>
  );
};

/* ------------------ ChangePasswordForm (GIỮ NGUYÊN) ------------------ */
const ChangePasswordForm = ({ user, identity }) => {
  const [loading, setLoading] = useState(false);
  const { session } = useAuth(); 
  const isHybridUser = !session;

  // State cho "User thật" (Admin/Supabase Auth)
  const [emailSent, setEmailSent] = useState(false);
  
  // State cho "User ảo" (Admin OTP)
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- HÀM CHO "USER THẬT" (ADMIN) ---
  const handleSendResetEmail = async () => {
    setLoading(true);
    setEmailSent(false);
    try {
      const redirectTo = `${window.location.origin}/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectTo,
      });
      if (error) throw error;
      toast.success("Đã gửi email khôi phục. Vui lòng kiểm tra hộp thư của bạn.");
      setEmailSent(true);
    } catch (error) {
      toast.error(`Lỗi gửi email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // --- HÀM CHO "USER ẢO" (USER) ---
  const handleSendOtpRequest = async () => {
    setLoading(true);
    try {
      // 1. Gửi yêu cầu hỗ trợ (tạo bản ghi)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      const { error: insertError } = await supabase
        .from('password_reset_requests')
        .insert({
            email: user.email,
            is_resolved: false,
            requested_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
        });
      if (insertError) throw insertError;

      toast.success(`Yêu cầu đã gửi! Vui lòng liên hệ Admin (SĐT: ${ADMIN_PHONE}) để nhận mã OTP.`);
      setIsOtpSent(true);
    } catch (err) {
      toast.error(`Lỗi gửi yêu cầu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpPasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 2. Xác thực OTP và đổi mật khẩu
      if (!otp || otp.length !== 6) throw new Error("Vui lòng nhập Mã OTP 6 số.");
      if (!password || password.length < 6) throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      if (password !== confirm) throw new Error("Mật khẩu không khớp.");

      const { data: req, error: reqError } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('email', user.email)
        .eq('token', otp) // 'token' là cột chứa OTP
        .eq('is_resolved', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (reqError || !req) {
        throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
      }
      
      const hashedPassword = btoa(password); // Mã hóa Base64

      // Cập nhật mật khẩu trong bảng Users
      const { error: updateError } = await supabase
        .from('Users')
        .update({ password: hashedPassword }) 
        .eq('email', user.email);
      if (updateError) throw updateError;

      // Đánh dấu yêu cầu đã xử lý
      await supabase
        .from('password_reset_requests')
        .update({ is_resolved: true })
        .eq('id', req.id);

      toast.success("Đổi mật khẩu thành công!");
      setOtp("");
      setPassword("");
      setConfirm("");
      setIsOtpSent(false);
    } catch (err) {
      toast.error(`Lỗi đổi mật khẩu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="">
      <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <ShieldCheck size={22} className="text-orange-600" /> Bảo mật & Đăng nhập
      </h3>
      
      {/* <<< SỬA v36: Chọn chế độ dựa trên 'isHybridUser' >>> */}
      
      {isHybridUser ? (
        /* ----- CHẾ ĐỘ "USER ẢO" (ADMIN OTP) ----- */
        <form onSubmit={handleOtpPasswordChange} className="space-y-4">
          {!isOtpSent ? (
            /* --- Giai đoạn 1: Gửi yêu cầu --- */
            <div className="bg-gradient-to-br from-white/60 to-slate-50 dark:from-slate-800/60 p-5 rounded-2xl border dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Nhấn nút dưới đây để gửi yêu cầu hỗ trợ đổi mật khẩu cho tài khoản <strong>{user.email}</strong>.
              </p>
              <motion.button
                type="button"
                onClick={handleSendOtpRequest}
                disabled={loading}
                className="px-4 py-2.5 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white rounded-2xl font-semibold inline-flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
              >
                {loading ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneRight size={18} />}
                Gửi Yêu Cầu Hỗ Trợ
              </motion.button>
            </div>
          ) : (
            /* --- Giai đoạn 2: Nhập OTP & Mật khẩu mới --- */
            <div className="bg-gradient-to-br from-white/60 to-slate-50 dark:from-slate-800/60 p-5 rounded-2xl border dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 -mt-1">
                Yêu cầu đã gửi! Vui lòng liên hệ Admin (SĐT: <strong>{ADMIN_PHONE}</strong>) để nhận Mã OTP.
              </p>
              
              <InputGroup label="Mã OTP 6 số (từ Admin)">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-600" size={18} />
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" required />
              </InputGroup>

              <InputGroup label="Mật khẩu mới (Tối thiểu 6 ký tự)">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" required />
                <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash /> : <Eye />}
                </span>
              </InputGroup>
              
              <InputGroup label="Nhập lại mật khẩu mới">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                <input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full pl-11 py-3 border rounded-xl bg-white/5 text-slate-800 dark:text-white focus:ring-0 text-sm" required />
                <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeSlash /> : <Eye />}
                </span>
              </InputGroup>

              <div className="flex justify-end gap-3 pt-3">
                 <motion.button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  disabled={loading}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-2xl font-semibold"
                >
                  Hủy
                </motion.button>
                 <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white rounded-2xl font-semibold inline-flex items-center gap-2"
                  whileHover={{ scale: 1.03 }}
                >
                  {loading ? <CircleNotch size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Xác nhận Đổi Mật Khẩu
                </motion.button>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* ----- CHẾ ĐỘ "USER THẬT" (ADMIN/SUPABASE AUTH) ----- */
        <div className="bg-gradient-to-br from-white/60 to-slate-50 dark:from-slate-800/60 p-5 rounded-2xl border dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Nhấn nút dưới đây để gửi một email khôi phục mật khẩu đến <strong>{user.email}</strong>.
          </p>
          <motion.button
            onClick={handleSendResetEmail}
            disabled={loading || emailSent}
            className="px-4 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] text-white rounded-2xl font-semibold inline-flex items-center gap-2 disabled:opacity-60"
            whileHover={{ scale: (loading || emailSent) ? 1 : 1.03 }}
          >
            {loading ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneRight size={18} />}
            {emailSent ? "Email đã được gửi" : "Gửi Email Đổi Mật Khẩu"}
          </motion.button>
        </div>
      )}
    </div>
  );
};


/* ------------------ IdentityForm (GIỮ NGUYÊN) ------------------ */
const IdentityForm = ({ user, session, identity, loading, onRefresh }) => { 
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  
  useEffect(() => {
    if (!loading) {
      if (identity) {
        setIsEditing(false); // Có dữ liệu, hiển thị trạng thái
      } else {
        setIsEditing(true); // Không có dữ liệu, hiển thị form upload
      }
    }
  }, [identity, loading]);

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
      .from('id-scans')
      .upload(filePath, file, { contentType: file.type || 'image/png' });
    if (uploadError) throw uploadError;
    return filePath;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const front_image_path = frontImage ? await uploadFile(frontImage, 'front') : null;
      const back_image_path = backImage ? await uploadFile(backImage, 'back') : null;
      
      const updates = {
        id: user.id, 
        status: 'pending', 
        front_image_url: front_image_path || identity?.front_image_url,
        back_image_url: back_image_path || identity?.back_image_url,
        id_number: identity?.id_number || null,
        full_name: identity?.full_name || null,
        dob: identity?.dob || null,
        issue_date: identity?.issue_date || null,
        issue_place: identity?.issue_place || null,
      };
      
      const { error } = await supabase
        .from('user_identity')
        .upsert(updates, { onConflict: 'id' }); 

      if (error) throw error; 

      toast.success('Đã gửi thông tin xác thực! Vui lòng chờ Admin duyệt.');
      setFrontImage(null);
      setBackImage(null);
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      toast.error(`Lỗi gửi thông tin: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center mt-10"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>;
  }

  if (identity && !isEditing) {
    let statusBadge;
    switch (identity.status) {
      case 'approved':
        statusBadge = (
          <div className="px-4 py-2 text-sm font-semibold rounded-2xl inline-flex items-center gap-2 bg-green-100 text-green-800">
            <CheckCircle weight="bold" className="text-green-600" /> Đã Xác Thực
          </div>
        );
        break;
      case 'rejected':
        statusBadge = (
          <div className="px-4 py-2 text-sm font-semibold rounded-2xl inline-flex items-center gap-2 bg-red-100 text-red-800">
            <XCircle weight="bold" className="text-red-600" /> Bị Từ Chối
          </div>
        );
        break;
      default: // 'pending'
        statusBadge = (
          <div className="px-4 py-2 text-sm font-semibold rounded-2xl inline-flex items-center gap-2 bg-yellow-100 text-yellow-800">
            <WarningCircle weight="bold" className="text-yellow-600" /> Đang Chờ Duyệt
          </div>
        );
    }
    return (
      <div className="">
        <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Palette size={22} className="text-violet-600" /> Xác thực Danh tính (CMND/CCCD)
        </h3>
        <div className="bg-gradient-to-br from-white/60 to-slate-50 dark:from-slate-800/60 p-5 rounded-2xl border dark:border-slate-700 space-y-3">
          {statusBadge}
          <p className="text-sm text-slate-600 dark:text-slate-300 pt-2">
            Trạng thái hồ sơ của bạn. Bạn có thể gửi lại thông tin nếu bị từ chối hoặc cần cập nhật.
          </p>
          <motion.button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#22d3ee] text-white rounded-2xl inline-flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
          >
            <Sparkle size={18} className="inline mr-2" /> Cập nhật / Gửi lại thông tin
          </motion.button>
        </div>
      </div>
    );
  }

  // (User sẽ thấy Form này nếu 'identity' là null hoặc 'isEditing' là true)
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <Palette size={22} className="text-violet-600" /> {identity ? 'Cập nhật Thông tin Xác thực' : 'Bổ sung Thông tin Xác thực (CMND/CCCD)'}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 -mt-2">
        Vui lòng tải lên ảnh scan 2 mặt CMND/CCCD của bạn. Admin sẽ xem xét và điền thông tin giúp bạn.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label="Ảnh Scan Mặt trước CMND/CCCD">
          <label htmlFor="front-image-upload" className="flex items-center gap-2 w-full py-3 pl-11 pr-3 border rounded-xl bg-white/5 text-slate-500 cursor-pointer">
            <FileArrowUp className="text-sky-600" size={18} />
            <span className="truncate">{frontImage ? frontImage.name : (identity?.front_image_url ? "Đã tải lên (Mặt trước)" : 'Nhấp để tải lên')}</span>
          </label>
          <input id="front-image-upload" type="file" onChange={(e) => handleFileChange(e, 'front')} className="hidden" accept="image/*" />
        </InputGroup>
        <InputGroup label="Ảnh Scan Mặt sau CMND/CCCD">
          <label htmlFor="back-image-upload" className="flex items-center gap-2 w-full py-3 pl-11 pr-3 border rounded-xl bg-white/5 text-slate-500 cursor-pointer">
            <FileArrowUp className="text-pink-600" size={18} />
            <span className="truncate">{backImage ? backImage.name : (identity?.back_image_url ? "Đã tải lên (Mặt sau)" : 'Nhấp để tải lên')}</span>
          </label>
          <input id="back-image-upload" type="file" onChange={(e) => handleFileChange(e, 'back')} className="hidden" accept="image/*" />
        </InputGroup>
      </div>
      <div className="flex justify-end pt-4 border-t dark:border-slate-700 gap-3">
        {identity && (
          <motion.button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isUploading}
            className="px-4 py-2 bg-rose-500 text-white rounded-2xl inline-flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
          >
            <XCircle size={18} /> Hủy
          </motion.button>
        )}
        <motion.button
          type="submit"
          disabled={isUploading}
          className="px-4 py-2 bg-gradient-to-r from-[#22d3ee] to-[#6366f1] text-white rounded-2xl inline-flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
        >
          {isUploading ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneRight size={18} />}
          Gửi thông tin
        </motion.button>
      </div>
    </form>
  );
};

/* ------------------ (MỚI) AnimatedNameDisplay ------------------ */
// (Thay thế cho AvatarBannerManager theo yêu cầu)
// (SỬA v38: Hiển thị customer_tier)
const AnimatedNameDisplay = ({ user }) => {
  return (
    <div className="p-6 text-center"> {/* Thêm padding vào đây */}
      <h2 className="text-4xl font-bold galaxy-text mb-2">
        {user.full_name || user.email}
      </h2>
      <p className="text-base font-medium text-slate-500 dark:text-slate-400 capitalize">
        {/* SỬA: Hiển thị customer_tier hoặc role (như "Tiêu chuẩn") */}
        {user.customer_tier || user.role || 'Người dùng'}
      </p>
    </div>
  );
};


/* ------------------ Main Profile Component (SỬA v38) ------------------ */
export default function Profile() {
  // SỬA v38: Đổi tên 'user' -> 'authUser' để tránh nhầm lẫn
  const { user: authUser, loading: authLoading, refreshUser: refreshAuthUser, session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // SỬA v38: Thêm state cho dữ liệu đầy đủ từ bảng 'Users'
  const [fullUserProfile, setFullUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [identity, setIdentity] = useState(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);

  useEffect(() => {
    if (!authLoading && !authUser) navigate('/login');
  }, [authUser, authLoading, navigate]);
  
  // SỬA v38: Thêm hàm fetch dữ liệu đầy đủ từ bảng 'Users'
  const fetchFullProfile = useCallback(async () => {
    if (!authUser) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*') // Lấy tất cả cột (SĐT, địa chỉ, ngày sinh, customer_tier)
        .eq('id', authUser.id)
        .single();
      
      if (error) throw error;
      setFullUserProfile(data); // Lưu dữ liệu đầy đủ
    } catch (error) {
      console.error("Lỗi fetch full user profile:", error.message);
      toast.error("Không thể tải đầy đủ thông tin tài khoản.");
      setFullUserProfile(authUser); // Dùng tạm dữ liệu cơ bản nếu lỗi
    } finally {
      setLoadingProfile(false);
    }
  }, [authUser]); // Chỉ phụ thuộc vào authUser

  // SỬA v38: Thêm hàm fetch 'user_identity' (giữ nguyên logic cũ)
  const fetchIdentity = useCallback(async () => {
    if (!authUser) {
      setLoadingIdentity(false);
      return;
    }
    setLoadingIdentity(true);
    try {
      const { data, error } = await supabase
        .from('user_identity')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (data) setIdentity(data);
      else setIdentity(null);
      
      if (error && error.code !== 'PGRST116') throw error;
    } catch (error) {
      console.error("Lỗi fetch identity:", error.message);
       setIdentity(null);
    } finally {
      setLoadingIdentity(false);
    }
  }, [authUser]); // Phụ thuộc vào authUser
  
  // SỬA v38: Chạy cả hai hàm fetch khi có authUser
  useEffect(() => {
    if (!authLoading && authUser) {
      fetchFullProfile();
      fetchIdentity();
    }
  }, [authLoading, authUser, fetchFullProfile, fetchIdentity]);

  // SỬA v38: Sửa hàm update để fetch lại dữ liệu đầy đủ
  const handleProfileUpdate = () => {
    if(refreshAuthUser) refreshAuthUser(); // Cập nhật tên trong context (nếu có)
    fetchFullProfile(); // Tải lại SĐT, địa chỉ, v.v. từ DB
  };

  // SỬA v38: Cập nhật điều kiện loading
  if (authLoading || loadingProfile || loadingIdentity || !fullUserProfile) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <CircleNotch size={40} className="animate-spin text-sky-500" />
      </div>
    );
  }

  const isHybridUser = !session;
  const identityStatus = identity?.status || null;

  return (
    <div className="bg-gradient-to-br from-white to-sky-50 dark:from-slate-900 min-h-screen font-inter py-8">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-sora font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <User weight="duotone" className="text-sky-600" size={36} />
            Tài Khoản Của Tôi
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Quản lý thông tin tài khoản và xác thực danh tính của bạn.
          </p>
        </div>

        <div className="md:flex md:gap-8">
          <aside className="md:w-1/4 mb-6 md:mb-0">
            <div className="sticky top-24">
              
              {/* SỬA v38: Truyền 'fullUserProfile' vào */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur rounded-2xl mb-4 overflow-hidden">
                <AnimatedNameDisplay user={fullUserProfile} />
              </div>
              {/* === (KẾT THÚC THAY ĐỔI) === */}

              <nav className="bg-white/60 dark:bg-slate-800/50 backdrop-blur rounded-2xl p-3">
                <TabButton
                  label="Thông tin Chung"
                  icon={<Info className="text-indigo-600" />}
                  isActive={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                />
                
                <TabButton
                  label="Bảo mật & Mật khẩu"
                  icon={<ShieldCheck className="text-orange-600" />}
                  isActive={activeTop === 'password'}
                  onClick={() => setActiveTab('password')}
                  disabled={identityStatus !== 'approved'} // Giờ chỉ khóa khi chưa duyệt
                />
                
                <TabButton
                  label="Xác thực CMND/CCCD"
                  icon={<IdentificationCard className="text-violet-600" />}
                  isActive={activeTab === 'identity'}
                  onClick={() => setActiveTab('identity')}
                  disabled={false} // (Giữ nguyên v32)
                />
              </nav>
              
              {(identityStatus !== 'approved') && (
                 <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-2xl text-xs font-medium text-center">
                    <Warning size={16} className="inline mr-1" />
                    Bạn phải xác thực CMND/CCCD (và được Admin duyệt) để mở khóa tab 'Bảo mật'.
                 </div>
              )}
            </div>
          </aside>

          <main className="md:w-3/4">
            <motion.div
              className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl rounded-3xl overflow-hidden p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-slate-800 dark:text-white"
                >
                  {/* SỬA v38: Truyền 'fullUserProfile' vào các component con */}
                  
                  {activeTab === 'profile' && <ProfileInfoForm user={fullUserProfile} onProfileUpdate={handleProfileUpdate} />}
                  
                  {activeTab === 'password' && <ChangePasswordForm user={fullUserProfile} identity={identity} />}
                  
                  {activeTab === 'identity' && (
                    <IdentityForm 
                      user={fullUserProfile} 
                      session={session}
                      identity={identity}
                      loading={loadingIdentity}
                      onRefresh={fetchIdentity} // Cung cấp hàm fetch của cha
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .font-sora { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue"; }

        /* === (THÊM CSS CHO HIỆU ỨNG GALAXY) === */
        .galaxy-text {
          background: linear-gradient(90deg, #007cf0, #00dfd8, #ff00c3, #007cf0);
          background-size: 400% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: galaxy-animation 5s linear infinite;
          -webkit-text-fill-color: transparent; /* Đảm bảo hoạt động trên Safari */
        }
        
        @keyframes galaxy-animation {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        /* === (KẾT THÚC THÊM CSS) === */
      `}</style>
    </div>
  );
}

/* ------------------ (XÓA) AvatarBannerWrapper ------------------ */
// (Đã xóa component)
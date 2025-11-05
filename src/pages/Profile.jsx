// src/pages/Profile.jsx
/* *** (SỬA LỖI v36 - THEO YÊU CẦU) ***
  1. (Fix) VIẾT LẠI HOÀN TOÀN 'ChangePasswordForm' để dùng
     logic "Admin OTP" (giống file Login.jsx) cho "Tài khoản ảo".
  2. (Fix) 'ChangePasswordForm' giờ sẽ có 2 chế độ:
     - "Tài khoản thật" (Admin/có session): Dùng email reset (như cũ).
     - "Tài khoản ảo" (User/không session): Dùng Admin OTP (mới).
  3. (Giữ nguyên v35) Mở khóa Tab "Bảo mật" (chỉ khóa khi chưa duyệt).
  4. (Giữ nguyên v34) Hợp nhất state 'identity'.
*/

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import Cropper from 'react-easy-crop';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { getSupabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import {
  User, Envelope, Phone, House, CalendarBlank, Key, IdentificationCard,
  UploadSimple, CircleNotch, PaperPlaneRight, Lock, Eye, EyeSlash, CheckCircle,
  WarningCircle, ShieldCheck, FileArrowUp, XCircle, Info, Sparkle, Palette,
  Camera, Image, PaintBrush, TrashSimple, MagnifyingGlassPlus, Warning
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = getSupabase();
// (Thêm SĐT Admin từ Login.jsx)
const ADMIN_PHONE = "0912345678"; 

/* ------------------ Helper: getPublicUrlSafe ------------------ */
const getPublicUrlSafe = (bucket, path) => {
  if (!path) return null;
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    return null;
  }
};

/* ------------------ Crop Utility (in-file) ------------------ */
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

/* ------------------ ProfileInfoForm ------------------ */
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
         if (onProfileUpdate) onProfileUpdate(authUser);
      } else {
         // Cập nhật localStorage cho user "ảo" (nếu có)
         const localUser = JSON.parse(localStorage.getItem('user'));
         if (localUser) {
           const updatedLocalUser = { ...localUser, ...updates };
           localStorage.setItem('user', JSON.stringify(updatedLocalUser));
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

/* ------------------ ChangePasswordForm (SỬA v36) ------------------ */
// (VIẾT LẠI HOÀN TOÀN: Giờ hỗ trợ cả "User ảo" và "User thật")
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
/* ------------------ KẾT THÚC SỬA v36 ------------------ */


/* ------------------ IdentityForm (SỬA v34) ------------------ */
// (Nhận state từ cha, không tự fetch/load)
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

/* ------------------ AvatarBannerManager (ĐÃ SỬA LỖI UPLOAD) ------------------ */
// 1. (Fix) Trỏ đến bảng 'Users' thay vì 'user_identity' (dựa theo ảnh Supabase)
// 2. (Fix) Gỡ bỏ check 'session' để "User ảo" (không có session) có thể fetch và upload
const AvatarBannerManager = ({ user, refreshUser, session }) => {
  const [avatarPath, setAvatarPath] = useState(null);
  const [bannerPath, setBannerPath] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);
  const [isBannerCropOpen, setIsBannerCropOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [currentUploadType, setCurrentUploadType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // SỬA: Bỏ check '!session' để user "ảo" cũng có thể fetch
    if (!user) return; 
    (async () => {
      try {
        const { data, error } = await supabase
          .from('Users') // SỬA: Đổi từ 'user_identity' sang 'Users'
          .select('avatar_url, banner_url')
          .eq('id', user.id)
          .single();
        if (!error) {
          setAvatarPath(data?.avatar_url || null);
          setBannerPath(data?.banner_url || null);
        }
      } catch (e) { /* ignore */ }
    })();
  }, [user]); // SỬA: Bỏ 'session' khỏi dependency

  useEffect(() => {
    setAvatarPreview(getPublicUrlSafe('avatars', avatarPath));
  }, [avatarPath]);

  useEffect(() => {
    setBannerPreview(getPublicUrlSafe('banners', bannerPath));
  }, [bannerPath]);

  const readFileAsDataURL = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => res(reader.result));
    reader.addEventListener('error', (e) => rej(e));
    reader.readAsDataURL(file);
  });

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const openCropForFile = async (file, type) => {
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setImageSrc(dataUrl);
    setCurrentUploadType(type);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (type === 'avatar') setIsAvatarCropOpen(true);
    else setIsBannerCropOpen(true);
  };

  // *** SỬA LỖI (FIX) NÚT TẢI LÊN ***
  // (Lỗi là do tạo 'new File()' từ 'blob'. Sửa bằng cách upload 'blob' trực tiếp.)
  const uploadCropped = async () => {
    if (!imageSrc || !croppedAreaPixels || !currentUploadType) {
      toast.error('Không có ảnh hoặc vùng cắt.');
      return;
    }
    setIsUploading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels); // 1. Lấy blob đã crop
      const fileName = `${user.id}-${currentUploadType}-${Date.now()}.jpg`;
      // const file = new File([blob], fileName, { type: 'image/jpeg' }); // <-- DÒNG NÀY GÂY LỖI (XÓA ĐI)
      const bucket = currentUploadType === 'avatar' ? 'avatars' : 'banners';
      
      // 2. Sửa: Tải 'blob' lên trực tiếp, thay vì 'file'
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, blob, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const updates = currentUploadType === 'avatar' ? { avatar_url: fileName } : { banner_url: fileName };
      
      // SỬA: Đổi từ 'user_identity' sang 'Users'
      const { error: dbErr } = await supabase.from('Users').update(updates).eq('id', user.id);
      if (dbErr) throw dbErr;

      // (Giữ nguyên) Chỉ update auth nếu là user "thật" (có session)
      if (session) {
        const { error: authErr } = await supabase.auth.updateUser({ data: updates });
        if (authErr) throw authErr;
      }
      
      if (currentUploadType === 'avatar') {
        setAvatarPath(fileName);
        setAvatarPreview(getPublicUrlSafe('avatars', fileName));
      } else {
        setBannerPath(fileName);
        setBannerPreview(getPublicUrlSafe('banners', fileName));
      }
      toast.success('Tải ảnh thành công!');
      
      setIsAvatarCropOpen(false);
      setIsBannerCropOpen(false);
      setImageSrc(null);
      setCurrentUploadType(null);
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error(`Tải ảnh thất bại: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  // *** KẾT THÚC SỬA LỖI ***

  const handleAvatarFileSelected = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await openCropForFile(f, 'avatar');
    e.target.value = null; // Reset input để có thể chọn lại file cũ
  };

  const handleBannerFileSelected = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await openCropForFile(f, 'banner');
    e.target.value = null; // Reset input
  };

  const handleDelete = async (type) => {
    if (!user) return;
    const confirm = window.confirm(`Bạn có chắc muốn xóa ${type === 'avatar' ? 'ảnh đại diện' : 'banner'}?`);
    if (!confirm) return;
    try {
      const updates = type === 'avatar' ? { avatar_url: null } : { banner_url: null };
      
      // SỬA: Đổi từ 'user_identity' sang 'Users'
      const { error: dbErr } = await supabase.from('Users').update(updates).eq('id', user.id);
      if (dbErr) throw dbErr;

      // (Giğ nguyên) Chỉ update auth nếu là user "thật" (có session)
      if (session) {
        const { error: authErr } = await supabase.auth.updateUser({ data: updates });
        if (authErr) throw authErr;
      }

      if (type === 'avatar') {
        setAvatarPath(null);
        setAvatarPreview(null);
      } else {
        setBannerPath(null);
        setBannerPreview(null);
      }
      toast.success('Đã xoá thành công.');
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error(`Không thể xoá: ${err.message}`);
    }
  };

  const openPreview = (src) => {
    setPreviewSrc(src);
    setIsPreviewOpen(true);
  };

  return (
    <div className="mb-6">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        {bannerPreview ? (
          <img src={bannerPreview} alt="banner" className="w-full h-44 object-cover" onClick={() => openPreview(bannerPreview)} style={{ cursor: 'zoom-in' }} />
        ) : (
          <div className="w-full h-44 bg-gradient-to-r from-[#22d3ee] to-[#6366f1] flex items-center justify-center text-white">
            <PaintBrush size={20} /> <span className="ml-2 font-semibold">Your Banner</span>
          </div>
        )}

        {/* SỬA: Gỡ bỏ check 'session' để ai cũng thấy nút */}
        <div className="absolute top-3 right-3 flex gap-2">
          <label htmlFor="banner-upload-input" className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 p-2 rounded-xl cursor-pointer">
            <Image size={18} /> <span className="hidden md:inline">Thay banner</span>
          </label>
          <input 
            id="banner-upload-input" 
            type="file" 
            accept="image/*" 
            onChange={handleBannerFileSelected} 
            className="hidden" 
            disabled={isUploading}
          />
          {bannerPreview && (
            <button onClick={() => handleDelete('banner')} className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 p-2 rounded-xl hover:bg-rose-100" disabled={isUploading}>
              <TrashSimple size={18} /> <span className="hidden md:inline">Xóa</span>
            </button>
          )}
        </div>
      </div>

      {/* Avatar + name */}
      <div className="flex items-end gap-4 mt- -12">
        <div className="relative -mt-12">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg" onClick={() => avatarPreview && openPreview(avatarPreview)} style={{ cursor: avatarPreview ? 'zoom-in' : 'default' }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                <User size={28} className="text-white/80" />
              </div>
            )}
          </div>

          {/* SỬA: Gỡ bỏ check 'session' */}
          <>
            <label htmlFor="avatar-upload-input" className="absolute -right-1 -bottom-1 bg-white/90 dark:bg-slate-800/80 rounded-full p-1 cursor-pointer border border-white/40">
              <Camera size={16} className="text-slate-700" />
            </label>
            <input 
              id="avatar-upload-input" 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarFileSelected} 
              className="hidden" 
              disabled={isUploading}
            />
          </>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.full_name || user.email}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">{user?.role || 'Người dùng'}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* SỬA: Gỡ bỏ check 'session', chỉ check 'avatarPreview' */}
          {avatarPreview && (
            <button onClick={() => handleDelete('avatar')} className="px-3 py-2 bg-white/90 dark:bg-slate-800/80 rounded-2xl inline-flex items-center gap-2" disabled={isUploading}>
              <TrashSimple size={16} /> <span className="hidden md:inline">Xóa avatar</span>
            </button>
          )}
          {avatarPreview && (
            <button onClick={() => avatarPreview && openPreview(avatarPreview)} className="px-3 py-2 bg-white/90 dark:bg-slate-800/80 rounded-2xl inline-flex items-center gap-2">
              <MagnifyingGlassPlus size={16} /> <span className="hidden md:inline">Xem ảnh</span>
            </button>
          )}
        </div>
      </div>

      {/* Crop Modal (Giữ nguyên) */}
      <Dialog open={isAvatarCropOpen || isBannerCropOpen} onClose={() => { setIsAvatarCropOpen(false); setIsBannerCropOpen(false); setImageSrc(null); }}>
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl p-4">
            <Dialog.Title className="text-lg font-semibold mb-3">Cắt ảnh trước khi tải lên</Dialog.Title>
            <div className="relative w-full h-80 bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={currentUploadType === 'avatar' ? 1 : 16 / 6}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
              <button onClick={uploadCropped} className="px-4 py-2 bg-gradient-to-r from-[#22d3ee] to-[#6366f1] text-white rounded-2xl inline-flex items-center gap-2" disabled={isUploading}>
                {isUploading ? <CircleNotch size={16} className="animate-spin" /> : <UploadSimple size={16} />} Tải lên
              </button>
              <button onClick={() => { setIsAvatarCropOpen(false); setIsBannerCropOpen(false); setImageSrc(null); }} className="px-3 py-2 bg-slate-200 rounded-2xl">Hủy</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Preview Modal (Giữ nguyên) */}
      <Dialog open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-transparent rounded-md">
            <div className="relative">
              <img src={previewSrc} alt="preview" className="max-h-[80vh] w-auto mx-auto rounded-lg shadow-2xl object-contain" />
              <button onClick={() => setIsPreviewOpen(false)} className="absolute top-3 right-3 bg-white/90 rounded-full p-2">
                <XCircle size={20} />
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

/* ------------------ Main Profile Component (SỬA v34) ------------------ */
export default function Profile() {
  const { user, loading, refreshUser, session } = useAuth(); // 'session' rất quan trọng
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // <<< SỬA: Hợp nhất state >>>
  const [identity, setIdentity] = useState(null); // Giờ là object
  const [loadingIdentity, setLoadingIdentity] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);
  
  // <<< SỬA: Tách hàm fetch ra ngoài để có thể gọi lại >>>
  const fetchIdentity = useCallback(async () => {
    if (!user) return;
    
    // (FIX v33) ĐÃ XÓA LOGIC CHẶN 'SESSION'
    // (YÊU CẦU SQL POLICY "INSECURE" ĐỂ CHẠY)
    
    setLoadingIdentity(true);
    try {
      const { data, error } = await supabase
        .from('user_identity')
        .select('*') // Lấy tất cả
        .eq('id', user.id)
        .single();
        
      if (data) {
        setIdentity(data);
      } else {
        setIdentity(null);
      }
      if (error && error.code !== 'PGRST116') throw error;
    } catch (error) {
      console.error("Lỗi fetch identity:", error.message);
       setIdentity(null);
    } finally {
      setLoadingIdentity(false);
    }
  }, [user, session]); // Thêm 'session' vào dependency array
  
  // <<< SỬA: useEffect giờ chỉ gọi hàm fetch >>>
  useEffect(() => {
    fetchIdentity();
  }, [fetchIdentity]);

  const handleProfileUpdate = (updatedData) => {
    if(refreshUser) refreshUser();
  };

  if (loading || !user || loadingIdentity) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <CircleNotch size={40} className="animate-spin text-sky-500" />
      </div>
    );
  }

  const isHybridUser = !session;
  // <<< SỬA: Lấy status từ object 'identity' >>>
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
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur rounded-2xl p-4 mb-4">
                <AvatarBannerWrapper user={user} refreshUser={handleProfileUpdate} session={session} />
              </div>

              <nav className="bg-white/60 dark:bg-slate-800/50 backdrop-blur rounded-2xl p-3">
                <TabButton
                  label="Thông tin Chung"
                  icon={<Info className="text-indigo-600" />}
                  isActive={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                />
                
                {/* <<< SỬA LỖI v35: Xóa 'isHybridUser' >>> */}
                <TabButton
                  label="Bảo mật & Mật khẩu"
                  icon={<ShieldCheck className="text-orange-600" />}
                  isActive={activeTab === 'password'}
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
              
              {/* <<< SỬA LỖI v35: Cập nhật thông báo lỗi >>> */}
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
                  {activeTab === 'profile' && <ProfileInfoForm user={user} onProfileUpdate={handleProfileUpdate} />}
                  
                  {/* <<< SỬA: Truyền 'identity' (object) xuống >>> */}
                  {activeTab === 'password' && <ChangePasswordForm user={user} identity={identity} />}
                  
                  {/* <<< SỬA: Truyền 'identity', 'loading' và 'onRefresh' xuống >>> */}
                  {activeTab === 'identity' && (
                    <IdentityForm 
                      user={user} 
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
      `}</style>
    </div>
  );
}

/* ------------------ AvatarBannerWrapper (SỬA THEO YÊU CẦU) ------------------ */
function AvatarBannerWrapper({ user, refreshUser, session }) {
  return <AvatarBannerManager user={user} refreshUser={refreshUser} session={session} />;
}
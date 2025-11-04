// src/pages/Profile.jsx
/* *** (SỬA LỖI v35 - REALTIME UNLOCK) ***
  1. (Mới) Thêm Supabase Realtime Subscription vào component 'Profile'.
  2. (Mới) Trang sẽ lắng nghe thay đổi trên bảng 'user_identity' cho user hiện tại.
  3. (Mới) Khi Admin duyệt/từ chối, listener sẽ tự động gọi 'fetchIdentity' 
     để cập nhật state và mở khóa Tab 'Bảo mật' mà không cần F5.
  4. (Giữ nguyên v34) Hợp nhất state 'identity' và 'loadingIdentity'.
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

/* ------------------ ChangePasswordForm (v34) ------------------ */
// (Logic này đã đúng - chỉ hiển thị cho Admin "thật" và đã xác thực)
const ChangePasswordForm = ({ user, identity }) => { // <<< Nhận 'identity' (object)
  const [loading, setLoading] = useState(false);
  const { session } = useAuth(); 

  const handleSendResetEmail = async () => {
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectTo,
      });
      if (error) throw error;
      toast.success("Đã gửi email khôi phục. Vui lòng kiểm tra hộp thư của bạn.");
    } catch (error) {
      toast.error(`Lỗi gửi email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const isHybridUser = !session;
  // <<< Dùng 'identity.status'
  if (isHybridUser || identity?.status !== 'approved') {
    return (
      <div className="">
        <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <ShieldCheck size={22} className="text-orange-600" /> Bảo mật & Đăng nhập
        </h3>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/40 p-5 rounded-2xl border border-yellow-300 dark:border-yellow-700">
          <div className="flex items-center gap-3">
            <Warning size={24} className="text-yellow-600" />
            <h4 className="font-semibold text-lg text-yellow-800 dark:text-yellow-200">
              {isHybridUser ? "Chức năng không hỗ trợ" : "Yêu cầu xác thực"}
            </h4>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 ml-9">
            {isHybridUser
              ? "Tài khoản của bạn (User) được quản lý bằng hệ thống 'Admin OTP'. Vui lòng sử dụng chức năng 'Quên mật khẩu' ở trang Đăng nhập."
              : "Bạn phải xác thực CMND/CCCD (và được Admin duyệt) trước khi có thể sử dụng chức năng đổi mật khẩu."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <h3 className="text-2xl font-sora font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <ShieldCheck size={22} className="text-orange-600" /> Bảo mật & Đăng nhập
      </h3>
      <div className="bg-gradient-to-br from-white/60 to-slate-50 dark:from-slate-800/60 p-5 rounded-2xl border dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Nhấn nút dưới đây để gửi một email khôi phục mật khẩu đến <strong>{user.email}</strong>.
        </p>
        <motion.button
          onClick={handleSendResetEmail}
          disabled={loading}
          className="px-4 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] text-white rounded-2xl font-semibold inline-flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
        >
          {loading ? <CircleNotch size={18} className="animate-spin" /> : <PaperPlaneRight size={18} />}
          Gửi Email Đổi Mật Khẩu
        </motion.button>
      </div>
    </div>
  );
};

/* ------------------ IdentityForm (v34) ------------------ */
// (Nhận state từ cha, không tự fetch/load)
const IdentityForm = ({ user, session, identity, loading, onRefresh }) => { 
  // <<< Xóa state 'identity', 'loading'
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // <<< Xóa hàm 'fetchIdentity' (useCallback)
  
  // <<< Logic 'useEffect' mới để xử lý khi 'identity' prop thay đổi
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
    
    // (Lệnh này giờ sẽ chạy được nhờ RLS mới cho anon)
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
        status: 'pending', // Luôn set là pending khi submit/resubmit
        front_image_url: front_image_path || identity?.front_image_url,
        back_image_url: back_image_path || identity?.back_image_url,
        // Giữ lại thông tin cũ nếu admin đã điền, hoặc set null nếu chưa có
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
      
      // <<< Gọi hàm 'onRefresh' của cha để cập nhật toàn bộ trang
      if (onRefresh) {
        onRefresh();
      }
      
      // (Không cần logic 'setIsEditing' ở đây nữa,
      //  useEffect (dòng 301) sẽ tự động xử lý khi prop 'identity' thay đổi)

    } catch (error) {
      toast.error(`Lỗi gửi thông tin: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center mt-10"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>;
  }

  // (Giờ logic này sẽ chạy cho TẤT CẢ user,
  //  miễn là 'identity' tồn tại và 'isEditing' là false)
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
          {identity.status === 'rejected' && identity.reject_reason && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm text-red-800 dark:text-red-200">
              <strong>Lý do từ chối:</strong> {identity.reject_reason}
            </div>
          )}
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

/* ------------------ AvatarBannerManager (v31) ------------------ */
// (Logic này đã đúng: Vô hiệu hóa cho "User ảo")
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
    if (!user || !session) return; // User "ảo" không fetch
    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_identity') 
          .select('avatar_url, banner_url')
          .eq('id', user.id)
          .single();
        if (!error) {
          setAvatarPath(data?.avatar_url || null);
          setBannerPath(data?.banner_url || null);
        }
      } catch (e) { /* ignore */ }
    })();
  }, [user, session]); // Thêm session

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

  const uploadCropped = async () => {
    if (!imageSrc || !croppedAreaPixels || !currentUploadType) {
      toast.error('Không có ảnh hoặc vùng cắt.');
      return;
    }
    setIsUploading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `${user.id}-${currentUploadType}-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      const bucket = currentUploadType === 'avatar' ? 'avatars' : 'banners';
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const updates = currentUploadType === 'avatar' ? { avatar_url: fileName } : { banner_url: fileName };
      
      const { error: dbErr } = await supabase.from('user_identity').update(updates).eq('id', user.id);
      if (dbErr) throw dbErr;

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

  const handleAvatarFileSelected = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await openCropForFile(f, 'avatar');
  };

  const handleBannerFileSelected = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await openCropForFile(f, 'banner');
  };

  const handleDelete = async (type) => {
    if (!user) return;
    const confirm = window.confirm(`Bạn có chắc muốn xóa ${type === 'avatar' ? 'ảnh đại diện' : 'banner'}?`);
    if (!confirm) return;
    try {
      const updates = type === 'avatar' ? { avatar_url: null } : { banner_url: null };
      
      const { error: dbErr } = await supabase.from('user_identity').update(updates).eq('id', user.id);
      if (dbErr) throw dbErr;

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

        {/* (v31) Chỉ hiển thị nút cho user "thật" (có session) */}
        {session && (
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
            />
            {bannerPreview && (
              <button onClick={() => handleDelete('banner')} className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/80 p-2 rounded-xl hover:bg-rose-100">
                <TrashSimple size={18} /> <span className="hidden md:inline">Xóa</span>
              </button>
            )}
          </div>
        )}
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

          {/* (v31) Chỉ hiển thị nút cho user "thật" (có session) */}
          {session && (
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
              />
            </>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.full_name || user.email}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">{user?.role || 'Người dùng'}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* (v31) Chỉ hiển thị nút cho user "thật" (có session) */}
          {session && avatarPreview && (
            <button onClick={() => handleDelete('avatar')} className="px-3 py-2 bg-white/90 dark:bg-slate-800/80 rounded-2xl inline-flex items-center gap-2">
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

      {/* Crop Modal */}
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

      {/* Preview Modal */}
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

/* ------------------ Main Profile Component (SỬA v35) ------------------ */
export default function Profile() {
  const { user, loading, refreshUser, session } = useAuth(); // 'session' rất quan trọng
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // <<< (v34) Hợp nhất state >>>
  const [identity, setIdentity] = useState(null); // Giờ là object
  const [loadingIdentity, setLoadingIdentity] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);
  
  // <<< (v34) Tách hàm fetch ra ngoài để có thể gọi lại >>>
  const fetchIdentity = useCallback(async () => {
    if (!user) return;

    // (FIX v30) Lỗi 406 RLS do "User ảo"
    // (FIX v33) Đã xóa logic chặn 'session' -> YÊU CẦU SQL "INSECURE"
    const isHybridUser = !session;
    if (isHybridUser) {
      // Nếu là "User ảo" (không có session), không được gọi API
      // TRỪ KHI BẠN ĐÃ CHẠY SQL POLICY "INSECURE"
      try {
        const { data, error } = await supabase
          .from('user_identity')
          .select('*') 
          .eq('id', user.id)
          .single();
        if (data) setIdentity(data);
        else setIdentity(null);
        if (error && error.code !== 'PGRST116') throw error;
      } catch (error) {
         console.error("Lỗi fetch identity (User ảo):", error.message);
         setIdentity(null);
      } finally {
         setLoadingIdentity(false);
      }
      return;
    }

    // (Nếu là User "Thật" - có session)
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
      console.error("Lỗi fetch identity (User thật):", error.message);
    } finally {
      setLoadingIdentity(false);
    }
  }, [user, session]); // Thêm 'session' vào dependency array
  
  // <<< SỬA v35: Thêm REALTIME SUBSCRIPTION >>>
  useEffect(() => {
    // 1. Fetch dữ liệu ban đầu khi component mount
    fetchIdentity();

    // 2. Chỉ thiết lập listener nếu có user
    if (!user) return;

    // 3. Tạo kênh (channel) lắng nghe
    const channel = supabase
      .channel(`user_identity_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Lắng nghe INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_identity',
          filter: `id=eq.${user.id}`, // Chỉ lắng nghe thay đổi của CHÍNH user này
        },
        (payload) => {
          // 4. Khi có thay đổi, fetch lại dữ liệu
          console.log('Realtime: Trạng thái user_identity đã thay đổi!', payload);
          toast.success('Trạng thái xác thực của bạn vừa được cập nhật!');
          fetchIdentity();
        }
      )
      .subscribe();

    // 5. Hàm dọn dẹp: Hủy đăng ký kênh khi component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIdentity, user]); // Thêm 'user' vào dependency array

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
  // <<< (v34) Lấy status từ object 'identity' >>>
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
                <TabButton
                  label="Bảo mật & Mật khẩu"
                  icon={<ShieldCheck className="text-orange-600" />}
                  isActive={activeTab === 'password'}
                  onClick={() => setActiveTab('password')}
                  disabled={isHybridUser || identityStatus !== 'approved'} // <<< (v34) Logic này giờ đã ĐÚNG
                />
                <TabButton
                  label="Xác thực CMND/CCCD"
                  icon={<IdentificationCard className="text-violet-600" />}
                  isActive={activeTab === 'identity'}
                  onClick={() => setActiveTab('identity')}
                  disabled={false} // (v32)
                />
              </nav>
              {/* (v32) */}
              {(!isHybridUser && identityStatus !== 'approved') && (
                 <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-2xl text-xs font-medium text-center">
                    <Warning size={16} className="inline mr-1" />
                    {isHybridUser 
                      ? "Tab 'Bảo mật' chỉ dành cho tài khoản Admin/Supplier." 
                      : "Bạn phải xác thực CMND/CCCD để mở khóa tab 'Bảo mật'."
                    }
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
                  
                  {/* <<< (v34) Truyền 'identity' (object) xuống >>> */}
                  {activeTab === 'password' && <ChangePasswordForm user={user} identity={identity} />}
                  
                  {/* <<< (v34) Truyền 'identity', 'loading' và 'onRefresh' xuống >>> */}
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

/* ------------------ AvatarBannerWrapper (v30) ------------------ */
function AvatarBannerWrapper({ user, refreshUser, session }) {
  return <AvatarBannerManager user={user} refreshUser={refreshUser} session={session} />;
}
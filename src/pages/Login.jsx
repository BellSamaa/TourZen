// src/pages/Login.jsx
/* *** (SỬA THEO YÊU CẦU) NÂNG CẤP v23 (Sửa Lỗi 400 + Đồng bộ) ***
  1. (Lý do) Lỗi 400 là do 'NOT NULL constraint violation'.
  2. (Logic) Cột trong CSDL là 'token', không phải 'otp'.
  3. (SỬA) Đổi `otp: null` thành `token: null` khi insert (handleSendRequest).
  4. (SỬA) Đổi `eq('otp', ...)` thành `eq('token', ...)` khi kiểm tra OTP.
  5. (SỬA) Đổi `username` trong logic "Tài khoản ảo" (v21)
     để khớp với logic trigger (v7) là `split_part(email, '@', 1)`.
*/
// (Phiên bản TÀI KHOẢN ẢO + OTP HOÀN CHỈNH)

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaSignInAlt,
  FaMapMarkerAlt, FaPhone, FaInfoCircle, FaCheckCircle,
  FaCalendarAlt, FaQuestionCircle, FaPaperPlane, FaKey
} from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();
const phoneRegex = /^(0(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9]))\d{7}$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const initialFormState = { name: "", email: "", password: "", confirm: "", address: "", phone_number: "", ngay_sinh: "", otp: "" };
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const ADMIN_PHONE = "0912345678";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // --- ĐĂNG KÝ ---
      if (mode === 'register') {
        if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
        if (form.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        if (form.phone_number && !phoneRegex.test(form.phone_number)) throw new Error("Số điện thoại không hợp lệ.");
        if (form.address.length < 10) throw new Error("Địa chỉ không hợp lệ (ít nhất 10 ký tự).");

        const { data: exists } = await supabase
          .from("Users")
          .select("email")
          .eq("email", form.email)
          .single();
        if (exists) throw new Error("Email đã tồn tại trong hệ thống.");

        const hashedPassword = btoa(form.password);
        
        // (SỬA v23) Tạo username từ email (Giống hệt trigger v7)
        const generatedUsername = form.email.split('@')[0];
        
        // (SỬA v23) Xóa accountCode (vì trigger v10 sẽ tự tạo customer_code)
        // const accountCode = "TK" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, "0");

        const { error: insertError } = await supabase.from("Users").insert({
          email: form.email,
          password: hashedPassword,
          full_name: form.name,
          address: form.address,
          phone_number: form.phone_number || null,
          ngay_sinh: form.ngay_sinh || null,
          role: "user",
          username: generatedUsername, // <<< SỬA v23: Thêm username (fix lỗi 500)
          // account_code: accountCode, // <<< SỬA v23: Xóa
          is_active: true
        });
        if (insertError) throw insertError;

        setSuccess("Đăng ký thành công! 🎉 Bạn có thể đăng nhập ngay.");
        setForm(initialFormState);
        setTimeout(() => { setMode('login'); setSuccess(''); }, 2000);
      }

      // --- ĐĂNG NHẬP ---
      else if (mode === 'login') {
        const { data: user, error: findErr } = await supabase
          .from("Users")
          .select("*")
          .eq("email", form.email)
          .single();
        if (findErr || !user) throw new Error("Email không tồn tại.");
        if (btoa(form.password) !== user.password) throw new Error("Mật khẩu không đúng.");
        if (user.is_active === false) throw new Error("Tài khoản của bạn đã bị khóa.");

        setSuccess("Đăng nhập thành công!");
        localStorage.setItem("user", JSON.stringify(user));
        const from = location.state?.from?.pathname || (user.role === "admin" ? "/admin" : "/");
        navigate(from, { replace: true });
      }

      // --- QUÊN MẬT KHẨU (OTP) ---
      else if (mode === 'forgot') {
        if (!form.email) throw new Error("Vui lòng nhập email của bạn.");

        if (!isOtpSent) {
          const { data: user } = await supabase
            .from("Users")
            .select("id")
            .eq("email", form.email)
            .single();
          if (!user) throw new Error("Email không tồn tại.");

          const { error: insertError } = await supabase
            .from("password_reset_requests")
            // <<< SỬA v23: Đổi 'otp: null' thành 'token: null'
            .insert({ email: form.email, token: null, is_resolved: false });
          
          if (insertError) {
             console.error("Lỗi insert password_reset_requests:", insertError);
             throw new Error("Không thể gửi yêu cầu. (Kiểm tra RLS trên bảng password_reset_requests)");
          }

          setSuccess(`Yêu cầu đã gửi! Liên hệ Admin (${ADMIN_PHONE}) để nhận mã OTP.`);
          setIsOtpSent(true);
        } else {
          if (!form.otp || form.otp.length !== 6) throw new Error("Mã OTP không hợp lệ.");
          if (!form.password || form.password.length < 6) throw new Error("Mật khẩu mới quá ngắn.");
          if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");

          const { data: req } = await supabase
            .from("password_reset_requests")
            .select("*")
            .eq("email", form.email)
            // <<< SỬA v23: Đổi 'otp' thành 'token'
            .eq("token", form.otp) // Admin phải tự nhập OTP vào bảng này
            .eq("is_resolved", false)
            .single();
          if (!req) throw new Error("Mã OTP không đúng hoặc đã hết hạn.");

          const hashedPassword = btoa(form.password);
          const { error: updateError } = await supabase
            .from("Users")
            .update({ password: hashedPassword })
            .eq("email", form.email);
          if (updateError) throw new Error("Không thể đổi mật khẩu.");

          await supabase
            .from("password_reset_requests")
            .update({ is_resolved: true })
            .eq("id", req.id);

          setSuccess("Đổi mật khẩu thành công! 🎉");
          setForm(initialFormState);
          setIsOtpSent(false);
          setMode("login");
        }
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
    setForm(initialFormState);
    setIsOtpSent(false);
  };

  const handleForgotBackToLogin = () => handleModeChange("login");
  const handleGoToForgot = () => handleModeChange("forgot");

  // Animation
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } };
  const formContainerVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  // (SỬA v21) Giao diện này không có Icon, giữ nguyên style cũ
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/images/login-background.jpg')" }}>
      <motion.div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" variants={backdropVariants} initial="hidden" animate="visible" />
      <motion.div key={mode + (isOtpSent ? '-otp' : '')} className="relative z-10 w-full max-w-md bg-white/10 p-8 rounded-3xl backdrop-blur-xl border border-white/20 text-white" variants={formContainerVariants} initial="hidden" animate="visible">
        <h2 className="text-center text-3xl font-bold mb-6">TourZen</h2>

        <AnimatePresence mode="wait">
          {error && <motion.div className="bg-red-500/80 p-3 mb-4 rounded-xl text-sm text-center">{error}</motion.div>}
          {success && <motion.div className="bg-green-500/80 p-3 mb-4 rounded-xl text-sm text-center">{success}</motion.div>}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && <input type="text" placeholder="Họ và tên" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />}

          <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={`input-field ${mode === 'forgot' && isOtpSent ? 'bg-white/5 cursor-not-allowed' : ''}`} disabled={mode === 'forgot' && isOtpSent} />

          {mode === "register" && (
            <>
              <input type="text" placeholder="Địa chỉ (tối thiểu 10 ký tự)" required minLength={10} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" />
              <input type="tel" placeholder="Số điện thoại" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} className="input-field" />
              <input type="date" value={form.ngay_sinh} onChange={e => setForm({ ...form, ngay_sinh: e.target.value })} className="input-field" />
            </>
          )}

          {mode === 'forgot' && isOtpSent && (
            <input type="text" placeholder="Mã OTP 6 số" value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} className="input-field" />
          )}

          {(mode !== 'forgot' || isOtpSent) && (
            <>
              <input type={showPassword ? "text" : "password"} placeholder={mode === 'forgot' ? "Mật khẩu mới" : "Mật khẩu"} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" />
              {(mode === 'register' || (mode === 'forgot' && isOtpSent)) && (
                <input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="input-field" />
              )}
            </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-blue-600 py-3 rounded-xl font-bold text-white">
            {loading ? "Đang xử lý..." : (mode === "login" ? "Đăng nhập" : mode === "register" ? "Đăng ký" : isOtpSent ? "Đổi mật khẩu" : "Gửi yêu cầu")}
          </button>

          <div className="text-center pt-2">
            <button type="button" onClick={mode === 'forgot' ? handleForgotBackToLogin : handleGoToForgot} className="text-sm text-sky-300 hover:text-white">
Z             {mode === 'forgot' ? 'Quay lại đăng nhập' : mode === 'login' ? 'Quên mật khẩu?' : ''}
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background-color: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .input-field:focus {
          outline: none;
          border-color: #38bdf8;
          background-color: rgba(255,255,255,0.15);
        }
      `}</style>
    </div>
  );
}
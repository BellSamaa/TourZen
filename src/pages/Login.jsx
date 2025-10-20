// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope } from "react-icons/fa";
// SỬA: Thay đổi cách import để giải quyết lỗi "Multiple instances"
import { getSupabase } from "../lib/supabaseClient";

// Lấy client bằng cách gọi hàm một lần duy nhất
const supabase = getSupabase();

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  // Thay `phone` bằng `email` để tương thích với Supabase
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sửa lại toàn bộ logic handleSubmit để kết nối với Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // --- LOGIC ĐĂNG KÝ TÀI KHOẢN MỚI ---
    if (isRegister) {
      if (form.password !== form.confirm) {
        setError("Mật khẩu không khớp");
        setLoading(false);
        return;
      }

      // 1. Gọi hàm signUp của Supabase để tạo người dùng trong hệ thống Auth
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (user) {
        // 2. (Quan trọng) Sau khi tạo user thành công, lưu thông tin công khai
        //    của họ vào bảng 'Users' mà chúng ta đã tạo.
        const { error: insertError } = await supabase
          .from('Users')
          .insert({
            id: user.id, // Dùng ID từ user vừa tạo
            full_name: form.name,
            email: form.email
          });
        
        if (insertError) {
            setError(`Tạo tài khoản thành công nhưng không thể lưu thông tin: ${insertError.message}`);
        } else {
            setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
            setForm({ name: "", email: "", password: "", confirm: "" });
        }
      }

    // --- LOGIC ĐĂNG NHẬP ---
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError("Email hoặc mật khẩu không đúng.");
      } else {
        // Đăng nhập thành công, Supabase tự quản lý session. Chuyển về trang chủ.
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="w-full max-w-md p-6 relative z-10">
        <div
          className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${
            isRegister ? "rotate-y-180" : ""
          }`}
        >
          {/* Login */}
          <div className="absolute w-full backface-hidden glass-card p-8 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Đăng nhập</h2>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded text-sm">{error}</div>}
            {success && <div className="bg-green-200 text-green-800 p-2 mb-4 rounded text-sm">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute top-3 left-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
                <span className="absolute top-2 right-3 cursor-pointer text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-400 to-yellow-300 hover:from-green-500 hover:to-yellow-400 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
            <p className="mt-4 text-center text-gray-900">
              Chưa có tài khoản?{" "}
              <span className="text-green-600 cursor-pointer font-medium" onClick={() => { setIsRegister(true); setError(""); setSuccess(""); }}>
                Đăng ký
              </span>
            </p>
          </div>

          {/* Register */}
          <div className="absolute w-full backface-hidden rotate-y-180 glass-card p-8 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Đăng ký</h2>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded text-sm">{error}</div>}
            {success && <div className="bg-green-200 text-green-800 p-2 mb-4 rounded text-sm">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                 <FaUser className="absolute top-3 left-4 text-gray-400" />
                 <input
                  type="text"
                  placeholder="Họ và tên"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
              </div>
              <div className="relative">
                <FaEnvelope className="absolute top-3 left-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
                <span className="absolute top-2 right-3 cursor-pointer text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
                <span className="absolute top-2 right-3 cursor-pointer text-gray-700" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-400 to-yellow-300 hover:from-green-500 hover:to-yellow-400 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </form>
            <p className="mt-4 text-center text-gray-900">
              Đã có tài khoản?{" "}
              <span className="text-green-600 cursor-pointer font-medium" onClick={() => { setIsRegister(false); setError(""); setSuccess(""); }}>
                Đăng nhập
              </span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .glass-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(15px);
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
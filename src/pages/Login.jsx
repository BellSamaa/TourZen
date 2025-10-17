// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaUser, FaEnvelope } from "react-icons/fa";
// THÊM: Import kết nối Supabase
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  // SỬA: Thay `phone` bằng `email`
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Sửa thành string để hiển thị thông báo
  const [loading, setLoading] = useState(false); // THÊM: State để xử lý loading
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // SỬA: Viết lại toàn bộ logic handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // --- LOGIC ĐĂNG KÝ ---
    if (isRegister) {
      if (form.password !== form.confirm) {
        setError("Mật khẩu không khớp");
        setLoading(false);
        return;
      }

      // Gọi hàm signUp của Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          // Lưu thêm thông tin vào profile của người dùng
          data: {
            full_name: form.name,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
        // Xóa form sau khi thành công
        setForm({ name: "", email: "", password: "", confirm: "" });
      }

    // --- LOGIC ĐĂNG NHẬP ---
    } else {
      // Gọi hàm signInWithPassword của Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError("Email hoặc mật khẩu không đúng.");
      } else {
        // Đăng nhập thành công, Supabase sẽ tự quản lý session
        // Chuyển hướng về trang chủ
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
          <div className="absolute w-full backface-hidden glass-card p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Đăng nhập</h2>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded text-sm">{error}</div>}
            {success && <div className="bg-green-200 text-green-800 p-2 mb-4 rounded text-sm">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SỬA: Đổi input từ phone sang email */}
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
                <span className="absolute top-2 right-3 cursor-pointer text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading} // THÊM: Vô hiệu hóa nút khi đang xử lý
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
          <div className="absolute w-full backface-hidden rotate-y-180 glass-card p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Đăng ký</h2>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded text-sm">{error}</div>}
            {success && <div className="bg-green-200 text-green-800 p-2 mb-4 rounded text-sm">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Họ và tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                required
              />
              {/* SỬA: Đổi input từ phone sang email */}
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
                <span className="absolute top-2 right-3 cursor-pointer text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full pl-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                  required
                />
                <span className="absolute top-2 right-3 cursor-pointer text-gray-700" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading} // THÊM: Vô hiệu hóa nút khi đang xử lý
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

      {/* THÊM: Bỏ FaCheckCircle vì đã có thông báo thành công */}

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
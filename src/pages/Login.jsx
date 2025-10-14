// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaUser } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      if (!form.name || !form.phone || !form.password || !form.confirm) {
        setError("Vui lòng điền đầy đủ thông tin");
        return;
      }
      if (form.password !== form.confirm) {
        setError("Mật khẩu không khớp");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsRegister(false);
        setForm({ name: "", phone: "", password: "", confirm: "" });
      }, 1000);
    } else {
      if (!form.phone || !form.password) {
        setError("Vui lòng điền SĐT và mật khẩu");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/");
      }, 800);
    }
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
      {/* overlay dịu mắt */}
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
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                <span
                  className="absolute top-2 right-3 cursor-pointer text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-400 to-yellow-300 hover:from-green-500 hover:to-yellow-400 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-200"
              >
                Đăng nhập
              </button>
            </form>
            <p className="mt-4 text-center text-gray-900">
              Chưa có tài khoản?{" "}
              <span
                className="text-green-600 cursor-pointer font-medium"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                }}
              >
                Đăng ký
              </span>
            </p>
          </div>

          {/* Register */}
          <div className="absolute w-full backface-hidden rotate-y-180 glass-card p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Đăng ký</h2>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Họ và tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-900 shadow-sm"
                required
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                <span
                  className="absolute top-2 right-3 cursor-pointer text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
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
                <span
                  className="absolute top-2 right-3 cursor-pointer text-gray-700"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-400 to-yellow-300 hover:from-green-500 hover:to-yellow-400 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-200"
              >
                Tạo tài khoản
              </button>
            </form>
            <p className="mt-4 text-center text-gray-900">
              Đã có tài khoản?{" "}
              <span
                className="text-green-600 cursor-pointer font-medium"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                }}
              >
                Đăng nhập
              </span>
            </p>
          </div>
        </div>
      </div>

      {success && (
        <FaCheckCircle className="absolute text-green-500 text-6xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl animate-bounce" />
      )}

      <style>{`
        .perspective-1200 { perspective: 1200px; }
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

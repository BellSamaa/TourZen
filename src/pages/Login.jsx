// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaFacebook, FaUser } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_KEY = "re_fEAkkZm4_7do16hgga5NUWenjbag35DZo";
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const url = isRegister ? `${API_BASE}/api/register` : `${API_BASE}/api/login`;
      const payload = isRegister
        ? { name: form.name, password: form.password }
        : { email: form.email, password: form.password };

      const res = await axios.post(url, payload, { headers: { Authorization: `Bearer ${API_KEY}` } });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate("/");
        }, 800);
      } else {
        setError(res.data.message || (isRegister ? "Đăng ký thất bại" : "Đăng nhập thất bại"));
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi server, vui lòng thử lại.");
    }
  };

  const handleFacebookLogin = async () => {
    setError("Chức năng Facebook đã tạm tắt");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      <div className="w-full max-w-md p-6 perspective-1200">
        <div
          className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${
            isRegister ? "rotate-y-180" : ""
          }`}
        >
          {/* Login */}
          <div className="absolute w-full backface-hidden glass-card p-8 rounded-xl shadow-xl animated-border hover-effect">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Đăng nhập</h2>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 text-gray-900"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 text-gray-900"
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
            <button
              onClick={handleFacebookLogin}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-200"
            >
              <FaFacebook /> Đăng nhập bằng Facebook
            </button>
            <p className="mt-4 text-center text-gray-800">
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
          <div className="absolute w-full backface-hidden rotate-y-180 glass-card p-8 rounded-xl shadow-xl animated-border hover-effect">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Đăng ký</h2>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Tên của bạn"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 text-gray-900"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/70 text-gray-900"
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
                Tạo tài khoản
              </button>
            </form>
            <p className="mt-4 text-center text-gray-800">
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
        <FaCheckCircle className="absolute text-green-500 text-6xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}

      <style>{`
        .perspective-1200 { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .glass-card {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
          position: relative;
          overflow: hidden;
        }
        .animated-border {
          border: 2px solid transparent;
          border-radius: 1rem;
          background-clip: padding-box, border-box;
          position: relative;
        }
        .animated-border::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: -1;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(270deg, #6ee7b7, #facc15, #34d399, #fbbf24, #6ee7b7);
          background-size: 600% 600%;
          animation: gradientBorder 10s ease infinite;
        }
        .hover-effect {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-effect:hover {
          transform: scale(1.03);
          box-shadow: 0 15px 30px rgba(0,0,0,0.25);
        }
        @keyframes gradientBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

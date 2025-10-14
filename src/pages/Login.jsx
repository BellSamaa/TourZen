// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaFacebook } from "react-icons/fa";

export default function Auth() {
  const { login, register, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [particles, setParticles] = useState([]);

  // --- Form submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isRegister) {
        res = await register(form); // Gọi backend /api/register
      } else {
        res = await login(form); // Gọi backend /api/login
      }
      if (res.success) {
        setSuccess(true);
        setShowCheck(true);
        generateParticles();
        setTimeout(() => {
          setShowCheck(false);
          setParticles([]);
          navigate("/");
        }, 1200);
      } else {
        setError(res.message || "Có lỗi xảy ra");
        triggerShake();
      }
    } catch (err) {
      setError("Lỗi server, vui lòng thử lại.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // --- Particle ---
  const generateParticles = () => {
    const arr = Array.from({ length: 15 }).map(() => ({
      id: Math.random(),
      left: Math.random() * 100 - 50,
      top: Math.random() * 100 - 50,
      size: Math.random() * 6 + 4,
      duration: Math.random() * 0.8 + 0.6,
    }));
    setParticles(arr);
  };

  // --- Facebook login ---
  const handleFacebookLogin = async () => {
    try {
      const res = await loginWithFacebook(); // OAuth backend
      if (res.success) {
        setSuccess(true);
        setShowCheck(true);
        generateParticles();
        setTimeout(() => {
          setShowCheck(false);
          setParticles([]);
          navigate("/");
        }, 1200);
      } else {
        setError(res.message || "Facebook login thất bại");
        triggerShake();
      }
    } catch {
      setError("Facebook login lỗi server");
      triggerShake();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 relative overflow-hidden">
      <div className={`
        relative bg-white shadow-xl rounded-xl p-8 w-full max-w-md
        animate-fadeIn
        ${shake ? "animate-shake" : ""}
        ${success ? "animate-success" : ""}
      `}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </h2>

        {error && !success && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded transition-all flex items-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="relative group">
              <input
                type="text"
                placeholder="Tên của bạn"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gradient-blue-purple transition-all duration-200 animate-input"
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="relative group">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400 group-focus-within:text-gradient-blue-purple transition-colors" />
            <input
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gradient-blue-purple transition-all duration-200 animate-input"
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <FaLock className="absolute top-3 left-3 text-gray-400 group-focus-within:text-gradient-blue-purple transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gradient-blue-purple transition-all duration-200 animate-input"
              required
            />
            <span
              className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-gradient-blue-purple transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg shadow-md transform hover:scale-105 transition-all duration-200"
          >
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>

        <div className="flex items-center justify-center mt-4">
          <button
            onClick={handleFacebookLogin}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 w-full"
          >
            <FaFacebook /> {isRegister ? "Đăng ký với Facebook" : "Đăng nhập với Facebook"}
          </button>
        </div>

        <p className="mt-5 text-center text-gray-500 text-sm">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <span
            className="text-blue-500 hover:underline font-medium cursor-pointer"
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
          >
            {isRegister ? "Đăng nhập ngay" : "Đăng ký ngay"}
          </span>
        </p>

        {/* Animated Check Icon */}
        {showCheck && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <FaCheckCircle className="text-green-500 text-6xl animate-checkBounce" />
          </div>
        )}

        {/* Particle Effects */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute bg-yellow-400 rounded-full pointer-events-none"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%)`,
              animation: `particleMove ${p.duration}s ease-out forwards`,
              '--dx': `${p.left}px`,
              '--dy': `${p.top}px`,
            }}
          />
        ))}
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }

        @keyframes inputPulse { 0% { box-shadow:0 0 0 rgba(59,130,246,0); } 50% { box-shadow:0 0 8px rgba(59,130,246,0.5); } 100% { box-shadow:0 0 0 rgba(59,130,246,0); } }
        .animate-input:focus { animation: inputPulse 0.5s ease-out; }

        @keyframes shake { 0%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-8px);}80%{transform:translateX(8px);}100%{transform:translateX(0);} }
        .animate-shake { animation: shake 0.5s; }

        @keyframes successFlash { 0%{background-color:#fff;}50%{background-color:#d1fae5;}100%{background-color:#fff;} }
        .animate-success { animation: successFlash 0.8s ease-out; }

        @keyframes checkBounce { 0%{transform:scale(0) translateY(0);opacity:0;}50%{transform:scale(1.2) translateY(-20px);opacity:1;}70%{transform:scale(0.9) translateY(0);}100%{transform:scale(1) translateY(0);opacity:1;} }
        .animate-checkBounce { animation: checkBounce 0.8s ease-out forwards; }

        @keyframes particleMove { 0%{transform:translate(-50%,-50%) scale(1);opacity:1;}100%{transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.5);opacity:0;} }

        .text-gradient-blue-purple { background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .focus\\:ring-gradient-blue-purple:focus { border-color: transparent; box-shadow: 0 0 8px 2px rgba(59,130,246,0.5),0 0 8px 2px rgba(139,92,246,0.5); }
      `}</style>
    </div>
  );
}

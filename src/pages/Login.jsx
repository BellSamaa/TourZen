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
    setError("");
    try {
      let res;
      if (isRegister) {
        res = await register(form);
      } else {
        res = await login(form);
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
    } catch {
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
      if (!window.FB) {
        setError("Facebook SDK chưa load");
        return;
      }
      window.FB.login(async (response) => {
        if (response.authResponse) {
          const res = await loginWithFacebook(response.authResponse.accessToken);
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
        } else {
          setError("Bạn đã hủy đăng nhập Facebook");
          triggerShake();
        }
      }, { scope: "email" });
    } catch {
      setError("Facebook login lỗi server");
      triggerShake();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80)',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={`relative bg-white/95 shadow-xl rounded-xl p-8 w-full max-w-md
        animate-fadeIn
        ${shake ? "animate-shake" : ""}
        ${success ? "animate-success" : ""}`}
      >
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
            <input
              type="text"
              placeholder="Tên của bạn"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          )}

          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <span
              className="absolute top-3 right-3 cursor-pointer"
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

        <button
          onClick={handleFacebookLogin}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
        >
          <FaFacebook /> {isRegister ? "Đăng ký với Facebook" : "Đăng nhập với Facebook"}
        </button>

        <p className="mt-5 text-center text-gray-600">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
          >
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </span>
        </p>

        {/* Animated Check Icon */}
        {showCheck && (
          <FaCheckCircle className="absolute text-green-500 text-6xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }

        @keyframes shake { 0%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-8px);}80%{transform:translateX(8px);}100%{transform:translateX(0);} }
        .animate-shake { animation: shake 0.5s; }

        @keyframes successFlash { 0%{background-color:#fff;}50%{background-color:#d1fae5;}100%{background-color:#fff;} }
        .animate-success { animation: successFlash 0.8s ease-out; }

        @keyframes particleMove { 0%{transform:translate(-50%,-50%) scale(1);opacity:1;}100%{transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.5);opacity:0;} }
      `}</style>
    </div>
  );
}

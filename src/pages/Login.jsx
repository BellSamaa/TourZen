// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaFacebook, FaUser } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);
  const [hue, setHue] = useState(0); // để đổi màu nền theo thời gian

  const API_KEY = "re_fEAkkZm4_7do16hgga5NUWenjbag35DZo";
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

  // Animate background hue
  useEffect(() => {
    const interval = setInterval(() => {
      setHue((prev) => (prev + 0.2) % 360); // tăng hue liên tục
    }, 30); // update mỗi 30ms
    return () => clearInterval(interval);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const url = isRegister ? `${API_BASE}/api/register` : `${API_BASE}/api/login`;
      const payload = isRegister ? form : { email: form.email, password: form.password };

      const res = await axios.post(url, payload, { headers: { Authorization: `Bearer ${API_KEY}` } });

      if (res.data.success) {
        setSuccess(true);
        generateParticles();
        setTimeout(() => {
          setSuccess(false);
          setParticles([]);
          navigate("/");
        }, 1200);
      } else {
        setError(res.data.message || (isRegister ? "Đăng ký thất bại" : "Đăng nhập thất bại"));
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi server, vui lòng thử lại.");
      triggerShake();
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/api/login/facebook`, {}, { headers: { Authorization: `Bearer ${API_KEY}` } });
      if (res.data.success) {
        setSuccess(true);
        generateParticles();
        setTimeout(() => {
          setSuccess(false);
          setParticles([]);
          navigate("/");
        }, 1200);
      } else {
        setError(res.data.message || "Facebook login thất bại");
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setError("Facebook login lỗi server");
      triggerShake();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1470&q=80)',
          filter: "blur(3px)",
          zIndex: 0,
          transition: "filter 0.3s",
          // đổi màu hue theo thời gian
          filter: `blur(3px) hue-rotate(${hue}deg)`,
        }}
      ></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* Form Container */}
      <div className="relative w-full max-w-md perspective-1200 z-10">
        <div
          className={`relative w-full transition-transform duration-800 transform-style-preserve-3d ${
            isRegister ? "rotate-y-180" : ""
          }`}
        >
          {/* Front: Login */}
          <div className="absolute w-full backface-hidden glass-card p-10 shine-card">
            <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Đăng nhập</h2>
            {error && <div className="bg-red-200 text-red-800 p-3 mb-4 rounded-lg flex items-center shadow-md">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FaEnvelope className="absolute top-3 left-3 text-gray-300" />
                <input
                  type="email"
                  placeholder="Nhập email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/10 text-white placeholder-white/70"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/10 text-white placeholder-white/70"
                  required
                />
                <span
                  className="absolute top-3 right-3 cursor-pointer text-white/80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-300 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Đăng nhập bằng Email
              </button>
            </form>
            <button
              onClick={handleFacebookLogin}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <FaFacebook /> Đăng nhập bằng Facebook
            </button>
            <p className="mt-5 text-center text-white/80">
              Chưa có tài khoản?{" "}
              <span
                className="text-green-300 cursor-pointer hover:text-green-100 font-medium"
                onClick={() => { setIsRegister(true); setError(""); }}
              >
                Đăng ký
              </span>
            </p>
          </div>

          {/* Back: Register */}
          <div className="absolute w-full backface-hidden rotate-y-180 glass-card p-10 shine-card">
            <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Đăng ký</h2>
            {error && <div className="bg-red-200 text-red-800 p-3 mb-4 rounded-lg flex items-center shadow-md">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FaUser className="absolute top-3 left-3 text-gray-300" />
                <input
                  type="text"
                  placeholder="Tên của bạn"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/10 text-white placeholder-white/70"
                  required
                />
              </div>
              <div className="relative">
                <FaEnvelope className="absolute top-3 left-3 text-gray-300" />
                <input
                  type="email"
                  placeholder="Nhập email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/10 text-white placeholder-white/70"
                  required
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3 left-3 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/10 text-white placeholder-white/70"
                  required
                />
                <span
                  className="absolute top-3 right-3 cursor-pointer text-white/80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-yellow-400 hover:from-green-600 hover:to-yellow-300 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Đăng ký bằng Email
              </button>
            </form>
            <button
              onClick={handleFacebookLogin}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <FaFacebook /> Đăng ký bằng Facebook
            </button>
            <p className="mt-5 text-center text-white/80">
              Đã có tài khoản?{" "}
              <span
                className="text-green-300 cursor-pointer hover:text-green-100 font-medium"
                onClick={() => { setIsRegister(false); setError(""); }}
              >
                Đăng nhập
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Particles + Success Icon */}
      {success && (
        <FaCheckCircle className="absolute text-green-500 text-6xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg" />
      )}
      {particles.map((p) => (
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
            "--dx": `${p.left}px`,
            "--dy": `${p.top}px`,
          }}
        />
      ))}

      <style>{`
        .perspective-1200 { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .glass-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 1rem;
          backdrop-filter: blur(15px);
          position: relative;
          overflow: hidden;
        }
        .shine-card::before {
          content: '';
          position: absolute;
          top: 0; left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(120deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
          transform: skewX(-25deg);
          animation: shineMove 2s linear infinite;
        }
        @keyframes shineMove {
          0% { left: -75%; }
          100% { left: 125%; }
        }
        @keyframes particleMove { 0%{transform:translate(-50%,-50%) scale(1);opacity:1;}100%{transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.5);opacity:0;} }
      `}</style>
    </div>
  );
}

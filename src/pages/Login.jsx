// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaFacebook,
  FaGoogle,
} from "react-icons/fa";

const API_KEY = "re_fEAkkZm4_7do16hgga5NUWenjbag35DZo";
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

const SocialButton = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-lg shadow-md transform hover:scale-105 transition-all duration-200 ${className}`}
  >
    {children}
  </button>
);

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);

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

  // --- Login Email ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${API_BASE}/api/login`,
        form,
        { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        setSuccess(true);
        generateParticles();
        setTimeout(() => {
          setSuccess(false);
          setParticles([]);
          navigate("/");
        }, 1200);
      } else {
        setError(res.data.message || "Đăng nhập thất bại");
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi server, vui lòng thử lại.");
      triggerShake();
    }
  };

  // --- Login Facebook ---
  const handleFacebookLogin = async () => {
    setError("");
    try {
      const res = await axios.post(
        `${API_BASE}/api/login/facebook`,
        {},
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
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

  // --- Login Google ---
  const handleGoogleLogin = async () => {
    setError("");
    try {
      const res = await axios.post(
        `${API_BASE}/api/login/google`,
        {},
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
      if (res.data.success) {
        setSuccess(true);
        generateParticles();
        setTimeout(() => {
          setSuccess(false);
          setParticles([]);
          navigate("/");
        }, 1200);
      } else {
        setError(res.data.message || "Google login thất bại");
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setError("Google login lỗi server");
      triggerShake();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <div
        className={`relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md
        animate-fadeIn ${shake ? "animate-shake" : ""} ${success ? "animate-success" : ""}`}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Đăng nhập
        </h2>

        {error && !success && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <span
              className="absolute top-3 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <SocialButton type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
            Đăng nhập bằng Email
          </SocialButton>
        </form>

        <div className="mt-4 space-y-3">
          <SocialButton
            onClick={handleFacebookLogin}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            <FaFacebook /> Facebook
          </SocialButton>

          <SocialButton
            onClick={handleGoogleLogin}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <FaGoogle /> Google
          </SocialButton>
        </div>

        {/* Success Check */}
        {success && (
          <FaCheckCircle className="absolute text-green-500 text-6xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
        )}

        {/* Particle Effects */}
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
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }

        @keyframes shake { 0%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-8px);}80%{transform:translateX(8px);}100%{transform:translateX(0);} }
        .animate-shake { animation: shake 0.5s; }

        @keyframes successFlash { 0%{background-color:#fff;}50%{background-color:#d1fae5;}100%{background-color:#fff;} }
        .animate-success { animation: successFlash 0.8s ease-out; }

        @keyframes bounce { 0%,100%{transform:translateY(0);}50%{transform:translateY(-15px);} }
        .animate-bounce { animation: bounce 0.8s ease-out forwards; }

        @keyframes particleMove { 0%{transform:translate(-50%,-50%) scale(1);opacity:1;}100%{transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.5);opacity:0;} }
      `}</style>
    </div>
  );
}

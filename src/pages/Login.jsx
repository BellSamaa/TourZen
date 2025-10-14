// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [particles, setParticles] = useState([]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const isSuccess = await login(form);
      if (isSuccess) {
        setSuccess(true);
        setShowCheck(true);
        generateParticles();
        setTimeout(() => {
          setShowCheck(false);
          setParticles([]);
          navigate("/");
        }, 1200); // particle effect + check effect duration
      } else {
        setError("Email hoặc mật khẩu không đúng!");
        triggerShake();
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Tạo particle khi login thành công
  const generateParticles = () => {
    const arr = Array.from({ length: 15 }).map(() => ({
      id: Math.random(),
      left: Math.random() * 100 - 50, // x offset
      top: Math.random() * 100 - 50, // y offset
      size: Math.random() * 6 + 4, // 4px - 10px
      duration: Math.random() * 0.8 + 0.6, // 0.6s - 1.4s
    }));
    setParticles(arr);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 relative overflow-hidden">
      <div className={`
        relative
        bg-white shadow-xl rounded-xl p-8 w-full max-w-md
        animate-fadeIn
        ${shake ? "animate-shake" : ""}
        ${success ? "animate-success" : ""}
      `}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Đăng nhập</h2>

        {error && !success && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded transition-all flex items-center">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          {/* Email Input */}
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

          {/* Password Input */}
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
            Đăng nhập
          </button>
        </form>

        <p className="mt-5 text-center text-gray-500 text-sm">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-blue-500 hover:underline font-medium">
            Đăng ký ngay
          </a>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }

        @keyframes inputPulse {
          0% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 8px rgba(59, 130, 246, 0.5); }
          100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
        }
        .animate-input:focus { animation: inputPulse 0.5s ease-out; }

        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        .animate-shake { animation: shake 0.5s; }

        @keyframes successFlash {
          0% { background-color: #ffffff; }
          50% { background-color: #d1fae5; }
          100% { background-color: #ffffff; }
        }
        .animate-success { animation: successFlash 0.8s ease-out; }

        @keyframes checkBounce {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          50% { transform: scale(1.2) translateY(-20px); opacity: 1; }
          70% { transform: scale(0.9) translateY(0); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-checkBounce { animation: checkBounce 0.8s ease-out forwards; }

        /* Particle move animation */
        @keyframes particleMove {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.5); opacity: 0; }
        }

        /* Gradient colors for focus/hover */
        .text-gradient-blue-purple {
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .focus\\:ring-gradient-blue-purple:focus {
          border-color: transparent;
          box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.5), 0 0 8px 2px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}

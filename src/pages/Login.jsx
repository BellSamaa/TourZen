// src/pages/Login.jsx
// (Nâng cấp giao diện + hiệu ứng - Đã sửa lỗi khai báo kép)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // <<< Thêm motion
import {
    FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaSignInAlt,
    FaMapMarkerAlt, FaPhone, FaInfoCircle // <<< Thêm icon info
} from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();

// --- Component PasswordStrengthMeter (Định nghĩa đầy đủ ở dưới) ---
// <<< XÓA ĐỊNH NGHĨA Ở ĐÂY >>>
// const PasswordStrengthMeter = ({ password }) => { /* ... code giữ nguyên ... */ };

// --- Component chính ---
export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const initialFormState = { name: "", email: "", password: "", confirm: "", address: "", phone_number: "" };
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === 'register') {
                if (form.password !== form.confirm) { throw new Error("Mật khẩu không khớp."); }
                if (form.password.length < 6) { throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");}

                const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                    options: { data: { full_name: form.name, } }
                });
                if (signUpError) { throw signUpError; }

                if (user) {
                    const { error: insertError } = await supabase
                        .from('Users')
                        .insert({
                            id: user.id,
                            full_name: form.name,
                            email: form.email,
                            address: form.address,
                            phone_number: form.phone_number,
                        });
                    if (insertError) {
                        console.error("Insert profile error:", insertError);
                        throw new Error(`Tài khoản đã tạo nhưng lỗi lưu hồ sơ: ${insertError.message}. Vui lòng thử đăng nhập và cập nhật sau.`);
                    }
                    setSuccess("Đăng ký thành công! 🎉 Vui lòng kiểm tra email để xác nhận.");
                    setForm(initialFormState);
                } else {
                    throw new Error("Không thể tạo người dùng. Vui lòng thử lại.");
                }

            } else { // Chế độ login
                const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
                    email: form.email,
                    password: form.password,
                });
                if (signInError) { throw new Error("Email hoặc mật khẩu không đúng."); }

                if (user) {
                    const { data: userData, error: userError } = await supabase
                        .from('Users')
                        .select('role, is_active')
                        .eq('id', user.id)
                        .single();

                    if (userError) { throw new Error("Lỗi lấy thông tin người dùng."); }
                    if (userData) {
                        if (userData.is_active === false) {
                            await supabase.auth.signOut();
                            throw new Error("Tài khoản của bạn đã bị khóa. 🔒");
                        }
                        navigate(userData.role === 'admin' ? "/admin" : "/");
                    } else {
                         throw new Error("Không tìm thấy hồ sơ người dùng tương ứng.");
                    }
                }
            }
        } catch (err) {
            setError(err.message || "Đã có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setError('');
        setSuccess('');
        setForm(initialFormState);
    }

    // --- Animation Variants (Giữ nguyên) ---
    const formContainerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
    };
    const inputGroupVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };
    const messageVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white p-4 overflow-hidden">
            {/* Background Gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-sky-900 via-indigo-900 to-purple-900 animate-gradient-xy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            />
            {/* Form Container */}
            <motion.div
                key={mode}
                className="w-full max-w-md p-8 relative z-10 bg-gray-800 bg-opacity-70 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl"
                variants={formContainerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo Placeholder */}
                <div className="text-center mb-6">
                     <h2 className="text-3xl font-bold text-sky-400 mt-2">TourZen</h2>
                </div>
                {/* Mode Switcher */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex rounded-lg bg-gray-700/50 p-1 shadow-inner">
                        <button onClick={() => handleModeChange('login')} className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-300 ${mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:text-white hover:bg-gray-700/30'}`}>Đăng nhập</button>
                        <button onClick={() => handleModeChange('register')} className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-300 ${mode === 'register' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:text-white hover:bg-gray-700/30'}`}>Đăng ký</button>
                    </div>
                </div>
                {/* Title */}
                <h3 className="text-2xl font-bold mb-1 text-center text-gray-100">{mode === 'login' ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới ✨'}</h3>
                <p className="text-center text-gray-400 mb-6 text-sm">{mode === 'login' ? 'Đăng nhập để tiếp tục khám phá' : 'Tham gia cộng đồng TourZen ngay'}</p>
                {/* Error/Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="bg-red-500/20 border border-red-500 text-red-300 p-3 mb-4 rounded-lg text-sm text-center flex items-center justify-center gap-2"
                            variants={messageVariants} initial="hidden" animate="visible" exit="exit"
                        >
                            <FaInfoCircle/> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            className="bg-green-500/20 border border-green-500 text-green-300 p-3 mb-4 rounded-lg text-sm text-center"
                            variants={messageVariants} initial="hidden" animate="visible" exit="exit"
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <AnimatePresence mode="popLayout">
                        {mode === 'register' && (
                            <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit">
                                <FaUser className="input-icon" />
                                <input type="text" placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                            </motion.div>
                        )}
                        <motion.div className="relative" variants={inputGroupVariants} layout>
                            <FaEnvelope className="input-icon" />
                            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
                        </motion.div>
                        {mode === 'register' && (
                            <>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input type="text" placeholder="Địa chỉ (Tỉnh/Thành phố)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
                                </motion.div>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit">
                                    <FaPhone className="input-icon" />
                                    <input type="tel" placeholder="Số điện thoại" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input-field" />
                                </motion.div>
                            </>
                        )}
                        <motion.div className="relative" variants={inputGroupVariants} layout>
                            <FaLock className="input-icon" />
                            <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-10" required />
                            <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </motion.div>
                        {mode === 'register' && (
                            <motion.div variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit">
                                <PasswordStrengthMeter password={form.password} />
                            </motion.div>
                        )}
                        {mode === 'register' && (
                            <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit">
                                <FaLock className="input-icon" />
                                <input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field pr-10" required />
                                <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r ${mode === 'login' ? 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' : 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'} text-white py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6 transform active:scale-95`}
                        whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.3)"}}
                    >
                        {loading ? (
                             <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                               {mode === 'login' ? <FaSignInAlt /> : <FaUser />}
                               <span>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>

            {/* --- CSS --- */}
            <style>{`
                .input-field { /* ... css giữ nguyên ... */ }
                .input-field:focus { /* ... css giữ nguyên ... */ }
                .input-field::placeholder { /* ... css giữ nguyên ... */ }
                .input-icon { /* ... css giữ nguyên ... */ }
                @keyframes gradient-xy { /* ... css giữ nguyên ... */ }
                .animate-gradient-xy { /* ... css giữ nguyên ... */ }
            `}</style>
        </div>
    );
}

// --- Component PasswordStrengthMeter (Định nghĩa đầy đủ ở đây) ---
const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState({ score: 0, label: '', color: '' });
    useEffect(() => {
        let score = 0; let label = 'Yếu'; let color = 'bg-red-500';
        if (!password) { setStrength({ score: 0, label: '', color: '' }); return; }
        if (password.length >= 8) score++; if (/[A-Z]/.test(password)) score++; if (/[a-z]/.test(password)) score++; if (/[0-9]/.test(password)) score++; if (/[^A-Za-z0-9]/.test(password)) score++;
        switch (score) { case 5: label = 'Rất mạnh 💪'; color = 'bg-emerald-500'; break; case 4: label = 'Mạnh 👍'; color = 'bg-green-500'; break; case 3: label = 'Trung bình 🙂'; color = 'bg-yellow-500'; break; default: label = 'Yếu 😕'; color = 'bg-red-500'; break; }
        setStrength({ score, label, color });
    }, [password]);

    if (!password) return null;

    return (
        <div className="w-full mt-1">
            <div className="relative w-full h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <motion.div
                    className={`absolute top-0 left-0 h-full rounded-full ${strength.color}`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(strength.score / 5) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            <AnimatePresence>
                {strength.label && (
                    <motion.p
                        key={strength.label}
                        className={`text-xs text-right mt-1 font-medium ${strength.color.replace('bg-', 'text-')}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {strength.label}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};
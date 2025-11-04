// HỆ THỐNG TÀI KHOẢN AUTH THẬT CỦA SUPABASE

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaSignInAlt,
    FaMapMarkerAlt, FaPhone, FaInfoCircle, FaCheckCircle,
    FaCalendarAlt, FaPaperPlane, FaKey 
} from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();
const phoneRegex = /^(0(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9]))\d{7}$/;

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState('login');
    // Xóa 'otp' khỏi state
    const initialFormState = { name: "", email: "", password: "", confirm: "", address: "", phone_number: "", ngay_sinh: "" };
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    // XÓA BỎ: isOtpSent và ADMIN_PHONE không còn cần thiết

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        
        try {
            if (mode === 'register') {
                // ========== ĐĂNG KÝ BẰNG SUPABASE AUTH ==========
                if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
                if (form.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
                if (form.phone_number && !phoneRegex.test(form.phone_number)) {
                    throw new Error("Số điện thoại không hợp lệ. Phải đủ 10 số và đúng đầu số (03, 05, 07, 08, 09).");
                }
                if (form.address.length < 10) {
                    throw new Error("Địa chỉ không hợp lệ. Vui lòng nhập địa chỉ đầy đủ (ít nhất 10 ký tự).");
                }

                // 1. Tạo tài khoản trong auth.users (Bảo mật)
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                    options: {
                        // Thêm dữ liệu này vào user metadata (nếu cần)
                        data: {
                            full_name: form.name,
                        }
                    }
                });

                if (authError) {
                    throw new Error(`Lỗi đăng ký Auth: ${authError.message}`);
                }
                if (!authData.user) {
                    throw new Error("Đăng ký thành công nhưng không nhận được thông tin user.");
                }

                // 2. Tạo hồ sơ trong public.Users (liên kết bằng ID)
                const customerCode = 'KH' + Date.now().toString().slice(-6);
                
                // (QUAN TRỌNG) Cột 'id' trong bảng Users của bạn PHẢI là UUID
                const { error: profileError } = await supabase
                    .from('Users')
                    .insert({
                        id: authData.user.id, // <<< LIÊN KẾT QUAN TRỌNG
                        email: form.email,
                        full_name: form.name,
                        address: form.address,
                        phone_number: form.phone_number || null,
                        ngay_sinh: form.ngay_sinh || null,
                        role: 'user',
                        customer_code: customerCode,
                        is_active: true
                        // KHÔNG CÓ CỘT PASSWORD Ở ĐÂY
                    });

                if (profileError) {
                    console.error("❌ Profile error:", profileError);
                    // Mặc dù lỗi profile, tài khoản Auth vẫn được tạo
                    throw new Error(`Tài khoản đã tạo nhưng lỗi khi lưu hồ sơ: ${profileError.message}`);
                }

                console.log("✅ User created:", authData.user);
                // (QUAN TRỌNG) Bạn cần bật "Confirm email" trong Supabase Auth
                setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
                setForm(initialFormState);
                
                setTimeout(() => {
                    setMode('login');
                    setSuccess('');
                }, 3000);

            } else if (mode === 'login') {
                // ========== ĐĂNG NHẬP BẰNG SUPABASE AUTH ==========
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: form.email,
                    password: form.password,
                });

                if (loginError) {
                    if (loginError.message === "Invalid login credentials") {
                        throw new Error("Email hoặc mật khẩu không đúng.");
                    }
                    if (loginError.message === "Email not confirmed") {
                         throw new Error("Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.");
                    }
                    throw loginError;
                }

                if (!loginData.session) {
                    throw new Error("Đăng nhập thất bại, không nhận được session.");
                }

                // Lấy thông tin role và is_active từ bảng Users (Profile)
                const { data: userData, error: userError } = await supabase
                    .from('Users')
                    .select('role, is_active')
                    .eq('id', loginData.user.id) // Lấy bằng ID (UUID)
                    .single();

                if (userError || !userData) {
                    // Nếu không có hồ sơ, đăng xuất user ra
                    await supabase.auth.signOut();
                    throw new Error("Xác thực thành công nhưng không tìm thấy hồ sơ người dùng.");
                }

                if (userData.is_active === false) {
                    // Tự động đăng xuất nếu tài khoản bị khóa
                    await supabase.auth.signOut();
                    throw new Error("Tài khoản của bạn đã bị khóa. 🔒");
                }
                
                // XÓA BỎ: localStorage.setItem, AuthContext sẽ tự xử lý

                setSuccess("Đăng nhập thành công! 🎉");
                
                // Chuyển hướng theo role
                const from = location.state?.from?.pathname || (userData.role === 'admin' ? "/admin" : "/");
                
                // Dùng window.location.href để BUỘC TẢI LẠI TRANG
                // Điều này sẽ ép AuthContext của bạn tải lại với session MỚI
                setTimeout(() => {
                    window.location.href = from;
                }, 1000);

            } else if (mode === 'forgot') {
                // ========== QUÊN MẬT KHẨU BẰNG SUPABASE AUTH ==========
                if (!form.email) throw new Error("Vui lòng nhập email của bạn.");

                // (QUAN TRỌNG) Đây là đường dẫn đến trang TẠO MẬT KHẨU MỚI
                // Bạn phải tự tạo trang này (ví dụ: /update-password)
                const redirectTo = `${window.location.origin}/update-password`;

                const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email, {
                    redirectTo: redirectTo,
                });

                if (resetError) {
                    // Không báo lỗi chi tiết để bảo mật
                    console.error("Lỗi reset pass:", resetError.message);
                }

                // Luôn luôn báo thành công để tránh bị dò email
                setSuccess("Đã gửi hướng dẫn. Vui lòng kiểm tra email (cả spam) để đặt lại mật khẩu.");
            }
        } catch (err) {
            console.error("Error:", err);
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
        // XÓA BỎ: setIsOtpSent(false);
    };

    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } };
    const formContainerVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99], staggerChildren: 0.05 } }
    };
    const inputGroupVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
    };
    const messageVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/login-background.jpg')" }}>
            <motion.div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" variants={backdropVariants} initial="hidden" animate="visible" />

            {/* Bỏ key={...isOtpSent} */}
            <motion.div key={mode} className="w-full max-w-md p-8 sm:p-10 relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white" variants={formContainerVariants} initial="hidden" animate="visible">
                <motion.div className="text-center mb-8" variants={inputGroupVariants}>
                    <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">TourZen</h2>
                    <p className="text-sm text-sky-300 mt-1">
                        {/* Sửa lại tiêu đề cho chế độ 'forgot' */}
                        {mode === 'forgot' ? 'Khôi phục mật khẩu' : 'Khám phá thế giới trong tầm tay'}
                    </p>
                </motion.div>

                {mode !== 'forgot' && (
                    <motion.div className="flex justify-center mb-8" variants={inputGroupVariants}>
                        <div className="inline-flex rounded-full bg-white/10 p-1 border border-white/20 shadow-inner">
                            <button onClick={() => handleModeChange('login')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${mode === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-200 hover:text-white'}`}>Đăng nhập</button>
                            <button onClick={() => handleModeChange('register')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${mode === 'register' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-200 hover:text-white'}`}>Đăng ký</button>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div key="error-message" className="bg-red-500/80 border border-red-400 text-white p-3 mb-4 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg" variants={messageVariants} initial="hidden" animate="visible" exit="exit">
                            <FaInfoCircle /> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div key="success-message" className="bg-green-500/80 border border-green-400 text-white p-3 mb-4 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg" variants={messageVariants} initial="hidden" animate="visible" exit="exit">
                            <FaCheckCircle /> {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.form onSubmit={handleSubmit} className="space-y-5" variants={inputGroupVariants}>
                    <AnimatePresence mode="popLayout">
                        {mode === 'register' && (
                            <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                <FaUser className="input-icon" />
                                <input type="text" placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                            </motion.div>
                        )}

                        <motion.div className="relative" variants={inputGroupVariants} layout>
                            <FaEnvelope className="input-icon" />
                            {/* Bỏ disabled và class bg-white/5 */}
                            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
                        </motion.div>

                        {mode === 'register' && (
                            <>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input type="text" placeholder="Địa chỉ (Tỉnh/Thành phố)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" required minLength={10} />
                                </motion.div>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                    <FaPhone className="input-icon" />
                                    <input type="tel" placeholder="Số điện thoại" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input-field" />
                                </motion.div>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                    <FaCalendarAlt className="input-icon" />
                                    <input type="date" title="Ngày sinh" value={form.ngay_sinh} onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })} className="input-field" />
                                </motion.div>
                            </>
                        )}

                        {/* XÓA BỎ: Ô nhập OTP */}
                        
                        {/* Chỉ hiển thị mật khẩu khi Đăng nhập hoặc Đăng ký */}
                        {mode !== 'forgot' && (
                            <>
                                <motion.div className="relative" variants={inputGroupVariants} layout>
                                    <FaLock className="input-icon" />
                                    <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu (Tối thiểu 6 ký tự)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-10" required />
                                    <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </motion.div>

                                {mode === 'register' && (
                                    <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                        <FaLock className="input-icon" />
                                        <input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field pr-10" required />
                                        <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowConfirm(!showConfirm)}>
                                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>

                    {mode === 'forgot' && (
                        <motion.p className="text-sm text-center text-gray-200" variants={inputGroupVariants}>
                            Nhập email của bạn. Chúng tôi sẽ gửi một liên kết
                            để bạn đặt lại mật khẩu.
                        </motion.p>
                    )}

                    <motion.button type="submit" disabled={loading} className={`w-full bg-gradient-to-r ${mode === 'login' ? 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700' : mode === 'register' ? 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700' : 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'} text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-8 transform active:scale-[0.97]`} whileHover={{ scale: 1.03, y: -3, transition: { type: 'spring', stiffness: 300 } }} variants={inputGroupVariants}>
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                {/* Sửa lại icon và text cho nút */}
                                {mode === 'login' ? <FaSignInAlt /> : mode === 'register' ? <FaUser /> : <FaPaperPlane />}
                                <span>{mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Gửi yêu cầu khôi phục'}</span>
                            </>
                        )}
                    </motion.button>

                    <motion.div className="text-center pt-2" variants={inputGroupVariants}>
                        <button type="button" onClick={() => mode === 'forgot' ? handleModeChange('login') : handleModeChange('forgot')} className="text-sm text-sky-300 hover:text-white transition-colors">
                            {mode === 'forgot' ? 'Quay lại trang Đăng nhập' : (mode === 'login' ? 'Quên mật khẩu?' : '')}
                        </button>
                    </motion.div>
                </motion.form>
            </motion.div>

            <style>{`
                .input-field {
                    width: 100%;
                    padding-left: 2.75rem;
                    padding-top: 0.8rem;
                    padding-bottom: 0.8rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 0.75rem;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: #FFFFFF;
                    transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
                    font-size: 0.9rem;
                    backdrop-filter: blur(2px);
                }
                .input-field:focus {
                    outline: none;
                    border-color: #38BDF8;
                    background-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.3);
                }
                .input-field::placeholder { color: rgba(255, 255, 255, 0.6); }
                .input-icon {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 0.9rem;
                    color: rgba(255, 255, 255, 0.5);
                    pointer-events: none;
                }
                input[type="date"].input-field { position: relative; color-scheme: dark; }
                input[type="date"].input-field::before {
                    content: 'Ngày sinh';
                    position: absolute;
                    left: 2.75rem;
                    top: 0.8rem;
                    color: rgba(255, 255, 255, 0.6);
                    display: block;
                    pointer-events: none;
                }
                input[type="date"].input-field:focus::before,
                input[type="date"].input-field:valid::before { display: none; }
                input[type="date"].input-field:valid { color: #FFFFFF; }
            `}</style>
        </div>
    );
}


// HỆ THỐNG ĐA XÁC THỰC (HYBRID: Auth cho Admin, Ảo cho User)
// (SỬA LỖI v27 - THEO YÊU CẦU) Sửa lỗi 406 Not Acceptable
// 1. (Fix) Xóa bước 'SELECT' email (kiểm tra existingUser)
//    vì RLS đang chặn request này từ user 'anon', gây lỗi 406.
// 2. (Fix) Chuyển logic bắt email trùng lặp xuống phần 'insertError',
//    dựa vào 'unique constraint "Users_email_key"'.

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
    // KHÔI PHỤC 'otp' cho hệ thống "Ảo"
    const initialFormState = { name: "", email: "", password: "", confirm: "", address: "", phone_number: "", ngay_sinh: "", otp: "" };
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    // KHÔI PHỤC state cho hệ thống "Ảo"
    const [isOtpSent, setIsOtpSent] = useState(false);
    const ADMIN_PHONE = "0912345678";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        
        try {
            if (mode === 'register') {
                // ========== ĐĂNG KÝ (Chỉ dành cho Khách hàng - Hệ thống "Ảo") ==========
                if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
                if (form.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");

                // ========== CẬP NHẬT VALIDATION (SĐT & ĐỊA CHỈ) ==========
                // (Giữ nguyên logic validation của bạn)
                if (form.phone_number) { 
                    if (form.phone_number.length !== 10) {
                        throw new Error("Số điện thoại phải có đúng 10 chữ số.");
                    }
                    if (!phoneRegex.test(form.phone_number)) {
                        throw new Error("Số điện thoại không hợp lệ (Sai đầu số hoặc định dạng).");
                    }
                }
                if (form.address.length < 5) { 
                    throw new Error("Địa chỉ (Tỉnh/Thành phố) có vẻ quá ngắn.");
                }
                if (!/[a-zA-Z]/.test(form.address)) { 
                    throw new Error("Địa chỉ (Tỉnh/Thành phố) phải chứa ký tự chữ (không chỉ số hoặc ký tự đặc biệt).");
                }
                if (/[!@#$%^&*()_+\=\[\]{};':"\\|<>?~]/.test(form.address)) {
                     throw new Error("Địa chỉ (Tỉnh/Thành phố) chứa ký tự đặc biệt không hợp lệ.");
                }
                
                // ========== KẾT THÚC CẬP NHẬT ==========

                // *** (SỬA LỖI v27) XÓA BƯỚC KIỂM TRA EMAIL (GÂY LỖI 406) ***
                // Lý do: RLS (Row Level Security) đang chặn request 'SELECT' 
                // từ người dùng ẩn danh (anonymous).
                
                // const { data: existingUser } = await supabase
                //     .from('Users')
                //     .select('email')
                //     .eq('email', form.email)
                //     .single();
                //
                // if (existingUser) {
                //     throw new Error("Email đã được sử dụng. Vui lòng dùng email khác.");
                // }
                // *** KẾT THÚC SỬA v27 ***


                const hashedPassword = btoa(form.password);
                
                // (Giữ nguyên) DB Trigger sẽ tự động gán mã KHxxxx
                const { error: insertError } = await supabase
                    .from('Users')
                    .insert({
                        email: form.email,
                        password: hashedPassword, // Lưu mật khẩu Base64
                        full_name: form.name,
                        address: form.address,
                        phone_number: form.phone_number || null,
                        ngay_sinh: form.ngay_sinh || null,
                        role: 'user', 
                        is_active: true
                    });

                if (insertError) {
                    // *** (SỬA v27) Bắt lỗi email trùng lặp tại đây ***
                    // (Giả định cột email của bạn có unique constraint là "Users_email_key")
                    if (insertError.message.includes('unique constraint "Users_email_key"')) {
                         throw new Error("Email đã được sử dụng. Vui lòng dùng email khác.");
                    }
                    // Nếu là lỗi khác
                    throw new Error(`Không thể tạo tài khoản: ${insertError.message}`);
                }

                // **************************************************
                // *** (Giữ nguyên) Đặt cờ localStorage cho popup ***
                localStorage.setItem('show_identity_prompt', 'true');
                // **************************************************

                // (Giữ nguyên) Báo thành công và chuyển sang login
                setSuccess("Đăng ký thành công! 🎉 Bạn có thể đăng nhập ngay.");
                setForm(initialFormState);
                
                setTimeout(() => {
                    setMode('login'); // <-- Chỉ đổi form, không đăng nhập
                    setSuccess('');
                }, 2000);

            } else if (mode === 'login') {
                // ========== ĐĂNG NHẬP (Đa hệ thống) ==========
                
                // (Toàn bộ logic Đăng nhập của bạn giữ nguyên)
                const { data: userProfile, error: profileError } = await supabase
                    .from('Users')
                    .select('*')
                    .eq('email', form.email)
                    .single();

                if (profileError || !userProfile) {
                    throw new Error("Email hoặc mật khẩu không đúng.");
                }
                if (userProfile.is_active === false) {
                    throw new Error("Tài khoản của bạn đã bị khóa. 🔒");
                }
                let from = "/"; 
                if (userProfile.role === 'admin' || userProfile.role === 'supplier') {
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                        email: form.email,
                        password: form.password,
                    });
                    if (loginError) {
                        throw new Error("Email hoặc mật khẩu không đúng.");
                    }
                    if (!loginData.session) {
                         throw new Error("Đăng nhập thất bại, không nhận được session.");
                    }
                    if(userProfile.role === 'admin') {
                        from = location.state?.from?.pathname || "/";
                    } else if (userProfile.role === 'supplier') {
                        from = "/supplier"; 
                    }
                } else {
                    if (!userProfile.password) {
                        throw new Error("Tài khoản này không có mật khẩu (Lỗi NULL). Vui lòng liên hệ Admin.");
                    }
                    try {
                        const decodedPassword = atob(userProfile.password);
                        if (decodedPassword !== form.password) {
                            throw new Error("Email hoặc mật khẩu không đúng.");
                        }
                    } catch (e) {
                        throw new Error("Đã xảy ra lỗi khi kiểm tra mật khẩu (Base64).");
                    }
                    // File: Login.jsx
// ...
                    // (SỬA) Lưu đầy đủ thông tin và mô phỏng cấu trúc user_metadata
                    localStorage.setItem('user', JSON.stringify({
                        id: userProfile.id,
                        email: userProfile.email,
                        role: userProfile.role,
                        customer_code: userProfile.customer_code,
                        
                        // THÊM DỮ LIỆU GỐC ĐỂ PAYMENT.JSX ĐỌC
                        full_name: userProfile.full_name, // Thêm gốc
                        phone_number: userProfile.phone_number, // Thêm SĐT
                        address: userProfile.address, // Thêm Địa chỉ

                        // Bắt chước cấu trúc metadata để các trang khác (như Payment) đọc đồng nhất
                        user_metadata: {
                            full_name: userProfile.full_name,
                            phone: userProfile.phone_number, // Lấy từ 'phone_number' của bảng Users
                            address: userProfile.address   // Lấy từ 'address' của bảng Users
                        }
                    }));
                    from = location.state?.from?.pathname || "/";
                }
                setSuccess("Đăng nhập thành công! 🎉");
                setTimeout(() => {
                    window.location.href = from;
                }, 1000);

            } else if (mode === 'forgot') {
                // (Toàn bộ logic Quên mật khẩu của bạn giữ nguyên)
                if (!form.email) throw new Error("Vui lòng nhập email của bạn.");
                if (!isOtpSent) {
                    const { data: user, error: findError } = await supabase
                        .from('Users')
                        .select('id, role')
                        .eq('email', form.email)
                        .single();
                    if (findError || !user) {
                        throw new Error("Email không tồn tại trong hệ thống.");
                    }
                    if (user.role === 'admin' || user.role === 'supplier') {
                         throw new Error("Không thể dùng chức năng này cho tài khoản Quản trị/NCC.");
                    }
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 24);
                    const { error: insertError } = await supabase
                        .from('password_reset_requests')
                        .insert({
                            email: form.email,
                            otp: null, 
                            is_resolved: false,
                            requested_at: new Date().toISOString(),
                            expires_at: expiresAt.toISOString()
                        });
                    if (insertError) throw insertError;
                    setSuccess(`Yêu cầu đã gửi! Vui lòng liên hệ Admin (SĐT: ${ADMIN_PHONE}) để nhận mã OTP.`);
                    setIsOtpSent(true);
                } else {
                    if (!form.otp || form.otp.length !== 6) throw new Error("Vui lòng nhập Mã OTP 6 số.");
                    if (!form.password || form.password.length < 6) throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
                    if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
                    
                    const { data: req, error: reqError } = await supabase
                        .from('password_reset_requests')
                        .select('*')
                        .eq('email', form.email)
                        .eq('token', form.otp) 
                        .eq('is_resolved', false)
                        .gt('expires_at', new Date().toISOString())
                        .single();

                    if (reqError || !req) {
                        throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
                    }
                    const hashedPassword = btoa(form.password); 
                    const { error: updateError } = await supabase
                        .from('Users')
                        .update({ password: hashedPassword }) 
                        .eq('email', form.email);
                    if (updateError) throw updateError;
                    await supabase
                        .from('password_reset_requests')
                        .update({ is_resolved: true })
                        .eq('id', req.id);
                    setSuccess("Đổi mật khẩu thành công! 🎉");
                    setForm(initialFormState);
                    setIsOtpSent(false);
                    setTimeout(() => setMode('login'), 2000);
                }
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
        setIsOtpSent(false); 
    };

    // ... (Toàn bộ phần JSX return giữ nguyên như file "hybrid" trước đó) ...
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

            <motion.div key={mode + (isOtpSent ? '-otp' : '')} className="w-full max-w-md p-8 sm:p-10 relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white" variants={formContainerVariants} initial="hidden" animate="visible">
                <motion.div className="text-center mb-8" variants={inputGroupVariants}>
                    <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">TourZen</h2>
                    <p className="text-sm text-sky-300 mt-1">
                        {mode === 'forgot' ? (isOtpSent ? 'Nhập Mã & Mật Khẩu Mới' : 'Yêu cầu Hỗ trợ Mật khẩu') : 'Khám phá thế giới trong tầm tay'}
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
                            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`input-field ${mode === 'forgot' && isOtpSent ? 'bg-white/5 cursor-not-allowed' : ''}`} required disabled={mode === 'forgot' && isOtpSent} />
                        </motion.div>

                        {mode === 'register' && (
                            <>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input type="text" placeholder="Địa chỉ (Tỉnh/Thành phố)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" required minLength={5} /> 
                                    {/* (Sửa) Giảm minLength xuống 5 để khớp logic validate */}
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

                        {mode === 'forgot' && isOtpSent && (
                            <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                <FaKey className="input-icon" />
                                <input type="text" placeholder="Mã OTP 6 số (từ Admin)" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} className="input-field" required />
                            </motion.div>
                        )}

                        {(mode !== 'forgot' || isOtpSent) && (
                            <>
                                <motion.div className="relative" variants={inputGroupVariants} layout>
                                    <FaLock className="input-icon" />
                                    <input type={showPassword ? "text" : "password"} placeholder={mode === 'forgot' ? "Mật khẩu mới (Tối thiểu 6 ký tự)" : "Mật khẩu"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-10" required />
                                    <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </motion.div>

                                {(mode === 'register' || (mode === 'forgot' && isOtpSent)) && (
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
                            {!isOtpSent ? "Nhập email của bạn để gửi yêu cầu hỗ trợ đến Admin." : (
                                <>Vui lòng liên hệ Admin (SĐT: <strong className="text-white">{ADMIN_PHONE}</strong>)<br /> để nhận Mã OTP và điền vào ô bên trên.</>
                            )}
                        </motion.p>
                    )}

                    <motion.button type="submit" disabled={loading} className={`w-full bg-gradient-to-r ${mode === 'login' ? 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700' : mode === 'register' ? 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700' : isOtpSent ? 'from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700' : 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'} text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-8 transform active:scale-[0.97]`} whileHover={{ scale: 1.03, y: -3, transition: { type: 'spring', stiffness: 300 } }} variants={inputGroupVariants}>
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
                                {mode === 'login' ? <FaSignInAlt /> : mode === 'register' ? <FaUser /> : (isOtpSent ? <FaLock /> : <FaPaperPlane />)}
                                <span>{mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : (isOtpSent ? 'Đổi mật khẩu' : 'Gửi yêu cầu hỗ trợ')}</span>
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
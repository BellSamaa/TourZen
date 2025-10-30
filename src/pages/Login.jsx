// src/pages/Login.jsx
// (Nâng cấp giao diện "Hoa lá cành" + Hiệu ứng - Đã sửa lỗi khai báo kép)
// (ĐÃ SỬA: Thêm trường Ngày Sinh)
// (*** NÂNG CẤP v8: Thêm Validate SĐT + Chức năng Quên Mật Khẩu ***)
// (*** SỬA LỖI v9: Chuyển luồng Quên Mật Khẩu sang sử dụng Mã Xác Nhận/Mật khẩu mới trực tiếp ***)

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaSignInAlt,
    FaMapMarkerAlt, FaPhone, FaInfoCircle, FaCheckCircle,
    FaCalendarAlt, FaQuestionCircle, FaPaperPlane, FaKey // SỬA v9: Thêm icon
} from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();

// --- (SỬA v8) Regex Validate SĐT Việt Nam ---
const phoneRegex = /^(0(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9]))\d{7}$/;

// --- Component PasswordStrengthMeter (Định nghĩa đầy đủ ở dưới) ---

// --- Component chính ---
export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
    const initialFormState = { name: "", email: "", password: "", confirm: "", address: "", phone_number: "", ngay_sinh: "", otp: "" }; // SỬA v9: Thêm otp
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    // SỬA v9: Trạng thái mới cho luồng Quên Mật Khẩu
    const [isOtpSent, setIsOtpSent] = useState(false); 

    // --- Hàm handleSubmit (Đã sửa điều hướng + Thêm mode 'forgot') ---
     const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            if (mode === 'register') {
                if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
                if (form.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
                
                // --- SỬA v8: VALIDATE SĐT ---
                if (form.phone_number && !phoneRegex.test(form.phone_number)) {
                    throw new Error("Số điện thoại không hợp lệ. Phải đủ 10 số và đúng đầu số (03, 05, 07, 08, 09).");
                }
                // --- KẾT THÚC SỬA SĐT ---

                const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name, } } });
                if (signUpError) throw signUpError;
                if (user) {
                    const { error: insertError } = await supabase.from('Users').upsert({ 
                        id: user.id, 
                        full_name: form.name, 
                        email: form.email, 
                        address: form.address, 
                        phone_number: form.phone_number,
                        ngay_sinh: form.ngay_sinh || null 
                    });
                    
                    if (insertError) { console.error("Upsert profile error:", insertError); throw new Error(`Lỗi lưu hồ sơ: ${insertError.message}. Vui lòng thử lại.`); }
                    setSuccess("Đăng ký thành công! 🎉 Vui lòng kiểm tra email để xác nhận.");
                    setForm(initialFormState);
                } else throw new Error("Không thể tạo người dùng.");
            
            } else if (mode === 'login') { // Login
                const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
                if (signInError) throw new Error("Email hoặc mật khẩu không đúng.");
                if (user) {
                    const { data: userData, error: userError } = await supabase.from('Users').select('role, is_active').eq('id', user.id).single();
                    if (userError) {
                         if (userError.code === 'PGRST116') {
                             const { error: insertError } = await supabase.from('Users').upsert({ id: user.id, email: user.email });
                             if (insertError) throw new Error("Lỗi tạo hồ sơ người dùng.");
                             navigate(location.state?.from?.pathname || "/", { replace: true });
                             return;
                         } else {
                             throw new Error("Lỗi lấy thông tin người dùng.");
                         }
                    }
                    if (userData) {
                        if (userData.is_active === false) { await supabase.auth.signOut(); throw new Error("Tài khoản của bạn đã bị khóa. 🔒"); }
                        const from = location.state?.from?.pathname || (userData.role === 'admin' ? "/admin" : "/");
                        navigate(from, { replace: true });
                    } else {
                        throw new Error("Không tìm thấy hồ sơ người dùng.");
                    }
                }
            } else if (mode === 'forgot') { // SỬA v9: Luồng Quên Mật Khẩu mới
                if (!form.email) throw new Error("Vui lòng nhập email của bạn.");
                
                if (!isOtpSent) {
                    // --- BƯỚC 1: YÊU CẦU GỬI MÃ OTP QUA EMAIL ---
                    // SỬA v9: Thay đổi luồng sang gửi yêu cầu reset mật khẩu trực tiếp.
                    // Supabase sẽ gửi một email chứa mã OTP hoặc link ma thuật (Magic Link). 
                    // Để đáp ứng yêu cầu 'gõ mã', ta dùng `sendOtp` với type 'recovery'.
                    // LƯU Ý: Admin phải cung cấp mã OTP cho khách qua kênh khác 
                    // nếu bạn không muốn dùng email của Supabase.
                    
                    const { error: otpError } = await supabase.auth.signInWithOtp({ 
                        email: form.email, 
                        options: { emailRedirectTo: window.location.origin, shouldCreateUser: false } // 'recovery' type is default for existing users in this flow
                    });

                    if (otpError) {
                        // Nếu tài khoản chưa xác nhận email, Supabase có thể báo lỗi
                        if (otpError.message.includes("Email rate limit exceeded")) throw new Error("Vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.");
                        if (otpError.message.includes("User not found")) throw new Error("Email không tồn tại trong hệ thống.");
                        throw new Error(`Lỗi gửi yêu cầu: ${otpError.message}.`);
                    }
                    
                    setSuccess("Mã xác nhận đã được gửi đến Email của bạn. Vui lòng kiểm tra hộp thư!");
                    setIsOtpSent(true); // Chuyển sang bước nhập mã
                } else {
                    // --- BƯỚC 2: NHẬP MÃ OTP VÀ MẬT KHẨU MỚI ---
                    if (!form.otp || !form.password || form.password.length < 6) {
                        throw new Error("Vui lòng nhập Mã xác nhận và Mật khẩu mới (tối thiểu 6 ký tự).");
                    }
                    if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
                    
                    // Supabase `updateUser` (Đã xác thực) hoặc `verifyOtp` (chưa xác thực)
                    // Vì luồng này phức tạp hơn (cần dùng mã), ta dùng `verifyOtp` với type 'recovery'
                    // và sau đó update mật khẩu.
                    
                    // Xác thực mã OTP
                    const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
                        email: form.email,
                        token: form.otp,
                        type: 'recovery'
                    });
                    
                    if (verifyError) throw new Error(`Mã xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.`);

                    // Đổi mật khẩu
                    const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
                    if (updateError) throw new Error(`Lỗi đổi mật khẩu: ${updateError.message}.`);
                    
                    setSuccess("Đổi mật khẩu thành công! 🎉 Vui lòng đăng nhập lại.");
                    setForm(initialFormState);
                    setIsOtpSent(false);
                    setMode('login'); // Quay lại mode login sau khi thành công
                }
            }
        } catch (err) { setError(err.message || "Đã có lỗi xảy ra."); }
        finally { setLoading(false); }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setError('');
        setSuccess('');
        setForm(initialFormState);
        setIsOtpSent(false); // SỬA v9: Reset trạng thái OTP
    }
    
    // SỬA v9: Thêm hàm xử lý khi quay lại Đăng nhập từ Quên Mật Khẩu
    const handleForgotBackToLogin = () => {
        setError("");
        setSuccess("");
        setForm(initialFormState);
        setIsOtpSent(false);
        setMode('login');
    }

    // --- Animation Variants ---
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
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/login-background.jpg')" }}
        >
            {/* Lớp phủ Gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
            />

            {/* Form Container */}
            <motion.div
                key={mode + (isOtpSent ? '-otp' : '')} // SỬA v9: Key theo isOtpSent
                className="w-full max-w-md p-8 sm:p-10 relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white"
                variants={formContainerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo */}
                <motion.div className="text-center mb-8" variants={inputGroupVariants}>
                     <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">TourZen</h2>
                     <p className="text-sm text-sky-300 mt-1">
                        {/* SỬA v9: Thay đổi tiêu đề con khi 'forgot' */}
                        {mode === 'forgot' ? (isOtpSent ? 'Nhập Mã & Mật Khẩu Mới' : 'Yêu cầu Đặt lại Mật khẩu') : 'Khám phá thế giới trong tầm tay'}
                     </p>
                </motion.div>

                {/* Mode Switcher (Ẩn khi 'forgot') */}
                {mode !== 'forgot' && (
                    <motion.div className="flex justify-center mb-8" variants={inputGroupVariants}>
                        <div className="inline-flex rounded-full bg-white/10 p-1 border border-white/20 shadow-inner">
                            <button onClick={() => handleModeChange('login')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${mode === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-200 hover:text-white'}`}>Đăng nhập</button>
                            <button onClick={() => handleModeChange('register')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${mode === 'register' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-200 hover:text-white'}`}>Đăng ký</button>
                        </div>
                    </motion.div>
                )}

                {/* Error/Success Messages */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            key="error-message"
                            className="bg-red-500/80 border border-red-400 text-white p-3 mb-4 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg"
                            variants={messageVariants} initial="hidden" animate="visible" exit="exit"
                        >
                            <FaInfoCircle/> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            key="success-message"
                            className="bg-green-500/80 border border-green-400 text-white p-3 mb-4 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg"
                            variants={messageVariants} initial="hidden" animate="visible" exit="exit"
                        >
                           <FaCheckCircle/> {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <motion.form onSubmit={handleSubmit} className="space-y-5" variants={inputGroupVariants}>
                     <AnimatePresence mode="popLayout">
                        {mode === 'register' && (
                            <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                <FaUser className="input-icon" />
                                <input type="text" placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                            </motion.div>
                        )}

                        {/* (SỬA v9) Email (Hiển thị cho cả 3 mode - Disable khi đã gửi OTP) */}
                        <motion.div className="relative" variants={inputGroupVariants} layout>
                            <FaEnvelope className="input-icon" />
                            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`input-field ${mode === 'forgot' && isOtpSent ? 'bg-white/5 cursor-not-allowed' : ''}`} required disabled={mode === 'forgot' && isOtpSent} />
                        </motion.div>

                        {mode === 'register' && (
                            <>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input type="text" placeholder="Địa chỉ (Tỉnh/Thành phố)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
                                </motion.div>
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                    <FaPhone className="input-icon" />
                                    <input type="tel" placeholder="Số điện thoại" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input-field" />
                                </motion.div>

                                {/* === THÊM TRƯỜNG NGÀY SINH === */}
                                <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                    <FaCalendarAlt className="input-icon" />
                                    <input
                                        type="date"
                                        title="Ngày sinh" // Tooltip
                                        value={form.ngay_sinh}
                                        onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })}
                                        className="input-field"
                                    />
                                </motion.div>
                            </>
                        )}

                        {/* (SỬA v9) Trường Mã Xác Nhận - Chỉ hiển thị khi mode='forgot' VÀ isOtpSent=true */}
                        {mode === 'forgot' && isOtpSent && (
                             <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                <FaKey className="input-icon" />
                                <input type="text" placeholder="Mã xác nhận (OTP)" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} className="input-field" required />
                            </motion.div>
                        )}

                        {/* (SỬA v9) Mật khẩu: Ẩn khi 'forgot' và chưa gửi OTP */}
                        {mode !== 'forgot' || isOtpSent ? (
                            <>
                                <motion.div className="relative" variants={inputGroupVariants} layout>
                                    <FaLock className="input-icon" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder={mode === 'forgot' ? "Mật khẩu mới (Tối thiểu 6 ký tự)" : "Mật khẩu"} 
                                        value={form.password} 
                                        onChange={(e) => setForm({ ...form, password: e.target.value })} 
                                        className="input-field pr-10" 
                                        required 
                                    />
                                    <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </motion.div>

                                {mode === 'register' && (
                                    <motion.div variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                        <PasswordStrengthMeter password={form.password} />
                                    </motion.div>
                                )}

                                {(mode === 'register' || mode === 'forgot') && ( // SỬA v9: Confirm cho cả register và forgot (khi đã gửi OTP)
                                    <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit" layout>
                                        <FaLock className="input-icon" />
                                        <input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field pr-10" required />
                                        <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowConfirm(!showConfirm)}>
                                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </motion.div>
                                )}
                            </>
                        ) : null}
                    </AnimatePresence>
                     
                    {/* (SỬA v9) Ghi chú cho mode 'forgot' */}
                    {mode === 'forgot' && (
                       <motion.p 
                           className="text-sm text-center text-gray-200"
                           variants={inputGroupVariants}
                       >
                           {!isOtpSent ? (
                                "Nhập email của bạn để nhận mã xác nhận đổi mật khẩu."
                           ) : (
                                "Vui lòng kiểm tra email và nhập Mã xác nhận (OTP) cùng với Mật khẩu mới."
                           )}
                       </motion.p>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        /* (SỬA v9) Thay đổi màu/icon/text cho luồng 'forgot' */
                        className={`w-full bg-gradient-to-r ${
                            mode === 'login' ? 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700' 
                            : mode === 'register' ? 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700' 
                            : isOtpSent ? 'from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700' : 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                        } text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-8 transform active:scale-[0.97]`}
                        whileHover={{ scale: 1.03, y: -3, transition: { type: 'spring', stiffness: 300 } }}
                        variants={inputGroupVariants}
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
                               {/* (SỬA v9) Thêm icon cho 'forgot' */}
                               {mode === 'login' ? <FaSignInAlt /> : mode === 'register' ? <FaUser /> : (isOtpSent ? <FaLock/> : <FaPaperPlane/>)}
                               <span>{mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : (isOtpSent ? 'Đổi mật khẩu' : 'Gửi yêu cầu')}</span>
                            </>
                        )}
                    </motion.button>
                    
                    {/* (SỬA v9) Nút 'Quên mật khẩu' / 'Quay lại Đăng nhập' */}
                    <motion.div className="text-center pt-2" variants={inputGroupVariants}>
                        <button
                            type="button"
                            onClick={() => handleForgotBackToLogin()} // SỬA v9: Luôn gọi hàm mới để reset trạng thái OTP
                            className="text-sm text-sky-300 hover:text-white transition-colors"
                        >
                            {mode === 'forgot' ? 'Quay lại trang Đăng nhập' : (mode === 'login' ? 'Quên mật khẩu?' : '')}
                        </button>
                    </motion.div>
                </motion.form>
            </motion.div>

            {/* --- CSS --- */}
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
                .input-field::placeholder {
                  color: rgba(255, 255, 255, 0.6);
                }
                .input-icon {
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  left: 0.9rem;
                  color: rgba(255, 255, 255, 0.5);
                  pointer-events: none;
                }
                
                /* SỬA: Thêm kiểu cho input date */
                input[type="date"].input-field {
                    position: relative;
                    color-scheme: dark; /* Giúp calendar picker thân thiện với nền tối */
                }
                
                /* Ẩn placeholder 'yyyy-mm-dd' mặc định và hiển thị chữ 'Ngày sinh' */
                input[type="date"].input-field::before {
                    content: 'Ngày sinh';
                    position: absolute;
                    left: 2.75rem; /* Giống padding-left */
                    top: 0.8rem; /* Giống padding-top */
                    color: rgba(255, 255, 255, 0.6); /* Màu placeholder */
                    display: block;
                    pointer-events: none; /* Cho phép click xuyên qua */
                }
                
                /* Ẩn chữ 'Ngày sinh' khi input có giá trị hoặc đang được focus */
                input[type="date"].input-field:focus::before,
                input[type="date"].input-field:valid::before {
                    display: none;
                }
                
                /* Đảm bảo text do người dùng nhập là màu trắng */
                input[type="date"].input-field:valid {
                   color: #FFFFFF;
                }
            `}</style>
        </div>
    );
}

// --- Component PasswordStrengthMeter (Định nghĩa đầy đủ ở đây) ---
const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState({ score: 0, label: '', color: '', textColor: 'text-gray-400' });
    useEffect(() => {
        let score = 0; let label = 'Yếu 😕'; let color = 'bg-red-500'; let textColor = 'text-red-300';
        if (!password) { setStrength({ score: 0, label: '', color: '', textColor: 'text-gray-400' }); return; }
        if (password.length >= 8) score++; if (/[A-Z]/.test(password)) score++; if (/[a-z]/.test(password)) score++; if (/[0-9]/.test(password)) score++; if (/[^A-Za-z0-9]/.test(password)) score++;
        switch (score) {
            case 5: label = 'Rất mạnh 💪'; color = 'bg-emerald-500'; textColor = 'text-emerald-300'; break;
            case 4: label = 'Mạnh 👍'; color = 'bg-green-500'; textColor = 'text-green-300'; break;
            case 3: label = 'Trung bình 🙂'; color = 'bg-yellow-500'; textColor = 'text-yellow-300'; break;
            default: label = 'Yếu 😕'; color = 'bg-red-500'; textColor = 'text-red-300'; break;
        }
        setStrength({ score, label, color, textColor });
    }, [password]);

    if (!password) return null;

    return (
        <div className="w-full mt-1">
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
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
                        className={`text-xs text-right mt-1 font-medium ${strength.textColor}`}
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
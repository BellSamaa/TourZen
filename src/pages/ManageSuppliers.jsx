// src/pages/Login.jsx
// (Nâng cấp giao diện "Hoa lá cành" + Hiệu ứng)
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // <<< Thêm useLocation
import { motion, AnimatePresence } from "framer-motion";
import {
    FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaSignInAlt,
    FaMapMarkerAlt, FaPhone, FaInfoCircle, FaCheckCircle // <<< Thêm CheckCircle
} from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();

// --- Component PasswordStrengthMeter (Giữ nguyên) ---
const PasswordStrengthMeter = ({ password }) => { /* ... code component này giữ nguyên ... */ };

// --- Component chính ---
export default function Login() {
    const navigate = useNavigate();
    const location = useLocation(); // <<< Lấy location
    const [mode, setMode] = useState('login');
    const initialFormState = { name: "", email: "", password: "", confirm: "", address: "", phone_number: "" };
    const [form, setForm] = useState(initialFormState);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // --- Hàm handleSubmit (Giữ nguyên logic) ---
     const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            if (mode === 'register') {
                if (form.password !== form.confirm) throw new Error("Mật khẩu không khớp.");
                if (form.password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
                const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name, } } });
                if (signUpError) throw signUpError;
                if (user) {
                    const { error: insertError } = await supabase.from('Users').insert({ id: user.id, full_name: form.name, email: form.email, address: form.address, phone_number: form.phone_number });
                    if (insertError) { console.error("Insert profile error:", insertError); throw new Error(`Lỗi lưu hồ sơ: ${insertError.message}. Vui lòng thử đăng nhập và cập nhật sau.`); }
                    setSuccess("Đăng ký thành công! 🎉 Vui lòng kiểm tra email để xác nhận.");
                    setForm(initialFormState);
                } else throw new Error("Không thể tạo người dùng.");
            } else { // Login
                const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
                if (signInError) throw new Error("Email hoặc mật khẩu không đúng.");
                if (user) {
                    const { data: userData, error: userError } = await supabase.from('Users').select('role, is_active').eq('id', user.id).single();
                    if (userError) throw new Error("Lỗi lấy thông tin người dùng.");
                    if (userData) {
                        if (userData.is_active === false) { await supabase.auth.signOut(); throw new Error("Tài khoản của bạn đã bị khóa. 🔒"); }
                        // <<< Điều hướng thông minh hơn: về trang trước đó nếu có >>>
                        const from = location.state?.from?.pathname || (userData.role === 'admin' ? "/admin" : "/");
                        navigate(from, { replace: true });
                    } else throw new Error("Không tìm thấy hồ sơ người dùng.");
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
    }

    // --- Animation Variants ---
    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } };
    const formContainerVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99], staggerChildren: 0.05 } } // <<< Thêm staggerChildren
    };
    const inputGroupVariants = { // <<< Hiệu ứng slide + fade cho input
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
            className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-cover bg-center bg-no-repeat" // <<< Thêm bg-no-repeat
            style={{ backgroundImage: "url('/images/login-background.jpg')" }}
        >
            {/* Lớp phủ Gradient tinh tế hơn */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" // <<< Gradient phủ
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
            />

            {/* Form Container */}
            <motion.div
                key={mode}
                // <<< Style form: Bo tròn lớn, nền mờ hơn, bóng đổ mềm mại >>>
                className="w-full max-w-md p-8 sm:p-10 relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-white" // <<< Nền mờ, chữ trắng
                variants={formContainerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo cách điệu */}
                <motion.div className="text-center mb-8" variants={inputGroupVariants}>
                     <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">TourZen</h2>
                     <p className="text-sm text-sky-300 mt-1">Khám phá thế giới trong tầm tay</p>
                </motion.div>

                {/* Mode Switcher */}
                <motion.div className="flex justify-center mb-8" variants={inputGroupVariants}>
                    <div className="inline-flex rounded-full bg-white/10 p-1 border border-white/20 shadow-inner">
                        <button onClick={() => handleModeChange('login')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${mode === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-gray-200 hover:text-white'}`}>Đăng nhập</button>
                        <button onClick={() => handleModeChange('register')} className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${mode === 'register' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-200 hover:text-white'}`}>Đăng ký</button>
                    </div>
                </motion.div>

                {/* Title (bỏ đi vì đã có logo và slogan) */}

                {/* Error/Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            // <<< Style thông báo lỗi nổi bật hơn >>>
                            className="bg-red-500/80 border border-red-400 text-white p-3 mb-4 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg"
                            variants={messageVariants} initial="hidden" animate="visible" exit="exit"
                        >
                            <FaInfoCircle/> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            // <<< Style thông báo thành công >>>
                            className="bg-green-500/80 border border-green-400 text-white p-3 mb-4 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg"
                            variants={messageVariants} initial="hidden" animate="visible" exit="exit"
                        >
                           <FaCheckCircle/> {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <motion.form onSubmit={handleSubmit} className="space-y-5" variants={inputGroupVariants}> {/* <<< Thêm variants stagger */}
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
                            <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </motion.div>

                        {mode === 'register' && (
                            <motion.div variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit">
                                {/* Component PasswordStrengthMeter dùng màu chữ trắng mặc định */}
                                <PasswordStrengthMeter password={form.password} />
                            </motion.div>
                        )}

                        {mode === 'register' && (
                            <motion.div className="relative" variants={inputGroupVariants} initial="hidden" animate="visible" exit="exit">
                                <FaLock className="input-icon" />
                                <input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field pr-10" required />
                                <span className="absolute top-1/2 transform -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                         // <<< Style nút bấm nổi bật hơn >>>
                        className={`w-full bg-gradient-to-r ${mode === 'login' ? 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700' : 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'} text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-8 transform active:scale-[0.97]`} // <<< Tăng mt, đổi py, bo tròn
                        whileHover={{ scale: 1.03, y: -3, transition: { type: 'spring', stiffness: 300 } }} // <<< Hiệu ứng hover kiểu spring
                        variants={inputGroupVariants} // <<< Thêm variant để có hiệu ứng vào cùng form
                    >
                        {loading ? ( /* ... svg loading ... */ ) : ( /* ... icon + text ... */ )}
                    </motion.button>
                </motion.form>
            </motion.div>

            {/* --- CSS (Sửa lại cho nền ảnh + form mờ) --- */}
            <style>{`
                .input-field {
                  width: 100%;
                  padding-left: 2.75rem;
                  padding-top: 0.8rem;
                  padding-bottom: 0.8rem;
                  border: 1px solid rgba(255, 255, 255, 0.3); /* Viền trắng mờ */
                  border-radius: 0.75rem; /* bo tròn lớn hơn */
                  background-color: rgba(255, 255, 255, 0.1); /* Nền trắng siêu mờ */
                  color: #FFFFFF; /* Chữ trắng */
                  transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
                  font-size: 0.9rem;
                  backdrop-filter: blur(2px); /* Thêm blur nhẹ cho input */
                }
                .input-field:focus {
                  outline: none;
                  border-color: #38BDF8; /* Viền xanh da trời sáng khi focus */
                  background-color: rgba(255, 255, 255, 0.15); /* Sáng hơn chút khi focus */
                  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.3);
                }
                .input-field::placeholder {
                  color: rgba(255, 255, 255, 0.6); /* Placeholder trắng mờ */
                }
                .input-icon {
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  left: 0.9rem;
                  color: rgba(255, 255, 255, 0.5); /* Icon trắng mờ */
                  pointer-events: none;
                }
                /* Bỏ animation gradient nền vì dùng ảnh */
            `}</style>
        </div>
    );
}

// --- Component PasswordStrengthMeter (Sửa lại màu chữ cho nền tối) ---
const PasswordStrengthMeter = ({ password }) => {
    const [strength, setStrength] = useState({ score: 0, label: '', color: '', textColor: 'text-gray-400' }); // <<< Mặc định màu text xám nhạt

    useEffect(() => {
        let score = 0; let label = 'Yếu 😕'; let color = 'bg-red-500'; let textColor = 'text-red-300'; // <<< Màu chữ sáng hơn
        if (!password) { setStrength({ score: 0, label: '', color: '', textColor: 'text-gray-400' }); return; }
        // ... (logic tính score giữ nguyên) ...
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
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden"> {/* <<< Nền thanh trắng mờ */}
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
                        className={`text-xs text-right mt-1 font-medium ${strength.textColor}`} // <<< Dùng textColor đã sửa
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
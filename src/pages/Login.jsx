// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FaLock, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaSignInAlt,
    FaMapMarkerAlt, FaPhone // <<< Thêm icon mới
} from "react-icons/fa";
import { getSupabase } from "../lib/supabaseClient";

const supabase = getSupabase();

// --- Component con để hiển thị độ mạnh mật khẩu (Giữ nguyên) ---
const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    let score = 0;
    let label = 'Yếu';
    let color = 'bg-red-500';

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 5:
        label = 'Rất mạnh';
        color = 'bg-emerald-500';
        break;
      case 4:
        label = 'Mạnh';
        color = 'bg-green-500';
        break;
      case 3:
        label = 'Trung bình';
        color = 'bg-yellow-500';
        break;
      default:
        label = 'Yếu';
        color = 'bg-red-500';
        break;
    }
    
    if(password.length > 0) {
        setStrength({ score, label, color });
    } else {
        setStrength({ score: 0, label: '', color: '' });
    }

  }, [password]);

  if (!password) return null;

  return (
    <div className="w-full mt-2">
      <div className="relative w-full h-2 bg-gray-600 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        ></div>
      </div>
      <p className={`text-xs text-right mt-1 ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
    </div>
  );
};


// --- Component chính ---
export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); 
  
  // <<< SỬA ĐỔI (1/4): Thêm address và phone_number vào state ---
  const initialFormState = { 
    name: "", 
    email: "", 
    password: "", 
    confirm: "", 
    address: "", 
    phone_number: "" 
  };
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

    if (mode === 'register') {
      if (form.password !== form.confirm) {
        setError("Mật khẩu không khớp.");
        setLoading(false);
        return;
      }
      
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (user) {
        
        // <<< SỬA ĐỔI (2/4): Thêm address và phone_number vào CSDL ---
        const { error: insertError } = await supabase
          .from('Users')
          .insert({
            id: user.id,
            full_name: form.name,
            email: form.email,
            address: form.address, // <-- Thêm địa chỉ
            phone_number: form.phone_number, // <-- Thêm SĐT
            // 'role' sẽ tự động nhận giá trị default 'user'
            // 'is_active' sẽ tự động nhận giá trị default 'true'
          });
        
        if (insertError) {
          setError(`Tài khoản đã được tạo nhưng không thể lưu thông tin: ${insertError.message}`);
        } else {
          setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
          setForm(initialFormState); // <-- Reset form
        }
      }
    
    } else {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError("Email hoặc mật khẩu không đúng.");
      } else if (user) {
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('role, is_active') // <<< Lấy thêm trạng thái active
          .eq('id', user.id)
          .single();

        if (userError) {
          setError("Không thể lấy thông tin vai trò người dùng.");
        } else if (userData) {
          
          // <<< SỬA ĐỔI: Kiểm tra tài khoản có bị khóa không
          if (userData.is_active === false) {
             setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.");
             setLoading(false);
             // Tự động logout nếu lỡ đăng nhập
             await supabase.auth.signOut(); 
             return;
          }

          if (userData.role === 'admin') {
            navigate("/admin/dashboard"); // Sửa thành /admin/dashboard cho rõ
          } else {
            navigate("/");
          }
        }
      }
    }

    setLoading(false);
  };
  
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    // <<< SỬA ĐỔI (3/4): Reset form đầy đủ ---
    setForm(initialFormState); 
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white p-4">
       <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-gradient-xy"></div>
      <div className="w-full max-w-md p-8 relative z-10 bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg bg-gray-700/50 p-1">
                <button onClick={() => handleModeChange('login')} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}>Đăng nhập</button>
                <button onClick={() => handleModeChange('register')} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'register' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'}`}>Đăng ký</button>
            </div>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-center text-gray-100">{mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</h2>
        <p className="text-center text-gray-400 mb-6">{mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Bắt đầu hành trình của bạn'}</p>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 mb-4 rounded-lg text-sm text-center">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 mb-4 rounded-lg text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* --- Các ô nhập liệu --- */}
            {mode === 'register' && (
                <div className="relative">
                    <FaUser className="absolute top-3.5 left-4 text-gray-400" />
                    <input type="text" placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
            )}
            
            <div className="relative">
                <FaEnvelope className="absolute top-3.5 left-4 text-gray-400" />
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
            </div>

             {/* <<< SỬA ĐỔI (4/4): Thêm 2 trường mới cho Đăng ký --- */}
            {mode === 'register' && (
              <>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute top-3.5 left-4 text-gray-400" />
                    <input type="text" placeholder="Địa chỉ (Tỉnh/Thành phố)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
                </div>
                <div className="relative">
                    <FaPhone className="absolute top-3.5 left-4 text-gray-400" />
                    <input type="tel" placeholder="Số điện thoại" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="input-field" />
                </div>
              </>
            )}
            
            <div className="relative">
                <FaLock className="absolute top-3.5 left-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pr-10" required />
                <span className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
            </div>
             {mode === 'register' && <PasswordStrengthMeter password={form.password} />}

            {mode === 'register' && (
                <div className="relative">
                    <FaLock className="absolute top-3.5 left-4 text-gray-400" />
                    <input type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field pr-10" required />
                     <span className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
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
                       {mode === 'login' ? <FaSignInAlt /> : <FaUser />}
                       <span>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
                    </>
                )}
            </button>
        </form>
      </div>

      {/* --- CSS (Giữ nguyên) --- */}
      <style>{`
        .input-field {
          width: 100%;
          padding-left: 2.5rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          border: 1px solid #4A5568;
          border-radius: 0.5rem;
          background-color: rgba(31, 41, 55, 0.5);
          color: #E5E7EB;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .input-field:focus {
          outline: none;
          border-color: #6366F1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
        }
        .input-field::placeholder {
          color: #9CA3AF;
        }
        @keyframes gradient-xy {
            0%, 100% {
                background-size: 400% 400%;
                background-position: top center;
            }
            50% {
                background-size: 200% 200%;
                background-position: bottom center;
            }
        }
        .animate-gradient-xy {
            animation: gradient-xy 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
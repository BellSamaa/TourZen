// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { getSupabase } from "../lib/supabaseClient";

// Khởi tạo Supabase client
const supabase = getSupabase();
const AuthContext = createContext();

/**
 * Hook tùy chỉnh để sử dụng AuthContext
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider: Component này sẽ bọc toàn bộ ứng dụng của bạn
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // Lưu session của Supabase auth
  const [user, setUser] = useState(null); // Lưu thông tin từ bảng 'Users' (full_name, role)
  const [isAdmin, setIsAdmin] = useState(false); // Biến quan trọng nhất: có phải admin không?
  const [loading, setLoading] = useState(true); // Trạng thái loading

  useEffect(() => {
    // 1. Lấy session (phiên đăng nhập) hiện tại ngay khi tải trang
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // 2. Nếu có session, lấy thông tin chi tiết (bao gồm role)
        getUserDetails(session.user.id);
      } else {
        // Không có session, không cần làm gì thêm
        setLoading(false);
      }
    });

    // 3. Lắng nghe các thay đổi về trạng thái xác thực (Đăng nhập, Đăng xuất)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (event === "SIGNED_IN") {
          // Khi người dùng vừa ĐĂNG NHẬP
          getUserDetails(session.user.id);
        } else if (event === "SIGNED_OUT") {
          // Khi người dùng vừa ĐĂNG XUẤT
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    // Dọn dẹp listener khi component bị unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Hàm lấy thông tin chi tiết (tên, vai trò) từ bảng 'Users' của chúng ta
   */
  const getUserDetails = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .single(); // Lấy một dòng duy nhất

    if (error) {
      console.error("Lỗi khi lấy thông tin vai trò người dùng:", error);
    } else if (data) {
      // Lưu thông tin (full_name, email, role)
      setUser(data);
      
      // KIỂM TRA QUYỀN ADMIN
      if (data.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    setLoading(false);
  };

  // Giá trị (value) mà chúng ta cung cấp cho toàn bộ ứng dụng
  const value = {
    session,  // Thông tin session (supabase.auth.session)
    user,     // Thông tin profile (từ bảng 'Users')
    isAdmin,  // Biến cờ (true/false) báo admin
    loading,  // Báo trạng thái loading
    // Lưu ý: hàm login, logout, register giờ nằm trong component Login.jsx
    // Nếu muốn gọi logout từ nơi khác, bạn có thể thêm hàm vào đây:
    logout: () => supabase.auth.signOut(), 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { getSupabase } from "../lib/supabaseClient";

// --- Khởi tạo Supabase client ---
const supabase = getSupabase();
const AuthContext = createContext();

// --- Hook tùy chỉnh để sử dụng AuthContext ---
export function useAuth() {
  return useContext(AuthContext);
}

// --- AuthProvider: Bọc toàn bộ ứng dụng ---
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);  // Phiên đăng nhập Supabase
  const [user, setUser] = useState(null);        // Thông tin người dùng (full_name, role, email)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false); // ✅ Thêm cho supplier
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Lấy session hiện tại khi tải trang
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        getUserDetails(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2️⃣ Lắng nghe thay đổi đăng nhập / đăng xuất
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === "SIGNED_IN") {
          getUserDetails(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(false);
          setIsSupplier(false);
        }
      }
    );

    // Dọn dẹp listener khi unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * 🔍 Lấy thông tin người dùng từ bảng "Users" (hoặc "profiles")
   */
  const getUserDetails = async (userId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("Users") // 👈 Đảm bảo bảng của bạn là "Users" hoặc "profiles"
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      setLoading(false);
      return;
    }

    if (data) {
      setUser(data);

      // 🔑 Xác định vai trò
      setIsAdmin(data.role === "admin");
      setIsSupplier(data.role === "supplier");
    }

    setLoading(false);
  };

  /**
   * 🔒 Hàm đăng xuất
   */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsSupplier(false);
    setSession(null);
  };

  // ✅ Cung cấp giá trị context
  const value = {
    session,
    user,
    isAdmin,
    isSupplier, // ✅ Thêm biến này để Navbar, SupplierDashboard nhận biết
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

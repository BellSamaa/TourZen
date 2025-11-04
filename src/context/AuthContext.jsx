// src/context/AuthContext.jsx
// (KHÔNG THAY ĐỔI - Code này đã xử lý đúng yêu cầu của bạn)

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
  const [session, setSession] = useState(null);  // Phiên đăng nhập Supabase (cho Admin)
  const [user, setUser] = useState(null);        // Thông tin người dùng (cho cả Admin và User)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Lấy session hiện tại khi tải trang (Kiểm tra cả 2 hệ thống)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // --- HỆ THỐNG 1: TÌM THẤY ADMIN (SUPABASE AUTH) ---
        getUserDetails(session.user.id);
      } else {
        // --- HỆ THỐNG 2: KHÔNG THẤY ADMIN, KIỂM TRA USER "ẢO" ---
        try {
          const localUser = localStorage.getItem('user');
          if (localUser) {
            const userData = JSON.parse(localUser);
            setUser(userData);
            setIsAdmin(userData.role === 'admin'); // (Sẽ là false, nhưng kiểm tra cho chắc)
            setIsSupplier(userData.role === 'supplier');
          }
        } catch (e) {
          console.error("Lỗi parse user 'ảo' từ localStorage:", e);
          localStorage.removeItem('user'); // Xóa data "ảo" bị hỏng
        } finally {
          setLoading(false); // Xong, vì không cần fetch gì thêm
        }
      }
    });

    // 2️⃣ Lắng nghe thay đổi đăng nhập / đăng xuất (Chỉ dành cho Supabase Auth - Admin)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === "SIGNED_IN") {
          getUserDetails(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(false);
          setIsSupplier(false);
          localStorage.removeItem('user'); // Đảm bảo xóa cả "ảo" khi Admin đăng xuất
        }
      }
    );

    // Dọn dẹp listener khi unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * 🔍 Lấy thông tin người dùng từ bảng "Users" (chỉ dùng cho Admin)
   */
  const getUserDetails = async (userId) => {
    // Đã set loading=true ở đầu useEffect, không cần set lại
    
    // (LƯU Ý: Nếu dùng hệ thống "hybrid", ID Admin phải là UUID
    // và ID User "ảo" phải là INT. Database của bạn phải hỗ trợ cả hai)
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId) // userId này là UUID từ Supabase Auth
      .single();

    if (error) {
      console.error("Lỗi khi lấy thông tin người dùng (Admin):", error);
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
   * 🔒 Hàm đăng xuất (Sửa để xóa cả 2 hệ thống)
   */
  const logout = async () => {
    await supabase.auth.signOut(); // 1. Đăng xuất Supabase Auth (Admin)
    localStorage.removeItem('user'); // 2. Xóa session "ảo" (User)
    
    // Reset state
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
    isSupplier,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
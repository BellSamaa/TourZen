// src/context/CartContext.jsx
// (ĐÃ SỬA: Phân tách giỏ hàng theo user.id)

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
// 👇 THÊM: Import useAuth (Giả định đường dẫn, hãy sửa nếu sai)
import { useAuth } from "./AuthContext.jsx"; 

// Tạo Context
const CartContext = createContext();

// Hook dùng trong component
export function useCart() {
  return useContext(CartContext);
}

// Hàm slugify (Giữ nguyên)
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

// Provider bao quanh App
export function CartProvider({ children }) {

  // --- (SỬA LỚN) TẠO KEY ĐỘNG ---
  const { user } = useAuth(); // 1. Lấy user từ AuthContext

  // 2. Tạo key động: "tourzen_cart_user_ID" nếu đã login, "tourzen_cart_guest" nếu chưa
  const cartKey = useMemo(() => {
    if (user && user.id) {
        return `tourzen_cart_user_${user.id}`;
    }
    return "tourzen_cart_guest"; // Key cho khách
  }, [user]);

  const [items, setItems] = useState(() => {
    try {
      // 3. Đọc giỏ hàng từ key động
      const raw = localStorage.getItem(cartKey); 
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 4. EFFECT 1: Lưu vào localStorage khi 'items' hoặc 'cartKey' thay đổi
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, cartKey]); // Thêm cartKey vào dependency

  // 5. EFFECT 2: Tải lại giỏ hàng khi 'cartKey' thay đổi (khi user đăng nhập/đăng xuất)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]); // Nếu lỗi, set giỏ hàng rỗng
    }
  }, [cartKey]); // Chỉ chạy khi cartKey thay đổi
  // --- KẾT THÚC SỬA LỚN ---


  // ✅ Thêm tour vào giỏ (Giữ nguyên)
  function addToCart({
    tour,
    monthData = { month: "Chưa chọn", prices: { adult: tour?.price || 0, child: 0, infant: 0, singleSupplement: 0 } },
    adults = 1,
    children = 0,
    infants = 0,
  }) {
    if (!tour) return;
    const key = `${tour.id}_${monthData.month}`;

    setItems((prev) => {
      const found = prev.find((p) => p.key === key);
      if (found) {
        return prev.map((p) =>
          p.key === key
            ? { ...p, adults: Math.max(p.adults + adults, 0), children: Math.max(p.children + children, 0), infants: Math.max(p.infants + infants, 0), }
            : p
        );
      }
      const tourName = tour.title || tour.name || "";
      const slug = slugify(tourName);
      const dynamicImage = slug ? `/images/tour-${slug}.jpg` : "/images/default.jpg";
      return [
        ...prev,
        {
          key, tourId: tour.id, title: tourName, month: monthData.month,
          departureDates: monthData.departureDates || [],
          adults: Math.max(adults, 0), children: Math.max(children, 0), infants: Math.max(infants, 0),
          priceAdult: monthData.prices?.adult || 0, priceChild: monthData.prices?.child || 0,
          priceInfant: monthData.prices?.infant || 0, singleSupplement: monthData.prices?.singleSupplement || 0,
          image: tour.image_url || tour.image || dynamicImage,
          location: tour.location || "",
        },
      ];
    });
  }

  // ✅ Xóa tour khỏi giỏ (Giữ nguyên)
  function removeFromCart(key) {
    setItems((prev) => prev.filter((p) => p.key !== key));
  }

  // ✅ Cập nhật số lượng (Giữ nguyên)
  function updateQty(key, adults, children, infants) {
    setItems((prev) =>
      prev.map((p) =>
        p.key === key
          ? { ...p, adults: Math.max(adults || 0, 0), children: Math.max(children || 0, 0), infants: Math.max(infants || 0, 0), }
          : p
      )
    );
  }

  // ✅ Cập nhật toàn bộ item (Giữ nguyên)
  function updateCartItem(index, newItem) {
    setItems((prev) => prev.map((item, i) => (i === index ? newItem : item)));
  }

  // ✅ Làm trống giỏ (Giữ nguyên)
  function clearCart() {
    setItems([]);
  }

  // ✅ Tính tổng tiền (Giữ nguyên)
  const total = items.reduce(
    (sum, i) =>
      sum +
      i.adults * (i.priceAdult || 0) +
      i.children * (i.priceChild || 0) +
      (i.singleSupplement || 0),
    0
  );

  // ✅ Trả giá trị (Giữ nguyên)
  const value = {
    items, addToCart, removeFromCart,
    updateQty, updateCartItem, clearCart, total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
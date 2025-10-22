// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

// Khóa lưu trong localStorage
const KEY = "tourzen_cart_v2";

// Tạo Context
const CartContext = createContext();

// ✅ Hook dùng trong component
export function useCart() {
  return useContext(CartContext);
}

// --- SỬA Ở ĐÂY: Thêm hàm slugify ---
// (Copy từ file TourDetail.jsx)
function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}
// --- KẾT THÚC SỬA ---

// ✅ Provider bao quanh App
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Lưu vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // ✅ Thêm tour vào giỏ
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
        // Cộng dồn số lượng nếu đã tồn tại
        return prev.map((p) =>
          p.key === key
            ? {
                ...p,
                adults: Math.max(p.adults + adults, 0),
                children: Math.max(p.children + children, 0),
                infants: Math.max(p.infants + infants, 0),
              }
            : p
        );
      }

      // --- SỬA Ở ĐÂY: Logic lấy ảnh động ---
      const tourName = tour.title || tour.name || "";
      const slug = slugify(tourName);
      const dynamicImage = slug ? `/images/tour-${slug}.jpg` : "/images/default.jpg";
      // --- KẾT THÚC SỬA ---

      // Thêm mới
      return [
        ...prev,
        {
          key,
          tourId: tour.id,
          title: tourName, // <-- Sửa: Dùng tourName
          month: monthData.month,
          departureDates: monthData.departureDates || [],
          adults: Math.max(adults, 0),
          children: Math.max(children, 0),
          infants: Math.max(infants, 0),
          priceAdult: monthData.prices?.adult || 0,
          priceChild: monthData.prices?.child || 0,
          priceInfant: monthData.prices?.infant || 0,
          singleSupplement: monthData.prices?.singleSupplement || 0,
          // --- SỬA Ở ĐÂY: Ưu tiên image_url, rồi đến ảnh động, cuối cùng là ảnh tour.image
          image: tour.image_url || tour.image || dynamicImage,
          // --- KẾT THÚC SỬA ---
          location: tour.location || "",
        },
      ];
    });
  }

  // ✅ Xóa tour khỏi giỏ
  function removeFromCart(key) {
    setItems((prev) => prev.filter((p) => p.key !== key));
  }

  // ✅ Cập nhật số lượng theo key
  function updateQty(key, adults, children, infants) {
    setItems((prev) =>
      prev.map((p) =>
        p.key === key
          ? {
              ...p,
              adults: Math.max(adults || 0, 0),
              children: Math.max(children || 0, 0),
              infants: Math.max(infants || 0, 0),
            }
          : p
      )
    );
  }

  // ✅ Cập nhật toàn bộ object item (dùng cho Payment.jsx)
  function updateCartItem(index, newItem) {
    setItems((prev) => prev.map((item, i) => (i === index ? newItem : item)));
  }

  // ✅ Làm trống giỏ
  function clearCart() {
    setItems([]);
  }

  // ✅ SỬA Ở ĐÂY: Tính tổng tiền an toàn (Không tính tiền cho em bé)
  const total = items.reduce(
    (sum, i) =>
      sum +
      i.adults * (i.priceAdult || 0) +
      i.children * (i.priceChild || 0) +
      // Dòng tính tiền cho em bé đã được xóa
      (i.singleSupplement || 0),
    0
  );

  // ✅ Trả giá trị cho context
  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    updateCartItem,
    clearCart,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
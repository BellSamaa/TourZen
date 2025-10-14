// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

// Khóa lưu trong localStorage
const KEY = "tourzen_cart_v2";

// Tạo Context
const CartContext = createContext();

// ✅ Hook để gọi trong các component khác
export function useCart() {
  return useContext(CartContext);
}

// ✅ Provider bao quanh toàn bộ app
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
  function addToCart(tour) {
    setItems((prev) => {
      const found = prev.find((p) => p.tourId === tour.id);
      if (found) {
        return prev.map((p) =>
          p.tourId === tour.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [
        ...prev,
        {
          tourId: tour.id,
          title: tour.title || tour.name,
          price: tour.price,
          qty: 1,
          image: tour.image,
          location: tour.location,
        },
      ];
    });
  }

  // ✅ Xóa tour khỏi giỏ
  function removeFromCart(tourId) {
    setItems((prev) => prev.filter((p) => p.tourId !== tourId));
  }

  // ✅ Cập nhật số lượng
  function updateQty(tourId, qty) {
    setItems((prev) =>
      prev.map((p) =>
        p.tourId === tourId ? { ...p, qty: Math.max(qty, 1) } : p
      )
    );
  }

  // ✅ Làm trống giỏ
  function clearCart() {
    setItems([]);
  }

  // ✅ Tính tổng tiền
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // ✅ Trả giá trị cho context
  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    total,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ✅ Export mặc định cho import linh hoạt
export default CartContext;

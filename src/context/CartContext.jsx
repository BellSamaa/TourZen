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
  function addToCart({ tour, monthData, adults = 1, children = 0, infants = 0 }) {
    if (!tour || !monthData) return;
    const key = `${tour.id}_${monthData.month}`; // mỗi tour theo tháng là 1 mục riêng
    setItems((prev) => {
      const found = prev.find((p) => p.key === key);
      if (found) {
        return prev.map((p) =>
          p.key === key
            ? {
                ...p,
                adults: p.adults + adults,
                children: p.children + children,
                infants: p.infants + infants,
              }
            : p
        );
      }
      return [
        ...prev,
        {
          key,
          tourId: tour.id,
          title: tour.title || tour.name,
          month: monthData.month,
          departureDates: monthData.departureDates,
          adults,
          children,
          infants,
          priceAdult: monthData.prices.adult,
          priceChild: monthData.prices.child,
          priceInfant: monthData.prices.infant,
          singleSupplement: monthData.prices.singleSupplement,
          image: tour.image,
          location: tour.location,
        },
      ];
    });
  }

  // ✅ Xóa tour khỏi giỏ
  function removeFromCart(key) {
    setItems((prev) => prev.filter((p) => p.key !== key));
  }

  // ✅ Cập nhật số lượng
  function updateQty(key, adults, children, infants) {
    setItems((prev) =>
      prev.map((p) =>
        p.key === key
          ? {
              ...p,
              adults: Math.max(adults, 0),
              children: Math.max(children, 0),
              infants: Math.max(infants, 0),
            }
          : p
      )
    );
  }

  // ✅ Làm trống giỏ
  function clearCart() {
    setItems([]);
  }

  // ✅ Tính tổng tiền
  const total = items.reduce(
    (sum, i) =>
      sum +
      i.adults * i.priceAdult +
      i.children * i.priceChild +
      i.infants * i.priceInfant,
    0
  );

  // ✅ Trả giá trị cho context
  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;

// src/pages/Cart.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQty, clearCart, total } = useCart();

  if (items.length === 0)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">🛒 Giỏ hàng trống</h2>
        <p className="text-gray-600 mb-6">
          Hãy khám phá các tour hấp dẫn và thêm vào giỏ nhé!
        </p>
        <Link
          to="/tours"
          className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-all"
        >
          Xem tour ngay
        </Link>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center">🧳 Giỏ hàng của bạn</h2>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        {items.map((item) => (
          <div
            key={item.tourId}
            className="flex flex-col sm:flex-row items-center justify-between border-b p-4 gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-500">{item.location}</p>
                <p className="font-bold text-sky-600">
                  {item.price.toLocaleString()}₫
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => updateQty(item.tourId, item.qty - 1)}
              >
                -
              </button>
              <span>{item.qty}</span>
              <button
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => updateQty(item.tourId, item.qty + 1)}
              >
                +
              </button>

              <button
                className="text-red-500 hover:text-red-600"
                onClick={() => removeFromCart(item.tourId)}
                title="Xóa tour này"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-10">
        <button
          onClick={clearCart}
          className="text-red-500 font-semibold hover:text-red-700"
        >
          🗑 Xóa tất cả
        </button>

        <div className="text-right">
          <p className="text-lg font-medium text-gray-600">Tổng cộng:</p>
          <p className="text-3xl font-bold text-sky-600">
            {total.toLocaleString()}₫
          </p>
          <Link
            to="/payment"
            className="mt-4 inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}

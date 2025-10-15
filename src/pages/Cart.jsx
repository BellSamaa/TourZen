// src/pages/Cart.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { FaPlus, FaMinus } from "react-icons/fa";
import { motion } from "framer-motion";

// Helper định dạng tiền tệ
const formatCurrency = (number) =>
  typeof number === "number"
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number)
    : "N/A";

export default function CartPage() {
  const { items, removeFromCart, updateQty, clearCart, total } = useCart();
  const [notification, setNotification] = useState("");

  if (!items || items.length === 0)
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

  // Hàm tính tổng tiền mỗi item
  const calculateItemTotal = (item) =>
    (item.adults || 0) * (item.priceAdult || 0) +
    (item.children || 0) * (item.priceChild || 0) +
    (item.infants || 0) * (item.priceInfant || 0) +
    (item.singleSupplement || 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10 text-center">🧳 Giỏ hàng của bạn</h2>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        {items.map((item) => (
          <div
            key={item.key}
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
                  {formatCurrency(calculateItemTotal(item))}
                </p>
              </div>
            </div>

            {/* Số lượng từng loại */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {["adults", "children", "infants"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {type === "adults"
                      ? "Người lớn"
                      : type === "children"
                      ? "Trẻ em"
                      : "Trẻ nhỏ"}
                  </span>
                  <button
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() =>
                      updateQty(
                        item.key,
                        Math.max(item.adults - (type === "adults" ? 1 : 0), 0),
                        Math.max(item.children - (type === "children" ? 1 : 0), 0),
                        Math.max(item.infants - (type === "infants" ? 1 : 0), 0)
                      )
                    }
                  >
                    <FaMinus />
                  </button>
                  <span>{item[type]}</span>
                  <button
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() =>
                      updateQty(
                        item.key,
                        item.adults + (type === "adults" ? 1 : 0),
                        item.children + (type === "children" ? 1 : 0),
                        item.infants + (type === "infants" ? 1 : 0)
                      )
                    }
                  >
                    <FaPlus />
                  </button>
                </div>
              ))}

              <button
                className="text-red-500 hover:text-red-600"
                onClick={() => removeFromCart(item.key)}
                title="Xóa tour này"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tổng cộng & nút thanh toán */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
        <button
          onClick={() => {
            clearCart();
            setNotification("Đã xóa tất cả tour trong giỏ!");
            setTimeout(() => setNotification(""), 3000);
          }}
          className="text-red-500 font-semibold hover:text-red-700"
        >
          🗑 Xóa tất cả
        </button>

        <div className="text-right">
          <p className="text-lg font-medium text-gray-600">Tổng cộng:</p>
          <p className="text-3xl font-bold text-sky-600">{formatCurrency(total)}</p>
          <Link
            to="/payment"
            className="mt-4 inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            Thanh toán
          </Link>
        </div>
      </div>

      {/* Thông báo */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg text-sm z-50"
        >
          {notification}
        </motion.div>
      )}
    </div>
  );
}

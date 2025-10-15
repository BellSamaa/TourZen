// src/pages/Payment.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import { FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";

// Format tiền
const formatCurrency = (number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);

const Payment = () => {
  const { items, removeFromCart, updateQty, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <motion.div
        className="text-center py-20 text-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Giỏ hàng trống. Vui lòng chọn tour trước khi thanh toán.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Thanh Toán</h1>

      {items.map((item) => (
        <div key={item.key} className="bg-white rounded-2xl shadow p-5 flex flex-col md:flex-row gap-4">
          <img
            src={item.image}
            alt={item.title}
            className="w-full md:w-48 h-32 md:h-40 object-cover rounded-xl"
          />
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-gray-500">Tháng: {item.month}</p>
              <p className="text-gray-500">Địa điểm: {item.location}</p>
              <p className="text-gray-500">Ngày khởi hành: {item.departureDates.join(" | ")}</p>

              {/* Giá */}
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
                <div>
                  <p>Người lớn:</p>
                  <p className="font-bold text-red-600">{formatCurrency(item.priceAdult)}</p>
                </div>
                <div>
                  <p>Trẻ em:</p>
                  <p className="font-bold text-red-600">{formatCurrency(item.priceChild)}</p>
                </div>
                <div>
                  <p>Trẻ nhỏ:</p>
                  <p className="font-bold text-red-600">{formatCurrency(item.priceInfant)}</p>
                </div>
                <div>
                  <p>Phụ thu phòng đơn:</p>
                  <p className="font-bold text-red-600">{formatCurrency(item.singleSupplement)}</p>
                </div>
              </div>

              {/* Số lượng */}
              <div className="mt-3 flex gap-3 items-center">
                <label className="flex items-center gap-1">
                  Người lớn:
                  <input
                    type="number"
                    min={0}
                    value={item.adults}
                    onChange={(e) =>
                      updateQty(item.key, parseInt(e.target.value), item.children, item.infants)
                    }
                    className="w-16 border rounded px-1 text-center"
                  />
                </label>
                <label className="flex items-center gap-1">
                  Trẻ em:
                  <input
                    type="number"
                    min={0}
                    value={item.children}
                    onChange={(e) =>
                      updateQty(item.key, item.adults, parseInt(e.target.value), item.infants)
                    }
                    className="w-16 border rounded px-1 text-center"
                  />
                </label>
                <label className="flex items-center gap-1">
                  Trẻ nhỏ:
                  <input
                    type="number"
                    min={0}
                    value={item.infants}
                    onChange={(e) =>
                      updateQty(item.key, item.adults, item.children, parseInt(e.target.value))
                    }
                    className="w-16 border rounded px-1 text-center"
                  />
                </label>
                <button
                  onClick={() => removeFromCart(item.key)}
                  className="ml-auto text-red-600 hover:text-red-800"
                  title="Xóa tour"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Tổng tiền tour này */}
              <p className="mt-2 font-semibold text-lg">
                Tổng:{" "}
                {formatCurrency(
                  item.adults * item.priceAdult +
                    item.children * item.priceChild +
                    item.infants * item.priceInfant
                )}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Tổng tất cả */}
      <div className="text-right text-2xl font-bold">
        Tổng cộng: {formatCurrency(total)}
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={clearCart}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          Xóa tất cả
        </button>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
          Thanh toán
        </button>
      </div>
    </motion.div>
  );
};

export default Payment;

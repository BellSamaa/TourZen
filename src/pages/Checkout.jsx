// src/pages/Checkout.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const tour = location.state?.tour;

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <p>Không có tour nào được chọn. Vui lòng quay lại trang chủ.</p>
        <button
          onClick={() => navigate("/")}
          className="ml-4 px-4 py-2 bg-yellow-500 rounded-lg text-black font-semibold"
        >
          Trang chủ
        </button>
      </div>
    );
  }

  const handleConfirm = (e) => {
    e.preventDefault();
    alert(`✅ Đặt tour ${tour.name} thành công!`);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/10">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          🧾 Thanh toán Tour
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full md:w-1/2 h-64 object-cover rounded-xl shadow-md"
          />

          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-semibold">{tour.name}</h2>
            <p className="text-gray-300">{tour.description}</p>
            <p className="text-yellow-300 font-bold text-lg">
              💰 Giá: {tour.price.toLocaleString()}₫
            </p>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-gray-300">Họ và tên</label>
            <input
              type="text"
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300">Số điện thoại</label>
            <input
              type="tel"
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-300">Số lượng người</label>
            <input
              type="number"
              min="1"
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="col-span-2 text-center mt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all"
            >
              ✅ Xác nhận thanh toán
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

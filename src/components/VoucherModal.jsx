import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const VoucherModal = ({ promo, onClose }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!promo) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      setStatus("Vui lòng điền đầy đủ Họ tên, SĐT và Email.");
      return;
    }

    setIsLoading(true);
    setStatus("Đang gửi...");

    try {
      const res = await fetch("/api/send-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, promo }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.message || "Gửi thành công! Kiểm tra mail của bạn.");
      } else {
        setStatus("Gửi thất bại: " + (data.error || "Thử lại sau."));
      }
    } catch (err) {
      console.error(err);
      setStatus("Gửi thất bại, thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white dark:bg-neutral-800 rounded-3xl shadow-xl max-w-sm w-full p-6 text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-teal-600 mb-3">
          Săn Voucher: {promo.title}
        </h2>

        <p className="mb-3 text-gray-700 dark:text-gray-300">
          Mã voucher:{" "}
          <span className="font-mono bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
            {promo.voucherCode}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-500 text-white py-2 rounded-full font-semibold hover:bg-teal-600 transition-colors disabled:opacity-70"
          >
            {isLoading ? "Đang gửi..." : "Gửi Voucher"}
          </button>
        </form>

        {status && (
          <p
            className={`mt-3 text-sm ${
              status.includes("thành công") ? "text-green-600" : "text-red-500"
            }`}
          >
            {status}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default VoucherModal;

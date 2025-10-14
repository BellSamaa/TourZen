// src/components/PaymentMethod.jsx
import React, { useState } from "react";
import { sendBookingEmail } from "../utils/email";

export default function PaymentMethod({ total, tourName }) {
  const [method, setMethod] = useState("vnpay");
  const [location, setLocation] = useState("Hà Nội");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleConfirm = async () => {
    if (!date || !location) {
      setMessage("Vui lòng chọn đầy đủ ngày và địa điểm.");
      return;
    }

    setSending(true);
    setMessage("Đang gửi email xác nhận...");

    const res = await sendBookingEmail({
      name: "Khách hàng",
      email: "example@gmail.com", // bạn có thể thay bằng email khách nhập
      tour: tourName,
      date: `${date} - ${time}`,
      location,
      total: `${total.toLocaleString()} đ`,
    });

    if (res.success) {
      setMessage("✅ Email xác nhận đã được gửi thành công!");
    } else {
      setMessage("❌ Gửi email thất bại. Vui lòng thử lại.");
    }

    setSending(false);
  };

  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white mt-4">
      <h3 className="text-lg font-semibold mb-3">Phương thức thanh toán</h3>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="method"
            value="vnpay"
            checked={method === "vnpay"}
            onChange={(e) => setMethod(e.target.value)}
          />
          Thanh toán qua VNPay
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="method"
            value="offline"
            checked={method === "offline"}
            onChange={(e) => setMethod(e.target.value)}
          />
          Đặt lịch hẹn đến cơ sở thanh toán
        </label>
      </div>

      {method === "offline" && (
        <div className="mt-4 space-y-2 border-t pt-3">
          <label className="block">
            Cơ sở gần nhất:
            <select
              className="border rounded-md p-2 w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>Hà Nội</option>
              <option>TP. Hồ Chí Minh</option>
              <option>Đà Nẵng</option>
              <option>Cần Thơ</option>
            </select>
          </label>

          <label className="block">
            Ngày đến cơ sở:
            <input
              type="date"
              className="border rounded-md p-2 w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="block">
            Giờ:
            <input
              type="time"
              className="border rounded-md p-2 w-full"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>

          <button
            onClick={handleConfirm}
            disabled={sending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mt-3"
          >
            {sending ? "Đang xử lý..." : "Xác nhận và gửi email"}
          </button>

          {message && <p className="text-sm mt-2 text-center">{message}</p>}
        </div>
      )}

      {method === "vnpay" && (
        <div className="mt-4">
          <button
            onClick={() => alert("🧾 Mô phỏng VNPay sandbox (chưa kết nối thật).")}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Thanh toán qua VNPay
          </button>
        </div>
      )}
    </div>
  );
}

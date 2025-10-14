// src/pages/Booking.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TOURS } from "../data/tours";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tour = TOURS.find(t => t.id === id);
  const { add } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    qty: 1,
    date: "",
    notes: ""
  });

  useEffect(()=> {
    if (user) setForm(f => ({ ...f, name: user.name || f.name, email: user.email || f.email }));
  }, [user]);

  if(!tour) return <div style={{ padding: 40 }}>Tour không tồn tại</div>;

  const subtotal = tour.price * form.qty;

  function handleAddToCart() {
    add({ tourId: tour.id, title: tour.title, price: tour.price, qty: form.qty });
    navigate("/cart");
  }

  function handleCheckout() {
    // create provisional booking in localStorage bookings list
    const bid = "B" + Date.now();
    const booking = {
      id: bid,
      tourId: tour.id,
      tourTitle: tour.title,
      qty: form.qty,
      total: subtotal,
      customer: { name: form.name, phone: form.phone, email: form.email },
      status: "PENDING",
      payMethod: "VNPAY",
      createdAt: new Date().toISOString(),
    };
    // persist bookings
    const key = "tourzen_bookings_v1";
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(booking);
    localStorage.setItem(key, JSON.stringify(arr));
    // redirect to payment simulation
    navigate(`/payment/vnpay?bid=${bid}`);
  }

  return (
    <main className="container">
      <h2>Đặt tour: {tour.title}</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <img src={tour.img} alt={tour.title} style={{ width: "100%", borderRadius: 8 }} />
          <p style={{ marginTop: 12 }}>{tour.description || "Chi tiết hành trình..."}</p>
          <div>
            <label>Ngày khởi hành
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            </label>
            <label>Số lượng
              <select value={form.qty} onChange={e=>setForm({...form,qty:Number(e.target.value)})}>
                {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label>Ghi chú
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}></textarea>
            </label>
          </div>
        </div>

        <aside style={{ width: 320 }}>
          <div className="price-box">
            <div style={{ fontWeight: 900, fontSize: 20 }}>{new Intl.NumberFormat("vi-VN").format(subtotal)}đ</div>
            <div className="small">Giá / {form.qty} khách</div>
            <div style={{ marginTop: 12, display:'flex', gap:8 }}>
              <button className="btn" onClick={handleCheckout}>Thanh toán VNPay</button>
              <button className="btn-outline" onClick={handleAddToCart}>Thêm vào giỏ</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

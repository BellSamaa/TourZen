// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layout & Utility Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Page Components
import Home from "./pages/Home.jsx";
import TourList from "./pages/TourList.jsx";
import TourDetail from "./pages/TourDetail.jsx";
import Booking from "./pages/Booking.jsx";
import VNPAYPage from "./pages/VNPAYPage";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import CartPage from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import HotelPage from "./pages/HotelPage.jsx";
import PromotionPage from "./pages/PromotionPage.jsx";
import Checkout from "./pages/Checkout.jsx";
import About from "./pages/About.jsx";
import AdminHotels from "./pages/AdminHotels.jsx"; // <-- 1. IMPORT TRANG MỚI

// Context Providers
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// CSS Imports
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./index.css";

// Component NotFound
function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h2 className="text-4xl font-bold">404</h2>
        <p className="text-neutral-500 mt-2">
          Không tìm thấy trang bạn yêu cầu.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <Navbar />

        <main className="pt-[76px] bg-white dark:bg-neutral-900 min-h-screen">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about-tourzen" element={<About />} />
              <Route path="/tours" element={<TourList />} />
              <Route path="/tour/:id" element={<TourDetail />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/hotels" element={<HotelPage />} />
              <Route path="/promotions" element={<PromotionPage />} />
              <Route path="/payment/*" element={<Payment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />
              
              {/* --- VÙNG ADMIN --- */}
              {/* 2. THÊM ROUTE CỤ THỂ CHO QUẢN LÝ KHÁCH SẠN */}
              <Route path="/admin/hotels" element={<AdminHotels />} /> 

              {/* Route chung cho dashboard admin phải đặt sau */}
              <Route path="/admin/*" element={<AdminDashboard />} />

              <Route path="/vnpay" element={<VNPAYPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}

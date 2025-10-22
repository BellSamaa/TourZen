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
import Booking from "./pages/Booking.jsx"; // Lưu ý trang này
import VNPAYPage from "./pages/VNPAYPage";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import CartPage from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SupplierDashboard from "./pages/SupplierDashboard.jsx";
import HotelPage from "./pages/HotelPage.jsx"; // Lưu ý trang này
import PromotionPage from "./pages/PromotionPage.jsx";
import Checkout from "./pages/Checkout.jsx"; // Lưu ý trang này
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx"; // 👈 THÊM IMPORT TRANG SERVICES

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
    <div className="flex items-center justify-center min-h-screen text-center">
      <div>
        <h2 className="text-4xl font-bold dark:text-white">404</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">Không tìm thấy trang bạn yêu cầu.</p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  // Logic ẩn/hiện Navbar/Footer (giữ nguyên)
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSupplierRoute = location.pathname.startsWith('/supplier');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'; // Sửa lại để bao gồm cả register

  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        {/* Ẩn Navbar/Footer */}
        {!isAdminRoute && !isSupplierRoute && !isAuthRoute && <Navbar />}

        <main className={!isAdminRoute && !isSupplierRoute && !isAuthRoute ? "pt-[76px] bg-white dark:bg-neutral-900 min-h-screen" : "bg-white dark:bg-neutral-900 min-h-screen"}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* === Public Routes === */}
              <Route path="/" element={<Home />} />
              <Route path="/about-tourzen" element={<About />} />
              <Route path="/tours" element={<TourList />} />
              <Route path="/tour/:id" element={<TourDetail />} />
              {/* Lưu ý: Xem lại mục đích của /booking/:id và /checkout */}
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Lưu ý: Đảm bảo /hotels lấy dữ liệu từ bảng Suppliers */}
              <Route path="/hotels" element={<HotelPage />} />
              <Route path="/promotions" element={<PromotionPage />} />
              <Route path="/payment" element={<Payment />} /> {/* Sửa lại path payment */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/vnpay" element={<VNPAYPage />} />

              {/* === THÊM ROUTE SERVICES === */}
              <Route path="/services" element={<Services />} />

              {/* === Auth Routes === */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login />} />

              {/* === Private Dashboards === */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/supplier/*" element={<SupplierDashboard />} />

              {/* Route cuối cùng cho trang không tìm thấy */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Ẩn Footer */}
        {!isAdminRoute && !isSupplierRoute && !isAuthRoute && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}
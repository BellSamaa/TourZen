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
// Register.jsx không cần nữa vì Login đã bao gồm
// import Register from "./pages/Register.jsx"; 
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Trang Admin
import SupplierDashboard from "./pages/SupplierDashboard.jsx"; // 👈 THÊM TRANG SUPPLIER
import HotelPage from "./pages/HotelPage.jsx";
import PromotionPage from "./pages/PromotionPage.jsx";
import Checkout from "./pages/Checkout.jsx";
import About from "./pages/About.jsx";

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
        <p className="text-neutral-500 mt-2">Không tìm thấy trang bạn yêu cầu.</p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  // Giả sử Navbar/Footer có logic ẩn/hiện dựa trên location
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSupplierRoute = location.pathname.startsWith('/supplier');
  const isAuthRoute = location.pathname === '/login';

  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        {/* Ẩn Navbar/Footer trên các trang Dashboard và trang Login */}
        {!isAdminRoute && !isSupplierRoute && !isAuthRoute && <Navbar />}

        <main className={!isAdminRoute && !isSupplierRoute && !isAuthRoute ? "pt-[76px] bg-white dark:bg-neutral-900 min-h-screen" : "bg-white dark:bg-neutral-900 min-h-screen"}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* === Public Routes === */}
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
              <Route path="/vnpay" element={<VNPAYPage />} />

              {/* === Auth Routes === */}
              <Route path="/login" element={<Login />} />
              {/* Trang Register dùng chung component Login */}
              <Route path="/register" element={<Login />} /> 

              {/* === Private Dashboards === */}
              {/* 👈 SỬA ADMIN ROUTE */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              {/* 👈 THÊM SUPPLIER ROUTE MỚI */}
              <Route path="/supplier/*" element={<SupplierDashboard />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>

        {!isAdminRoute && !isSupplierRoute && !isAuthRoute && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}

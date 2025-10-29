// src/App.jsx
// (ĐÃ SỬA: Thêm wildcard /* cho các route dashboard)

import React from "react";
import { Routes, Route, Outlet, Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Layout & Utility Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// === 1. IMPORT CÁC TRANG PUBLIC ===
import Home from "./pages/Home.jsx";
import TourList from "./pages/TourList.jsx";
import TourDetail from "./pages/TourDetail.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import PromotionPage from "./pages/PromotionPage.jsx"; // Bổ sung PromotionPage
import NotFound from "./pages/NotFound.jsx"; // Bổ sung NotFound

// === 2. IMPORT LAYOUT VÀ CÁC TRANG ADMIN ===
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Layout Admin
import SupplierDashboard from "./pages/SupplierDashboard.jsx"; // Layout NCC

// Các trang con của Admin (sẽ được render bên trong AdminDashboard)
import DashboardHome from './pages/DashboardHome.jsx';
import Reports from './pages/Reports.jsx';
import AdminManageProducts from './pages/AdminManageProducts.jsx';
import ManageTour from './pages/ManageTour.jsx';
import ManageCustomers from './pages/ManageCustomers.jsx';
import ManageSuppliers from './pages/ManageSuppliers.jsx';
import ManageAccounts from './pages/ManageAccounts.jsx';

// (Thêm các trang con của Supplier nếu chưa import trong SupplierDashboard.jsx)
// import SupplierHome from "./pages/SupplierHome.jsx";
// import SupplierManageProducts from "./pages/SupplierManageProducts";
// import ManageTransport from "./pages/ManageTransport";
// import ManageFlights from "./pages/ManageFlights";
// import SupplierAddQuickTour from "./pages/SupplierAddQuickTour";

// Context Providers
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// CSS Imports
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./index.css";

// --- Component Layout (Public) ---
const SiteLayout = () => {
    const location = window.location;
    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };
    const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900">
            <Navbar />
            <main className="flex-grow pt-[76px] relative"> {/* pt bằng chiều cao Navbar */}
                 <AnimatePresence mode="wait">
                    {/* Sử dụng Outlet để render trang con */}
                    {/* Key={location.pathname} đảm bảo animation chạy khi đổi trang */}
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        // Style position absolute để animation chồng lên nhau mượt mà
                        style={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
                    >
                        <Outlet />
                    </motion.div>
                 </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};


// --- Component App chính (ĐÃ SỬA Routes) ---
export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <ScrollToTop />
                <Routes>
                    {/* === Public Routes (Sử dụng SiteLayout) === */}
                    <Route path="/" element={<SiteLayout />}>
                        <Route index element={<Home />} />
                        <Route path="about-tourzen" element={<About />} />
                        <Route path="tours" element={<TourList />} />
                        <Route path="tour/:id" element={<TourDetail />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="payment" element={<Payment />} />
                        <Route path="payment-success" element={<PaymentSuccess />} />
                        <Route path="services" element={<Services />} />
                        <Route path="my-bookings" element={<MyBookings />} />
                        <Route path="promotions" element={<PromotionPage />} /> {/* Bổ sung promotions */}
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Login />} />
                        {/* Route 404 cho các trang public nằm trong SiteLayout */}
                        <Route path="*" element={<NotFound />} />
                    </Route> {/* Kết thúc SiteLayout */}


                    {/* === Private Dashboards (Layout riêng + Route con) === */}

                    {/* 1. Admin Dashboard Routes */}
                    {/* Thêm wildcard (*) để các route con bên trong AdminDashboard hoạt động */}
                    <Route path="/admin/*" element={<AdminDashboard />}>
                        {/* Trang mặc định khi vào /admin */}
                        {/* <Route index element={<Navigate to="dashboard" replace />} /> */}

                        {/* Các trang con đã được định nghĩa bên trong AdminDashboard.jsx qua <Outlet /> */}
                        {/* Không cần định nghĩa lại ở đây nữa */}

                        {/* Route bắt lỗi 404 bên trong Admin */}
                        {/* <Route path="*" element={<AdminNotFound />} /> */}
                    </Route>

                    {/* ====> SỬA Ở ĐÂY <==== */}
                    {/* 2. Supplier Dashboard Routes */}
                    {/* Thêm wildcard (*) để các route con bên trong SupplierDashboard hoạt động */}
                    <Route path="/supplier/*" element={<SupplierDashboard />}>
                         {/* Các trang con đã được định nghĩa bên trong SupplierDashboard.jsx qua <Outlet /> */}
                         {/* Không cần định nghĩa lại ở đây nữa */}

                         {/* Route bắt lỗi 404 bên trong Supplier */}
                         {/* <Route path="*" element={<SupplierNotFound />} /> */}
                    </Route>
                    {/* ====> KẾT THÚC SỬA <==== */}


                    {/* Route 404 chung (nếu không khớp public, admin, supplier) */}
                    {/* Bỏ route này vì đã có 404 trong SiteLayout */}
                    {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>
            </CartProvider>
        </AuthProvider>
    );
}

// --- Component NotFound (Chung - Bỏ đi vì đã import từ file riêng) ---
// function NotFound() { ... }

// --- Component NotFound (Admin - Bỏ đi vì nên đặt trong AdminDashboard hoặc file riêng) ---
// function AdminNotFound() { ... }
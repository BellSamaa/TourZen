// src/App.jsx
// (ĐÃ SỬA: Thêm các route con (nested routes) cho /admin)

import React from "react";
// SỬA: Bỏ 'useLocation' vì đã chuyển vào SiteLayout
import { Routes, Route, Outlet, Link, Navigate } from "react-router-dom"; 
import { AnimatePresence, motion } from "framer-motion";

// Layout & Utility Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// === 1. IMPORT CÁC TRANG PUBLIC (Giữ nguyên) ===
import Home from "./pages/Home.jsx";
import TourList from "./pages/TourList.jsx";
import TourDetail from "./pages/TourDetail.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import CartPage from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import MyBookings from "./pages/MyBookings.jsx";

// === 2. IMPORT LAYOUT VÀ CÁC TRANG ADMIN (Bổ sung) ===
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Layout Admin
import SupplierDashboard from "./pages/SupplierDashboard.jsx"; // Layout NCC
// (MỚI) Bổ sung các trang con của Admin
import DashboardHome from './pages/DashboardHome.jsx';
import Reports from './pages/Reports.jsx';
import AdminManageProducts from './pages/AdminManageProducts.jsx'; // (Quản lý Tour)
import ManageTour from './pages/ManageTour.jsx';             // (Quản lý Đơn đặt)
import ManageCustomers from './pages/ManageCustomers.jsx';
import ManageSuppliers from './pages/ManageSuppliers.jsx';
import ManageAccounts from './pages/ManageAccounts.jsx';

// Context Providers
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// CSS Imports
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./index.css";

// --- (GIỮ NGUYÊN) Component Layout (Public) ---
const SiteLayout = () => {
    // Component này sẽ chứa Navbar, Footer và render các trang con
    const location = window.location; // Dùng window.location đơn giản hơn nếu chỉ cần pathname
    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };
    const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900">
            <Navbar />
            <main className="flex-grow pt-[76px] relative">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        style={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
                    >
                        <Outlet /> {/* Outlet render trang con (Home, Login, v.v.) */}
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
                        <Route path="cart" element={<CartPage />} />
                        <Route path="payment" element={<Payment />} />
                        <Route path="payment-success" element={<PaymentSuccess />} />
                        <Route path="services" element={<Services />} />
                        <Route path="my-bookings" element={<MyBookings />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Login />} />
                    </Route> {/* Kết thúc SiteLayout */}


                    {/* === (SỬA) Private Dashboards (Layout riêng + Route con) === */}
                    
                    {/* 1. Admin Dashboard Routes */}
                    <Route path="/admin" element={<AdminDashboard />}>
                        {/* Trang mặc định khi vào /admin */}
                        <Route index element={<Navigate to="dashboard" replace />} />
                        
                        {/* Các trang con, sẽ render vào <Outlet /> của AdminDashboard */}
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="tours" element={<AdminManageProducts />} />
                        <Route path="bookings" element={<ManageTour />} />
                        <Route path="customers" element={<ManageCustomers />} />
                        <Route path="suppliers" element={<ManageSuppliers />} />
                        <Route path="accounts" element={<ManageAccounts />} />
                        
                        {/* Route bắt lỗi 404 bên trong Admin */}
                        <Route path="*" element={<AdminNotFound />} />
                    </Route>

                    {/* 2. Supplier Dashboard Routes */}
                    <Route path="/supplier" element={<SupplierDashboard />}>
                        {/* (Thêm các route con cho nhà cung cấp ở đây) */}
                        {/* Ví dụ: */}
                        {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
                        {/* <Route path="dashboard" element={<SupplierHome />} /> */}
                        {/* <Route path="products" element={<SupplierProducts />} /> */}
                    </Route>


                    {/* Route 404 chung (nằm ngoài cùng) */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CartProvider>
        </AuthProvider>
    );
}

// --- Component NotFound (Chung) ---
function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen text-center px-4 bg-white dark:bg-neutral-900">
      <div>
        <motion.h2
            className="text-6xl font-bold text-sky-500 mb-2"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            404
        </motion.h2>
        <motion.p
            className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            Oops! Trang bạn tìm kiếm không tồn tại.
        </motion.p>
         <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="mt-6"
         >
             <Link to="/" className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">
                 Về Trang Chủ
             </Link>
         </motion.div>
      </div>
    </div>
  );
}

// --- (MỚI) Component NotFound (cho Admin) ---
function AdminNotFound() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-150px)] text-center px-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
      <div>
        <motion.h2
            className="text-5xl font-bold text-sky-500 mb-2"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            404
        </motion.h2>
        <motion.p
            className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            Trang quản trị này không tồn tại.
        </motion.p>
         <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="mt-6"
         >
             <Link to="/admin/dashboard" className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">
                 Về Tổng quan
             </Link>
         </motion.div>
      </div>
    </div>
  );
}
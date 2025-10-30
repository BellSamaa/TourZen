// src/App.jsx
// (ĐÃ SỬA: Sửa lỗi useLocation, lỗi layout 'position: absolute' và sai path route)

import React from "react";
// SỬA 1: Thêm 'useLocation'
import { Routes, Route, Outlet, Link, Navigate, useLocation } from "react-router-dom";
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
import PromotionPage from "./pages/PromotionPage.jsx";
import NotFound from "./pages/NotFound.jsx";

// === 2. IMPORT LAYOUT VÀ CÁC TRANG ADMIN ===
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Layout Admin
import SupplierDashboard from "./pages/SupplierDashboard.jsx"; // Layout NCC

// Các trang con của Admin
import DashboardHome from './pages/DashboardHome.jsx';
import Reports from './pages/Reports.jsx';
import AdminManageProducts from './pages/AdminManageProducts.jsx';
import ManageTour from './pages/ManageTour.jsx';
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

// --- Component Layout (Public) ---
const SiteLayout = () => {
    // SỬA 2: Dùng hook 'useLocation' thay vì 'window.location'
    const location = useLocation();
    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };
    const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900">
            <Navbar />
            {/* SỬA 3: Xóa 'relative' khỏi <main> */}
            <main className="flex-grow pt-[76px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                            // SỬA 3: Xóa style 'position: absolute'
                        // style={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
                    >
                        <Outlet /> {/* Outlet render trang con */}
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
<                        Route path="about" element={<About />} />
                        <Route path="tours" element={<TourList />} />
                        <Route path="tour/:id" element={<TourDetail />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="payment" element={<Payment />} />
                            {/* SỬA 4: Đổi path để khớp với navigate() trong Payment.jsx */}
                        <Route path="booking-success" element={<PaymentSuccess />} />
                        <Route path="services" element={<Services />} />
                        <Route path="my-bookings" element={<MyBookings />} />
                        <Route path="promotions" element={<PromotionPage />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Login />} />
                        {/* Route 404 cho các trang public nằm trong SiteLayout */}
                        <Route path="*" element={<NotFound />} />
                    </Route> {/* Kết thúc SiteLayout */}


                    {/* === Private Dashboards (Layout riêng + Route con) === */}

                    {/* 1. Admin Dashboard Routes */}
                    <Route path="/admin/*" element={<AdminDashboard />}> {/* Vẫn giữ /* */}
                        {/* ====> KHÔI PHỤC CÁC ROUTE CON ADMIN Ở ĐÂY <==== */}
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="tours" element={<AdminManageProducts />} />
                        <Route path="bookings" element={<ManageTour />} />
           t          <Route path="customers" element={<ManageCustomers />} />
                        <Route path="suppliers" element={<ManageSuppliers />} />
                        <Route path="accounts" element={<ManageAccounts />} />
                        <Route path="*" element={<AdminNotFound />} />
                         {/* ====> KẾT THÚC KHÔI PHỤC <==== */}
                    </Route>

                    {/* 2. Supplier Dashboard Routes */}
                    <Route path="/supplier/*" element={<SupplierDashboard />}> {/* Vẫn giữ /* */}
                         {/* Các route con của supplier sẽ nằm trong SupplierDashboard.jsx (thông qua Outlet) */}
                         {/* Nếu chưa định nghĩa trong SupplierDashboard.jsx, bạn cần thêm chúng ở đây */}
                         {/* Ví dụ:
                         <Route index element={<Navigate to="dashboard" replace />} />
                         <Route path="dashboard" element={<SupplierHome />} />
                         <Route path="tours" element={<SupplierManageProducts />} />
                         <Route path="transport" element={<ManageTransport />} />
                         <Route path="flights" element={<ManageFlights />} />
                         <Route path="add-quick-tour" element={<SupplierAddQuickTour />} />
                         <Route path="*" element={<SupplierNotFound />} /> // Tạo component SupplierNotFound nếu cần
                         */}
                    </Route>

                    {/* Route 404 chung nếu không khớp các path trên */}
                    {/* Đã được xử lý bên trong SiteLayout và các Dashboard */}

                </Routes>
            </CartProvider>
        </AuthProvider>
    );
}

// --- Component NotFound (Admin) ---
// (Bạn nên tạo file riêng cho component này, ví dụ: src/pages/AdminNotFound.jsx)
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
             mtransition={{ duration: 0.5, delay: 0.4 }}
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
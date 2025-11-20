// src/App.jsx
// (SỬA v19) Thêm import và route cho trang Profile.jsx
// (ĐÃ SỬA: Sửa lỗi useLocation, lỗi layout 'position: absolute' và sai path route)
// (SỬA v3: Thêm VNPAYPage và sửa sai route VirtualPayment)
// (SỬA THEO YÊU CẦU: Thêm logic bảo vệ route cho Admin và Supplier)
// *** (SỬA LỖI v39) BỔ SUNG ROUTE CHO VIRTUALPAYMENT / PAYMENTSUCCESS ***

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
// (SỬA) Import đúng trang PaymentSuccess
import PaymentSuccess from "./pages/PaymentSuccess.jsx"; 
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import PromotionPage from "./pages/PromotionPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Profile from "./pages/Profile.jsx"; // <<< THÊM v19: Import trang Profile

// *** SỬA v3: IMPORT CẢ 2 TRANG THANH TOÁN ***
import VirtualPayment from "./pages/VirtualPayment.jsx"; 
import VNPAYPage from "./pages/VNPAYPage.jsx";

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
// --- (THÊM) Import useAuth để bảo vệ route ---
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

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
                    >
                        <Outlet /> {/* Outlet render trang con */}
                    </motion.div>
               D</AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};


// --- (THÊM) Component bảo vệ cho Admin ---
const AdminRoute = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    // Quan trọng: Chờ AuthContext load xong để tránh bị điều hướng sai
    return <div>Đang tải trang xác thực...</div>; // (Nên thay bằng component LoadingSpinner)
  }

  // Nếu đã load xong, kiểm tra quyền Admin
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

// --- (THÊM) Component bảo vệ cho Supplier (đáp ứng yêu cầu) ---
const SupplierRoute = () => {
  const { isSupplier, loading } = useAuth();

  if (loading) {
    // Quan trọng: Chờ AuthContext load xong (kiểm tra cả "ảo" và "thật")
    return <div>Đang tải trang xác thực...</div>; // (Nên thay bằng component LoadingSpinner)
  }

  // Nếu đã load xong, kiểm tra quyền Supplier
  // Biến 'isSupplier' đã được AuthContext tính toán đúng cho cả 2 loại tài khoản
  return isSupplier ? <Outlet /> : <Navigate to="/" replace />;
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
                        <Route path="about" element={<About />} />
                        <Route path="tours" element={<TourList />} />
                        <Route path="tour/:id" element={<TourDetail />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="payment" element={<Payment />} />
  
                        {/* *** (SỬA LỖI v39) BỔ SUNG 2 ROUTE BỊ THIẾU DẪN ĐẾN 404 *** */}
                        {/* 1. Trang Virtual Payment (từ Payment.jsx) */}
                        <Route path="virtual-payment" element={<VirtualPayment />} />
                        {/* 2. Trang Success (từ Payment.jsx hoặc VirtualPayment.jsx) */}
                        <Route path="booking-success" element={<PaymentSuccess />} />
                        {/* *** KẾT THÚC SỬA *** */}

                        {/* Trang VNPAY (nếu bạn có dùng) */}
                        <Route path="payment/vnpay" element={<VNPAYPage />} />

                        <Route path="services" element={<Services />} />
                        <Route path="my-bookings" element={<MyBookings />} />
                        <Route path="profile" element={<Profile />} /> {/* <<< THÊM v19: Route cho Profile */}
                        <Route path="promotions" element={<PromotionPage />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Login />} />
                        {/* Route 404 cho các trang public nằm trong SiteLayout */}
                        <Route path="*" element={<NotFound />} />
                    </Route> {/* Kết thúc SiteLayout */}


                    {/* === Private Dashboards (Layout riêng + Route con) === */}

                    {/* 1. Admin Dashboard Routes (SỬA: Bọc bằng AdminRoute) */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin/*" element={<AdminDashboard />}> {/* Vẫn giữ /* */}
                            {/* ====> KHÔI PHỤC CÁC ROUTE CON ADMIN Ở ĐÂY <==== */}
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="tours" element={<AdminManageProducts />} />
                            <Route path="bookings" element={<ManageTour />} />
                            <Route path="customers" element={<ManageCustomers />} />
                            <Route path="suppliers" element={<ManageSuppliers />} />
                            <Route path="accounts" element={<ManageAccounts />} />
                            <Route path="*" element={<AdminNotFound />} />
                             {/* ====> KẾT THÚC KHÔI PHỤC <==== */}
                        </Route>
                    </Route>

                   s  {/* 2. Supplier Dashboard Routes (SỬA: Bọc bằng SupplierRoute) */}
                    <Route element={<SupplierRoute />}>
                        <Route path="/supplier/*" element={<SupplierDashboard />}> {/* Vẫn giữ /* */}
                             {/* Các route con của supplier sẽ nằm trong SupplierDashboard.jsx (thông qua Outlet) */}
                             {/* Ví dụ:
                         <Route index element={<Navigate to="dashboard" replace />} />
                         <Route path="dashboard" element={<SupplierHome />} />
                         <Route path="tours" element={<SupplierManageProducts />} />
ci                      <Route path="transport" element={<ManageTransport />} />
                         <Route path="flights" element={<ManageFlights />} />
                         <Route path="add-quick-tour" element={<SupplierAddQuickTour />} />
                         <Route path="*" element={<SupplierNotFound />} /> // Tạo component SupplierNotFound nếu cần
                         */}
                        </Route>
                    </Route>

                   {/* Route 404 chung nếu không khớp các path trên */}
                    {/* Đã được xử lý bên trong SiteLayout và các Dashboard */}

               _D</Routes>
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
     _        animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
          >
             <Link to="/admin/dashboard" className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">
                  Về Tổng quan
              </Link>
   D        </motion.div>
      </div>
    </div>
  );
}
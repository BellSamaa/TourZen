// src/App.jsx
// (Đã sửa để sử dụng Layout cho các trang Public, bao gồm Login)

import React from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom"; // <<< Thêm Outlet
import { AnimatePresence, motion } from "framer-motion"; // <<< Thêm motion

// Layout & Utility Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Page Components (Giữ nguyên imports)
import Home from "./pages/Home.jsx";
import TourList from "./pages/TourList.jsx";
import TourDetail from "./pages/TourDetail.jsx";
// import Booking from "./pages/Booking.jsx"; // Xem lại trang này
// import VNPAYPage from "./pages/VNPAYPage";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import CartPage from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx"; // Trang Login
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SupplierDashboard from "./pages/SupplierDashboard.jsx";
// import HotelPage from "./pages/HotelPage.jsx"; // Xem lại trang này
// import PromotionPage from "./pages/PromotionPage.jsx";
// import Checkout from "./pages/Checkout.jsx"; // Xem lại trang này
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import MyBookings from "./pages/MyBookings.jsx";

// Context Providers
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// CSS Imports
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./index.css";
// --- (MỚI) Component Layout ---
// Component này sẽ chứa Navbar, Footer và render các trang con
const SiteLayout = () => {
    const location = useLocation();
     // Logic ẩn Navbar/Footer dựa trên route con (nếu cần)
    // const hideOnRoutes = ['/login', '/register']; // Ví dụ nếu muốn ẩn trên login/register
    // const shouldShowNavFooter = !hideOnRoutes.includes(location.pathname);

    // Mặc định là luôn hiện trong Layout này
    const shouldShowNavFooter = true;

    // Hiệu ứng chuyển trang
    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -15 }
    };
    const pageTransition = { type: "tween", ease: "anticipate", duration: 0.4 };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900">
            {shouldShowNavFooter && <Navbar />}
            {/* Thêm padding top nếu Navbar hiển thị */}
            <main className={`flex-grow ${shouldShowNavFooter ? 'pt-[76px]' : ''} relative`}> {/* Thêm relative */}
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname} // Key cho animation
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        // Style để đảm bảo nội dung không bị nhảy khi chuyển trang (tùy chỉnh nếu cần)
                        style={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
                    >
                         {/* Outlet render trang con */}
                        <Outlet />
                    </motion.div>
                 </AnimatePresence>
            </main>
            {shouldShowNavFooter && <Footer />}
        </div>
    );
};


// --- Component App chính (Đã cấu trúc lại Routes) ---
export default function App() {
    // Bỏ location và logic ẩn hiện ở đây vì đã chuyển vào Layout

    return (
        <AuthProvider>
            <CartProvider>
                <ScrollToTop />
                {/* Routes được đặt trực tiếp ở đây */}
                <Routes>
                    {/* === Public Routes (Sử dụng SiteLayout) === */}
                    <Route path="/" element={<SiteLayout />}>
                        <Route index element={<Home />} />
                        <Route path="about-tourzen" element={<About />} />
                        <Route path="tours" element={<TourList />} />
                        <Route path="tour/:id" element={<TourDetail />} />
                        {/* <Route path="booking/:id" element={<Booking />} /> */}
                        <Route path="cart" element={<CartPage />} />
                        {/* <Route path="checkout" element={<Checkout />} /> */}
                        {/* <Route path="hotels" element={<HotelPage />} /> */}
                        {/* <Route path="promotions" element={<PromotionPage />} /> */}
                        <Route path="payment" element={<Payment />} />
                        <Route path="payment-success" element={<PaymentSuccess />} />
                        {/* <Route path="vnpay" element={<VNPAYPage />} /> */}
                        <Route path="services" element={<Services />} />
                        <Route path="my-bookings" element={<MyBookings />} />

                        {/* === Auth Routes NẰM TRONG Layout === */}
                        {/* Nếu bạn muốn Navbar/Footer ở trang Login/Register */}
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Login />} /> {/* Vẫn dùng component Login cho register */}

                    </Route> {/* Kết thúc SiteLayout */}


                    {/* === Private Dashboards (Layout riêng) === */}
                    {/* AdminDashboard và SupplierDashboard tự quản lý layout của chúng */}
                    <Route path="/admin/*" element={<AdminDashboard />} />
                    <Route path="/supplier/*" element={<SupplierDashboard />} />


                    {/* Route cuối cùng cho trang không tìm thấy */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CartProvider>
        </AuthProvider>
    );
}

// --- Component NotFound (Dán code vào đây) ---
function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-76px)] text-center px-4"> {/* Điều chỉnh min-h */}
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
        {/* Có thể thêm nút Quay về trang chủ */}
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
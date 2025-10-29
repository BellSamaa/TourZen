// src/App.jsx
// (ĐÃ SỬA: Tạo các component giả (mock) để file có thể biên dịch độc lập)

import React from "react";
// SỬA: Thêm useLocation
import { Routes, Route, Outlet, Link, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// === 1. IMPORT CÁC TRANG PUBLIC ===
// SỬA: Đã comment out các import và tạo component giả bên dưới
// import Navbar from "./components/Navbar.jsx";
// import Footer from "./components/Footer.jsx";
// import ScrollToTop from "./components/ScrollToTop.jsx";
// import Home from "./pages/Home.jsx";
// import TourList from "./pages/TourList.jsx";
// import TourDetail from "./pages/TourDetail.jsx";
// import Payment from "./pages/Payment.jsx";
// import PaymentSuccess from "./pages/PaymentSuccess.jsx";
// import Cart from "./pages/Cart.jsx";
// import Login from "./pages/Login.jsx";
// import About from "./pages/About.jsx";
// import Services from "./pages/Services.jsx";
// import MyBookings from "./pages/MyBookings.jsx";
// import PromotionPage from "./pages/PromotionPage.jsx";
// import NotFound from "./pages/NotFound.jsx";

// === 2. IMPORT LAYOUT VÀ CÁC TRANG ADMIN ===
// SỬA: Đã comment out các import và tạo component giả bên dưới
// import AdminDashboard from "./pages/AdminDashboard.jsx"; // Layout Admin
// import SupplierDashboard from "./pages/SupplierDashboard.jsx"; // Layout NCC
// import DashboardHome from './pages/DashboardHome.jsx';
// import Reports from './pages/Reports.jsx';
// import AdminManageProducts from './pages/AdminManageProducts.jsx';
// import ManageTour from './pages/ManageTour.jsx';
// import ManageCustomers from './pages/ManageCustomers.jsx';
// import ManageSuppliers from './pages/ManageSuppliers.jsx';
// import ManageAccounts from './pages/ManageAccounts.jsx';

// Context Providers
// SỬA: Đã comment out các import và tạo component giả bên dưới
// import { CartProvider } from "./context/CartContext.jsx";
// import { AuthProvider } from "./context/AuthContext.jsx";

// CSS Imports
// SỬA: Comment out vì các file này không tồn tại trong môi trường preview
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import "./index.css";


// =================================================================
// === SỬA: BẮT ĐẦU KHỐI COMPONENT GIẢ (MOCK COMPONENTS) ===
// =================================================================

// Factory tạo trang giả
const DummyPage = (name) => () => (
    <div className="p-8 text-center" style={{ minHeight: '60vh' }}>
        <h1 className="text-3xl font-bold dark:text-white">{name} (Giả lập)</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Nội dung trang {name} sẽ hiển thị ở đây.</p>
        <div className="mt-6 space-x-4">
            <Link to="/" className="text-sky-500 hover:underline">Về Home</Link>
            <Link to="/tours" className="text-sky-500 hover:underline">Xem Tours</Link>
            <Link to="/payment" className="text-sky-500 hover:underline">Tới Payment</Link>
        </div>
    </div>
);

// Layout & Utility Components
const Navbar = () => (
    <nav className="w-full p-4 bg-gray-800 text-white text-center font-bold sticky top-0 z-50 shadow-lg">
        Navbar (Giả lập)
    </nav>
);

const Footer = () => (
    <footer className="w-full p-8 bg-gray-200 dark:bg-neutral-800 text-center text-gray-700 dark:text-gray-300">
        Footer (Giả lập)
    </footer>
);

const ScrollToTop = () => {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// Public Pages
const Home = DummyPage("Home");
const TourList = DummyPage("TourList");
const TourDetail = DummyPage("TourDetail");
const Payment = () => (
    <div className="p-8 text-center" style={{ minHeight: '60vh' }}>
        <h1 className="text-3xl font-bold dark:text-white">Payment (Giả lập)</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Đây là trang thanh toán.</p>
        <Link 
            to="/booking-success" 
            className="mt-6 inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
            // Giả lập việc truyền state
            state={{ method: 'direct', branch: 'VP Hà Nội (giả lập)', deadline: '20/10/2025' }}
        >
            Bấm để tới trang Thành công (Giả lập)
        </Link>
    </div>
);
const PaymentSuccess = () => (
    <div className="p-8 text-center flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <h1 className="text-3xl font-bold text-green-500">PaymentSuccess (Giả lập)</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">ĐẶT TOUR THÀNH CÔNG!</p>
        <p className="text-gray-500 mt-1">Trang này đã hiển thị đúng.</p>
        <Link to="/" className="mt-6 text-sky-500 hover:underline">Về Home</Link>
    </div>
);
const Cart = DummyPage("Cart");
const Login = DummyPage("Login/Register");
const About = DummyPage("About");
const Services = DummyPage("Services");
const MyBookings = DummyPage("MyBookings");
const PromotionPage = DummyPage("PromotionPage");
const NotFound = DummyPage("404 Not Found");

// Admin & Supplier Dashboards
const AdminDashboard = () => (
    <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-900 text-white p-4">
            <h2 className="text-xl font-bold mb-4">Admin (Giả lập)</h2>
            <nav className="flex flex-col space-y-2">
                <Link to="dashboard" className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
                <Link to="reports" className="hover:bg-gray-700 p-2 rounded">Reports</Link>
                <Link to="tours" className="hover:bg-gray-700 p-2 rounded">Tours</Link>
                <Link to="/" className="hover:bg-gray-700 p-2 rounded mt-8">Về trang Public</Link>
            </nav>
        </aside>
        <main className="flex-1 p-6 bg-gray-100 dark:bg-neutral-800">
            <Outlet /> {/* Route con của Admin sẽ render ở đây */}
        </main>
    </div>
);

const SupplierDashboard = () => (
    <div className="flex min-h-screen">
        <aside className="w-64 bg-teal-800 text-white p-4">
             <h2 className="text-xl font-bold mb-4">Supplier (Giả lập)</h2>
             <nav className="flex flex-col space-y-2">
                <Link to="dashboard" className="hover:bg-teal-700 p-2 rounded">Supplier Dashboard</Link>
                <Link to="/" className="hover:bg-teal-700 p-2 rounded mt-8">Về trang Public</Link>
             </nav>
        </aside>
        <main className="flex-1 p-6 bg-gray-100 dark:bg-neutral-800">
            {/* Giả lập Outlet hoặc trang mặc định */}
            <DummyPage("Supplier Dashboard") />
        </main>
    </div>
);

// Admin Sub-pages
const DashboardHome = DummyPage("Admin Dashboard Home");
const Reports = DummyPage("Reports");
const AdminManageProducts = DummyPage("AdminManageProducts");
const ManageTour = DummyPage("ManageTour (Bookings)");
const ManageCustomers = DummyPage("ManageCustomers");
const ManageSuppliers = DummyPage("ManageSuppliers");
const ManageAccounts = DummyPage("ManageAccounts");

// Context Providers
const CartProvider = ({ children }) => <>{children}</>;
const AuthProvider = ({ children }) => <>{children}</>;

// =================================================================
// === SỬA: KẾT THÚC KHỐI COMPONENT GIẢ (MOCK COMPONENTS) ===
// =================================================================


// --- Component Layout (Public) ---
const SiteLayout = () => {
    // SỬA: Phải dùng hook useLocation() của React Router
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
            {/* SỬA: Xóa 'relative' khỏi main vì motion.div không còn absolute */}
            <main className="flex-grow pt-[76px]">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname} // Giờ key này sẽ thay đổi chính xác
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        // SỬA: Xóa style position: 'absolute'
                        // Style này đã bị xóa, giúp layout hoạt động đúng
                    >
                        <Outlet /> {/* Outlet render trang con */}
                    </motion.div>
                 </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};


// --- Component App chính (Routes) ---
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
                        {/* Route này đã có và chính xác */}
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
                        <Route path="customers" element={<ManageCustomers />} />
                        <Route path="suppliers" element={<ManageSuppliers />} />
                        <Route path="accounts" element={<ManageAccounts />} />
                        <Route path="*" element={<AdminNotFound />} />
                         {/* ====> KẾT THÚC KHÔI PHỤC <==== */}
                    </Route>

                    {/* 2. Supplier Dashboard Routes */}
                    <Route path="/supplier/*" element={<SupplierDashboard />}> {/* Vẫn giữ /* */}
                         {/* Các route con của supplier sẽ nằm trong SupplierDashboard.jsx (thông qua Outlet) */}
                         {/* (Các route con giả lập sẽ được render bởi Outlet trong SupplierDashboard) */}
                    </Route>

                </Routes>
            </CartProvider>
        </AuthProvider>
    );
}

// --- Component NotFound (Admin) ---
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
            Trang quản trị này không tồn tại. (Giả lập)
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


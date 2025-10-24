// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Import Navbar của bạn
import Footer from './Footer'; // Import Footer của bạn

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet /> {/* Nội dung trang con sẽ hiển thị ở đây */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
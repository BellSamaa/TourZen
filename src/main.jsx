// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import App from './App.jsx';
import './index.css';

// ================== BÀI KIỂM TRA DỨT ĐIỂM ==================
//
//   BẠN CẦN XÓA TẤT CẢ CODE SUPABASE KHỎI FILE NÀY
//
// ==========================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ParallaxProvider>
        <App />
      </ParallaxProvider>
    </BrowserRouter>
  </React.StrictMode>
);
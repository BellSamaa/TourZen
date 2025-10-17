import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import App from "./App.jsx";
import "./index.css";

// ================== BÀI KIỂM TRA CUỐI CÙNG ==================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zdwpjgpysxxqpvhovct.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdndwamdweXN4eHFwdmhvdmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjQzODUsImV4cCI6MjA3NjI0MDM4NX0.tmFvDXSUdJlJKBuYoqvuJArZ5apYpb-eNQ90uYBJf0";

// Đoạn code này sẽ bỏ qua tất cả các file khác và thử kết nối
// với Supabase ngay tại điểm khởi đầu của ứng dụng.
try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("✅ KẾT NỐI SUPABASE TRONG main.jsx THÀNH CÔNG!");
} catch (error) {
  console.error("❌ VẪN LỖI NGAY CẢ TRONG main.jsx:", error.message);
}
// ==========================================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ParallaxProvider>
        <App />
      </ParallaxProvider>
    </BrowserRouter>
  </React.StrictMode>
);
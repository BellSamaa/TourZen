// src/pages/Payment.jsx
import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import VnPayRedirect from "../utils/vnpay.jsx";
import PaymentSuccess from "./PaymentSuccess.jsx";

export default function Payment() {
  return (
    <Routes>
      <Route path="vnpay" element={<VnPayRedirect />} />
      <Route path="success" element={<PaymentSuccess />} />
      <Route path="*" element={<div style={{ padding: 40 }}>Payment base</div>} />
    </Routes>
  );
}

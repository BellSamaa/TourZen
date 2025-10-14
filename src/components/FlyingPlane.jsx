// src/components/FlyingPlane.jsx
import React from "react";
import { motion } from "framer-motion";

export default function FlyingPlane() {
  return (
    <motion.div
      initial={{ x: "-10%", y: "40%" }}
      animate={{ x: "110%", y: "40%" }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="fixed top-0 left-0 z-50 pointer-events-none"
    >
      <img
        src="/images/plane.png" // ← bạn đặt ảnh máy bay ở public/images/plane.png
        alt="Máy bay đang bay"
        className="w-16 h-16"
      />
    </motion.div>
  );
}

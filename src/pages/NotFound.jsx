import React from "react";
import { Link } from "react-router-dom";

export default function NotFound(){
  return (
    <main className="container" style={{textAlign:"center"}}>
      <h2>404 — Không tìm thấy</h2>
      <p>Trang bạn tìm không tồn tại.</p>
      <Link to="/" className="btn">Quay về trang chủ</Link>
    </main>
  );
}

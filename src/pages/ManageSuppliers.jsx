// src/pages/ManageSuppliers.jsx
import React, { useState } from "react";

export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState([
    { id: "S001", name: "Vietravel Partner", phone: "0909-000-111", email: "info@vietravel.vn" },
    { id: "S002", name: "SaigonTourist", phone: "0902-333-222", email: "contact@saigontourist.vn" },
  ]);

  function remove(id) {
    setSuppliers(suppliers.filter(s => s.id !== id));
  }

  return (
    <main className="container">
      <h2>Quản lý Nhà cung cấp</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Mã NCC</th>
            <th>Tên</th>
            <th>Liên hệ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.phone}<br />{s.email}</td>
              <td>
                <button className="btn-outline" onClick={() => remove(s.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

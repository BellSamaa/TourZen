// src/pages/ManageCustomers.jsx
import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/format";

export default function ManageCustomers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("tourzen_users_v1");
    setUsers(raw ? JSON.parse(raw) : []);
  }, []);

  return (
    <main className="container">
      <h2>Quản lý Khách hàng</h2>
      {users.length === 0 ? (
        <div>Chưa có khách hàng nào đăng ký.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

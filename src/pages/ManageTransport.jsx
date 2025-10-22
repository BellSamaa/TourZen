import React, { useState } from "react";
import { PlusCircle, Pencil, Trash } from "@phosphor-icons/react";

export default function ManageTransport() {
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "TourZenExpress - Limousine 9 chỗ",
      type: "Limousine",
      price: 850000,
      seats: 9,
      status: "Đang hoạt động",
    },
    {
      id: 2,
      name: "TourZenExpress - Xe khách 29 chỗ",
      type: "Xe khách",
      price: 1200000,
      seats: 29,
      status: "Tạm nghỉ",
    },
    {
      id: 3,
      name: "TourZenExpress - Taxi 4 chỗ",
      type: "Taxi",
      price: 450000,
      seats: 4,
      status: "Đang hoạt động",
    },
  ]);

  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "",
    price: "",
    seats: "",
  });

  const handleAdd = () => {
    if (!newVehicle.name || !newVehicle.type || !newVehicle.price) return;
    const newItem = {
      ...newVehicle,
      id: Date.now(),
      status: "Đang hoạt động",
    };
    setVehicles([...vehicles, newItem]);
    setNewVehicle({ name: "", type: "", price: "", seats: "" });
  };

  const handleDelete = (id) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-sky-400 mb-4">
        🚗 Quản lý nhà xe TourZenExpress
      </h1>

      {/* Form thêm mới */}
      <div className="bg-slate-800 text-slate-200 p-4 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-3">Thêm xe mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Tên xe"
            value={newVehicle.name}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, name: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-sky-500"
          />
          <input
            type="text"
            placeholder="Loại xe"
            value={newVehicle.type}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, type: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
          <input
            type="number"
            placeholder="Giá (VND)"
            value={newVehicle.price}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, price: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
          <input
            type="number"
            placeholder="Số chỗ"
            value={newVehicle.seats}
            onChange={(e) =>
              setNewVehicle({ ...newVehicle, seats: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={20} /> Thêm xe
        </button>
      </div>

      {/* Bảng danh sách xe */}
      <table className="w-full text-left border border-slate-700 text-slate-200">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-4 py-2">Tên xe</th>
            <th className="px-4 py-2">Loại</th>
            <th className="px-4 py-2">Giá</th>
            <th className="px-4 py-2">Số chỗ</th>
            <th className="px-4 py-2">Trạng thái</th>
            <th className="px-4 py-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id} className="border-t border-slate-700">
              <td className="px-4 py-2">{v.name}</td>
              <td className="px-4 py-2">{v.type}</td>
              <td className="px-4 py-2">{v.price.toLocaleString()} VND</td>
              <td className="px-4 py-2">{v.seats}</td>
              <td className="px-4 py-2">{v.status}</td>
              <td className="px-4 py-2 flex justify-center gap-3">
                <button className="text-yellow-400 hover:text-yellow-300">
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

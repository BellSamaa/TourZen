import React, { useState } from "react";
import { PlusCircle, Trash } from "@phosphor-icons/react";

export default function ManageFlights() {
  const [flights, setFlights] = useState([
    {
      id: 1,
      code: "VN245",
      airline: "Vietnam Airlines",
      route: "Hà Nội → Đà Nẵng",
      price: 1500000,
      combo: "Limousine 9 chỗ",
    },
    {
      id: 2,
      code: "VJ602",
      airline: "VietJet Air",
      route: "TP.HCM → Nha Trang",
      price: 1250000,
      combo: "Taxi TourZenExpress",
    },
    {
      id: 3,
      code: "QH212",
      airline: "Bamboo Airways",
      route: "Đà Nẵng → Hà Nội",
      price: 1450000,
      combo: "Xe khách 29 chỗ",
    },
  ]);

  const [newFlight, setNewFlight] = useState({
    code: "",
    airline: "",
    route: "",
    price: "",
    combo: "",
  });

  const handleAdd = () => {
    if (!newFlight.code || !newFlight.route || !newFlight.price) return;
    setFlights([
      ...flights,
      { ...newFlight, id: Date.now() },
    ]);
    setNewFlight({ code: "", airline: "", route: "", price: "", combo: "" });
  };

  const handleDelete = (id) => {
    setFlights(flights.filter((f) => f.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-sky-400 mb-4">
        ✈️ Quản lý chuyến bay
      </h1>

      {/* Form thêm mới */}
      <div className="bg-slate-800 text-slate-200 p-4 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-3">Thêm chuyến bay mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Mã chuyến bay"
            value={newFlight.code}
            onChange={(e) =>
              setNewFlight({ ...newFlight, code: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
          <input
            type="text"
            placeholder="Hãng hàng không"
            value={newFlight.airline}
            onChange={(e) =>
              setNewFlight({ ...newFlight, airline: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
          <input
            type="text"
            placeholder="Tuyến bay"
            value={newFlight.route}
            onChange={(e) =>
              setNewFlight({ ...newFlight, route: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
          <input
            type="number"
            placeholder="Giá vé (VND)"
            value={newFlight.price}
            onChange={(e) =>
              setNewFlight({ ...newFlight, price: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
          <input
            type="text"
            placeholder="Combo xe (nếu có)"
            value={newFlight.combo}
            onChange={(e) =>
              setNewFlight({ ...newFlight, combo: e.target.value })
            }
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600"
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={20} /> Thêm chuyến bay
        </button>
      </div>

      {/* Bảng danh sách */}
      <table className="w-full text-left border border-slate-700 text-slate-200">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-4 py-2">Mã</th>
            <th className="px-4 py-2">Hãng</th>
            <th className="px-4 py-2">Tuyến bay</th>
            <th className="px-4 py-2">Giá</th>
            <th className="px-4 py-2">Combo xe</th>
            <th className="px-4 py-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((f) => (
            <tr key={f.id} className="border-t border-slate-700">
              <td className="px-4 py-2">{f.code}</td>
              <td className="px-4 py-2">{f.airline}</td>
              <td className="px-4 py-2">{f.route}</td>
              <td className="px-4 py-2">{f.price.toLocaleString()} VND</td>
              <td className="px-4 py-2">{f.combo || "—"}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleDelete(f.id)}
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

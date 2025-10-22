// src/pages/SupplierAddQuickTour.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { FaSpinner, FaPlusCircle } from "react-icons/fa";

const supabase = getSupabase();

export default function SupplierAddQuickTour() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const addQuickTour = async () => {
    if (!user) return alert("Bạn cần đăng nhập!");

    setLoading(true);
    try {
      // Lấy một tour mẫu từ Products + TourDetails
      const { data: sampleTours, error: tourError } = await supabase
        .from("Products")
        .select("*")
        .eq("product_type", "tour")
        .limit(1)
        .order("created_at", { ascending: false });

      if (tourError) throw tourError;
      if (!sampleTours?.length) throw new Error("Không tìm thấy tour mẫu");

      const sample = sampleTours[0];
      const { id, created_at, updated_at, approval_status, supplier_id, ...rest } = sample;

      // Tạo payload mới cho nhà cung cấp
      const payload = {
        ...rest,
        name: `${rest.name || "Tour mới"} (Bản sao)`,
        supplier_id: user.id,
        approval_status: "pending",
        created_at: new Date().toISOString(),
        product_type: "tour",
      };

      // Thêm tour mới
      const { data: insertedData, error: insertError } = await supabase
        .from("Products")
        .insert([payload])
        .select()
        .single();

      if (insertError) throw insertError;

      alert("Đã thêm tour nhanh, chờ admin phê duyệt!");
      navigate(`/tour/${insertedData.id}`);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm tour nhanh: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h2 className="text-2xl font-bold text-sky-600 mb-6">
        Thêm Tour Nhanh
      </h2>
      <button
        onClick={addQuickTour}
        disabled={loading}
        className="flex items-center justify-center gap-3 mx-auto bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors text-lg"
      >
        {loading ? <FaSpinner className="animate-spin text-xl" /> : <FaPlusCircle />}
        {loading ? "Đang thêm..." : "Thêm Tour +"}
      </button>
    </div>
  );
}

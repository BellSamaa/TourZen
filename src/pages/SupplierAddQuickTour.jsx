// src/pages/SupplierAddQuickTour.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { FaSpinner, FaSave } from "react-icons/fa";

const supabase = getSupabase();

export default function SupplierAddQuickTour() {
  const [params] = useSearchParams();
  const tourId = params.get("id");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch hoặc khởi tạo dữ liệu tour
  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);

      try {
        if (tourId) {
          const { data, error } = await supabase
            .from("Products")
            .select("*")
            .eq("id", tourId)
            .single();

          if (error) throw error;
          if (!data) {
            alert("Không tìm thấy tour gốc.");
          }

          const { id, created_at, updated_at, approval_status, supplier_id, ...rest } = data;

          setTourData({
            ...rest,
            name: `${rest.name || "Tour mới"} (Bản sao)`,
            approval_status: "pending",
            supplier_id: user?.id || null,
            start_date: rest.start_date?.split("T")[0] || "",
            end_date: rest.end_date?.split("T")[0] || "",
            image_url: rest.image_url?.startsWith("/images/") ? rest.image_url : "/images/default.jpg",
          });
        } else {
          // Khởi tạo form mặc định nếu không có tourId
          setTourData({
            name: "Tour mới",
            destination: "",
            description: "",
            price: 0,
            inventory: 10,
            start_date: "",
            end_date: "",
            image_url: "/images/default.jpg",
          });
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi khi tải dữ liệu tour: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourId, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTourData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Bạn cần đăng nhập!");

    setSaving(true);

    const payload = {
      ...tourData,
      supplier_id: user.id,
      approval_status: "pending",
      created_at: new Date().toISOString(),
      destination: tourData.destination || "Chưa xác định",
      product_type: "tour",
    };

    try {
      // Insert và lấy luôn record vừa tạo để lấy id
      const { data: insertedData, error } = await supabase
        .from("Products")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      alert("Đã gửi tour chờ phê duyệt!");
      // Chuyển sang trang chi tiết tour mới
      navigate(`/tour/${insertedData.id}`);
    } catch (err) {
      alert("Lỗi khi gửi yêu cầu phê duyệt: " + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-sky-600">
        <FaSpinner className="animate-spin text-3xl" />
        <span className="ml-3">Đang tải dữ liệu...</span>
      </div>
    );

  if (!tourData)
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
        Không thể khởi tạo form.
      </p>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 mt-6 border dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-4 text-sky-600">
        Thêm Tour Nhanh & Gửi phê duyệt
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Tên Tour", name: "name" },
          { label: "Điểm đến", name: "destination" },
          { label: "Mô tả", name: "description" },
          { label: "Giá (VNĐ)", name: "price", type: "number" },
          { label: "Số chỗ", name: "inventory", type: "number" },
          { label: "Ngày khởi hành", name: "start_date", type: "date" },
          { label: "Ngày kết thúc", name: "end_date", type: "date" },
          { label: "Link hình ảnh (/images/...)", name: "image_url" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label}
            </label>
            <input
              type={type}
              name={name}
              value={tourData[name] || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-slate-900 dark:text-white"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          {saving ? "Đang lưu..." : "Gửi phê duyệt"}
        </button>
      </form>
    </div>
  );
}

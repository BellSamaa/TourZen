// src/pages/ManageCustomers.jsx
// (Làm lại hoàn toàn thành trang CRM)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { 
    FaSpinner, FaSearch, FaUserEdit, FaHistory, FaRegCommentDots, FaTrash,
    FaRegStar, FaStar 
} from "react-icons/fa";
import { UsersThree } from "@phosphor-icons/react";

const supabase = getSupabase();

// --- Helper Functions ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};
const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleString("vi-VN", options);
};

// --- Component con (MỚI): Lịch sử Đặt hàng ---
const CustomerHistoryModal = ({ user, onClose }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("Bookings")
                .select("id, created_at, total_price, status, main_tour:Products!product_id(name)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            
            if (data) setBookings(data);
            setLoading(false);
        };
        fetchHistory();
    }, [user.id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl relative max-h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    &times;
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    Lịch sử đặt tour của: {user.full_name}
                </h3>
                <div className="overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8"><FaSpinner className="animate-spin text-2xl" /></div>
                    ) : bookings.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 italic">Khách hàng này chưa đặt tour nào.</p>
                    ) : (
                        <ul className="divide-y dark:divide-neutral-700">
                            {bookings.map(b => (
                                <li key={b.id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold dark:text-white">{b.main_tour?.name || "Tour đã bị xóa"}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Ngày đặt: {formatDate(b.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(b.total_price)}</p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                LI>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Component con (MỚI): Quản lý Đánh giá ---
const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("Reviews") // <<< Giả định bạn có bảng 'Reviews'
            .select("*, user:Users(full_name, email), product:Products(name)")
            .order("created_at", { ascending: false });
        if (data) setReviews(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

        const { error } = await supabase.from("Reviews").delete().eq("id", reviewId);
        if (error) {
            toast.error("Lỗi khi xóa: "Try again.");
        } else {
            toast.success("Đã xóa đánh giá.");
            fetchReviews();
        }
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            i < rating 
            ? <FaStar key={i} className="text-yellow-400" /> 
            : <FaRegStar key={i} className="text-gray-300" />
        ));
    };

    return (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white p-5 border-b dark:border-neutral-700 flex items-center gap-3">
                 <FaRegCommentDots className="text-sky-600" /> Quản lý Đánh giá
            </h2>
            {loading ? (
                <div className="p-8 text-center"><FaSpinner className="animate-spin text-2xl" /></div>
            ) : reviews.length === 0 ? (
                <p className="p-8 text-center text-gray-500 italic">Chưa có đánh giá nào.</p>
            ) : (
                <div className="divide-y dark:divide-neutral-700 max-h-[600px] overflow-y-auto">
                    {reviews.map(r => (
                        <div key={r.id} className="p-5 flex gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold dark:text-white">{r.user?.full_name || 'Khách'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tour: {r.product?.name || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {renderStars(r.rating)}
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mt-2">{r.comment}</p>
                            </div>
                            <button 
                                onClick={() => handleDelete(r.id)}
                                className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Xóa đánh giá"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Component chính: Quản lý Khách hàng (CRM) ---
export default function ManageCustomers() {
    const [customers, setCustomers] = useState([]); // Lấy từ bảng Users
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null); // Cho modal lịch sử

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        // Lấy user, nhưng chỉ role 'user'
        const { data, error: fetchError } = await supabase
            .from("Users")
            .select("*")
            .eq('role', 'user') // <<< Chỉ lấy khách hàng
            .order("full_name", { ascending: true });

        if (fetchError) {
            setError("Không thể tải danh sách khách hàng: " + fetchError.message);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // --- Cập nhật thông tin cá nhân (lấy từ ManageAccounts) ---
    const handleEditUser = async (user) => {
        const newName = prompt("Nhập tên mới:", user.full_name || "");
        const newAddress = prompt("Nhập địa chỉ mới:", user.address || "");
        const newPhone = prompt("Nhập số điện thoại mới:", user.phone_number || "");

        if (newName === null && newAddress === null && newPhone === null) return;

        const updates = {
            full_name: newName || user.full_name,
            address: newAddress || user.address,
            phone_number: newPhone || user.phone_number,
        };

        const { error } = await supabase.from("Users").update(updates).eq("id", user.id);
        if (error) {
            toast.error("Lỗi khi cập nhật: " + error.message);
        } else {
            toast.success("Cập nhật hồ sơ thành công!");
            fetchCustomers();
        }
    };
    
    // --- Lọc tìm kiếm ---
    const filteredCustomers = useMemo(() => {
        const q = search.toLowerCase();
        return customers.filter((c) => 
            c.full_name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.address?.toLowerCase().includes(q) ||
            c.phone_number?.toLowerCase?.().includes(q)
        );
    }, [customers, search]);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <UsersThree size={30} weight="duotone" className="text-sky-600" />
                Quản lý Khách hàng
            </h1>

            {/* --- Thanh tìm kiếm --- */}
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm theo tên, email, địa chỉ, SĐT..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition"
                />
            </div>

            {/* --- Bảng khách hàng --- */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên Khách hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Số điện thoại</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Địa chỉ</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center"><FaSpinner className="animate-spin text-2xl mx-auto" /></td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">Không tìm thấy khách hàng.</td></tr>
                            ) : (
                                filteredCustomers.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.full_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.phone_number || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.address || 'N/A'}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                                            <button 
                                                onClick={() => handleEditUser(c)}
                                                className="p-2 text-blue-500 hover:text-blue-700" title="Cập nhật thông tin">
                                                <FaUserEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setSelectedUser(c)}
                                                className="p-2 text-green-500 hover:text-green-700" title="Xem lịch sử đặt tour">
                                                <FaHistory size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* --- Component Quản lý Đánh giá --- */}
            <ManageReviews />

            {/* --- Modal Lịch sử --- */}
            {selectedUser && (
                <CustomerHistoryModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    );
}
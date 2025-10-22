// src/pages/AdminProductApproval.jsx (ĐÃ SỬA LỖI TOÀN DIỆN)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaUmbrellaBeach, FaHotel, FaPlane, FaCar, FaTags } from "react-icons/fa";
import { CheckSquare } from '@phosphor-icons/react';

const supabase = getSupabase();

// --- ApprovalBadge (giữ nguyên) ---
const ApprovalBadge = ({ status }) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
    switch (status) {
        case "approved": return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}><FaCheckCircle />Đã duyệt</span>;
        case "rejected": return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}><FaTimesCircle />Từ chối</span>;
        default: return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}><FaSyncAlt className="animate-spin" /> Đang chờ</span>;
    }
};
export { ApprovalBadge };

// --- Component Chính (Đã sửa logic) ---
const AdminProductApproval = () => {
    const [products, setProducts] = useState([]); // Đổi tên state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // State lọc

    // === SỬA LỖI: Hàm fetch data MỚI ===
    // Hàm này sẽ lấy TẤT CẢ sản phẩm, TẤT CẢ trạng thái
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Bắt đầu query từ bảng Products
            let query = supabase
                .from("Products")
                .select(`
                    *, 
                    supplier_info:Suppliers(name) 
                `) // Join để lấy tên NCC
                .order("created_at", { ascending: false });

            // Áp dụng filter (nếu filter không phải là 'all')
            if (filter !== 'all') {
                query = query.eq('product_type', filter);
            }
            
            // Bỏ lọc 'pending' để lấy TẤT CẢ trạng thái
            const { data, error } = await query;
            if (error) throw error;

            setProducts(data || []);

        } catch (err) {
            setError("Không thể tải danh sách sản phẩm: " + err.message);
            console.error("Lỗi tải dữ liệu duyệt:", err)
        } finally {
            setLoading(false);
        }
    }, [filter]); // Thêm 'filter' làm dependency

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // === SỬA LỖI: Hàm updateStatus MỚI ===
    // Đơn giản hóa, chỉ cập nhật bảng 'Products'
    const updateStatus = async (id, status) => {
        const actionText = status === "approved" ? "phê duyệt" : (status === "rejected" ? "từ chối" : "đặt lại");
        if (!window.confirm(`Bạn có chắc muốn ${actionText} sản phẩm này?`)) {
             return;
        }
        
        try {
            const { error } = await supabase
                .from('Products') // Luôn cập nhật bảng 'Products'
                .update({ approval_status: status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Đã ${actionText}!`);

            // Cập nhật UI ngay lập tức
            setProducts(prevItems =>
                prevItems.map(item =>
                    item.id === id ? { ...item, approval_status: status } : item
                )
            );
        
        } catch (err) {
            toast.error("Lỗi cập nhật trạng thái: " + err.message);
            console.error("Lỗi cập nhật trạng thái:", err);
        }
    };

    // Lọc items (Đã sửa)
    const filteredItems = useMemo(() => {
        if (filter === 'all') return products;
        return products.filter(item => item.product_type === filter);
    }, [products, filter]);

    // Helper icon (Đã sửa 'car_rental' thành 'transport')
    const ItemIcon = ({ type }) => {
        switch (type) {
            case 'hotel': return <FaHotel className="text-blue-500" title="Khách sạn"/>;
            case 'flight': return <FaPlane className="text-indigo-500" title="Chuyến bay"/>;
            case 'transport': return <FaCar className="text-orange-500" title="Vận chuyển"/>; // Sửa
            case 'tour':
            default: return <FaUmbrellaBeach className="text-teal-500" title="Tour"/>;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <CheckSquare weight="duotone" className="text-sky-600" /> Phê duyệt Sản phẩm
                </h1>
                <button onClick={fetchData} disabled={loading} className={`flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FaSyncAlt className={loading ? "animate-spin" : ""} /> Làm mới
                </button>
            </div>

            {/* --- Thanh Lọc Tabs (Đã sửa 'car_rental' thành 'transport') --- */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {[
                        { type: 'all', label: 'Tất cả', icon: FaTags },
                        { type: 'tour', label: 'Tour', icon: FaUmbrellaBeach },
                        { type: 'hotel', label: 'Khách sạn', icon: FaHotel },
                        { type: 'transport', label: 'Vận chuyển', icon: FaCar }, // Sửa
                        { type: 'flight', label: 'Chuyến bay', icon: FaPlane }
                    ].map((tab) => {
                        const isActive = filter === tab.type;
                        return (
                            <button
                                key={tab.type}
                                onClick={() => setFilter(tab.type)}
                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                                isActive
                                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Phần hiển thị bảng */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <FaSpinner className="animate-spin text-4xl text-sky-600" />
                </div>
             ) : error ? (
                <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">{error}</div>
             ) : (
                <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg border dark:border-slate-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nhà Cung Cấp</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Giá</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {/* SỬA: Lọc bằng filteredItems */}
                            {filteredItems.length > 0 ? filteredItems.map(item => ( 
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ItemIcon type={item.product_type} />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {item.supplier_info?.name || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {(item.price !== null && item.price !== undefined) ? item.price.toLocaleString("vi-VN") + ' VNĐ' : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm"><ApprovalBadge status={item.approval_status} /></td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        {item.approval_status === "pending" ? (
                                             <>
                                                <button onClick={() => updateStatus(item.id, "approved")} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Duyệt</button>
                                                <button onClick={() => updateStatus(item.id, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Từ chối</button>
                                             </>
                                         ) : (
                                            // --- SỬA LỖI GÕ MÁY Ở ĐÂY ---
                                            <button onClick={() => updateStatus(item.id, "pending")} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs">Đặt lại</button>
                                            // --- KẾT THÚC SỬA LỖI ---
                                         )}
                                    </td>
                                </tr>
                            )) : (
                                <tr> <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">Không có sản phẩm nào {filter !== 'all' ? `cho loại '${filter}'` : ''}.</td> </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             )}
        </div>
    );
};

export default AdminProductApproval;
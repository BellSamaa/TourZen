// src/pages/AdminProductApproval.jsx (ĐÃ SỬA)
import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaUmbrellaBeach, FaHotel, FaPlane, FaCar, FaTags } from "react-icons/fa";
import { CheckSquare, Buildings, AirplaneTilt } from '@phosphor-icons/react'; // Import thêm

const supabase = getSupabase();

// --- ApprovalBadge (giữ nguyên hoặc copy vào đây) ---
const ApprovalBadge = ({ status }) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
    switch (status) {
        case "approved": return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}><FaCheckCircle />Đã duyệt</span>;
        case "rejected": return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}><FaTimesCircle />Từ chối</span>;
        default: return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}><FaSyncAlt className="animate-spin" /> Đang chờ</span>;
    }
};

// --- Component Chính ---
const AdminProductApproval = () => {
    const [itemsToApprove, setItemsToApprove] = useState([]); // Đổi tên state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // State lọc (all, tour, hotel, transport, flight)

    // Hàm fetch data MỚI (lấy cả Products và Suppliers đang chờ duyệt)
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Lấy Products (chỉ tour) đang chờ duyệt
            const { data: productsData, error: productsError } = await supabase
                .from("Products")
                .select(`*, supplier_info:Suppliers(name)`) // Join để lấy tên NCC nếu tour có liên kết
                .eq('approval_status', 'pending')
                .eq('product_type', 'tour'); // Chỉ lấy tour từ bảng Products
            if (productsError) throw productsError;

            // Lấy Suppliers (Hotel, Transport, Flight) đang chờ duyệt
            const { data: suppliersData, error: suppliersError } = await supabase
                .from("Suppliers")
                .select(`*`) // Lấy tất cả cột từ Suppliers
                .eq('approval_status', 'pending');
            if (suppliersError) throw suppliersError;

            // Gộp kết quả và thêm thông tin để phân biệt
            const combinedData = [
                // Thêm source_table='Products' và item_type='tour' cho sản phẩm
                ...(productsData || []).map(p => ({ ...p, source_table: 'Products', item_type: 'tour' })),
                // Thêm source_table='Suppliers' và item_type là loại supplier (hotel/transport/flight)
                ...(suppliersData || []).map(s => ({ ...s, source_table: 'Suppliers', item_type: s.type }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sắp xếp theo ngày tạo mới nhất

            setItemsToApprove(combinedData);

        } catch (err) {
            setError("Không thể tải danh sách cần duyệt: " + err.message);
            console.error("Lỗi tải dữ liệu duyệt:", err)
        } finally {
            setLoading(false);
        }
    }, []); // Chỉ phụ thuộc vào supabase client (không đổi)

    useEffect(() => {
        fetchData();
    }, [fetchData]);

     // Hàm updateStatus MỚI (thêm tham số source_table)
    const updateStatus = async (id, status, source_table) => {
        if (!source_table) {
            toast.error("Lỗi: Không xác định được loại mục cần cập nhật.");
            return;
        }
        try {
            // Dùng source_table để biết update bảng nào ('Products' hoặc 'Suppliers')
            const { error } = await supabase
                .from(source_table)
                .update({ approval_status: status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Đã ${status === 'approved' ? 'duyệt' : status === 'rejected' ? 'từ chối' : 'đặt lại chờ'}!`);

            // Xóa mục đã xử lý khỏi danh sách chờ trên UI
            setItemsToApprove(prevItems =>
                prevItems.filter(item => !(item.id === id && item.source_table === source_table))
            );
             // Hoặc: Tải lại toàn bộ danh sách nếu muốn
             // await fetchData();

        } catch (err) {
            toast.error("Lỗi cập nhật trạng thái: " + err.message);
            console.error("Lỗi cập nhật trạng thái:", err);
        }
    };

    // Lọc items dựa trên state filter
    const filteredItems = useMemo(() => {
        if (filter === 'all') return itemsToApprove;
        // Lọc dựa trên item_type đã gán khi fetch
        return itemsToApprove.filter(item => item.item_type === filter);
    }, [itemsToApprove, filter]);

    // Helper icon cho loại item
    const ItemIcon = ({ type }) => {
        switch (type) {
            case 'hotel': return <FaHotel className="text-blue-500" title="Khách sạn"/>;
            case 'flight': return <FaPlane className="text-indigo-500" title="Chuyến bay"/>;
            case 'transport': return <FaCar className="text-orange-500" title="Vận chuyển"/>;
            case 'tour':
            default: return <FaUmbrellaBeach className="text-teal-500" title="Tour"/>;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <CheckSquare weight="duotone" className="text-sky-600" /> Phê duyệt Sản phẩm & NCC
                </h1>
                <button onClick={fetchData} disabled={loading} className={`flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FaSyncAlt className={loading ? "animate-spin" : ""} /> Làm mới
                </button>
            </div>

            {/* --- Thanh Lọc Tabs (Cập nhật các loại) --- */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {[
                        { type: 'all', label: 'Tất cả', icon: FaTags },
                        { type: 'tour', label: 'Tour', icon: FaUmbrellaBeach },
                        { type: 'hotel', label: 'Khách sạn', icon: FaHotel },
                        { type: 'transport', label: 'Vận chuyển', icon: FaCar }, // Đổi tên thành Vận chuyển
                        { type: 'flight', label: 'Chuyến bay', icon: FaPlane }
                        // Bạn có thể thêm các loại khác nếu bảng Products có thêm loại
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
            {loading ? ( // Ưu tiên kiểm tra loading
                <div className="flex justify-center items-center min-h-[200px]">
                    <FaSpinner className="animate-spin text-4xl text-sky-600" />
                </div>
             ) : error ? ( // Sau đó kiểm tra lỗi
                <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">{error}</div>
             ) : ( // Cuối cùng hiển thị bảng
                <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-xl rounded-lg border dark:border-slate-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Chi tiết / NCC liên kết</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Giá</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredItems.length > 0 ? filteredItems.map(item => (
                                // Key cần bao gồm cả source_table để đảm bảo duy nhất
                                <tr key={`${item.source_table}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* Dùng item_type đã gán */}
                                        <ItemIcon type={item.item_type} />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {/* Hiển thị chi tiết hoặc tên NCC liên kết */}
                                        {item.source_table === 'Products' && (item.supplier_info?.name || '—')}
                                        {item.source_table === 'Suppliers' && item.type === 'hotel' && `📍 ${item.details?.location || 'N/A'}`}
                                        {item.source_table === 'Suppliers' && item.type === 'transport' && `🚗 ${item.details?.vehicle_type || 'N/A'} (${item.details?.seats || '?'} chỗ)`}
                                        {item.source_table === 'Suppliers' && item.type === 'flight' && `✈️ ${item.details?.airline || 'N/A'} (${item.details?.code || 'N/A'})`}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {/* Kiểm tra giá null/undefined */}
                                        {(item.price !== null && item.price !== undefined) ? item.price.toLocaleString("vi-VN") + ' VNĐ' : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm"><ApprovalBadge status={item.approval_status} /></td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        {/* Các nút Duyệt/Từ chối chỉ hiển thị khi đang chờ */}
                                        {item.approval_status === "pending" ? (
                                             <>
                                                {/* Truyền cả id, status mới, và source_table vào hàm update */}
                                                <button onClick={() => updateStatus(item.id, "approved", item.source_table)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Duyệt</button>
                                                <button onClick={() => updateStatus(item.id, "rejected", item.source_table)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Từ chối</button>
                                             </>
                                         ) : (
                                            // Nút đặt lại trạng thái chờ nếu đã duyệt/từ chối
                                            <button onClick={() => updateStatus(item.id, "pending", item.source_table)} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs">Đặt lại chờ</button>
                                         )}
                                    </td>
                                </tr>
                            )) : (
                                // Thông báo khi không có item nào phù hợp bộ lọc
                                <tr> <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">Không có mục nào đang chờ duyệt {filter !== 'all' ? `cho loại '${filter}'` : ''}.</td> </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             )}
        </div>
    );
};

export default AdminProductApproval;
// src/pages/ManageTour.jsx
// (Nâng cấp: Thêm Realtime, sắp xếp cột)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { 
    FaSpinner, FaSearch, FaEdit, FaTrash, FaPlus,
    FaExclamationTriangle, FaSyncAlt // Thêm icon refresh
} from "react-icons/fa";
import { Package } from "@phosphor-icons/react";
import toast from 'react-hot-toast';

const supabase = getSupabase();

// --- Các hàm helpers (Giữ nguyên) ---
const formatCurrency = (number) => { /* ... */ };
const formatDate = (dateString) => { /* ... */ };
const bookingSelect = ` id, created_at, quantity, total_price, status, user_id, main_tour:Products!product_id (id, name, product_type, supplier_id, stock), user:Users (id, full_name, email) `;
const getProductsFromBooking = (booking) => { /* ... */ };
const updateStockAndNotify = async (product, quantityChange, reason) => { /* ... */ };
const applyStockChanges = async (oldBooking, newBooking) => { /* ... */ };
const EditBookingModal = ({ booking, onClose, onSave, allProducts, allUsers }) => { /* ... */ };
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => { /* ... */ };
const sendBookingEmail = async (booking, newStatus) => { /* ... */ };
const getStatusColor = (status) => { /* ... */ };

// --- Component chính: Quản lý Đặt Tour ---
export default function ManageTour() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Hàm fetch dữ liệu ban đầu
    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
            .from("Bookings")
            .select(bookingSelect)
            .eq('main_tour.product_type', 'tour')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error("Lỗi fetch đặt tour:", fetchError);
            setError(fetchError.message);
            toast.error("Lỗi tải danh sách đơn hàng.");
        } else {
            setBookings(data || []);
        }
        if (showLoading) setLoading(false);
    }, []);

    // Fetch data ban đầu và data cho modal
    useEffect(() => {
        fetchData(); // Fetch lần đầu

        // Tải data cho Modal (chỉ cần chạy 1 lần)
        const fetchModalData = async () => {
             const { data: products } = await supabase.from('Products').select('id, name, price, stock, supplier_id, product_type').eq('approval_status', 'approved').eq('product_type', 'tour');
             setAllProducts(products || []);
             const { data: users } = await supabase.from('Users').select('id, full_name, email');
             setAllUsers(users || []);
        };
        fetchModalData();
    }, [fetchData]);

    // --- (MỚI) Thiết lập Realtime Subscription ---
    useEffect(() => {
        // Lắng nghe thay đổi trên bảng Bookings
        const channel = supabase
            .channel('public:Bookings')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Bookings' },
                (payload) => {
                    console.log('Realtime Change received!', payload);
                    // Fetch lại dữ liệu mà không hiển thị loading
                    fetchData(false); 
                    // Hoặc bạn có thể xử lý payload để cập nhật state trực tiếp (phức tạp hơn)
                    // if (payload.new && payload.eventType === 'INSERT') {
                    //    // Check if it's a tour booking before adding
                    // } else if (payload.old && payload.eventType === 'DELETE') {
                    //    // Remove from state
                    // } else if (payload.new && payload.eventType === 'UPDATE') {
                    //    // Update in state
                    // }
                    toast.success('Danh sách đơn hàng đã được cập nhật!');
                }
            )
            .subscribe();

        // Cleanup subscription khi component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData]); // Thêm fetchData vào dependency array

    // Các hàm xử lý (handleStatusChange, handleSaveBooking, handleDeleteBooking) giữ nguyên
    const handleStatusChange = async (booking, newStatus) => { /* ... giữ nguyên ... */ };
    const handleSaveBooking = async (dataToSave, oldBooking) => { /* ... giữ nguyên ... */ };
    const handleDeleteBooking = async (booking) => { /* ... giữ nguyên ... */ };

    // Lọc tìm kiếm (Giữ nguyên)
    const filteredBookings = useMemo(() => { /* ... giữ nguyên ... */ }, [bookings, searchTerm]);

    return (
        <div className="p-4 space-y-8">
            <div>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <Package size={30} weight="duotone" className="text-sky-600" />
                        Quản lý Đặt Tour
                    </h1>
                    <div className="flex gap-2">
                         {/* Nút refresh thủ công */}
                        <button
                            onClick={() => fetchData(true)} // Fetch lại và hiện loading
                            disabled={loading}
                            className={`flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FaSyncAlt className={loading ? "animate-spin" : ""} /> Tải lại
                        </button>
                        <button
                            onClick={() => { setCurrentBooking(null); setIsModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium shadow"
                            disabled={loading} // Disable khi đang tải
                        >
                            <FaPlus /> Thêm Đơn Tour
                        </button>
                    </div>
                </div>

                {/* Thanh tìm kiếm (Giữ nguyên) */}
                <div className="mb-4 relative">
                    {/* ... input search ... */}
                </div>

                {loading && bookings.length === 0 ? ( // Chỉ hiện loading xoay tròn khi chưa có data
                    <div className="flex justify-center items-center h-64">
                        <FaSpinner className="animate-spin text-4xl text-sky-600" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">Lỗi: {error}</div>
                ) : (
                    <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden border dark:border-neutral-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {/* Sắp xếp lại cột */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã Đặt Tour</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên Khách Hàng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên Tour</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày Đặt</th>
                                        {/* Có thể thêm cột Ngày Khởi Hành nếu bạn lưu nó */}
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày Khởi Hành</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng Giá</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng Thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                                            {/* Mã đặt tour (lấy 8 ký tự cuối ID cho gọn) */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">#{booking.id.slice(-8).toUpperCase()}</td>
                                            {/* Tên khách hàng */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {booking.user ? booking.user.full_name : "Khách vãng lai"}
                                                {/* Có thể thêm link tới trang ManageCustomers */}
                                                {/* <Link to={`/admin/customers/${booking.user_id}`} className="block text-xs text-blue-500 hover:underline">{booking.user?.email}</Link> */}
                                            </td>
                                            {/* Tên tour */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                                                {booking.main_tour ? booking.main_tour.name : "N/A"}
                                                <span className="block text-xs text-gray-500 dark:text-gray-400">SL: {booking.quantity}</span>
                                            </td>
                                            {/* Ngày đặt */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {formatDate(booking.created_at)}
                                            </td>
                                            {/* Tổng giá */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                                                {formatCurrency(booking.total_price)}
                                            </td>
                                            {/* Trạng thái */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => handleStatusChange(booking, e.target.value)}
                                                    className={`text-xs font-medium rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${getStatusColor(booking.status)}`}
                                                >
                                                    <option value="pending">Chờ xử lý</option>
                                                    <option value="confirmed">Đã xác nhận</option>
                                                    <option value="cancelled">Đã hủy</option>
                                                </select>
                                            </td>
                                            {/* Hành động */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                                                {/* Nút Sửa */}
                                                <button onClick={() => { setCurrentBooking(booking); setIsModalOpen(true); }} className="..." title="Sửa"> <FaEdit size={16} /> </button>
                                                {/* Nút Xóa */}
                                                <button onClick={() => setBookingToDelete(booking)} className="..." title="Xóa"> <FaTrash size={16} /> </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredBookings.length === 0 && !loading && (
                                        <tr>
                                            {/* Cập nhật colSpan */}
                                            <td colSpan="8" className="text-center py-10 text-gray-500 italic">
                                                {searchTerm ? "Không tìm thấy đơn đặt tour." : "Chưa có đơn đặt tour nào."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals (Giữ nguyên) */}
            {isModalOpen && ( /* ... EditBookingModal ... */ )}
            {bookingToDelete && ( /* ... DeleteConfirmationModal ... */ )}
        </div>
    );
}

// --- Các component con (EditBookingModal, DeleteConfirmationModal) và helpers (formatCurrency, formatDate, ...) giữ nguyên code như trước ---
// ... (Dán code các hàm và component con đã có ở đây) ...
const formatCurrency = (number) => { /*...*/ };
const formatDate = (dateString) => { /*...*/ };
const EditBookingModal = ({ booking, onClose, onSave, allProducts, allUsers }) => { /*...*/ };
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => { /*...*/ };
const getStatusColor = (status) => { /*...*/ };
const sendBookingEmail = async (booking, newStatus) => { /*...*/ };
const getProductsFromBooking = (booking) => { /*...*/ };
const updateStockAndNotify = async (product, quantityChange, reason) => { /*...*/ };
const applyStockChanges = async (oldBooking, newBooking) => { /*...*/ };
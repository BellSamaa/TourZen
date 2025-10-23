// src/pages/ManageBookings.jsx
// (Nội dung được nâng cấp thành "Quản lý Khách hàng" & Admin)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { 
    FaSpinner, FaChartBar, FaUserFriends, FaRegStar, FaSearch, 
    FaCheckCircle, FaTimesCircle, FaClock, FaEdit, FaTrash, FaPlus,
    FaExclamationTriangle
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const supabase = getSupabase();

// --- Các hàm helpers (Giữ nguyên) ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(number);
};

const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleString("vi-VN", options);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Component con: Hàng chờ Phê duyệt Sản phẩm (Giữ nguyên) ---
const ProductApprovalQueue = () => {
    const [pendingProducts, setPendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Products')
            .select('*, supplier:Suppliers(name)') // Lấy cả tên nhà cung cấp
            .eq('approval_status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Lỗi fetch sản phẩm chờ duyệt:", error);
            setError(error.message);
        } else {
            setPendingProducts(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPendingProducts();
    }, [fetchPendingProducts]);

    const handleApproval = async (productId, newStatus) => {
        // Cập nhật UI ngay lập tức
        setPendingProducts(prev => prev.filter(p => p.id !== productId));

        const { error } = await supabase
            .from('Products')
            .update({ approval_status: newStatus })
            .eq('id', productId);
        
        if (error) {
            alert("Lỗi cập nhật sản phẩm: " + error.message);
            fetchPendingProducts(); // Tải lại nếu có lỗi
        }
    };

    if (loading) {
        return <div className="p-4 text-center dark:text-gray-300">Đang tải danh sách chờ duyệt...</div>
    }
    if (error) {
         return <div className="p-4 text-center text-red-500">Lỗi: {error}</div>
    }
    if (pendingProducts.length === 0) {
        return (
             <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-center">
                 <FaCheckCircle className="mx-auto text-3xl text-green-500 mb-2" />
                 <h3 className="font-semibold text-green-800 dark:text-green-200">Tuyệt vời!</h3>
                 <p className="text-sm text-green-700 dark:text-green-300">Không có sản phẩm nào đang chờ duyệt.</p>
             </div>
        )
    }

    // Hiển thị bảng nếu có sản phẩm chờ
    return (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                 <FaClock className="inline mr-2 text-yellow-500" /> Hàng chờ Phê duyệt
             </h2>
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                         <tr>
                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sản phẩm</th>
                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Loại</th>
                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">NCC</th>
                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Giá</th>
                             <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                         {pendingProducts.map(product => (
                             <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                                 <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{product.product_type}</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.supplier?.name || 'N/A'}</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(product.price)}</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2">
                                     <button onClick={() => handleApproval(product.id, 'approved')} className="p-2 text-green-500 hover:text-green-700" title="Duyệt">
                                         <FaCheckCircle size={18} />
                                     </button>
                                     <button onClick={() => handleApproval(product.id, 'rejected')} className="p-2 text-red-500 hover:text-red-700" title="Từ chối">
                                         <FaTimesCircle size={18} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
    );
};


// --- (MỚI) Component Modal Thêm/Sửa Booking ---
const EditBookingModal = ({ booking, onClose, onSave, allProducts, allUsers }) => {
    const [formData, setFormData] = useState({
        user_id: '',
        product_id: '',
        quantity: 1,
        status: 'pending',
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState('');

    // Load data khi edit
    useEffect(() => {
        if (booking) {
            setFormData({
                user_id: booking.user_id || '',
                product_id: booking.main_tour?.id || '',
                // Bỏ qua transport và flight vì modal này chỉ hỗ trợ 1 tour chính
                quantity: booking.quantity || 1,
                status: booking.status || 'pending',
                id: booking.id
            });
        } else {
            // Reset form khi tạo mới
            setFormData({
                user_id: '',
                product_id: '',
                quantity: 1,
                status: 'pending',
            });
        }
    }, [booking]);

    // Tính toán tổng giá khi sản phẩm hoặc số lượng thay đổi
    useEffect(() => {
        const product = allProducts.find(p => p.id === formData.product_id);
        const quantity = parseInt(formData.quantity, 10) || 0;
        if (product && quantity > 0) {
            setTotalPrice(product.price * quantity);
        } else {
            setTotalPrice(0);
        }
    }, [formData.product_id, formData.quantity, allProducts]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.user_id || !formData.product_id || formData.quantity <= 0) {
            setError('Vui lòng điền đầy đủ thông tin (Khách hàng, Tour, Số lượng > 0).');
            return;
        }

        const product = allProducts.find(p => p.id === formData.product_id);
        if (!product) {
             setError('Sản phẩm không hợp lệ.');
             return;
        }

        const dataToSave = {
            ...formData,
            total_price: totalPrice,
            // Đơn giản hóa: chỉ lưu tour chính
            transport_product_id: null,
            flight_product_id: null,
        };

        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <FaTimesCircle size={24} />
                </button>
                <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                    {booking ? 'Sửa Booking' : 'Tạo Booking Mới'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khách hàng</label>
                        <select
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="">-- Chọn khách hàng --</option>
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tour/Dịch vụ chính</label>
                        <select
                            name="product_id"
                            value={formData.product_id}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500"
                        >
                            <option value="">-- Chọn dịch vụ --</option>
                            {allProducts.map(product => (
                                <option key={product.id} value={product.id}>{product.name} ({formatCurrency(product.price)}) - Còn lại: {product.stock}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số lượng</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="pending">Chờ xử lý</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">Tổng cộng: {formatCurrency(totalPrice)}</span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-500">
                            Hủy
                        </button>
                        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- (MỚI) Component Modal Xác nhận Xóa ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
                 <div className="flex items-center">
                    <div className="mr-4 flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-3">
                         <FaExclamationTriangle className="text-red-600 dark:text-red-300" size={24} />
                    </div>
                    <div>
                         <h3 className="text-lg font-bold text-gray-800 dark:text-white">Xác nhận Xóa Booking</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Bạn có chắc chắn muốn xóa booking này? (ID: {booking.id}). 
                            {booking.status === 'confirmed' && <span className="font-bold text-red-500"> Số lượng sẽ được hoàn trả.</span>}
                         </p>
                    </div>
                </div>
                 <div className="flex justify-end gap-3 pt-6 mt-4 border-t dark:border-neutral-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-500">
                        Hủy
                    </button>
                    <button type="button" onClick={() => onConfirm(booking)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Xác nhận Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Component chính: Quản lý Khách hàng ---
export default function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // (MỚI) State cho Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null); // null = tạo mới
    const [bookingToDelete, setBookingToDelete] = useState(null);
    
    // (MỚI) State cho dữ liệu form
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);


    // (CẬP NHẬT) Sửa câu select để lấy `supplier_id` và `stock` cho logic số lượng ảo
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("Bookings")
            .select(`
                id, created_at, quantity, total_price, status, user_id,
                user:Users ( id, full_name, email ), 
                main_tour:Products!product_id ( id, name, product_type, supplier_id, stock ),
                transport_service:Products!transport_product_id ( id, name, product_type, supplier_id, stock ),
                flight_service:Products!flight_product_id ( id, name, product_type, supplier_id, stock )
            `)
            .order('created_at', { ascending: false }); 

        if (error) {
            console.error("Lỗi fetch bookings:", error);
            setError(error.message);
        } else {
            setBookings(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // (MỚI) Fetch dữ liệu cho Modals (Products và Users)
    useEffect(() => {
        const fetchModalData = async () => {
            // Lấy products (có supplier_id và stock)
            const { data: products } = await supabase
                .from('Products')
                .select('id, name, price, stock, supplier_id')
                .eq('approval_status', 'approved');
            setAllProducts(products || []);

            // Lấy users
            const { data: users } = await supabase.from('Users').select('id, full_name, email');
            setAllUsers(users || []);
        };
        fetchModalData();
    }, []);


    // --- (MỚI) Logic Cốt lõi: Cập nhật số lượng ảo & Thông báo NCC ---
    const updateStockAndNotify = async (product, quantityChange, reason) => {
        // quantityChange: số âm (trừ kho), số dương (cộng kho)
        
        if (!product || !product.id || !product.supplier_id) {
            console.error("Thiếu thông tin Product hoặc Supplier để cập nhật stock.", product);
            return;
        }

        // 1. Lấy stock hiện tại (để tránh race condition, nên dùng RPC, nhưng tạm thời dùng select + update)
        const { data: currentProduct, error: fetchError } = await supabase
            .from('Products')
            .select('stock, name')
            .eq('id', product.id)
            .single();

        if (fetchError || !currentProduct) {
            console.error("Lỗi fetch sản phẩm để cập nhật stock:", fetchError);
            alert("Lỗi: Không thể lấy stock sản phẩm.");
            return;
        }

        const newStock = (currentProduct.stock || 0) + quantityChange;

        // 2. Cập nhật "số lượng ảo" (stock)
        const { error: stockError } = await supabase
            .from('Products')
            .update({ stock: newStock })
            .eq('id', product.id);
        
        if (stockError) {
            console.error("Lỗi cập nhật số lượng ảo:", stockError);
            alert("Lỗi: Cập nhật stock thất bại.");
            // Không dừng lại, vẫn cố thông báo
        }

        // 3. Gửi thông báo cho Supplier (Tạo 1 record trong bảng Notifications)
        // (Giả sử bạn có bảng `Notifications` với các cột: `supplier_id`, `message`, `related_product_id`)
        const message = `Cập nhật SL: ${reason}. 
                       Tour "${product.name}". 
                       Thay đổi: ${quantityChange}. 
                       SL ảo còn lại: ${newStock}.`;
        
        const { error: notifyError } = await supabase
            .from('Notifications') // Bảng này phải tồn tại trong DB của bạn
            .insert({
                supplier_id: product.supplier_id,
                message: message,
                related_product_id: product.id,
                is_read: false
            });

        if (notifyError) {
            console.error("Lỗi tạo thông báo cho NCC:", notifyError);
            // Đây là lỗi không nghiêm trọng, không cần báo user
        }

        console.log(`Đã cập nhật stock và thông báo cho NCC: ${message}`);
    };


    // (CẬP NHẬT) Sửa hàm handleStatusChange để xử lý logic stock
    // Giờ đây hàm nhận cả object `booking` thay vì chỉ `bookingId`
    const handleStatusChange = async (booking, newStatus) => {
        const oldStatus = booking.status;
        const product = booking.main_tour; // Tạm thời chỉ xử lý main_tour
        const quantity = booking.quantity;

        // Không làm gì nếu trạng thái không đổi
        if (oldStatus === newStatus) return;

        // Cập nhật UI trước
        setBookings((prevBookings) =>
            prevBookings.map((b) =>
                b.id === booking.id ? { ...b, status: newStatus } : b
            )
        );

        // Cập nhật DB
        const { error } = await supabase
            .from("Bookings")
            .update({ status: newStatus })
            .eq("id", booking.id);

        if (error) {
            alert("Lỗi cập nhật trạng thái: " + error.message);
            fetchData(); // Tải lại nếu lỗi
            return;
        }

        // --- Logic Số lượng ảo & Thông báo ---
        try {
             // Case 1: Xác nhận đơn (Trừ kho)
            if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
                await updateStockAndNotify(product, -quantity, `Booking #${booking.id} Xác nhận`);
            } 
            // Case 2: Hủy đơn đã xác nhận (Hoàn kho)
            else if (newStatus !== 'confirmed' && oldStatus === 'confirmed') {
                await updateStockAndNotify(product, quantity, `Booking #${booking.id} Hủy/Hoàn`);
            }
            // Các trường hợp khác (pending -> cancelled) không ảnh hưởng kho
        } catch (e) {
            console.error("Lỗi nghiêm trọng khi xử lý stock/notify:", e);
            alert("Đã cập nhật trạng thái, nhưng lỗi xử lý số lượng: " + e.message);
        }
        // Tải lại danh sách sản phẩm để cập nhật số lượng (stock) trong modal
        const { data: products } = await supabase.from('Products').select('id, name, price, stock, supplier_id').eq('approval_status', 'approved');
        setAllProducts(products || []);
    };

    // (MỚI) Hàm lưu (Thêm/Sửa) Booking
    const handleSaveBooking = async (formData) => {
        // Lưu ý: Logic stock được xử lý riêng qua handleStatusChange (dropdown)
        // Hàm này chỉ tập trung vào việc tạo/cập nhật booking
        
        const dataToSave = {
            user_id: formData.user_id,
            product_id: formData.product_id, // Gán vào main_tour
            quantity: parseInt(formData.quantity, 10),
            total_price: formData.total_price,
            status: formData.status,
            // Đơn giản hóa: null các dịch vụ khác
            transport_product_id: null,
            flight_product_id: null,
        };
        
        let error;

        if (formData.id) {
            // Cập nhật
            const { error: updateError } = await supabase
                .from('Bookings')
                .update(dataToSave)
                .eq('id', formData.id);
            error = updateError;
        } else {
            // Thêm mới
            const { error: insertError } = await supabase
                .from('Bookings')
                .insert(dataToSave);
            error = insertError;
        }

        if (error) {
            console.error("Lỗi lưu booking:", error);
            alert("Lỗi: " + error.message);
        } else {
            setIsModalOpen(false); // Đóng modal
            fetchData(); // Tải lại danh sách
        }
    };

    // (MỚI) Hàm Xóa Booking
    const handleDeleteBooking = async (booking) => {
        if (!booking) return;

        // --- Logic Số lượng ảo: Hoàn kho nếu đơn đã 'confirmed' ---
         try {
            if (booking.status === 'confirmed' && booking.main_tour) {
                await updateStockAndNotify(booking.main_tour, booking.quantity, `Booking #${booking.id} Bị Xóa`);
            }
        } catch (e) {
             console.error("Lỗi hoàn stock khi xóa:", e);
             alert("Lỗi khi hoàn stock: " + e.message + ". Vui lòng kiểm tra thủ công.");
        }

        // Tiến hành xóa booking
        const { error } = await supabase
            .from('Bookings')
            .delete()
            .eq('id', booking.id);
        
        if (error) {
            console.error("Lỗi xóa booking:", error);
            alert("Lỗi: " + error.message);
        } else {
            setBookingToDelete(null); // Đóng modal xác nhận
            fetchData(); // Tải lại danh sách
            // Tải lại danh sách sản phẩm để cập nhật số lượng (stock) trong modal
            const { data: products } = await supabase.from('Products').select('id, name, price, stock, supplier_id').eq('approval_status', 'approved');
            setAllProducts(products || []);
        }
    };

    // --- (Giữ nguyên) Phân tích dữ liệu & Lọc tìm kiếm ---
    const { topCustomers, popularProducts, serviceTypeUsage } = useMemo(() => {
        // ... (Giữ nguyên logic tính toán)
        const customerStats = {};
        const productStats = {};
        const typeStats = { tour: 0, transport: 0, flight: 0 };

        for (const booking of bookings) {
            if (booking.user) {
                const u = booking.user;
                if (!customerStats[u.id]) {
                    customerStats[u.id] = { id: u.id, name: u.full_name || 'N/A', email: u.email, count: 0, total_spent: 0 };
                }
                customerStats[u.id].count += 1;
                customerStats[u.id].total_spent += booking.total_price;
            }
            const services = [booking.main_tour, booking.transport_service, booking.flight_service];
            for (const service of services) {
                if (service) {
                    if (!productStats[service.id]) {
                        productStats[service.id] = { name: service.name, value: 0 };
                    }
                    productStats[service.id].value += 1;
                    if (service.product_type === 'tour') typeStats.tour += 1;
                    else if (service.product_type === 'transport') typeStats.transport += 1;
                    else if (service.product_type === 'flight') typeStats.flight += 1;
                }
            }
        }
        const topCustomers = Object.values(customerStats).sort((a, b) => b.count - a.count).slice(0, 5);
        const popularProducts = Object.values(productStats).sort((a, b) => b.value - a.value).slice(0, 5);
        const serviceTypeUsage = [
            { name: 'Tour', value: typeStats.tour },
            { name: 'Xe', value: typeStats.transport },
            { name: 'Chuyến bay', value: typeStats.flight },
        ].filter(d => d.value > 0);
        return { topCustomers, popularProducts, serviceTypeUsage };
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        if (!searchTerm) return bookings;
        return bookings.filter(b => 
            b.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.main_tour?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bookings, searchTerm]);
    
    // (Giữ nguyên) Hàm lấy màu
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'pending': default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }
    };

    // --- (Render) Giao diện ---
    return (
    <div className="p-4 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Quản lý Khách hàng & Hệ thống
        </h1>

        {/* (Giữ nguyên) Phần Thống kê */}
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-sky-700 dark:text-sky-400 mb-3">Tổng quan (Dữ liệu động)</h2>
            {/* ... (Toàn bộ JSX của thống kê giữ nguyên) ... */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-4xl">
                 Phần này cung cấp thống kê động dựa trên lịch sử đặt dịch vụ của khách hàng.
            </p>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                 {/* Biểu đồ Dịch vụ được đặt nhiều (ĐỘNG) */}
                 <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner">
                     <h3 className="font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2"><FaChartBar /> Dịch vụ được đặt nhiều nhất</h3>
                     <div style={{ width: '100%', height: 200 }}>
                         <ResponsiveContainer>
                             <BarChart data={popularProducts} layout="vertical" margin={{ left: 30 }}>
                                 <XAxis type="number" hide />
                                 <YAxis dataKey="name" type="category" scale="band" fontSize={12} width={100} tick={{ fill: 'rgb(156 163 175)' }} />
                                 <Tooltip formatter={(v) => `${v} lượt đặt`} wrapperStyle={{ zIndex: 10 }} />
                                 <Bar dataKey="value" fill="#0ea5e9" background={{ fill: '#eee' }} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                 </div>

                 {/* Biểu đồ Tỷ lệ Dịch vụ (ĐỘNG) */}
                 <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner">
                     <h3 className="font-semibold text-gray-700 dark:text-white mb-2 flex items-center gap-2"><FaUserFriends /> Tỷ lệ sử dụng Dịch vụ</h3>
                     <div style={{ width: '100%', height: 200 }}>
                          <ResponsiveContainer>
                             <PieChart>
                                 <Pie data={serviceTypeUsage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                     {serviceTypeUsage.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                     ))}
                                 </Pie>
                                  <Tooltip formatter={(v, n) => `${v} lượt`} wrapperStyle={{ zIndex: 10 }} />
                             </PieChart>
                         </ResponsiveContainer>
                     </div>
                 </div>

                  {/* Phản hồi & Đánh giá (Tạm giữ) */}
                 <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg shadow-inner flex flex-col justify-center items-center">
                      <h3 className="font-semibold text-gray-700 dark:text-white mb-3 flex items-center gap-2"><FaRegStar /> Phản hồi & Đánh giá</h3>
                      <div className="text-4xl font-bold text-yellow-500">4.8 <span className="text-lg text-gray-500 dark:text-gray-300">/ 5 sao</span></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">(Dựa trên 1,234 đánh giá)</p>
                      <button className="mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors">
                         Xem chi tiết đánh giá
                      </button>
                 </div>
             </div>

             {/* TÍNH NĂNG MỚI: Top khách hàng (Thay thế Placeholder) */}
             <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                 <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Top 5 Khách hàng thân thiết</h3>
                 {topCustomers.length === 0 ? (
                      <p className="text-sm text-blue-700 dark:text-blue-300 italic">Chưa có dữ liệu thống kê khách hàng.</p>
                 ) : (
                     <div className="overflow-x-auto">
                         <table className="min-w-full">
                              <thead className="border-b border-blue-300 dark:border-blue-600">
                                 <tr>
                                     <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Tên Khách hàng</th>
                                     <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Email</th>
                                     <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Số lần đặt</th>
                                     <th className="py-2 text-left text-xs font-medium text-blue-900 dark:text-blue-200 uppercase">Tổng chi tiêu</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {topCustomers.map(customer => (
                                     <tr key={customer.id} className="border-b border-blue-200 dark:border-blue-700 last:border-b-0">
                                         <td className="py-2 pr-3 text-sm font-medium text-blue-800 dark:text-blue-100">{customer.name}</td>
                                         <td className="py-2 pr-3 text-sm text-blue-700 dark:text-blue-300">{customer.email}</td>
                                         <td className="py-2 pr-3 text-sm text-blue-700 dark:text-blue-300">{customer.count}</td>
                                         <td className="py-2 pr-3 text-sm font-semibold text-blue-800 dark:text-blue-200">{formatCurrency(customer.total_spent)}</td>
                                     </tr>
                                 ))}
                              </tbody>
                         </table>
                     </div>
                 )}
             </div>
        </div>

        {/* (Giữ nguyên) Hàng chờ phê duyệt */}
        <ProductApprovalQueue />


        {/* (CẬP NHẬT) Bảng Lịch sử Đặt tour (Thêm CRUD) */}
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Lịch sử Đặt dịch vụ
                </h2>
                {/* (MỚI) Nút Thêm Booking */}
                <button 
                    onClick={() => { setCurrentBooking(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium shadow"
                >
                    <FaPlus /> Thêm Booking Mới
                </button>
            </div>


            {/* (Giữ nguyên) Thanh tìm kiếm */}
            <div className="mb-4 relative">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên/email khách hàng, tên tour..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
        
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-sky-600" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-8">Lỗi: {error}</div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tour/Dịch vụ chính</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dịch vụ thêm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày đặt</th>
                                    {/* (MỚI) Cột Hành động */}
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {booking.user ? booking.user.full_name : "Khách vãng lai"}
                                            <span className="block text-xs text-gray-500 dark:text-gray-400">{booking.user ? booking.user.email : ""}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-200">
                                            {booking.main_tour ? booking.main_tour.name : "N/A"}
                                            <span className="block text-xs text-gray-500 dark:text-gray-400">SL: {booking.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">
                                            {booking.transport_service && <div>Xe: {booking.transport_service.name}</div>}
                                            {booking.flight_service && <div>Bay: {booking.flight_service.name}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                                            {formatCurrency(booking.total_price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {/* (CẬP NHẬT) Truyền cả object `booking` vào hàm */}
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {formatDate(booking.created_at)}
                                        </td>
                                        {/* (MỚI) Nút Sửa/Xóa */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                                            <button 
                                                onClick={() => { setCurrentBooking(booking); setIsModalOpen(true); }}
                                                className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200" title="Sửa"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setBookingToDelete(booking)}
                                                className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-300" title="Xóa"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBookings.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10 text-gray-500 italic">
                                            {searchTerm ? "Không tìm thấy booking." : "Chưa có đơn đặt nào."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* (MỚI) Render Modals */}
        {isModalOpen && (
            <EditBookingModal
                booking={currentBooking}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveBooking}
                allProducts={allProducts}
                allUsers={allUsers}
            />
        )}

        {bookingToDelete && (
            <DeleteConfirmationModal
                booking={bookingToDelete}
                onClose={() => setBookingToDelete(null)}
                onConfirm={handleDeleteBooking}
            />
        )}

    </div>
    );
}

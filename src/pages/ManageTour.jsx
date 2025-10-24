// src/pages/ManageTour.jsx
// (Nâng cấp: Tự động gửi email khi Admin đổi trạng thái)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import { 
    FaSpinner, FaSearch, FaEdit, FaTrash, FaPlus,
    FaExclamationTriangle
} from "react-icons/fa";
import { Package } from "@phosphor-icons/react";
import toast from 'react-hot-toast'; // << Thêm toast để thông báo

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

// --- Chuỗi select (Thêm email của user) ---
const bookingSelect = `
    id, created_at, quantity, total_price, status, user_id,
    main_tour:Products!product_id (id, name, product_type, supplier_id, stock),
    user:Users (id, full_name, email) 
`; // <<< Cập nhật: Đã gộp user vào đây luôn

// --- Hàm lấy products từ booking (Chỉ tour) ---
const getProductsFromBooking = (booking) => {
    const prods = [];
    if (booking?.main_tour) prods.push(booking.main_tour);
    return prods;
};

// --- (Giữ nguyên) updateStockAndNotify ---
const updateStockAndNotify = async (product, quantityChange, reason) => {
    // ... (Giữ nguyên code của hàm này) ...
    if (!product || !product.id || !product.supplier_id) return;
    const { data: currentProduct, error: fetchError } = await supabase
        .from('Products')
        .select('stock, name')
        .eq('id', product.id)
        .single();
    if (fetchError || !currentProduct) {
        throw new Error("Lỗi fetch sản phẩm để cập nhật stock.");
    }
    const newStock = currentProduct.stock + quantityChange;
    const { error: stockError } = await supabase
        .from('Products')
        .update({ stock: newStock })
        .eq('id', product.id);
    if (stockError) {
        throw new Error("Lỗi cập nhật số lượng ảo.");
    }
    const message = `Cập nhật SL: ${reason}. Tour "${product.name}". Thay đổi: ${quantityChange}. SL ảo còn lại: ${newStock}.`;
    const { error: notifyError } = await supabase
        .from('Notifications')
        .insert({
            supplier_id: product.supplier_id,
            message: message,
            related_product_id: product.id,
            is_read: false
        });
    if (notifyError) {
        console.error("Lỗi tạo thông báo cho NCC:", notifyError);
    }
};


// --- (Giữ nguyên) applyStockChanges ---
const applyStockChanges = async (oldBooking, newBooking) => {
    // ... (Giữ nguyên code của hàm này) ...
    const changes = [];
    if (oldBooking && oldBooking.status === 'confirmed') {
        const oldProducts = getProductsFromBooking(oldBooking);
        for (const prod of oldProducts) {
            changes.push({ product: prod, delta: oldBooking.quantity, reason: `Hoàn lại cho Booking Tour #${oldBooking.id}` });
        }
    }
    if (newBooking && newBooking.status === 'confirmed') {
        const newProducts = getProductsFromBooking(newBooking);
        for (const prod of newProducts) {
            changes.push({ product: prod, delta: -newBooking.quantity, reason: `Xác nhận Booking Tour #${newBooking.id}` });
        }
    }
    if (changes.length === 0) return;
    const netDeltas = new Map();
    const productNames = new Map();
    changes.forEach(ch => {
        const pid = ch.product.id;
        const currentDelta = netDeltas.get(pid) || 0;
        netDeltas.set(pid, currentDelta + ch.delta);
        if (!productNames.has(pid)) {
            productNames.set(pid, ch.product.name);
        }
    });
    const checkPids = [];
    netDeltas.forEach((delta, pid) => {
        if (delta < 0) {
            checkPids.push({ pid, required: -delta, name: productNames.get(pid) });
        }
    });
    if (checkPids.length > 0) {
        const pids = checkPids.map(c => c.pid);
        const { data: stocks, error: fetchError } = await supabase
            .from('Products')
            .select('id, stock')
            .in('id', pids);
        if (fetchError) {
            throw new Error('Lỗi kiểm tra stock: ' + fetchError.message);
        }
        for (const st of stocks) {
            const ch = checkPids.find(c => c.pid === st.id);
            if (st.stock < ch.required) {
                throw new Error(`Không đủ chỗ cho tour "${ch.name}". Còn lại: ${st.stock}, cần: ${ch.required}`);
            }
        }
    }
    for (const ch of changes) {
        await updateStockAndNotify(ch.product, ch.delta, ch.reason);
    }
};

// --- (Giữ nguyên) Modal Thêm/Sửa Booking ---
const EditBookingModal = ({ booking, onClose, onSave, allProducts, allUsers }) => {
    // ... (Giữ nguyên code của component này) ...
    const [formData, setFormData] = useState({ user_id: '', product_id: '', quantity: 1, status: 'pending' });
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState('');
    const tours = useMemo(() => allProducts.filter(p => p.product_type === 'tour'), [allProducts]);
    useEffect(() => {
        if (booking) {
            setFormData({
                user_id: booking.user_id || '',
                product_id: booking.main_tour?.id || '',
                quantity: booking.quantity || 1,
                status: booking.status || 'pending',
                id: booking.id
            });
        } else {
            setFormData({ user_id: '', product_id: '', quantity: 1, status: 'pending' });
        }
    }, [booking]);
    useEffect(() => {
        const quantity = parseInt(formData.quantity, 10) || 0;
        let total = 0;
        const main = allProducts.find(p => p.id === formData.product_id);
        if (main) total += main.price * quantity;
        setTotalPrice(total);
    }, [formData.product_id, formData.quantity, allProducts]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.user_id || !formData.product_id || formData.quantity <= 0) {
            setError('Vui lòng điền đầy đủ thông tin (Khách hàng, Tour chính, Số lượng > 0).');
            return;
        }
        const dataToSave = {
            user_id: formData.user_id,
            product_id: formData.product_id,
            quantity: parseInt(formData.quantity, 10),
            total_price: totalPrice,
            status: formData.status,
            id: formData.id
        };
        onSave(dataToSave, formData.id ? booking : null);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"> {/* <FaTimesCircle size={24} /> */} X </button>
                <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">{booking ? 'Sửa Đặt Tour' : 'Tạo Đặt Tour Mới'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khách hàng</label>
                        <select name="user_id" value={formData.user_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500">
                            <option value="">-- Chọn khách hàng --</option>
                            {allUsers.map(user => (<option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tour chính</label>
                        <select name="product_id" value={formData.product_id} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500">
                            <option value="">-- Chọn tour --</option>
                            {tours.map(product => (<option key={product.id} value={product.id}>{product.name} ({formatCurrency(product.price)}) - Còn lại: {product.stock}</option>))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số lượng</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500">
                                <option value="pending">Chờ xử lý</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-2"><span className="text-lg font-semibold text-gray-800 dark:text-white">Tổng cộng: {formatCurrency(totalPrice)}</span></div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-500">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- (Giữ nguyên) Modal Xác nhận Xóa ---
const DeleteConfirmationModal = ({ booking, onClose, onConfirm }) => {
    // ... (Giữ nguyên code của component này) ...
    if (!booking) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
                 <div className="flex items-center">
                    <div className="mr-4 flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-3">
                         <FaExclamationTriangle className="text-red-600 dark:text-red-300" size={24} />
                    </div>
                    <div>
                         <h3 className="text-lg font-bold text-gray-800 dark:text-white">Xác nhận Xóa Đặt Tour</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Bạn có chắc chắn muốn xóa booking này? (ID: {booking.id}). 
                            {booking.status === 'confirmed' && <span className="font-bold text-red-500"> Số lượng sẽ được hoàn trả.</span>}
                         </p>
                    </div>
                </div>
                 <div className="flex justify-end gap-3 pt-6 mt-4 border-t dark:border-neutral-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-500">Hủy</button>
                    <button type="button" onClick={() => onConfirm(booking)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Xác nhận Xóa</button>
                </div>
            </div>
        </div>
    );
};


// --- (MỚI) Hàm Gửi Email (Sử dụng Resend) ---
// Giả định bạn có một API route tại '/api/send-booking-email'
// (Bạn cần tạo file này trong thư mục /api/ của Vercel)
const sendBookingEmail = async (booking, newStatus) => {
    if (!booking || !booking.user || !booking.user.email) {
        toast.error("Không tìm thấy email khách hàng để gửi thông báo.");
        return;
    }

    // Chỉ gửi email khi xác nhận hoặc hủy
    if (newStatus !== 'confirmed' && newStatus !== 'cancelled') {
        return;
    }

    const customerEmail = booking.user.email;
    const customerName = booking.user.full_name || 'Quý khách';
    const tourName = booking.main_tour.name;
    const bookingId = booking.id;

    let subject = '';
    let emailBody = '';

    if (newStatus === 'confirmed') {
        subject = `TourZen: Đơn hàng #${bookingId} của bạn đã được xác nhận!`;
        emailBody = `
            <h2>Chào ${customerName},</h2>
            <p>Chúng tôi vui mừng thông báo đơn đặt tour <strong>${tourName}</strong> (Mã đơn: #${bookingId}) của bạn đã được xác nhận thành công.</p>
            <p>Chi tiết tour (thời gian, địa điểm, điều kiện hủy) sẽ được gửi trong một email tiếp theo hoặc bạn có thể xem trong tài khoản của mình.</p>
            <p>Cảm ơn bạn đã tin tưởng TourZen!</p>
        `;
    } else if (newStatus === 'cancelled') {
        subject = `TourZen: Đơn hàng #${bookingId} của bạn đã bị hủy.`;
        emailBody = `
            <h2>Chào ${customerName},</h2>
            <p>Chúng tôi rất tiếc phải thông báo đơn đặt tour <strong>${tourName}</strong> (Mã đơn: #${bookingId}) của bạn đã bị hủy.</p>
            <p>Lý do: ${booking.cancellation_reason || 'Nhà cung cấp không thể xác nhận dịch vụ.'}</p>
            <p>Chúng tôi sẽ liên hệ với bạn ngay lập tức để đề xuất các tour thay thế hoặc tiến hành hoàn trả phí (nếu bạn đã thanh toán).</p>
            <p>Xin lỗi vì sự bất tiện này.</p>
        `;
    }

    // Gửi yêu cầu đến API route của bạn
    try {
        const response = await fetch('/api/send-booking-email', { // <<< API Route của bạn
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: customerEmail,
                subject: subject,
                html: emailBody,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Lỗi không xác định từ API');
        }

        toast.success(`Đã gửi email ${newStatus} cho khách hàng!`);

    } catch (error) {
        console.error("Lỗi gửi email:", error);
        toast.error(`Lỗi gửi email: ${error.message}`);
        // Không dừng quy trình, chỉ thông báo lỗi
    }
};


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

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        // <<< SỬA ĐỔI: Thêm .eq('main_tour.product_type', 'tour')
        const { data, error } = await supabase
            .from("Bookings")
            .select(bookingSelect) // <<< Đã bao gồm user
            .eq('main_tour.product_type', 'tour') 
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi fetch đặt tour:", error);
            setError(error.message);
        } else {
            setBookings(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // (Giữ nguyên) Tải data cho Modal
    useEffect(() => {
        const fetchModalData = async () => {
            const { data: products } = await supabase
                .from('Products')
                .select('id, name, price, stock, supplier_id, product_type')
                .eq('approval_status', 'approved')
                .eq('product_type', 'tour'); 
            setAllProducts(products || []);

            const { data: users } = await supabase.from('Users').select('id, full_name, email');
            setAllUsers(users || []);
        };
        fetchModalData();
    }, []);

    // --- (NÂNG CẤP) handleStatusChange ---
    const handleStatusChange = async (booking, newStatus) => {
        if (booking.status === newStatus) return;

        // Nếu hủy tour, hỏi lý do (để gửi email cho khách)
        let cancellation_reason = null;
        if (newStatus === 'cancelled') {
             cancellation_reason = prompt("Nhập lý do hủy (ví dụ: NCC không xác nhận):", "Nhà cung cấp không thể xác nhận dịch vụ");
             if (cancellation_reason === null) return; // Admin bấm Hủy
        }

        const oldBooking = { ...booking };
        const newBooking = { ...booking, status: newStatus, cancellation_reason: cancellation_reason };

        // 1. Cập nhật Stock
        try {
            await applyStockChanges(oldBooking, newBooking);
        } catch (e) {
            toast.error(e.message); // Dùng toast
            return;
        }

        // 2. Cập nhật DB
        const { error } = await supabase
            .from("Bookings")
            .update({ status: newStatus })
            .eq("id", booking.id);

        if (error) {
            toast.error("Lỗi cập nhật trạng thái: " + error.message);
            fetchData(); // Rollback nếu lỗi
            return;
        }
        
        toast.success("Cập nhật trạng thái thành công!");

        // 3. Gửi Email (Không chặn nếu lỗi)
        // Chúng ta cần thông tin user và tour, đã có trong newBooking
        await sendBookingEmail(newBooking, newStatus);

        // 4. Cập nhật UI
        setBookings(prev => prev.map(b => b.id === booking.id ? newBooking : b));

        // 5. Refetch stock
        const { data: products } = await supabase
            .from('Products')
            .select('id, name, price, stock, supplier_id, product_type')
            .eq('approval_status', 'approved')
            .eq('product_type', 'tour');
        setAllProducts(products || []);
    };

    // (NÂNG CẤP) handleSaveBooking
    const handleSaveBooking = async (dataToSave, oldBooking) => {
        let result, dbError;
        
        dataToSave.transport_product_id = null;
        dataToSave.flight_product_id = null;

        if (dataToSave.id) {
            // Sửa
            result = await supabase
                .from('Bookings')
                .update(dataToSave)
                .eq('id', dataToSave.id)
                .select(bookingSelect); // <<< Lấy lại data mới
            dbError = result.error;
        } else {
            // Thêm mới
            delete dataToSave.id; 
            result = await supabase
                .from('Bookings')
                .insert(dataToSave)
                .select(bookingSelect); // <<< Lấy lại data mới
            dbError = result.error;
        }

        if (dbError) {
            toast.error("Lỗi lưu booking: " + dbError.message);
            return;
        }

        const newBookingData = result.data[0];

        // Cập nhật stock
        try {
            await applyStockChanges(oldBooking, newBookingData);
        } catch (e) {
            toast.error(e.message);
            fetchData(); // Tải lại toàn bộ
            return;
        }
        
        // Gửi email nếu là đơn mới và được xác nhận ngay
        if (!oldBooking && newBookingData.status === 'confirmed') {
            await sendBookingEmail(newBookingData, 'confirmed');
        }

        setIsModalOpen(false);
        fetchData(); // Tải lại

        const { data: products } = await supabase
            .from('Products')
            .select('id, name, price, stock, supplier_id, product_type')
            .eq('approval_status', 'approved')
            .eq('product_type', 'tour');
        setAllProducts(products || []);
    };

    // (NÂNG CẤP) handleDeleteBooking
    const handleDeleteBooking = async (booking) => {
        if (!booking) return;

        try {
            await applyStockChanges(booking, null); // Hoàn stock
        } catch (e) {
            toast.error(e.message);
            return;
        }

        const { error } = await supabase
            .from('Bookings')
            .delete()
            .eq('id', booking.id);

        if (error) {
            toast.error("Lỗi xóa booking: " + error.message);
        } else {
            toast.success("Đã xóa booking!");
            setBookingToDelete(null);
            fetchData();

            const { data: products } = await supabase
                .from('Products')
                .select('id, name, price, stock, supplier_id, product_type')
                .eq('approval_status', 'approved')
                .eq('product_type', 'tour');
            setAllProducts(products || []);
        }
    };

    // (Giữ nguyên) Lọc tìm kiếm
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

    // --- (Render) Giao diện (Giữ nguyên) ---
    return (
    <div className="p-4 space-y-8">
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <Package size={30} weight="duotone" className="text-sky-600" />
                    Quản lý Đặt Tour
                </h1>
                <button 
                    onClick={() => { setCurrentBooking(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium shadow"
                >
                    <FaPlus /> Thêm Đơn Tour
                </button>
            </div>
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
                <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden border dark:border-neutral-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên Tour</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng giá</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày đặt</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sky-600 dark:text-sky-400">
                                            {formatCurrency(booking.total_price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select
                                                value={booking.status}
                                                // Truyền cả object booking
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
                                        <td colSpan={7} className="text-center py-10 text-gray-500 italic">
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

        {/* Modals */}
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
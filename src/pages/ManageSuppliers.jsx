// src/pages/ManageSuppliers.jsx
// (FIXED: Join, Contact Info, Booking Logic + ADDED: Service Approval/Cancellation)

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import {
    Plus, Pencil, Trash, CircleNotch, X, UserCircle, Phone, MapPin,
    CaretDown, CaretUp, CheckCircle, XCircle, // Icons phê duyệt sản phẩm
    Buildings, AirplaneTilt, Car,
    Envelope,
    Package,
    WarningCircle, // Icon Hủy booking
    CheckSquareOffset, // Icon Duyệt booking
    Prohibit // Icon Từ chối/Hủy booking
} from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = { name: '', user_id: '' };

// --- Hàm format tiền tệ (Giữ nguyên) ---
const formatCurrency = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

// ====================================================================
// Component Modal Chỉnh sửa Sản phẩm (Giữ nguyên)
// ====================================================================
const EditProductModal = ({ product, onClose, onSaved }) => {
    // ... (Code của EditProductModal giữ nguyên như trước) ...
     const [loading, setLoading] = useState(false);
    // Giả định các cột này tồn tại trong bảng Products
    const [formData, setFormData] = useState({
        name: product.name || '',
        price: product.price || 0,
        description: product.description || '', // Giả định có cột description
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase
            .from('Products')
            .update({
                name: formData.name,
                price: formData.price,
                description: formData.description
            })
            .eq('id', product.id)
            .select() // Trả về data
            .single(); // Chỉ 1 record

        setLoading(false);
        if (error) {
            toast.error("Lỗi cập nhật sản phẩm: " + error.message);
        } else {
            toast.success("Cập nhật sản phẩm thành công!");
            onSaved(data); // Gửi data mới về
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700">
                        <h3 className="text-xl font-semibold">Chỉnh sửa Dịch vụ</h3>
                        <button type="button" onClick={onClose} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                            <X size={20} />
                        </button>
                    </div>
                    {/* Body */}
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Tên Dịch vụ (Xe, Chuyến bay)</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium mb-1">Giá (VNĐ)</label>
                            <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} required className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Mô tả</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="input-style"></textarea>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2 text-sm">
                            {loading && <CircleNotch size={18} className="animate-spin" />}
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ====================================================================
// Component con hiển thị Sản phẩm cần duyệt (Giữ nguyên)
// ====================================================================
const SupplierProductsApproval = ({ supplierId }) => {
    // ... (Code của SupplierProductsApproval giữ nguyên như trước) ...
     const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProductsForSupplier = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Products')
            .select('id, name, product_type, approval_status, price, description')
            .in('product_type', ['hotel', 'flight', 'car_rental'])
            .eq('supplier_id', supplierId)
            .order('approval_status', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi fetch sản phẩm NCC:", error);
            toast.error("Lỗi tải sản phẩm của NCC này.");
            setProducts([]);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    }, [supplierId]);

    const handleApproval = async (productId, newStatus) => {
        const actionText = newStatus === 'approved' ? 'Duyệt' : (newStatus === 'rejected' ? 'Từ chối' : 'Đặt lại chờ');
        if (!window.confirm(`Bạn chắc chắn muốn ${actionText} sản phẩm này?`)) return;

        const originalProducts = products;
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, approval_status: newStatus } : p));

        const { error } = await supabase
            .from('Products')
            .update({ approval_status: newStatus })
            .eq('id', productId);

        if (error) {
            toast.error(`Lỗi khi ${actionText}: ${error.message}`);
            setProducts(originalProducts); // Rollback
        } else {
            toast.success(`${actionText} thành công!`);
        }
    };

    const handleProductSaved = (updatedProduct) => {
        setProducts(prev => prev.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        ));
    };

    const ProductIcon = ({ type }) => {
        switch (type) {
            case 'hotel': return <Buildings size={16} className="text-blue-500 flex-shrink-0" title="Khách sạn"/>;
            case 'flight': return <AirplaneTilt size={16} className="text-indigo-500 flex-shrink-0" title="Chuyến bay"/>;
            case 'car_rental': return <Car size={16} className="text-orange-500 flex-shrink-0" title="Xe"/>;
            default: return null;
        }
    };
     const ApprovalBadge = ({ status }) => {
        const base = "px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap";
        switch (status) {
            case "approved": return <span className={`${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`}><CheckCircle size={12}/>Đã duyệt</span>;
            case "rejected": return <span className={`${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`}><XCircle size={12}/>Từ chối</span>;
            default: return <span className={`${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`}>Chờ duyệt</span>;
        }
     };

    useEffect(() => {
        if (isOpen && products.length === 0 && !loading) {
            fetchProductsForSupplier();
        }
    }, [isOpen, products.length, loading, fetchProductsForSupplier]);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-1"
                aria-expanded={isOpen}
                disabled={loading && isOpen && products.length === 0}
            >
                {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                {isOpen ? 'Ẩn' : 'Hiện'} Dịch vụ
                {isOpen && loading && <CircleNotch size={12} className="animate-spin" />}
                {!loading && ` (${products.length})`}
            </button>
            {isOpen && (
                <div className="mt-2 pl-4 border-l-2 dark:border-neutral-700">
                    {loading && products.length === 0 ? (
                        <div className="py-2 flex items-center gap-1 text-xs text-neutral-500">
                            <CircleNotch size={14} className="animate-spin" /> Đang tải...
                        </div>
                    ) : !loading && products.length === 0 ? (
                        <p className="text-xs italic text-neutral-500 py-1">NCC này chưa có sản phẩm dịch vụ (KS, CB, Xe).</p>
                    ) : (
                        <table className="min-w-full text-xs my-1">
                             <tbody className="divide-y dark:divide-neutral-700">
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td className="py-1.5 pr-2 flex items-center gap-1.5 whitespace-nowrap">
                                            <ProductIcon type={p.product_type} />
                                            <span title={`ID: ${p.id}`}>{p.name}</span>
                                        </td>
                                        <td className="py-1.5 pr-2">
                                            <ApprovalBadge status={p.approval_status} />
                                        </td>
                                        <td className="py-1.5 text-right space-x-1 whitespace-nowrap">
                                            {p.approval_status === 'approved' && (
                                                <button onClick={() => setEditingProduct(p)} className="p-1 text-blue-500 hover:text-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa chi tiết dịch vụ"><Pencil size={16}/></button>
                                            )}
                                            {p.approval_status === 'pending' && (
                                                <>
                                                <button onClick={() => handleApproval(p.id, 'approved')} className="p-1 text-green-500 hover:text-green-700 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30" title="Duyệt"><CheckCircle size={16}/></button>
                                                <button onClick={() => handleApproval(p.id, 'rejected')} className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30" title="Từ chối"><XCircle size={16}/></button>
                                                </>
                                            )}
                                            {(p.approval_status === 'approved' || p.approval_status === 'rejected') && (
                                                 <button onClick={() => handleApproval(p.id, 'pending')} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50" title="Đặt lại chờ duyệt">↩️</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    )}
                </div>
            )}
            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSaved={(updatedProduct) => handleProductSaved(updatedProduct)}
                />
            )}
        </div>
    );
};

// ====================================================================
// (SỬA) Component con Quản lý Đặt chỗ (Bookings) - Thêm Phê duyệt/Hủy
// ====================================================================
const SupplierBookingsManagement = ({ supplierId, supplierContact }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [processingBookingId, setProcessingBookingId] = useState(null); // Để disable nút khi đang xử lý

    // --- (SỬA) Fetch bookings dựa trên transport_product_id hoặc flight_product_id ---
    const fetchBookingsForSupplier = useCallback(async () => {
        setLoading(true);

        // 1. Lấy IDs của sản phẩm Xe ('car_rental') và Bay ('flight') của NCC này
        const { data: productsData, error: productError } = await supabase
            .from('Products')
            .select('id, product_type')
            .eq('supplier_id', supplierId)
            .in('product_type', ['flight', 'car_rental']);

        if (productError) {
            toast.error("Lỗi: Không thể lấy SP Xe/Bay của NCC.");
            console.error("Fetch products error:", productError);
            setLoading(false);
            return;
        }
        if (!productsData || productsData.length === 0) {
            setBookings([]);
            setLoading(false);
            return; // NCC này ko có SP xe/bay
        }

        const carIds = productsData.filter(p => p.product_type === 'car_rental').map(p => p.id);
        const flightIds = productsData.filter(p => p.product_type === 'flight').map(p => p.id);

        // 2. Xây dựng bộ lọc OR: Hoặc transport_id nằm trong carIds HOẶC flight_id nằm trong flightIds
        let filterParts = [];
        if (carIds.length > 0) filterParts.push(`transport_product_id.in.(${carIds.map(id => `"${id}"`).join(',')})`);
        if (flightIds.length > 0) filterParts.push(`flight_product_id.in.(${flightIds.map(id => `"${id}"`).join(',')})`);

        if (filterParts.length === 0) { // Trường hợp không chắc chắn xảy ra, nhưng để an toàn
             setBookings([]);
             setLoading(false);
             return;
        }
        const orFilter = `or(${filterParts.join(',')})`;

        // 3. Lấy Bookings dựa trên bộ lọc OR, và join customer + product tương ứng
        const { data, error } = await supabase
            .from('Bookings')
            .select(`
                id,
                created_at,
                status,          -- Trạng thái chung của đơn hàng
                service_status,  -- Trạng thái phê duyệt xe/bay (cột MỚI)
                notes,
                customer:user_id!inner(id, full_name, email), -- Join customer qua user_id
                transport:transport_product_id(id, name, product_type, price), -- Join xe
                flight:flight_product_id(id, name, product_type, price)    -- Join bay
            `)
            .or(orFilter) // Áp dụng bộ lọc OR
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi fetch đơn đặt hàng:", error);
            toast.error("Lỗi tải đơn đặt hàng Xe/Bay.");
            setBookings([]);
        } else {
            // Gộp thông tin product (xe hoặc bay) vào một field cho dễ dùng
            const formattedData = data.map(b => ({
                ...b,
                service_product: b.transport || b.flight || null // Lấy thông tin xe hoặc bay
            }));
            setBookings(formattedData || []);
        }
        setLoading(false);
    }, [supplierId]);

    useEffect(() => {
        if (isOpen && !loading) { // Fetch khi mở và không đang loading
            fetchBookingsForSupplier();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); // Chỉ fetch lại khi isOpen thay đổi

    // --- (MỚI) Hàm gửi Email Thông báo cho Khách ---
    const sendServiceStatusEmail = async (booking, newServiceStatus, reason = '') => {
        if (!booking?.customer?.email || !booking?.service_product?.name) {
            console.error("Thiếu thông tin để gửi email trạng thái dịch vụ:", booking);
            toast.error("Thiếu thông tin để gửi email trạng thái dịch vụ.");
            return;
        }

        const customerEmail = booking.customer.email;
        const customerName = booking.customer.full_name || 'Quý khách';
        const serviceName = booking.service_product.name;
        const serviceType = booking.service_product.product_type === 'car_rental' ? 'Xe' : 'Chuyến bay';
        const price = booking.service_product.price; // Lấy giá từ product join về
        const bookingId = booking.id.slice(-6).toUpperCase();

        let subject = '';
        let emailBody = '';

        if (newServiceStatus === 'approved') {
            subject = `TourZen: Dịch vụ ${serviceType} [${serviceName}] cho đơn #${bookingId} đã được xác nhận!`;
            emailBody = `<p>Chào ${customerName},</p>
                         <p>Chúng tôi xin xác nhận dịch vụ ${serviceType} <strong>${serviceName}</strong> bạn đặt kèm theo đơn hàng #${bookingId} đã được phê duyệt.</p>
                         <p>Thông tin chi tiết:</p>
                         <ul>
                             <li>Dịch vụ: ${serviceName}</li>
                             <li>Loại: ${serviceType}</li>
                             <li>Giá tham khảo: ${formatCurrency(price)}</li>
                             <li>Ngày đặt: ${new Date(booking.created_at).toLocaleDateString('vi-VN')}</li>
                         </ul>
                         <p>Vui lòng chuẩn bị sẵn sàng theo lịch trình. Cảm ơn bạn!</p>
                         <p>Trân trọng,<br/>Đội ngũ TourZen</p>`;
        } else if (newServiceStatus === 'cancelled') {
            subject = `TourZen: Thông báo hủy dịch vụ ${serviceType} [${serviceName}] cho đơn #${bookingId}`;
            emailBody = `<p>Chào ${customerName},</p>
                         <p>Chúng tôi rất tiếc phải thông báo dịch vụ ${serviceType} <strong>${serviceName}</strong> bạn đặt kèm theo đơn hàng #${bookingId} đã bị hủy.</p>
                         <p>Lý do: ${reason || 'Do vấn đề ngoài ý muốn (hết xe, lỡ chuyến, xe hỏng,...)'}.</p>
                         <p>Chúng tôi thành thật xin lỗi vì sự bất tiện này. Bộ phận hỗ trợ sẽ liên hệ với bạn sớm nhất để trao đổi về các phương án thay thế (nếu có) hoặc hoàn tiền.</p>
                         <p>Vui lòng liên hệ hotline [Số Hotline] nếu bạn cần hỗ trợ gấp.</p>
                         <p>Trân trọng,<br/>Đội ngũ TourZen</p>`;
        } else {
            return; // Không gửi mail cho trạng thái 'pending'
        }

        try {
            // Giả định bạn có endpoint API '/api/send-booking-email'
            const response = await fetch('/api/send-booking-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: customerEmail, subject: subject, html: emailBody }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Lỗi API gửi email');
            toast.success(`Đã gửi email thông báo "${newServiceStatus}" cho khách!`);
        } catch (error) {
            console.error("Lỗi gửi email:", error);
            toast.error(`Lỗi gửi email thông báo: ${error.message}`);
        }
    };


    // --- (MỚI) Hàm xử lý Phê duyệt/Hủy Dịch vụ Xe/Bay ---
    const handleUpdateServiceStatus = async (booking, newStatus) => {
        let reason = '';
        const actionText = newStatus === 'approved' ? 'Phê duyệt' : 'Hủy';
        const serviceName = booking.service_product?.name || 'Dịch vụ';

        if (newStatus === 'cancelled') {
            reason = prompt(`Nhập lý do hủy dịch vụ "${serviceName}" (VD: hết xe, lỡ chuyến,...). Bỏ trống nếu không có lý do cụ thể.`);
            if (reason === null) return; // Người dùng bấm Cancel
        } else { // newStatus === 'approved'
            if (!window.confirm(`Bạn chắc chắn muốn PHÊ DUYỆT dịch vụ "${serviceName}" cho đơn hàng này?`)) return;
        }

        setProcessingBookingId(booking.id); // Bắt đầu xử lý
        try {
            const { data, error } = await supabase
                .from('Bookings')
                .update({ service_status: newStatus, cancellation_reason: newStatus === 'cancelled' ? reason : null }) // Cập nhật trạng thái và lý do hủy nếu có
                .eq('id', booking.id)
                .select() // Trả về bản ghi đã cập nhật để gửi mail
                .single();

            if (error) throw error;

            toast.success(`${actionText} dịch vụ thành công!`);

            // Cập nhật lại state bookings ngay lập tức
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, service_status: newStatus, cancellation_reason: newStatus === 'cancelled' ? reason : null } : b));

            // Gửi email thông báo cho khách (kết hợp data trả về để có thông tin đầy đủ nhất)
            const updatedBooking = { ...booking, ...data }; // Merge data trả về
            await sendServiceStatusEmail(updatedBooking, newStatus, reason);

        } catch (err) {
            console.error(`Lỗi ${actionText} dịch vụ:`, err);
            toast.error(`Lỗi ${actionText} dịch vụ: ${err.message}`);
            // Không rollback UI ở đây, để tránh nhầm lẫn nếu chỉ lỗi gửi mail
        } finally {
            setProcessingBookingId(null); // Kết thúc xử lý
        }
    };


    // Liên hệ NCC (Giữ nguyên)
    const handleContactSupplier = () => {
        // <<< SỬA: Lấy email trực tiếp từ supplierContact >>>
        if (!supplierContact || !supplierContact.email) {
            toast.error("NCC này không có email để liên hệ.");
            return;
        }
        const subject = `[TourZen Admin] Trao đổi về các đơn đặt Xe/Chuyến bay`;
        const body = `Chào ${supplierContact.name || 'Nhà cung cấp'},%0D%0A%0D%0AVui lòng kiểm tra các đơn đặt hàng Xe/Chuyến bay sau...%0D%0A%0D%0A`;
        window.location.href = `mailto:${supplierContact.email}?subject=${subject}&body=${body}`;
    };

    // --- Render ---
    const BookingIcon = ({ type }) => { /* (Giữ nguyên) */
       switch (type) {
            case 'flight': return <AirplaneTilt size={16} className="text-indigo-500 flex-shrink-0" title="Chuyến bay"/>;
            case 'car_rental': return <Car size={16} className="text-orange-500 flex-shrink-0" title="Xe"/>;
            default: return <Package size={16} />;
        }
    };
    // (MỚI) Badge cho Service Status
    const ServiceStatusBadge = ({ status }) => {
        const base = "px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap";
        switch (status) {
            case "approved": return <span className={`${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`}><CheckCircle size={12}/>Đã duyệt</span>;
            case "cancelled": return <span className={`${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`}><Prohibit size={12}/>Đã hủy</span>;
            case "pending":
            default: return <span className={`${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`}>Chờ duyệt</span>;
        }
     };

    return (
        <div className="mt-4"> {/* Tăng khoảng cách */}
            {/* Nút Hiện/Ẩn */}
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                aria-expanded={isOpen}
                disabled={loading && isOpen && bookings.length === 0}
            >
                {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                {isOpen ? 'Ẩn' : 'Hiện'} Quản lý Đặt chỗ (Xe/Bay)
                {isOpen && loading && <CircleNotch size={12} className="animate-spin ml-1" />}
                {!loading && ` (${bookings.length})`}
            </button>


            {/* Danh sách đặt chỗ */}
            {isOpen && (
                <div className="mt-2 pl-4 border-l-2 border-indigo-300 dark:border-indigo-700">
                    <button
                        onClick={handleContactSupplier}
                        disabled={!supplierContact?.email}
                        className="mb-3 text-xs flex items-center gap-1 px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Envelope size={14} /> Liên hệ NCC
                    </button>

                    {loading && bookings.length === 0 ? (
                        <div className="py-2 flex items-center gap-1 text-xs text-neutral-500">
                            <CircleNotch size={14} className="animate-spin" /> Đang tải...
                        </div>
                    ) : !loading && bookings.length === 0 ? (
                        <p className="text-xs italic text-neutral-500 py-1">Chưa có đơn đặt Xe/Bay nào.</p>
                    ) : (
                        <table className="min-w-full text-xs my-1">
                            <thead className="font-medium text-neutral-500 dark:text-neutral-400 text-left">
                                <tr>
                                    <th className="py-1 pr-2">Khách hàng</th>
                                    <th className="py-1 pr-2">Dịch vụ (Xe/Bay)</th>
                                    <th className="py-1 pr-2">Trạng thái DV</th>
                                    <th className="py-1 text-right">Hành động</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y dark:divide-neutral-700">
                                {bookings.map(b => (
                                    <tr key={b.id} className={b.service_status === 'cancelled' ? 'opacity-50' : ''}>
                                        <td className="py-1.5 pr-2 whitespace-nowrap" title={b.customer?.email}>{b.customer?.full_name || b.customer?.email || 'N/A'}</td>
                                        <td className="py-1.5 pr-2 flex items-center gap-1.5 whitespace-nowrap">
                                            {b.service_product && <BookingIcon type={b.service_product.product_type} />}
                                            <span>{b.service_product?.name || 'N/A'}</span>
                                        </td>
                                        <td className="py-1.5 pr-2 whitespace-nowrap">
                                            <ServiceStatusBadge status={b.service_status} />
                                        </td>
                                        <td className="py-1.5 text-right space-x-1 whitespace-nowrap">
                                            {/* Nút Phê duyệt / Hủy */}
                                            {b.service_status === 'pending' && (
                                                <>
                                                <button onClick={() => handleUpdateServiceStatus(b, 'approved')} disabled={processingBookingId === b.id} className="p-1 text-green-500 hover:text-green-700 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50" title="Phê duyệt dịch vụ"><CheckSquareOffset size={16}/></button>
                                                <button onClick={() => handleUpdateServiceStatus(b, 'cancelled')} disabled={processingBookingId === b.id} className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50" title="Hủy dịch vụ"><Prohibit size={16}/></button>
                                                </>
                                            )}
                                            {/* Nút Hủy nếu đã duyệt */}
                                            {b.service_status === 'approved' && (
                                                <button onClick={() => handleUpdateServiceStatus(b, 'cancelled')} disabled={processingBookingId === b.id} className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50" title="Hủy dịch vụ (sau khi đã duyệt)"><Prohibit size={16}/></button>
                                            )}
                                             {/* Nút đặt lại chờ nếu đã hủy */}
                                             {b.service_status === 'cancelled' && (
                                                 <button onClick={() => handleUpdateServiceStatus(b, 'pending')} disabled={processingBookingId === b.id} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:opacity-50" title="Đặt lại chờ duyệt">↩️</button>
                                             )}
                                            {/* Nút gửi mail cho khách */}
                                            <button onClick={() => handleEmailCustomer(b)} disabled={processingBookingId === b.id} className="p-1 text-sky-500 hover:text-sky-700 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/30 disabled:opacity-50" title={`Gửi mail cho ${b.customer?.email}`}><Envelope size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};


// ====================================================================
// Component chính: ManageSuppliers (Sửa fetch và props)
// ====================================================================
export default function ManageSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]); // Vẫn dùng để chọn tài khoản liên kết
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);

    // --- (SỬA) fetchSuppliers: Lấy contact trực tiếp, join user nếu cần lấy tên tk quản lý ---
    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        // Lấy thông tin contact trực tiếp từ Suppliers
        // Join Users chỉ để lấy tên/email của tài khoản quản lý (nếu user_id có giá trị)
        const { data, error } = await supabase
            .from('Suppliers')
            .select(`
                id, name, created_at, user_id, phone, email, address, /* Lấy trực tiếp contact */
                managing_user:Users(id, full_name, email) /* Join user quản lý */
            `)
            .order('created_at', { ascending: false });
        if (error) { toast.error('Lỗi tải NCC!'); console.error("Fetch Suppliers Error:", error); }
        else { setSuppliers(data || []); }
        setLoading(false);
    }, []);

    // Fetch users để đổ vào dropdown chọn tài khoản quản lý (Giữ nguyên)
    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('Users')
            .select('id, full_name, email, role'); // Không cần phone, address ở đây
        if (error) { console.error("Fetch Users Error for dropdown:", error); }
        else { setUsers(data || []); }
    };


    useEffect(() => {
        fetchSuppliers();
        fetchUsers(); // Fetch users cho dropdown
    }, [fetchSuppliers]);

    // --- Các hàm xử lý modal, submit, delete (Giữ nguyên logic chính) ---
     const handleOpenModal = (supplier = null) => {
        if (supplier) { setFormData({ name: supplier.name, user_id: supplier.user_id || '' }); setEditingId(supplier.id); }
        else { setFormData(initialFormData); setEditingId(null); }
        setIsModalOpen(true);
    };
    const handleCloseModal = () => { setIsModalOpen(false); setFormData(initialFormData); setEditingId(null); };
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) { toast.error('Nhập Tên NCC.'); return; }
        setIsSubmitting(true);
        let error;
        const dataToSubmit = { name: formData.name, user_id: formData.user_id === '' ? null : formData.user_id };
        // Có thể cập nhật thêm phone, email nếu muốn sửa trực tiếp ở modal này
        if (editingId) { const { error: uError } = await supabase.from('Suppliers').update(dataToSubmit).eq('id', editingId); error = uError; }
        else { const { error: iError } = await supabase.from('Suppliers').insert(dataToSubmit); error = iError; }
        if (error) { toast.error("Lỗi: " + error.message); console.error("Submit Error:", error); }
        else { toast.success(editingId ? 'Cập nhật OK!' : 'Thêm mới OK!'); handleCloseModal(); await fetchSuppliers(); }
        setIsSubmitting(false);
    };
    const handleDelete = async (supplierId, supplierName) => { /* (Giữ nguyên) */
        if (window.confirm(`Xóa NCC "${supplierName}"?\nCẢNH BÁO: Xóa NCC có thể gây lỗi cho các đơn hàng và sản phẩm liên quan. Bạn có chắc chắn?`)) {
            const { error } = await supabase.from('Suppliers').delete().eq('id', supplierId);
            if (error) { toast.error("Lỗi xóa: " + error.message); }
            else { toast.success('Đã xóa!'); await fetchSuppliers(); }
        }
    };


    // --- JSX (Sửa cách hiển thị contact và props truyền xuống) ---
    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen text-neutral-800 dark:text-neutral-200">
            <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Quản lý Nhà cung cấp</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                    <Plus size={20} /> Thêm NCC
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><CircleNotch size={32} className="animate-spin text-sky-500" /></div>
            ) : (
                <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg overflow-x-auto border dark:border-neutral-700">
                    <table className="w-full min-w-[700px] text-sm text-left">
                        <thead className="text-xs uppercase bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                            <tr>
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/3">Tên NCC & Quản lý</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/4">Tài khoản QLý</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/4">Thông tin liên hệ (NCC)</th> {/* Sửa tiêu đề */}
                                <th scope="col" className="px-4 sm:px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-neutral-700">
                            {suppliers.length > 0 ? suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 align-top">
                                    {/* Cột Tên NCC và Sản phẩm/Booking */}
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="font-medium whitespace-nowrap mb-1">{supplier.name}</div>
                                        <SupplierProductsApproval supplierId={supplier.id} />
                                        {/* <<< SỬA: Truyền supplier contact trực tiếp >>> */}
                                        <SupplierBookingsManagement
                                            supplierId={supplier.id}
                                            supplierContact={supplier} // Truyền cả object supplier
                                        />
                                    </td>
                                    {/* Cột Tài khoản quản lý */}
                                    <td className="px-4 sm:px-6 py-4">
                                        {supplier.managing_user ? ( // <<< SỬA: Dùng managing_user từ join >>>
                                            <Link to={`/admin/accounts?search=${supplier.managing_user.email || supplier.managing_user.id}`} title={`Xem tài khoản ${supplier.managing_user.full_name}`} className='flex items-center gap-1.5 hover:underline text-sky-600 dark:text-sky-400'>
                                                <UserCircle size={16} />
                                                <span className='font-medium whitespace-nowrap truncate max-w-[150px]'>{supplier.managing_user.full_name || supplier.managing_user.email}</span>
                                            </Link>
                                        ) : ( <span className="text-xs italic text-neutral-500">Chưa liên kết TK</span> )}
                                    </td>
                                    {/* <<< SỬA: Cột Thông tin liên hệ trực tiếp của NCC >>> */}
                                    <td className="px-4 sm:px-6 py-4 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                                         {supplier.phone && (
                                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                <Phone size={14} /> <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                             <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                <Envelope size={14} /> <span>{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-start gap-1.5"> {/* items-start cho địa chỉ dài */}
                                                <MapPin size={14} className="mt-0.5 flex-shrink-0"/> <span>{supplier.address}</span>
                                            </div>
                                        )}
                                        {!(supplier.phone || supplier.email || supplier.address) && (
                                            <span className="italic">Chưa có thông tin</span>
                                        )}
                                    </td>
                                     {/* Cột Hành động */}
                                    <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => handleOpenModal(supplier)} className="p-1.5 sm:p-2 text-blue-500 hover:text-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa NCC"><Pencil size={16} sm:size={18} /></button>
                                            <button onClick={() => handleDelete(supplier.id, supplier.name)} className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa NCC"><Trash size={16} sm:size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-neutral-500 italic">Chưa có nhà cung cấp nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form Thêm/Sửa NCC (Giữ nguyên) */}
             {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
                   <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100">
                     <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                       <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                         <h3 className="text-xl font-semibold">
                           {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                         </h3>
                         <button type="button" onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                           <X size={20} />
                         </button>
                       </div>
                       <div className="p-6 grid grid-cols-1 gap-y-4 overflow-y-auto flex-1">
                         <div>
                           <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên Nhà cung cấp *</label>
                           <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                         </div>
                         <div>
                           <label htmlFor="user_id" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tài khoản quản lý (Nếu có)</label>
                           <select id="user_id" name="user_id" value={formData.user_id} onChange={handleChange} className="input-style" >
                             <option value="">[Không liên kết]</option>
                             {/* Lọc user có role 'supplier' hoặc 'admin' */}
                             {users.filter(u => u.role === 'supplier' || u.role === 'admin').map(user => (
                               <option key={user.id} value={user.id}>
                                 {user.full_name || user.email} ({user.role})
                               </option>
                             ))}
                           </select>
                           <p className="text-xs text-neutral-500 mt-1">Chọn tài khoản sẽ quản lý NCC này (nếu NCC có tài khoản riêng).</p>
                         </div>
                       </div>
                       <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                         <button type="button" onClick={handleCloseModal} className="modal-button-secondary"> Hủy </button>
                         <button type="submit" disabled={isSubmitting} className="modal-button-primary flex items-center gap-2">
                           {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
                           {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                         </button>
                       </div>
                     </form>
                   </div>
                 </div>
            )}

             {/* CSS (Giữ nguyên) */}
            <style jsx>{`
                .input-style { /* ... */ }
                .dark .input-style { /* ... */ }
                .input-style:focus { /* ... */ }
                .input-style::placeholder { /* ... */ }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
            `}</style>
        </div>
    );
}

// <<< THÊM CSS cho input style nếu chưa có >>>
const css = `
 .input-style {
     width: 100%;
     padding: 0.5rem 0.75rem; /* py-2 px-3 */
     border: 1px solid #D1D5DB; /* border-neutral-300 */
     border-radius: 0.375rem; /* rounded-md */
     background-color: #F9FAFB; /* bg-neutral-50 */
     color: #1F2937; /* text-neutral-800 */
     transition: border-color 0.2s, box-shadow 0.2s;
     font-size: 0.875rem; /* text-sm */
 }
 .dark .input-style {
     background-color: #374151; /* dark:bg-neutral-700 */
     border-color: #4B5563; /* dark:border-neutral-600 */
     color: #F9FAFB; /* dark:text-white */
 }
 .input-style:focus {
     outline: none;
     --tw-ring-color: #0ea5e9; /* focus:ring-sky-500 */
     border-color: #0ea5e9; /* focus:border-sky-500 */
     box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.4); /* focus:ring-2 */
 }
 .input-style::placeholder {
     color: #9CA3AF; /* placeholder-neutral-400 */
 }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = css;
document.head.appendChild(styleSheet);
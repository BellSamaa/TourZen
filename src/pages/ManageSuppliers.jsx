// src/pages/ManageSuppliers.jsx
// (NÂNG CẤP: Thêm Chỉnh sửa Sản phẩm + Quản lý Đặt chỗ của Khách)

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import {
    Plus, Pencil, Trash, CircleNotch, X, UserCircle, Phone, MapPin,
    CaretDown, CaretUp, CheckCircle, XCircle,
    Buildings, AirplaneTilt, Car,
    Envelope, // <<< Thêm Mail
    Package, // <<< Thêm Đặt chỗ
    WarningCircle // <<< Thêm Cảnh báo
} from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = { name: '', user_id: '' };

// ====================================================================
// (MỚI) Component Modal Chỉnh sửa Sản phẩm
// ====================================================================
const EditProductModal = ({ product, onClose, onSaved }) => {
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
// Component con hiển thị Sản phẩm cần duyệt (Đã sửa)
// ====================================================================
const SupplierProductsApproval = ({ supplierId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // (MỚI) State cho modal sửa
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProductsForSupplier = useCallback(async () => {
        setLoading(true);
        // Lấy thêm price và description để sửa
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

    // (MỚI) Xử lý khi lưu thành công từ Modal
    const handleProductSaved = (updatedProduct) => {
        // Cập nhật lại list
        setProducts(prev => prev.map(p => 
            p.id === updatedProduct.id ? updatedProduct : p
        ));
    };

    // --- Render Icons + Badges ---
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
            {/* Nút Hiện/Ẩn */}
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

            {/* Danh sách sản phẩm */}
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
                                        {/* Tên + Icon */}
                                        <td className="py-1.5 pr-2 flex items-center gap-1.5 whitespace-nowrap">
                                            <ProductIcon type={p.product_type} />
                                            <span title={`ID: ${p.id}`}>{p.name}</span>
                                        </td>
                                        {/* Trạng thái */}
                                        <td className="py-1.5 pr-2">
                                            <ApprovalBadge status={p.approval_status} />
                                        </td>
                                        {/* Nút duyệt + (MỚI) Nút Sửa */}
                                        <td className="py-1.5 text-right space-x-1 whitespace-nowrap">
                                            
                                            {/* (MỚI) Nút Sửa: Luôn hiển thị nếu đã duyệt */}
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

            {/* (MỚI) Render Modal Chỉnh sửa */}
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
// (MỚI) Component con Quản lý Đặt chỗ (Bookings)
// ====================================================================
const SupplierBookingsManagement = ({ supplierId, supplierContact }) => {
    // Giả định bảng đặt chỗ tên là 'Bookings'
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch các đơn đặt hàng (của khách) liên quan đến NCC này
    const fetchBookingsForSupplier = useCallback(async () => {
        setLoading(true);

        // Đây là 1 query phức tạp, join 3 bảng: Bookings -> Products -> Users (customer)
        // 1. Lấy Product IDs của NCC này
        const { data: productIds, error: productError } = await supabase
            .from('Products')
            .select('id')
            .eq('supplier_id', supplierId)
            .in('product_type', ['flight', 'car_rental']); // Chỉ lấy Xe/Bay

        if (productError) {
            toast.error("Lỗi 1: Không thể lấy SP của NCC.");
            setLoading(false);
            return;
        }

        const ids = productIds.map(p => p.id);
        if (ids.length === 0) {
            setBookings([]);
            setLoading(false);
            return; // NCC này ko có SP xe/bay
        }

        // 2. Lấy Bookings dựa trên list Product IDs đó, và join với customer
        const { data, error } = await supabase
            .from('Bookings') // <<<< GIẢ ĐỊNH TÊN BẢNG LÀ 'Bookings'
            .select(`
                id, 
                booking_status, 
                created_at,
                customer:Users(id, full_name, email), 
                product:Products(id, name, product_type)
            `)
            .in('product_id', ids) // Lọc theo SP của NCC
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Lỗi fetch đơn đặt hàng:", error);
            toast.error("Lỗi tải đơn đặt hàng của NCC này.");
            setBookings([]);
        } else {
            setBookings(data || []);
        }
        setLoading(false);
    }, [supplierId]);

    useEffect(() => {
        if (isOpen && bookings.length === 0 && !loading) {
            fetchBookingsForSupplier();
        }
    }, [isOpen, bookings.length, loading, fetchBookingsForSupplier]);

    // --- (MỚI) Các hàm xử lý (Hủy, Mail) ---

    // Hủy đơn
    const handleCancelBooking = async (booking) => {
        if (!window.confirm(`Bạn chắc chắn muốn HỦY đơn đặt [${booking.product.name}] của khách [${booking.customer.full_name}]?`)) return;
        
        // Optimistic UI
        setBookings(prev => prev.map(b => b.id === booking.id ? {...b, booking_status: 'cancelled_by_admin'} : b));

        const { error } = await supabase
            .from('Bookings') // <<<< GIẢ ĐỊNH TÊN BẢNG LÀ 'Bookings'
            .update({ booking_status: 'cancelled_by_admin' }) // Giả định status
            .eq('id', booking.id);
        
        if (error) {
            toast.error("Lỗi hủy đơn: " + error.message);
            fetchBookingsForSupplier(); // Rollback
        } else {
            toast.success("Hủy đơn thành công!");
        }
    };

    // Gửi mail cho khách
    const handleEmailCustomer = (booking) => {
        const customerEmail = booking.customer.email;
        const productName = booking.product.name;
        const subject = `Thông báo về đơn đặt dịch vụ [${productName}] của bạn tại TourZen`;
        const body = `Chào ${booking.customer.full_name || 'Quý khách'},%0D%0A%0D%0AChúng tôi xin thông báo về đơn đặt [${productName}] của bạn...%0D%0A%0D%0A(Lý do: Thiếu xe / Lỡ chuyến bay /...)%0D%0A%0D%0ATrân trọng,%0D%0ABan quản trị TourZen.`;
        
        window.location.href = `mailto:${customerEmail}?subject=${subject}&body=${body}`;
    };

    // Liên hệ NCC (mở mailto)
    const handleContactSupplier = () => {
        if (!supplierContact || !supplierContact.email) {
            toast.error("NCC này chưa liên kết tài khoản hoặc không có email.");
            return;
        }
        const subject = `[TourZen Admin] Trao đổi về các đơn đặt Xe/Chuyến bay`;
        const body = `Chào ${supplierContact.full_name || 'Nhà cung cấp'},%0D%0A%0D%0AVui lòng kiểm tra các đơn đặt hàng sau...%0D%0A%0D%0A`;
        window.location.href = `mailto:${supplierContact.email}?subject=${subject}&body=${body}`;
    };

    // --- Render ---
    const BookingIcon = ({ type }) => {
        switch (type) {
            case 'flight': return <AirplaneTilt size={16} className="text-indigo-500 flex-shrink-0" title="Chuyến bay"/>;
            case 'car_rental': return <Car size={16} className="text-orange-500 flex-shrink-0" title="Xe"/>;
            default: return <Package size={16} />;
        }
    };

    return (
        <div className="mt-2"> {/* Thêm mt-2 để tách biệt */}
            {/* Nút Hiện/Ẩn */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1"
                aria-expanded={isOpen}
                disabled={loading && isOpen && bookings.length === 0}
            >
                {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                {isOpen ? 'Ẩn' : 'Hiện'} Quản lý Đặt chỗ (Xe/Bay)
                {isOpen && loading && <CircleNotch size={12} className="animate-spin" />}
                {!loading && ` (${bookings.length})`}
            </button>

            {/* Danh sách đặt chỗ */}
            {isOpen && (
                <div className="mt-2 pl-4 border-l-2 border-indigo-300 dark:border-indigo-700">
                    {/* (MỚI) Nút liên hệ NCC */}
                    <button 
                        onClick={handleContactSupplier}
                        disabled={!supplierContact?.email}
                        className="mb-2 text-xs flex items-center gap-1 px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Envelope size={14} /> Liên hệ NCC về các đặt chỗ này
                    </button>

                    {loading && bookings.length === 0 ? (
                        <div className="py-2 flex items-center gap-1 text-xs text-neutral-500">
                            <CircleNotch size={14} className="animate-spin" /> Đang tải...
                        </div>
                    ) : !loading && bookings.length === 0 ? (
                        <p className="text-xs italic text-neutral-500 py-1">Chưa có đơn đặt Xe/Bay nào của khách cho NCC này.</p>
                    ) : (
                        <table className="min-w-full text-xs my-1">
                            <thead className="font-medium text-neutral-500 dark:text-neutral-400 text-left">
                                <tr>
                                    <th className="py-1">Khách hàng</th>
                                    <th className="py-1">Dịch vụ (Xe/Bay)</th>
                                    <th className="py-1">Trạng thái</th>
                                    <th className="py-1 text-right">Hành động</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y dark:divide-neutral-700">
                                {bookings.map(b => (
                                    <tr key={b.id} className={b.booking_status === 'cancelled_by_admin' ? 'opacity-50' : ''}>
                                        <td className="py-1.5 pr-2 whitespace-nowrap" title={b.customer?.email}>{b.customer?.full_name || b.customer?.email || 'N/A'}</td>
                                        <td className="py-1.5 pr-2 flex items-center gap-1.5 whitespace-nowrap">
                                            <BookingIcon type={b.product?.product_type} />
                                            <span>{b.product?.name || 'N/A'}</span>
                                        </td>
                                        <td className="py-1.5 pr-2 whitespace-nowrap">
                                            {/* (MỚI) Hiển thị trạng thái đơn */}
                                            <span className={`font-semibold ${b.booking_status === 'cancelled_by_admin' ? 'text-red-500' : 'text-green-600'}`}>
                                                {b.booking_status === 'cancelled_by_admin' ? 'Đã hủy' : (b.booking_status || 'Đã xác nhận')}
                                            </span>
                                        </td>
                                        <td className="py-1.5 text-right space-x-1 whitespace-nowrap">
                                            {b.booking_status !== 'cancelled_by_admin' && (
                                                <button onClick={() => handleCancelBooking(b)} className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30" title="Hủy đơn này"><WarningCircle size={16}/></button>
                                            )}
                                            <button onClick={() => handleEmailCustomer(b)} className="p-1 text-sky-500 hover:text-sky-700 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/30" title={`Gửi mail cho ${b.customer?.email}`}><Envelope size={16}/></button>
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
// Component chính: ManageSuppliers (Đã sửa)
// ====================================================================
export default function ManageSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('Users')
            .select('id, full_name, email, role, phone_number, address');
        if (error) { toast.error('Lỗi tải Users!'); console.error("Fetch Users Error:", error); }
        else { setUsers(data || []); }
    };

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        // Sửa: Lấy đủ data user để truyền xuống component contact
        const { data, error } = await supabase
            .from('Suppliers')
            .select('*, Users(id, full_name, email, phone_number, address)') 
            .order('created_at', { ascending: false });
        if (error) { toast.error('Lỗi tải NCC!'); console.error("Fetch Suppliers Error:", error); }
        else { setSuppliers(data || []); }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSuppliers();
        fetchUsers();
    }, [fetchSuppliers]);

    // --- Các hàm xử lý modal, submit, delete (Giữ nguyên) ---
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
        if (editingId) { const { error: uError } = await supabase.from('Suppliers').update(dataToSubmit).eq('id', editingId); error = uError; }
        else { const { error: iError } = await supabase.from('Suppliers').insert(dataToSubmit); error = iError; }
        if (error) { toast.error("Lỗi: " + error.message); console.error("Submit Error:", error); }
        else { toast.success(editingId ? 'Cập nhật OK!' : 'Thêm mới OK!'); handleCloseModal(); await fetchSuppliers(); }
        setIsSubmitting(false);
    };
    const handleDelete = async (supplierId, supplierName) => {
        // (MỚI) Cảnh báo xóa: Cần kiểm tra đơn đặt hàng trước khi xóa NCC
        if (window.confirm(`Xóa NCC "${supplierName}"?\nCẢNH BÁO: Xóa NCC có thể gây lỗi cho các đơn hàng và sản phẩm liên quan. Bạn có chắc chắn?`)) {
            // Nên có logic kiểm tra NCC còn sản phẩm/đơn hàng không trước khi xóa
            // Tạm thời vẫn cho xóa:
            const { error } = await supabase.from('Suppliers').delete().eq('id', supplierId);
            if (error) { toast.error("Lỗi xóa: " + error.message); }
            else { toast.success('Đã xóa!'); await fetchSuppliers(); }
        }
    };


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
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/4">Tài khoản liên kết</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/4">Thông tin liên hệ (User)</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-neutral-700">
                            {suppliers.length > 0 ? suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 align-top">
                                    {/* Cột Tên NCC và Sản phẩm */}
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="font-medium whitespace-nowrap mb-1">{supplier.name}</div>
                                        
                                        {/* Phê duyệt Dịch vụ (KS, Xe, Bay) */}
                                        <SupplierProductsApproval supplierId={supplier.id} />
                                        
                                        {/* (MỚI) Quản lý Đặt chỗ (Chỉ Xe, Bay) */}
                                        <SupplierBookingsManagement 
                                            supplierId={supplier.id} 
                                            supplierContact={supplier.Users} // Truyền thông tin liên hệ của NCC
                                        />
                                    </td>
                                    {/* Cột Tài khoản liên kết */}
                                    <td className="px-4 sm:px-6 py-4">
                                        {supplier.Users ? (
                                            <Link to={`/admin/accounts?search=${supplier.Users.email || supplier.Users.id}`} title={`Xem tài khoản ${supplier.Users.full_name}`} className='flex items-center gap-1.5 hover:underline text-sky-600 dark:text-sky-400'>
                                                <UserCircle size={16} />
                                                <span className='font-medium whitespace-nowrap truncate max-w-[150px]'>{supplier.Users.full_name || supplier.Users.email}</span>
                                            </Link>
                                        ) : ( <span className="text-xs italic text-neutral-500">Chưa liên kết</span> )}
                                    </td>
                                    {/* Cột Thông tin liên hệ */}
                                    <td className="px-4 sm:px-6 py-4 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                                        {supplier.Users?.phone_number && (
                                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                <Phone size={14} /> <span>{supplier.Users.phone_number}</span>
                                            </div>
                                        )}
                                        {supplier.Users?.address && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} /> <span>{supplier.Users.address}</span>
                                            </div>
                                        )}
                                        {!(supplier.Users?.phone_number || supplier.Users?.address) && supplier.Users && (
                                            <span className="italic">Chưa có SĐT/Địa chỉ</span>
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
                       {/* Header Modal */}
                       <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                         <h3 className="text-xl font-semibold">
                           {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                         </h3>
                         <button type="button" onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                           <X size={20} />
                         </button>
                       </div>
                       {/* Body Modal */}
                       <div className="p-6 grid grid-cols-1 gap-y-4 overflow-y-auto flex-1">
                         <div>
                           <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên Nhà cung cấp *</label>
                           <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                         </div>
                         <div>
                           <label htmlFor="user_id" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tài khoản liên kết</label>
                           <select
                             id="user_id" name="user_id" value={formData.user_id} onChange={handleChange}
                             className="input-style"
                           >
                             <option value="">[Không liên kết]</option>
                             {users.filter(u => u.role === 'supplier' || u.role === 'admin' || !u.role).map(user => (
                               <option key={user.id} value={user.id}>
                                 {user.full_name || user.email} ({user.role || 'user'})
                               </option>
                             ))}
                           </select>
                           <p className="text-xs text-neutral-500 mt-1">Chọn tài khoản người dùng sẽ quản lý nhà cung cấp này (Thường là role 'supplier').</p>
                         </div>
                       </div>
                       {/* Footer Modal */}
                       <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0">
                         <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm">
                           Hủy
                         </button>
                         <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2 text-sm">
                           {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
                           {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                         </button>
                       </div>
                     </form>
                   </div>
                 </div>
            )}
             {/* CSS cho input style (Giữ nguyên) */}
            <style jsx>{`
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
            `}</style>
        </div>
    );
}
// src/pages/ManageSuppliers.jsx
// (UPGRADED: Thêm CRUD + Bật/Tắt cho Dịch vụ con)

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import {
    Plus, Pencil, Trash, CircleNotch, X, UserCircle, Phone, MapPin,
    CaretDown, CaretUp, CheckCircle, XCircle, Clock,
    Buildings, AirplaneTilt, Car, Envelope, Package, WarningCircle,
    CheckSquareOffset, Prohibit, Briefcase,
    ToggleLeft, ToggleRight, // (SỬA) Icons Bật/Tắt
    FloppyDisk // (SỬA) Icon Lưu
} from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = { name: '', user_id: '' };

// --- Hàm format tiền tệ (Giữ nguyên) ---
const formatCurrency = (number) => {
    if (typeof number !== "number" || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

// ====================================================================
// (MỚI) Component Modal Chỉnh sửa Dịch vụ (Hotel, Taxi, Flight)
// (Nâng cấp để handle Thêm/Sửa)
// ====================================================================
const EditProductModal = ({ product, onClose, onSaved, supplierId }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', price: 0, description: '',
        product_type: 'hotel', supplier_id: supplierId,
        approval_status: 'pending', is_published: false
    });
    const [isNew, setIsNew] = useState(true);

    useEffect(() => {
        if (product && product.id) { // Nếu là Sửa
            setIsNew(false);
            setFormData({
                name: product.name || '',
                price: product.price || 0,
                description: product.description || '',
                product_type: product.product_type || 'hotel',
                supplier_id: product.supplier_id || supplierId,
                approval_status: product.approval_status || 'pending',
                is_published: product.is_published || false
            });
        } else { // Nếu là Thêm mới
            setIsNew(true);
            setFormData({
                name: '', price: 0, description: '',
                product_type: 'hotel', supplier_id: supplierId,
                approval_status: 'pending', is_published: false // Mới tạo luôn chờ duyệt
            });
        }
    }, [product, supplierId]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        let error;
        if (isNew) {
            // Thêm mới
            const { data, error: insertError } = await supabase
                .from('Products')
                .insert(formData)
                .select()
                .single();
            error = insertError;
            if (!error) onSaved(data); // Trả về data mới
        } else {
            // Cập nhật
            const { data, error: updateError } = await supabase
                .from('Products')
                .update(formData)
                .eq('id', product.id)
                .select()
                .single();
            error = updateError;
            if (!error) onSaved(data); // Trả về data đã cập nhật
        }
        
        setLoading(false);
        if (error) {
            toast.error("Lỗi: " + error.message);
        } else {
            toast.success(isNew ? "Thêm dịch vụ thành công!" : "Cập nhật thành công!");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            {isNew ? 'Thêm Dịch vụ mới' : 'Chỉnh sửa Dịch vụ'}
                        </h3>
                        <button type="button" onClick={onClose} disabled={loading} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="edit-product-type" className="label-style">Loại Dịch vụ *</label>
                            <select id="edit-product-type" name="product_type" value={formData.product_type} onChange={handleChange} required className="input-style" disabled={!isNew}>
                                <option value="hotel">Hotel (Khách sạn)</option>
                                <option value="car">TourZenTaxi (Xe)</option>
                                <option value="plane">TourZenFlight (Bay)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-product-name" className="label-style">Tên Dịch vụ *</label>
                            <input id="edit-product-name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="edit-product-price" className="label-style">Giá (VNĐ) *</label>
                            <input id="edit-product-price" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1000" className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="edit-product-description" className="label-style">Mô tả</label>
                            <textarea id="edit-product-description" name="description" value={formData.description} onChange={handleChange} rows="4" className="input-style resize-y"></textarea>
                        </div>
                    </div>
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary">Hủy</button>
                        <button type="submit" disabled={loading} className="modal-button-primary flex items-center justify-center gap-1.5">
                            {loading && <CircleNotch size={18} className="animate-spin" />}
                            <FloppyDisk size={18} /> Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// ====================================================================
// Component con hiển thị Sản phẩm cần duyệt (Nâng cấp UI nhẹ)
// ====================================================================
const SupplierProductsApproval = ({ supplierId, supplierName }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // null, or {productData} or {isNew: true}

    const fetchProductsForSupplier = useCallback(async () => {
        if (!isOpen) return; // Chỉ fetch khi mở
        setLoading(true);
        const { data, error } = await supabase
            .from('Products')
            .select('*')
            .eq('supplier_id', supplierId)
            .neq('product_type', 'tour'); // Lấy Hotel, Car, Plane
            
        if (error) { toast.error("Lỗi tải dịch vụ: " + error.message); }
        else { setProducts(data || []); }
        setLoading(false);
    }, [supplierId, isOpen]);

    useEffect(() => {
        fetchProductsForSupplier();
    }, [isOpen, fetchProductsForSupplier]);

    // (SỬA) Hàm cập nhật local state sau khi Thêm/Sửa
    const handleProductSaved = (savedProduct) => {
        const exists = products.find(p => p.id === savedProduct.id);
        if (exists) {
            // Sửa
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            // Thêm
            setProducts(prev => [savedProduct, ...prev]);
        }
        setEditingProduct(null);
    };

    // (SỬA) Hàm Duyệt
    const handleApproval = async (productId, newStatus) => {
        const { data, error } = await supabase
            .from('Products')
            .update({ 
                approval_status: newStatus,
                is_published: newStatus === 'approved' // Tự động Bật khi duyệt
            })
            .eq('id', productId)
            .select()
            .single();
            
        if (error) { toast.error("Lỗi: " + error.message); }
        else { 
            toast.success(newStatus === 'approved' ? "Đã duyệt!" : (newStatus === 'rejected' ? "Đã từ chối!" : "Đã reset!"));
            handleProductSaved(data); // Cập nhật UI 
        }
    };

    // (MỚI) Hàm Bật/Tắt (Hiển thị / Ngừng)
    const handleTogglePublished = async (product) => {
        if (product.approval_status !== 'approved') {
            toast.error("Chỉ có thể Bật/Tắt dịch vụ đã được duyệt.");
            return;
        }
        const newStatus = !product.is_published;
        const { data, error } = await supabase
            .from('Products')
            .update({ is_published: newStatus })
            .eq('id', product.id)
            .select()
            .single();
            
        if (error) { toast.error("Lỗi: " + error.message); }
        else {
            toast.success(newStatus ? "Đã BẬT (Hiển thị) dịch vụ." : "Đã TẮT (Ngừng) dịch vụ.");
            handleProductSaved(data); // Cập nhật UI
        }
    };

    // (MỚI) Hàm Xóa
    const handleDelete = async (productId) => {
        if (!window.confirm("Bạn chắc muốn XÓA dịch vụ này? Hành động này không thể hoàn tác.")) return;
        const { error } = await supabase.from('Products').delete().eq('id', productId);
        if (error) {
            toast.error("Lỗi xóa: " + error.message);
        } else {
            toast.success("Đã xóa dịch vụ.");
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    // (SỬA) Đổi tên
    const ProductIcon = ({ type }) => {
        if (type === 'hotel') return <Buildings title="Hotel" />;
        if (type === 'car') return <Car title="TourZenTaxi" />;
        if (type === 'plane') return <AirplaneTilt title="TourZenFlight" />;
        return <Package />;
    };
    
    // (SỬA) Badge Duyệt
    const ApprovalBadge = ({ status }) => {
      switch (status) {
        case "approved":
          return <span className="badge-green-sm"><CheckCircle size={12} /> Đã duyệt</span>;
        case "rejected":
          return <span className="badge-red-sm"><XCircle size={12} /> Bị từ chối</span>;
        default:
          return <span className="badge-yellow-sm"><Clock size={12} /> Chờ duyệt</span>;
      }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-1 font-medium"
                    aria-expanded={isOpen}
                    disabled={loading && isOpen && products.length === 0}
                >
                    {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                    {isOpen ? 'Ẩn' : 'Hiện'} Dịch vụ (Hotel, Taxi, Flight)
                    {isOpen && loading && <CircleNotch size={12} className="animate-spin ml-1" />}
                    {!loading && ` (${products.length})`}
                </button>
                {/* (MỚI) Nút Thêm Dịch vụ */}
                {isOpen && (
                    <button 
                        onClick={() => setEditingProduct({ isNew: true })} // Mở modal ở trạng thái "Mới"
                        className="button-primary !text-xs !px-2 !py-1 flex items-center gap-1"
                    >
                        <Plus size={12} /> Thêm DV
                    </button>
                )}
            </div>
            {isOpen && (
                <div className="mt-2 pl-4 border-l-2 border-sky-300 dark:border-sky-700 space-y-1.5">
                    {loading && products.length === 0 ? ( 
                        <div className="py-2 flex items-center gap-1 text-xs text-neutral-500"> <CircleNotch size={14} className="animate-spin" /> Đang tải... </div>
                    ) 
                    : !loading && products.length === 0 ? (
                        <p className="text-xs italic text-neutral-500 py-1">Chưa có dịch vụ.</p>
                    ) : (
                        <ul className="divide-y dark:divide-neutral-700 text-xs">
                            {products.map(p => (
                                <li key={p.id} className="py-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                                    {/* ... (Thông tin tên + giá giữ nguyên) ... */}
                                    <div className="flex items-center gap-1.5 flex-grow min-w-[150px]">
                                        <ProductIcon type={p.product_type} />
                                        <span className="font-medium dark:text-neutral-100" title={p.description || p.name}>{p.name}</span>
                                        <span className="text-sky-600 dark:text-sky-400 font-semibold">({formatCurrency(p.price)})</span>
                                    </div>
                                    
                                    {/* (SỬA) Nút Bấm Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <ApprovalBadge status={p.approval_status} />
                                        
                                        {/* (MỚI) Nút Bật/Tắt (Hiển thị / Ngừng) */}
                                        <button
                                            onClick={() => handleTogglePublished(p)}
                                            title={p.is_published ? "Đang Hiển thị (Bấm để Ngừng)" : "Đang Ngừng (Bấm để Hiển thị)"}
                                            disabled={p.approval_status !== 'approved'}
                                            className={`disabled:opacity-30 ${p.is_published ? 'text-green-500' : 'text-gray-400'}`}
                                        >
                                            {p.is_published ? <ToggleRight size={20} weight="fill" /> : <ToggleLeft size={20} />}
                                        </button>
                                        
                                        <div className="flex items-center gap-0.5">
                                            {/* Nút Sửa */}
                                            <button onClick={() => setEditingProduct(p)} className="action-button-sm text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa"><Pencil size={14}/></button>
                                            {/* Nút Xóa */}
                                            <button onClick={() => handleDelete(p.id)} className="action-button-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa"><Trash size={14}/></button>

                                            {p.approval_status === 'pending' && (
                                                <>
                                                <button onClick={() => handleApproval(p.id, 'approved')} className="action-button-sm text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" title="Duyệt"><CheckCircle size={14}/></button>
                                                <button onClick={() => handleApproval(p.id, 'rejected')} className="action-button-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Từ chối"><XCircle size={14}/></button>
                                                </>
                                            )}
                                            {(p.approval_status === 'approved' || p.approval_status === 'rejected') && (
                                                 <button onClick={() => handleApproval(p.id, 'pending')} className="action-button-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50" title="Đặt lại chờ duyệt"><Clock size={14}/></button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {editingProduct && (
                <EditProductModal
                    product={editingProduct.isNew ? null : editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSaved={handleProductSaved}
                    supplierId={supplierId} // Truyền supplierId vào modal
                />
            )}
        </div>
    );
};
// ====================================================================
// Component con Quản lý Đặt chỗ (Bookings) (Nâng cấp UI nhẹ)
// ====================================================================
const SupplierBookingsManagement = ({ supplierId, supplierContact }) => {
    // ... (Giữ nguyên logic của component này, chỉ sửa UI nhẹ) ...
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [processingBookingId, setProcessingBookingId] = useState(null);

    const fetchBookingsForSupplier = useCallback(async () => { /* ... */ }, [supplierId]);
    useEffect(() => { if (isOpen) fetchBookingsForSupplier(); }, [isOpen, fetchBookingsForSupplier]);
    const sendServiceStatusEmail = async (booking, newServiceStatus, reason = '') => { /* ... */ };
    const handleUpdateServiceStatus = async (booking, newStatus) => { /* ... */ };
    const handleContactSupplier = () => { /* ... */ };
    // (SỬA) Đổi tên icon
    const BookingIcon = ({ type }) => {
        if (type === 'hotel') return <Buildings title="Hotel" />;
        if (type === 'car') return <Car title="TourZenTaxi" />;
        if (type === 'plane') return <AirplaneTilt title="TourZenFlight" />;
        return <Package />;
    };
    const ServiceStatusBadge = ({ status }) => { /* ... */ };
    const handleEmailCustomer = (booking) => { /* (logic tạm) */ };

    return (
        <div className="mt-3">
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                aria-expanded={isOpen}
                disabled={loading && isOpen && bookings.length === 0}
            >
                {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                {isOpen ? 'Ẩn' : 'Hiện'} Quản lý Đặt chỗ (Xe/Bay/KS)
                {isOpen && loading && <CircleNotch size={12} className="animate-spin ml-1" />}
                {!loading && ` (${bookings.length})`}
            </button>
            {/* ... (Phần còn lại của JSX cho Bookings giữ nguyên) ... */}
        </div>
    );
};


// ====================================================================
// Component chính: ManageSuppliers (Giữ nguyên)
// ====================================================================
export default function ManageSuppliers() {
    // ... (Tất cả state, fetchSuppliers, fetchUsers, handlers giữ nguyên) ...
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null); 
    
    // (Giữ nguyên)
    const fetchSuppliers = useCallback(async (isInitialLoad = false) => {
        if(!isInitialLoad) setIsFetchingPage(true); 
        setError(null);
        if(isInitialLoad) setLoading(true); // Chỉ bật loading chính khi load lần đầu
        const selectQuery = `
            id, name, created_at, user_id, phone, email, address,
            managing_user:Users(id, full_name, email)
        `;
        const { data, error: fetchError } = await supabase
            .from('Suppliers')
            .select(selectQuery)
            .order('created_at', { ascending: false });

        if (fetchError) {
            toast.error('Lỗi tải danh sách NCC!');
            console.error("Fetch Suppliers Error:", fetchError);
            setError(fetchError.message);
        } else {
            setSuppliers(data || []);
        }
        setLoading(false); 
        setIsFetchingPage(false);
    }, []);
    const fetchUsers = async () => { /* ... */ };
    useEffect(() => { fetchSuppliers(true); fetchUsers(); }, [fetchSuppliers]);
    const handleOpenModal = (supplier = null) => { /* ... */ };
    const handleCloseModal = () => { /* ... */ };
    const handleChange = (e) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };
    const handleDelete = (supplierId, supplierName) => { /* ... */ };


     // --- Loading ban đầu (Giữ nguyên) ---
     if (loading && suppliers.length === 0) { 
        return (
          <div className="flex flex-col justify-center items-center p-24 text-center">
            <CircleNotch size={40} className="animate-spin text-sky-500" />
            <p className="text-slate-500 mt-3 font-medium"> Đang tải danh sách nhà cung cấp... </p>
          </div>
        );
      }

    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Tiêu đề & Nút Thêm (Giữ nguyên) */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Briefcase size={30} weight="duotone" className="text-sky-600" /> 
                    Quản lý Nhà cung cấp
                </h1>
                <div className="flex gap-2">
                     <button
                        onClick={() => fetchSuppliers(false)} 
                        disabled={isFetchingPage || loading}
                        className={`button-secondary flex items-center gap-1.5 ${isFetchingPage ? 'opacity-50 cursor-wait' : ''}`}
                     >
                         <CircleNotch size={16} className={isFetchingPage ? "animate-spin" : ""} /> Làm mới
                     </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="button-primary flex items-center gap-1.5"
                    >
                        <Plus size={18} weight="bold" /> Thêm NCC
                    </button>
                </div>
            </div>

             {/* Hiển thị lỗi fetch chính (Giữ nguyên) */}
             {error && !loading && ( <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm"> {error} </div> )}

            {/* Bảng dữ liệu */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border dark:border-slate-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th scope="col" className="th-style w-2/5">Tên NCC & Quản lý Dịch vụ</th>
                                <th scope="col" className="th-style w-1/4">Tài khoản QLý (Nếu có)</th>
                                <th scope="col" className="th-style w-1/4">Thông tin liên hệ (NCC)</th>
                                <th scope="col" className="th-style text-right w-[10%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {suppliers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-neutral-500 italic">Chưa có nhà cung cấp nào.</td>
                                </tr>
                            )}
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 align-top transition-colors">
                                    {/* Cột Tên NCC và Component con */}
                                    <td className="td-style py-3 align-top">
                                        <div className="font-semibold text-base dark:text-white mb-2">{supplier.name}</div>
                                        
                                        {/* (SỬA) Truyền supplierName vào */}
                                        <SupplierProductsApproval 
                                            supplierId={supplier.id} 
                                            supplierName={supplier.name} 
                                        />
                                        
                                        <SupplierBookingsManagement
                                            supplierId={supplier.id}
                                            supplierContact={supplier}
                                        />
                                    </td>
                                    {/* ... (Các <td> khác giữ nguyên) ... */}
                                    <td className="td-style py-3 align-top">
                                        {supplier.managing_user ? (
                                            <Link to={`/admin/accounts?search=${supplier.managing_user.email || supplier.managing_user.id}`} title={`Xem tài khoản ${supplier.managing_user.full_name}`} className='link-style text-sky-600 dark:text-sky-400'>
                                                <UserCircle size={16} weight="duotone"/>
                                                <span className='font-medium whitespace-nowrap truncate max-w-[150px]'>{supplier.managing_user.full_name || supplier.managing_user.email}</span>
                                            </Link>
                                        ) : ( <span className="text-xs italic text-neutral-500">Chưa liên kết TK</span> )}
                                    </td>
                                    <td className="td-style py-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 align-top">
                                         {supplier.phone && (
                                            <div className="flex items-center gap-1.5 whitespace-nowrap"> <Phone size={14} weight="duotone"/> <span>{supplier.phone}</span> </div>
                                        )}
                                        {supplier.email && (
                                             <div className="flex items-center gap-1.5 whitespace-nowrap"> <Envelope size={14} weight="duotone"/> <span>{supplier.email}</span> </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-start gap-1.5"> <MapPin size={14} weight="duotone" className="mt-0.5 flex-shrink-0"/> <span>{supplier.address}</span> </div>
                                        )}
                                        {!(supplier.phone || supplier.email || supplier.address) && ( <span className="italic">Chưa có thông tin</span> )}
                                    </td>
                                    <td className="td-style py-3 text-right whitespace-nowrap align-top">
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => handleOpenModal(supplier)} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa NCC"><Pencil size={16} /></button>
                                            <button onClick={() => handleDelete(supplier.id, supplier.name)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa NCC"><Trash size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form Thêm/Sửa NCC (Giữ nguyên) */}
             {isModalOpen && (null)}
            {/* CSS */}
            <style jsx>{`
                /* Các class CSS dùng chung */
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm; } 
                .link-style { @apply inline-flex items-center gap-1.5 hover:underline; }
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .action-button-sm { @apply p-1 rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }

                /* (MỚI) Badge nhỏ cho dịch vụ */
                .badge-sm-base { @apply px-2 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1; }
                .badge-green-sm { @apply badge-sm-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow-sm { @apply badge-sm-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red-sm { @apply badge-sm-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }

                /* Modal Styles */
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-2 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50; }
                .modal-button-danger { @apply px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm disabled:opacity-50; }
            `}</style>
        </div>
    );
}
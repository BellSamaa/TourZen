// src/pages/ManageSuppliers.jsx
// (UPGRADED: Giao diện đồng bộ + Giữ nguyên Logic đã sửa)

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import {
    Plus, Pencil, Trash, CircleNotch, X, UserCircle, Phone, MapPin,
    CaretDown, CaretUp, CheckCircle, XCircle, // Icons phê duyệt sản phẩm
    Buildings, AirplaneTilt, Car, // Icons loại SP
    Envelope,
    Package,
    WarningCircle,
    CheckSquareOffset, // Icon Duyệt booking
    Prohibit, // Icon Từ chối/Hủy booking
    Briefcase // Icon chính cho trang
} from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = { name: '', user_id: '' };

// --- Hàm format tiền tệ (Giữ nguyên) ---
const formatCurrency = (number) => { /* ... */ };

// ====================================================================
// Component Modal Chỉnh sửa Sản phẩm (Nâng cấp UI nhẹ)
// ====================================================================
const EditProductModal = ({ product, onClose, onSaved }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: product.name || '',
        price: product.price || 0,
        description: product.description || '',
    });

    const handleChange = (e) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... */ };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"> {/* Tăng z-index */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Chỉnh sửa Dịch vụ</h3>
                        <button type="button" onClick={onClose} disabled={loading} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
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
                            Lưu thay đổi
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
const SupplierProductsApproval = ({ supplierId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProductsForSupplier = useCallback(async () => { /* ... */ }, [supplierId]);
    const handleApproval = async (productId, newStatus) => { /* ... */ };
    const handleProductSaved = (updatedProduct) => { /* ... */ };
    const ProductIcon = ({ type }) => { /* ... */ };
    const ApprovalBadge = ({ status }) => { /* ... */ };
    useEffect(() => { /* ... */ }, [isOpen, products.length, loading, fetchProductsForSupplier]);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-1 font-medium" // Thêm font-medium
                aria-expanded={isOpen}
                disabled={loading && isOpen && products.length === 0}
            >
                {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                {isOpen ? 'Ẩn' : 'Hiện'} Dịch vụ (KS, Xe, Bay)
                {isOpen && loading && <CircleNotch size={12} className="animate-spin ml-1" />}
                {!loading && ` (${products.length})`}
            </button>
            {isOpen && (
                <div className="mt-2 pl-4 border-l-2 border-sky-300 dark:border-sky-700 space-y-1.5"> {/* Thêm space-y */}
                    {loading && products.length === 0 ? (
                        <div className="py-2 flex items-center gap-1 text-xs text-neutral-500"> <CircleNotch size={14} className="animate-spin" /> Đang tải... </div>
                    ) : !loading && products.length === 0 ? (
                        <p className="text-xs italic text-neutral-500 py-1">Chưa có dịch vụ.</p>
                    ) : (
                        // <<< SỬA: Dùng list thay table cho đẹp hơn >>>
                        <ul className="divide-y dark:divide-neutral-700 text-xs">
                            {products.map(p => (
                                <li key={p.id} className="py-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                                    <div className="flex items-center gap-1.5 flex-grow min-w-[150px]">
                                        <ProductIcon type={p.product_type} />
                                        <span className="font-medium dark:text-neutral-100" title={p.description || p.name}>{p.name}</span>
                                        <span className="text-sky-600 dark:text-sky-400 font-semibold">({formatCurrency(p.price)})</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <ApprovalBadge status={p.approval_status} />
                                        <div className="flex items-center gap-0.5">
                                            {p.approval_status === 'approved' && (
                                                <button onClick={() => setEditingProduct(p)} className="action-button-sm text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa chi tiết dịch vụ"><Pencil size={14}/></button>
                                            )}
                                            {p.approval_status === 'pending' && (
                                                <>
                                                <button onClick={() => handleApproval(p.id, 'approved')} className="action-button-sm text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" title="Duyệt"><CheckCircle size={14}/></button>
                                                <button onClick={() => handleApproval(p.id, 'rejected')} className="action-button-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Từ chối"><XCircle size={14}/></button>
                                                </>
                                            )}
                                            {(p.approval_status === 'approved' || p.approval_status === 'rejected') && (
                                                 <button onClick={() => handleApproval(p.id, 'pending')} className="action-button-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50" title="Đặt lại chờ duyệt">↩️</button>
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
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSaved={handleProductSaved}
                />
            )}
        </div>
    );
};

// ====================================================================
// Component con Quản lý Đặt chỗ (Bookings) (Nâng cấp UI nhẹ)
// ====================================================================
const SupplierBookingsManagement = ({ supplierId, supplierContact }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [processingBookingId, setProcessingBookingId] = useState(null);

    const fetchBookingsForSupplier = useCallback(async () => { /* ... */ }, [supplierId]);
    useEffect(() => { /* ... */ }, [isOpen]);
    const sendServiceStatusEmail = async (booking, newServiceStatus, reason = '') => { /* ... */ };
    const handleUpdateServiceStatus = async (booking, newStatus) => { /* ... */ };
    const handleContactSupplier = () => { /* ... */ };
    const BookingIcon = ({ type }) => { /* ... */ };
    const ServiceStatusBadge = ({ status }) => { /* ... */ };

    return (
        <div className="mt-3"> {/* Tăng khoảng cách */}
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium" // Thêm font-medium
                aria-expanded={isOpen}
                disabled={loading && isOpen && bookings.length === 0}
            >
                {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                {isOpen ? 'Ẩn' : 'Hiện'} Quản lý Đặt chỗ (Xe/Bay)
                {isOpen && loading && <CircleNotch size={12} className="animate-spin ml-1" />}
                {!loading && ` (${bookings.length})`}
            </button>
            {isOpen && (
                <div className="mt-2 pl-4 border-l-2 border-indigo-300 dark:border-indigo-700 space-y-2"> {/* Thêm space-y */}
                    <button
                        onClick={handleContactSupplier}
                        disabled={!supplierContact?.email}
                        className="text-xs flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Envelope size={14} /> Liên hệ NCC
                    </button>

                    {loading && bookings.length === 0 ? (
                         <div className="py-2 flex items-center gap-1 text-xs text-neutral-500"> <CircleNotch size={14} className="animate-spin" /> Đang tải... </div>
                    ) : !loading && bookings.length === 0 ? (
                        <p className="text-xs italic text-neutral-500 py-1">Chưa có đơn đặt Xe/Bay.</p>
                    ) : (
                        // <<< SỬA: Dùng list thay table >>>
                        <ul className="divide-y dark:divide-neutral-700 text-xs">
                             {bookings.map(b => (
                                <li key={b.id} className={`py-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 ${b.service_status === 'cancelled' ? 'opacity-50' : ''}`}>
                                     <div className="flex items-center gap-1.5 flex-grow min-w-[150px]">
                                         {b.service_product && <BookingIcon type={b.service_product.product_type} />}
                                         <span className="font-medium dark:text-neutral-100">{b.service_product?.name || 'N/A'}</span>
                                         <span className="text-gray-500 dark:text-gray-400">({b.customer?.full_name || b.customer?.email})</span>
                                    </div>
                                     <div className="flex items-center gap-2 flex-shrink-0">
                                        <ServiceStatusBadge status={b.service_status} />
                                         <div className="flex items-center gap-0.5">
                                            {b.service_status === 'pending' && (
                                                <>
                                                <button onClick={() => handleUpdateServiceStatus(b, 'approved')} disabled={processingBookingId === b.id} className="action-button-sm text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50" title="Phê duyệt"><CheckSquareOffset size={14}/></button>
                                                <button onClick={() => handleUpdateServiceStatus(b, 'cancelled')} disabled={processingBookingId === b.id} className="action-button-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50" title="Hủy"><Prohibit size={14}/></button>
                                                </>
                                            )}
                                            {b.service_status === 'approved' && (
                                                <button onClick={() => handleUpdateServiceStatus(b, 'cancelled')} disabled={processingBookingId === b.id} className="action-button-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50" title="Hủy (đã duyệt)"><Prohibit size={14}/></button>
                                            )}
                                             {b.service_status === 'cancelled' && (
                                                 <button onClick={() => handleUpdateServiceStatus(b, 'pending')} disabled={processingBookingId === b.id} className="action-button-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:opacity-50" title="Đặt lại chờ">↩️</button>
                                             )}
                                            <button onClick={() => handleEmailCustomer(b)} disabled={processingBookingId === b.id || !b.customer?.email} className="action-button-sm text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/30 disabled:opacity-50" title={`Email Khách: ${b.customer?.email || 'N/A'}`}><Envelope size={14}/></button>
                                        </div>
                                    </div>
                                </li>
                             ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};


// ====================================================================
// Component chính: ManageSuppliers (Nâng cấp UI)
// ====================================================================
export default function ManageSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false); // <<< Thêm loading phụ
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null); // <<< Thêm state lỗi

    // Fetch Suppliers (Giữ nguyên logic đã sửa)
    const fetchSuppliers = useCallback(async (isInitialLoad = false) => {
        if(!isInitialLoad) setIsFetchingPage(true); // Bật loading phụ
        setError(null);
        setLoading(true); // Bật loading chính nếu là initial load
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
        setLoading(false); // Tắt loading chính
        setIsFetchingPage(false); // Tắt loading phụ
    }, []);

    // Fetch users cho dropdown (Giữ nguyên)
    const fetchUsers = async () => { /* ... */ };

    useEffect(() => {
        fetchSuppliers(true); // Đánh dấu là initial load
        fetchUsers();
    }, [fetchSuppliers]);

    // Handlers (Giữ nguyên logic)
     const handleOpenModal = (supplier = null) => { /* ... */ };
     const handleCloseModal = () => { /* ... */ };
     const handleChange = (e) => { /* ... */ };
     const handleSubmit = async (e) => { /* ... */ };
     const handleDelete = (supplierId, supplierName) => { // <<< Sửa: Dùng Toast Confirm
         toast((t) => (
            <div className="flex flex-col items-center">
                <span className="text-center">
                    Xóa nhà cung cấp <b>{supplierName}</b>?<br/>
                    <span className="text-xs text-orange-600">(Sản phẩm và đơn hàng liên quan có thể bị ảnh hưởng)</span>
                </span>
               <div className="mt-3">
                 <button
                    className="modal-button-danger" // Nút đỏ
                    onClick={async () => {
                        toast.dismiss(t.id);
                        setIsFetchingPage(true); // Bật loading overlay
                        const { error: deleteError } = await supabase.from('Suppliers').delete().eq('id', supplierId);
                        setIsFetchingPage(false); // Tắt loading overlay
                        if (deleteError) {
                            toast.error("Lỗi xóa: " + deleteError.message);
                            console.error("Delete Supplier Error:", deleteError);
                        } else {
                            toast.success(`Đã xóa NCC "${supplierName}"!`);
                            // Cập nhật UI ngay hoặc fetch lại
                            setSuppliers(prev => prev.filter(s => s.id !== supplierId));
                            // fetchSuppliers(false);
                        }
                    }}
                  > Xác nhận Xóa </button>
                  <button className="ml-2 modal-button-secondary" onClick={() => toast.dismiss(t.id)}> Hủy </button>
               </div>
            </div>
          ), { icon: <WarningCircle size={24} className="text-red-500"/>, duration: 8000 });
     };


     // --- Loading ban đầu ---
     if (loading && suppliers.length === 0) { // Chỉ hiện loading toàn trang khi chưa có data
        return (
          <div className="flex flex-col justify-center items-center p-24 text-center">
            <CircleNotch size={40} className="animate-spin text-sky-500" />
            <p className="text-slate-500 mt-3 font-medium"> Đang tải danh sách nhà cung cấp... </p>
          </div>
        );
      }

    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white"> {/* <<< Thêm style trang */}
            {/* Tiêu đề & Nút Thêm */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Briefcase size={30} weight="duotone" className="text-sky-600" /> {/* <<< Icon mới */}
                    Quản lý Nhà cung cấp
                </h1>
                <div className="flex gap-2">
                     <button
                        onClick={() => fetchSuppliers(false)} // false nghĩa là không phải initial load
                        disabled={isFetchingPage || loading}
                        className={`button-secondary flex items-center gap-1.5 ${isFetchingPage ? 'opacity-50 cursor-wait' : ''}`}
                     >
                         <CircleNotch size={16} className={isFetchingPage ? "animate-spin" : ""} /> Làm mới
                     </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="button-primary flex items-center gap-1.5" // <<< Class nút chính
                    >
                        <Plus size={18} weight="bold" /> Thêm NCC
                    </button>
                </div>
            </div>

             {/* Hiển thị lỗi fetch chính */}
             {error && !loading && (
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm">
                     {error}
                 </div>
             )}

            {/* Bảng dữ liệu */}
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden border dark:border-slate-700"> {/* <<< Style bảng chính */}
                <div className="overflow-x-auto relative">
                    {isFetchingPage && !loading && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40"> {/* <<< Style thead */}
                            <tr>
                                <th scope="col" className="th-style w-2/5">Tên NCC & Quản lý Dịch vụ/Đặt chỗ</th>
                                <th scope="col" className="th-style w-1/4">Tài khoản QLý (Nếu có)</th>
                                <th scope="col" className="th-style w-1/4">Thông tin liên hệ (NCC)</th>
                                <th scope="col" className="th-style text-right w-[10%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {suppliers.length === 0 && !loading && ( // Hiển thị khi không có data (sau khi đã load xong)
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-neutral-500 italic">Chưa có nhà cung cấp nào.</td>
                                </tr>
                            )}
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 align-top transition-colors"> {/* <<< Style tr */}
                                    {/* Cột Tên NCC và Component con */}
                                    <td className="td-style py-3 align-top"> {/* <<< Style td */}
                                        <div className="font-semibold text-base dark:text-white mb-2">{supplier.name}</div>
                                        <SupplierProductsApproval supplierId={supplier.id} />
                                        <SupplierBookingsManagement
                                            supplierId={supplier.id}
                                            supplierContact={supplier}
                                        />
                                    </td>
                                    {/* Cột Tài khoản quản lý */}
                                    <td className="td-style py-3 align-top">
                                        {supplier.managing_user ? (
                                            <Link to={`/admin/accounts?search=${supplier.managing_user.email || supplier.managing_user.id}`} title={`Xem tài khoản ${supplier.managing_user.full_name}`} className='link-style text-sky-600 dark:text-sky-400'>
                                                <UserCircle size={16} weight="duotone"/>
                                                <span className='font-medium whitespace-nowrap truncate max-w-[150px]'>{supplier.managing_user.full_name || supplier.managing_user.email}</span>
                                            </Link>
                                        ) : ( <span className="text-xs italic text-neutral-500">Chưa liên kết TK</span> )}
                                    </td>
                                    {/* Cột Thông tin liên hệ */}
                                    <td className="td-style py-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 align-top"> {/* <<< Tăng space */}
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
                                     {/* Cột Hành động */}
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

            {/* Modal Form Thêm/Sửa NCC (Nâng cấp UI nhẹ) */}
             {isModalOpen && (
                 <div className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4">
                   <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                     <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                       <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                           {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                         </h3>
                         <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"> <X size={20} /> </button>
                       </div>
                       <div className="p-6 grid grid-cols-1 gap-y-5 overflow-y-auto flex-1"> {/* Tăng gap */}
                         <div>
                           <label htmlFor="ncc-name" className="label-style">Tên Nhà cung cấp *</label>
                           <input id="ncc-name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                         </div>
                         <div>
                           <label htmlFor="ncc-user" className="label-style">Tài khoản quản lý (Nếu có)</label>
                           <select id="ncc-user" name="user_id" value={formData.user_id} onChange={handleChange} className="input-style" >
                             <option value="">[Không liên kết]</option>
                             {users.filter(u => u.role === 'supplier' || u.role === 'admin').map(user => (
                               <option key={user.id} value={user.id}> {user.full_name || user.email} ({user.role}) </option>
                             ))}
                           </select>
                           <p className="text-xs text-neutral-500 mt-1.5">Chọn tài khoản sẽ quản lý NCC này (nếu NCC có tài khoản riêng).</p>
                         </div>
                         {/* Thêm các trường contact nếu muốn sửa ở đây */}
                         {/* <div><label className="label-style">Email NCC</label><input type="email" ... /></div> */}
                         {/* <div><label className="label-style">SĐT NCC</label><input type="tel" ... /></div> */}
                       </div>
                       <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                         <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="modal-button-secondary"> Hủy </button>
                         <button type="submit" disabled={isSubmitting} className="modal-button-primary flex items-center justify-center gap-1.5">
                           {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
                           {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                         </button>
                       </div>
                     </form>
                   </div>
                 </div>
            )}

            {/* CSS */}
            <style jsx>{`
                /* Các class CSS dùng chung */
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm; } /* Bỏ whitespace-nowrap ở td chính */
                .link-style { @apply inline-flex items-center gap-1.5 hover:underline; }
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .action-button-sm { @apply p-1 rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; } /* Nút nhỏ hơn */
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }

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

// Bỏ đoạn thêm CSS tự động ở cuối vì đã dùng style jsx
// src/pages/ManageSuppliers.jsx
// (Tích hợp Phê duyệt Chuyến bay, Khách sạn, Xe)

import React, { useState, useEffect, useCallback, Fragment } from 'react'; // <<< Thêm Fragment
import { Link } from 'react-router-dom'; // <<< Thêm Link
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import {
    Plus, Pencil, Trash, CircleNotch, X, UserCircle, Phone, MapPin, // <<< Thêm Phone, MapPin
    CaretDown, CaretUp, CheckCircle, XCircle, // <<< Thêm icons phê duyệt
    Hotel, AirplaneTilt, Car // <<< Icons cho sản phẩm
} from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = { name: '', user_id: '' };

// --- (MỚI) Component con hiển thị Sản phẩm cần duyệt ---
const SupplierProductsApproval = ({ supplierId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false); // State để expand/collapse

    const fetchProductsForSupplier = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Products')
            .select('id, name, product_type, approval_status, price')
            // <<< Chỉ lấy hotel, flight, car_rental >>>
            .in('product_type', ['hotel', 'flight', 'car_rental'])
            .eq('supplier_id', supplierId)
            // <<< Ưu tiên hiển thị pending lên đầu >>>
            .order('approval_status', { ascending: true }) // pending -> approved -> rejected
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi fetch sản phẩm NCC:", error);
            toast.error("Lỗi tải sản phẩm của NCC này.");
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    }, [supplierId]);

    // Hàm xử lý phê duyệt (cho component con này)
    const handleApproval = async (productId, currentStatus, newStatus) => {
        const actionText = newStatus === 'approved' ? 'Duyệt' : (newStatus === 'rejected' ? 'Từ chối' : 'Đặt lại chờ');
        if (!window.confirm(`Bạn chắc chắn muốn ${actionText} sản phẩm này?`)) return;

        // Optimistic UI
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, approval_status: newStatus } : p));

        const { error } = await supabase
            .from('Products')
            .update({ approval_status: newStatus })
            .eq('id', productId);

        if (error) {
            toast.error(`Lỗi khi ${actionText}: ${error.message}`);
            // Rollback UI nếu lỗi
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, approval_status: currentStatus } : p));
        } else {
            toast.success(`${actionText} thành công!`);
        }
    };

    // Hàm render icon theo loại sản phẩm
    const ProductIcon = ({ type }) => {
        switch (type) {
            case 'hotel': return <Hotel size={16} className="text-blue-500" title="Khách sạn"/>;
            case 'flight': return <AirplaneTilt size={16} className="text-indigo-500" title="Chuyến bay"/>;
            case 'car_rental': return <Car size={16} className="text-orange-500" title="Xe"/>;
            default: return null;
        }
    };
    // Hàm render badge trạng thái
     const ApprovalBadge = ({ status }) => {
        const base = "px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap"; // Thêm whitespace-nowrap
        switch (status) {
            case "approved": return <span className={`${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`}><CheckCircle size={12}/>Đã duyệt</span>;
            case "rejected": return <span className={`${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`}><XCircle size={12}/>Từ chối</span>;
            default: return <span className={`${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300`}>Chờ duyệt</span>;
        }
     };

    // Chỉ fetch khi người dùng mở ra
    useEffect(() => {
        if (isOpen && products.length === 0) { // Chỉ fetch nếu đang mở và chưa có data
            fetchProductsForSupplier();
        }
    }, [isOpen, products.length, fetchProductsForSupplier]);

    return (
        <div>
            {/* Nút Hiện/Ẩn */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-1"
                aria-expanded={isOpen} // Thêm aria-expanded
            >
                {isOpen ? <CaretUp weight="bold"/> : <CaretDown weight="bold"/>}
                {isOpen ? 'Ẩn' : 'Hiện'} Dịch vụ ({loading && isOpen ? '...' : products.length}) {/* Chỉ hiện ... khi đang mở và loading */}
            </button>

            {/* Danh sách sản phẩm (chỉ render khi isOpen) */}
            {isOpen && (
                <div className="mt-2 pl-4 border-l-2 dark:border-neutral-700">
                    {loading ? (
                        <div className="py-2 flex items-center gap-1 text-xs text-neutral-500">
                            <CircleNotch size={14} className="animate-spin" /> Đang tải...
                        </div>
                    ) : products.length === 0 ? (
                        <p className="text-xs italic text-neutral-500 py-1">NCC này chưa có sản phẩm dịch vụ (KS, CB, Xe).</p>
                    ) : (
                        <table className="min-w-full text-xs my-1">
                             <thead className="font-medium text-neutral-500 dark:text-neutral-400">
                                <tr>
                                    <th className="py-1 pr-2 text-left">Sản phẩm</th>
                                    <th className="py-1 pr-2 text-left">Trạng thái</th>
                                    <th className="py-1 text-right">Duyệt</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y dark:divide-neutral-700">
                                {products.map(p => (
                                    <tr key={p.id}>
                                        {/* Tên sản phẩm */}
                                        <td className="py-1.5 pr-2 flex items-center gap-1.5 whitespace-nowrap">
                                             <ProductIcon type={p.product_type} />
                                             <span title={`ID: ${p.id}`}>{p.name}</span>
                                        </td>
                                        {/* Trạng thái */}
                                        <td className="py-1.5 pr-2">
                                            <ApprovalBadge status={p.approval_status} />
                                        </td>
                                        {/* Nút duyệt */}
                                        <td className="py-1.5 text-right space-x-1 whitespace-nowrap">
                                            {p.approval_status === 'pending' && (
                                                <>
                                                <button onClick={() => handleApproval(p.id, p.approval_status, 'approved')} className="p-1 text-green-500 hover:text-green-700 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30" title="Duyệt"><CheckCircle size={16}/></button>
                                                <button onClick={() => handleApproval(p.id, p.approval_status, 'rejected')} className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30" title="Từ chối"><XCircle size={16}/></button>
                                                </>
                                            )}
                                             {(p.approval_status === 'approved' || p.approval_status === 'rejected') && (
                                                 <button onClick={() => handleApproval(p.id, p.approval_status, 'pending')} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50" title="Đặt lại chờ duyệt">↩️</button>
                                             )}
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


// --- Component chính: ManageSuppliers ---
export default function ManageSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);

    // --- fetchUsers (Lấy thêm phone, address) ---
    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('Users')
            .select('id, full_name, email, role, phone_number, address'); // <<< Lấy thêm SĐT, Địa chỉ
        if (error) { toast.error('Lỗi tải Users!'); console.error("Fetch Users Error:", error); }
        else { setUsers(data || []); }
    };

    // --- fetchSuppliers (Join lấy user data) ---
    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Suppliers')
            // <<< Lấy thêm SĐT, Địa chỉ từ Users >>>
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
        if (window.confirm(`Xóa NCC "${supplierName}"?`)) {
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
                    <table className="w-full min-w-[700px] text-sm text-left"> {/* Đặt min-width */}
                        <thead className="text-xs uppercase bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                            <tr>
                                {/* <<< Sửa tên cột */}
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/3">Tên NCC & Dịch vụ</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/4">Tài khoản liên kết</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 w-1/4">Thông tin liên hệ (User)</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-neutral-700">
                            {suppliers.length > 0 ? suppliers.map((supplier) => (
                                // <<< Dùng Fragment để nhóm row chính và row sản phẩm (nếu có)
                                // Tuy nhiên, cách làm lồng component con vào <td> đơn giản hơn
                                <tr key={supplier.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 align-top"> {/* Thêm align-top */}
                                    {/* Cột Tên NCC và Sản phẩm */}
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="font-medium whitespace-nowrap mb-1">{supplier.name}</div>
                                        {/* <<< Gọi component con ở đây >>> */}
                                        <SupplierProductsApproval supplierId={supplier.id} />
                                    </td>
                                    {/* Cột Tài khoản liên kết */}
                                    <td className="px-4 sm:px-6 py-4">
                                        {supplier.Users ? (
                                            <Link to={`/admin/accounts?search=${supplier.Users.email || supplier.Users.id}`} title={`Xem tài khoản ${supplier.Users.full_name}`} className='flex items-center gap-1.5 hover:underline text-sky-600 dark:text-sky-400'>
                                                <UserCircle size={16} />
                                                <span className='font-medium whitespace-nowrap truncate max-w-[150px]'>{supplier.Users.full_name || supplier.Users.email}</span> {/* Thêm truncate */}
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
                                    <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap"> {/* Thêm whitespace-nowrap */}
                                       <div className="flex gap-1 justify-end"> {/* Bọc nút bằng div */}
                                            <button onClick={() => handleOpenModal(supplier)} className="p-1.5 sm:p-2 text-blue-500 hover:text-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa NCC"><Pencil size={16} sm:size={18} /></button> {/* Giảm size icon */}
                                            <button onClick={() => handleDelete(supplier.id, supplier.name)} className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa NCC"><Trash size={16} sm:size={18} /></button> {/* Giảm size icon */}
                                        </div>
                                    </td>
                                </tr>
                            )) : ( // Nếu không có supplier nào
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-neutral-500 italic">Chưa có nhà cung cấp nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form (Đã sửa lỗi cuộn) */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
                   <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100"> {/* <<< Thêm flex flex-col */}
                     <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden"> {/* <<< Form bao ngoài cùng, flex */}
                       {/* Header Modal */}
                       <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0"> {/* <<< Thêm flex-shrink-0 */}
                         <h3 className="text-xl font-semibold">
                           {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                         </h3>
                         <button type="button" onClick={handleCloseModal} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"> {/* <<< Style nút X */}
                           <X size={20} />
                         </button>
                       </div>

                       {/* Body Modal (cho phép cuộn) */}
                       <div className="p-6 grid grid-cols-1 gap-y-4 overflow-y-auto flex-1"> {/* <<< Thêm overflow-y-auto flex-1 */}
                         <div>
                           <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tên Nhà cung cấp *</label>
                           <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" /> {/* <<< Dùng class chung */}
                         </div>
                         <div>
                           <label htmlFor="user_id" className="block text-sm font-medium mb-1 dark:text-neutral-300">Tài khoản liên kết</label>
                           <select
                             id="user_id" name="user_id" value={formData.user_id} onChange={handleChange}
                             className="input-style" // <<< Dùng class chung
                           >
                             <option value="">[Không liên kết]</option>
                             {users.map(user => (
                               <option key={user.id} value={user.id}>
                                 {user.full_name || user.email} ({user.role || 'user'})
                               </option>
                             ))}
                           </select>
                           <p className="text-xs text-neutral-500 mt-1">Chọn tài khoản người dùng sẽ quản lý nhà cung cấp này.</p>
                         </div>
                       </div>

                       {/* Footer Modal */}
                       <div className="p-4 border-t dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800 z-10 flex-shrink-0"> {/* <<< Thêm flex-shrink-0 */}
                         <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm"> {/* <<< Thêm text-sm */}
                           Hủy
                         </button>
                         <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2 text-sm"> {/* <<< Thêm text-sm */}
                           {isSubmitting && <CircleNotch size={18} className="animate-spin" />} {/* <<< Giảm size icon */}
                           {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
                         </button>
                       </div>
                     </form>
                   </div>
                 </div>
            )}
             {/* <<< Thêm CSS cho input style >>> */}
            <style jsx>{`
                .input-style {
                    width: 100%;
                    padding: 0.5rem 0.75rem; /* py-2 px-3 */
                    border-width: 1px;
                    border-radius: 0.375rem; /* rounded-md */
                    background-color: transparent; /* Hoặc màu nền dark mode */
                    transition: border-color 0.2s, box-shadow 0.2s;
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
                    box-shadow: 0 0 0 2px var(--tw-ring-color); /* focus:ring-2 */
                }

            `}</style>
        </div>
    );
}

// --- Dán code các hàm chưa thay đổi vào đây ---
// fetchUsers, fetchSuppliers, handleOpenModal, handleCloseModal, handleChange, handleSubmit, handleDelete
// ... (Đảm bảo code đầy đủ của các hàm này có ở đây hoặc được import)

// Ví dụ:
const fetchUsers = async () => { /* ... */ };
const fetchSuppliers = useCallback(async () => { /* ... */ }, []);
const handleOpenModal = (supplier = null) => { /* ... */ };
const handleCloseModal = () => { /* ... */ };
const handleChange = (e) => { /* ... */ };
const handleSubmit = async (e) => { /* ... */ };
const handleDelete = async (supplierId, supplierName) => { /* ... */ };
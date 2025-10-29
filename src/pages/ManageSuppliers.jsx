// src/pages/ManageSuppliers.jsx
// (UPGRADED V4: Sửa logic Thống kê, Sửa Trạng thái click, Thêm Icons)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from 'react-hot-toast';
import {
    Plus, Pencil, Trash, CircleNotch, X, UserCircle, Phone, MapPin,
    CaretDown, CaretUp, CheckCircle, XCircle, Clock,
    Buildings, AirplaneTilt, Car, Envelope, Package, WarningCircle,
    CheckSquareOffset, Prohibit, Briefcase,
    ToggleLeft, ToggleRight,
    FloppyDisk,
    Star, MagnifyingGlass, Funnel, List
} from '@phosphor-icons/react';

const supabase = getSupabase();

const initialFormData = { name: '', user_id: '', phone: '', email: '', address: '' };

const formatCurrency = (number) => {
    if (typeof number !== "number" || isNaN(number)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

// ====================================================================
// Component Thống kê
// ====================================================================
const StatCard = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center gap-4">
        {icon && <div className="text-sky-600 dark:text-sky-400">{icon}</div>}
        <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">{value}</div>
        </div>
    </div>
);

// ====================================================================
// Component Modal Chỉnh sửa Dịch vụ (Đã nâng cấp)
// ====================================================================
const EditProductModal = ({ product, onClose, onSaved, supplierId }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', price: 0, description: '', product_type: 'hotel', 
        supplier_id: supplierId, approval_status: 'pending', is_published: false,
        inventory: 99, details: {}, tour_code: ''
    });
    const [isNew, setIsNew] = useState(true);

    useEffect(() => {
        if (product && product.id) { // Nếu là Sửa
            setIsNew(false);
            setFormData({
                ...product,
                price: product.price || 0,
                inventory: product.inventory ?? 99,
                details: product.details || {},
            });
        } else { // Nếu là Thêm mới
            setIsNew(true);
            setFormData({
                name: '', price: 0, description: '', product_type: 'hotel', 
                supplier_id: supplierId, approval_status: 'pending', is_published: false,
                inventory: 99, details: {}, tour_code: ''
            });
        }
    }, [product, supplierId]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        if (name === 'name' || name === 'price' || name === 'inventory' || name === 'description' || name === 'product_type' || name === 'tour_code') {
             setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) || 0 : value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                details: {
                    ...prev.details,
                    [name]: value
                }
            }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { id, created_at, ...dataToSubmit } = formData; 
        
        let error;
        if (isNew) {
            const { data, error: insertError } = await supabase
                .from('Products')
                .insert(dataToSubmit) 
                .select()
                .single();
            error = insertError;
            if (!error) onSaved(data);
        } else {
            const { data, error: updateError } = await supabase
                .from('Products')
                .update(dataToSubmit)
                .eq('id', product.id)
                .select()
                .single();
            error = updateError;
            if (!error) onSaved(data);
        }
        
        setLoading(false);
        if (error) {
            toast.error("Lỗi: " + error.message);
            console.error("Lỗi submit modal:", error, dataToSubmit);
        } else {
            toast.success(isNew ? "Thêm dịch vụ thành công!" : "Cập nhật thành công!");
            onClose();
        }
    };

    const renderDynamicFields = () => {
        const type = formData.product_type;
        
        if (type === 'flight') {
            return (
                <>
                    <div>
                        <label htmlFor="tour_code" className="label-style">Mã Chuyến bay (tour_code) *</label>
                        <input id="tour_code" type="text" name="tour_code" value={formData.tour_code || ''} onChange={handleChange} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="airline" className="label-style">Hãng bay (details.airline)</label>
                        <input id="airline" type="text" name="airline" value={formData.details?.airline || ''} onChange={handleChange} className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="route" className="label-style">Tuyến bay (details.route)</label>
                        <input id="route" type="text" name="route" value={formData.details?.route || ''} onChange={handleChange} className="input-style" />
                    </div>
                </>
            );
        }
        
        if (type === 'transport') {
             return (
                <>
                    <div>
                        <label htmlFor="tour_code" className="label-style">Mã Dịch vụ (tour_code) *</label>
                        <input id="tour_code" type="text" name="tour_code" value={formData.tour_code || ''} onChange={handleChange} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="vehicle_type" className="label-style">Loại xe (details.vehicle_type)</label>
                        <input id="vehicle_type" type="text" name="vehicle_type" value={formData.details?.vehicle_type || ''} onChange={handleChange} className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="seats" className="label-style">Số chỗ (details.seats)</label>
                        <input id="seats" type="number" name="seats" value={formData.details?.seats || 0} onChange={handleChange} className="input-style" />
                    </div>
                </>
            );
        }

         return (
             <div>
                <label htmlFor="description" className="label-style">Mô tả</label>
                <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows="4" className="input-style resize-y"></textarea>
            </div>
         );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                            {isNew ? 'Thêm Dịch vụ mới' : 'Chỉnh sửa Dịch vụ'}
                        </h3>
                        <button type="button" onClick={onClose} disabled={loading} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="edit-product-type" className="label-style">Loại Dịch vụ *</label>
                            <select id="edit-product-type" name="product_type" value={formData.product_type} onChange={handleChange} required className="input-style !text-base" disabled={!isNew}>
                                <option value="hotel">Hotel (Khách sạn)</option>
                                <option value="transport">Transport (Vận chuyển)</option>
                                <option value="flight">Flight (Hàng không)</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="edit-product-name" className="label-style">Tên Dịch vụ *</label>
                            <input id="edit-product-name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                        </div>
                        <div>
                            <label htmlFor="edit-product-price" className="label-style">Giá (VNĐ) *</label>
                            <input id="edit-product-price" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1000" className="input-style" />
                        </div>
                         <div>
                            <label htmlFor="edit-product-inventory" className="label-style">Số lượng (Inventory) *</label>
                            <input id="edit-product-inventory" type="number" name="inventory" value={formData.inventory} onChange={handleChange} required min="0" className="input-style" />
                        </div>
                        
                        <div className="md:col-span-2 space-y-4 border-t dark:border-slate-700 pt-4 mt-2">
                             {renderDynamicFields()}
                        </div>
                    </div>
                    <div className="p-5 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
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


// ====================================================================
// Component con hiển thị Sản phẩm cần duyệt
// ====================================================================
const SupplierProductsApproval = ({ supplierId, supplierName }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [editingProduct, setEditingProduct] = useState(null); 

    const fetchProductsForSupplier = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('Products')
            .select('*') 
            .eq('supplier_id', supplierId)
            .neq('product_type', 'tour'); 
            
        if (error) { toast.error("Lỗi tải dịch vụ: " + error.message); }
        else { setProducts(data || []); }
        setLoading(false);
    }, [supplierId]);

    useEffect(() => {
        fetchProductsForSupplier();
    }, [fetchProductsForSupplier]);

    const handleProductSaved = (savedProduct) => {
        const exists = products.find(p => p.id === savedProduct.id);
        if (exists) {
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            setProducts(prev => [savedProduct, ...prev]);
        }
        setEditingProduct(null);
    };
    const handleApproval = async (productId, newStatus) => {
        const { data, error } = await supabase
            .from('Products')
            .update({ 
                approval_status: newStatus,
                is_published: newStatus === 'approved' 
            })
            .eq('id', productId)
            .select()
            .single();
            
        if (error) { toast.error("Lỗi: " + error.message); }
        else { 
            toast.success(newStatus === 'approved' ? "Đã duyệt!" : (newStatus === 'rejected' ? "Đã từ chối!" : "Đã reset!"));
            handleProductSaved(data); 
        }
    };
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
            handleProductSaved(data);
        }
    };
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
    
    const ProductIcon = ({ type }) => {
        const iconSize = 18;
        if (type === 'hotel') return <Buildings size={iconSize} title="Hotel" />;
        if (type === 'transport') return <Car size={iconSize} title="Vận chuyển (Transport)" />;
        if (type === 'flight') return <AirplaneTilt size={iconSize} title="Hàng không (Flight)" />;
        return <Package size={iconSize} />;
    };
    
    const ApprovalBadge = ({ status }) => {
      const iconSize = 14;
      switch (status) {
        case "approved":
          return <span className="badge-green-sm"><CheckCircle size={iconSize} /> Đã duyệt</span>;
        case "rejected":
          return <span className="badge-red-sm"><XCircle size={iconSize} /> Bị từ chối</span>;
        default:
          return <span className="badge-yellow-sm"><Clock size={iconSize} /> Chờ duyệt</span>;
      }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                 <h4 className="text-base font-semibold text-sky-700 dark:text-sky-400">
                    Dịch vụ (Hotel, Transport, Flight)
                 </h4>
                <button 
                    onClick={() => setEditingProduct({ isNew: true })}
                    className="button-primary !text-sm !px-3 !py-1.5 flex items-center gap-1.5"
                    title="Thêm dịch vụ (do Admin tạo)"
                >
                    <Plus size={16} /> Thêm DV
                </button>
            </div>
          
            <div className="mt-3 space-y-2.5">
                {loading ? ( 
                    <div className="py-2 flex items-center gap-1.5 text-sm text-neutral-500"> <CircleNotch size={16} className="animate-spin" /> Đang tải... </div>
                ) 
                : !loading && products.length === 0 ? (
                    <p className="text-sm italic text-neutral-500 py-1">Chưa có dịch vụ.</p>
                ) : (
                    <ul className="divide-y dark:divide-neutral-700 border-t dark:border-neutral-700">
                        {products.map(p => (
                            <li key={p.id} className="py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                                <div className="flex items-center gap-2 flex-grow min-w-[150px]">
                                    <ProductIcon type={p.product_type} />
                                    <span className="font-medium dark:text-neutral-100" title={p.description || p.name}>{p.name}</span>
                                    <span className="text-sky-600 dark:text-sky-400 font-semibold">({formatCurrency(p.price)})</span>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">(SL: {p.inventory ?? 'N/A'})</span>
                                </div>
                                
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <ApprovalBadge status={p.approval_status} />
                                    <button
                                        onClick={() => handleTogglePublished(p)}
                                        title={p.is_published ? "Đang Hiển thị (Bấm để Ngừng)" : "Đang Ngừng (Bấm để Hiển thị)"}
                                        disabled={p.approval_status !== 'approved'}
                                        className={`disabled:opacity-30 ${p.is_published ? 'text-green-500' : 'text-gray-400'}`}
                                    >
                                        {p.is_published ? <ToggleRight size={24} weight="fill" /> : <ToggleLeft size={24} />}
                                    </button>
                                    
                                    <div className="flex items-center gap-0.5">
                                        <button onClick={() => setEditingProduct(p)} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa"><Pencil size={16}/></button>
                                        <button onClick={() => handleDelete(p.id)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa"><Trash size={16}/></button>

                                        {p.approval_status === 'pending' && (
                                            <>
                                            <button onClick={() => handleApproval(p.id, 'approved')} className="action-button text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" title="Duyệt"><CheckCircle size={16}/></button>
                                            <button onClick={() => handleApproval(p.id, 'rejected')} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Từ chối"><XCircle size={16}/></button>
                                            </>
                                        )}
                                        {(p.approval_status === 'approved' || p.approval_status === 'rejected') && (
                                             <button onClick={() => handleApproval(p.id, 'pending')} className="action-button text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50" title="Đặt lại chờ duyệt"><Clock size={16}/></button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {editingProduct && (
                <EditProductModal
                    product={editingProduct.isNew ? null : editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSaved={handleProductSaved}
                    supplierId={supplierId} 
                />
            )}
        </div>
    );
};
// ====================================================================


// ====================================================================
// Component con Quản lý Đặt chỗ (Bookings)
// ====================================================================
const SupplierBookingsManagement = ({ supplierId, supplierContact }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true); 
    
    const fetchBookingsForSupplier = useCallback(async () => { 
        setLoading(true);
        setTimeout(() => {
             setBookings([]); 
             setLoading(false);
        }, 1000);
    }, [supplierId]);
    
    useEffect(() => { 
        fetchBookingsForSupplier(); 
    }, [fetchBookingsForSupplier]);

    return (
        <div className="mt-4">
            <h4 className="text-base font-semibold text-indigo-700 dark:text-indigo-400 mb-3">
                Quản lý Đặt chỗ (Xe/Bay/KS)
            </h4>
             
            <div className="mt-3 space-y-2.5">
                 {loading ? (
                     <div className="py-2 flex items-center gap-1.5 text-sm text-neutral-500"> <CircleNotch size={16} className="animate-spin" /> Đang tải đặt chỗ... </div>
                 ) : (
                     <p className="text-sm italic text-neutral-500 py-1">
                        {bookings.length === 0 ? "Không có đặt chỗ nào." : "(Hiển thị danh sách đặt chỗ ở đây)"}
                     </p>
                 )}
            </div>
        </div>
    );
};

// ====================================================================
// Modal để chứa 2 component con
// ====================================================================
const ServicesModal = ({ supplier, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Quản lý Dịch vụ & Đặt chỗ
              </h3>
              <button type="button" onClick={onClose} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X size={20} />
              </button>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto">
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              Nhà cung cấp: <span className="text-sky-600 dark:text-sky-400">{supplier.name}</span>
            </h4>
            
            <SupplierProductsApproval 
              supplierId={supplier.id} 
              supplierName={supplier.name}
            />
            
            <hr className="dark:border-slate-700 my-6"/>

            <SupplierBookingsManagement
              supplierId={supplier.id}
              supplierContact={supplier}
            />
          </div>
          <div className="p-5 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
              <button type="button" onClick={onClose} className="modal-button-secondary">Đóng</button>
          </div>
        </div>
      </div>
    );
  };
  
// ====================================================================
// Hàm lấy loại NCC
// ====================================================================
const getSupplierType = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('khách sạn') || lowerName.includes('resort') || lowerName.includes('hotel')) {
        return { type: 'Hotel', className: 'badge-green' };
    }
    if (lowerName.includes('hàng không') || lowerName.includes('airline') || lowerName.includes('vietjet')) {
        return { type: 'Airline', className: 'badge-purple' };
    }
    if (lowerName.includes('vận chuyển') || lowerName.includes('transport') || lowerName.includes('sài gòn')) {
        return { type: 'Transport', className: 'badge-orange' };
    }
    if (lowerName.includes('tourzensupplier')) {
         return { type: 'Transport', className: 'badge-orange' };
    }
    
    return { type: 'Tour Operator', className: 'badge-blue' };
};
// ====================================================================


// ====================================================================
// Component chính: ManageSuppliers
// ====================================================================
export default function ManageSuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null); 
    const [searchTerm, setSearchTerm] = useState('');
    
    const [viewingServicesFor, setViewingServicesFor] = useState(null); 
    
    // (FIX 2) State MỚI cho thống kê DỊCH VỤ
    const [productStats, setProductStats] = useState({ hotel: 0, flight: 0, transport: 0 });

    const fetchSuppliers = useCallback(async (isInitialLoad = false) => {
        if(!isInitialLoad) setIsFetchingPage(true); 
        setError(null);
        if(isInitialLoad) setLoading(true); 
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

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('Users')
            .select('id, full_name, email')
            .eq('role', 'supplier'); 
        if (error) {
            console.error("Fetch Users Error:", error);
        } else {
            setUsers(data || []);
        }
    };

    // (FIX 2) Sửa useEffect để fetch cả Thống kê
    useEffect(() => {
        fetchSuppliers(true);
        fetchUsers();

        // Thêm logic fetch số lượng Products
        async function fetchProductStats() {
            // FIX: Removed the extra underscore after the closing brace of destructuring
            const { data, error } = await supabase
                .from('Products')
                .select('product_type')
                .neq('product_type', 'tour');
            
            if (data) {
                let hotel = 0, flight = 0, transport = 0;
                for (const prod of data) {
                    if (prod.product_type === 'hotel') hotel++;
                    else if (prod.product_type === 'flight') flight++;
                    else if (prod.product_type === 'transport') transport++;
                }
                setProductStats({ hotel, flight, transport });
            }
        }
        fetchProductStats();

    }, [fetchSuppliers]); // fetchSuppliers đã có useCallback

    // --- Logic Modal NCC ---
    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setEditingId(supplier.id);
            setFormData({
                name: supplier.name || '',
                user_id: supplier.user_id || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || ''
            });
        } else {
            setEditingId(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(initialFormData);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Tên nhà cung cấp là bắt buộc.");
            return;
        }
        setIsSubmitting(true);
        const dataToSubmit = { ...formData, user_id: formData.user_id || null };

        let error;
        if (editingId) {
            const { error: updateError } = await supabase.from('Suppliers').update(dataToSubmit).eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('Suppliers').insert(dataToSubmit);
            error = insertError;
        }

        if (error) {
            toast.error("Lỗi: " + error.message);
        } else {
            toast.success(editingId ? "Cập nhật thành công!" : "Thêm NCC thành công!");
            handleCloseModal();
            fetchSuppliers(false); 
        }
        setIsSubmitting(false);
    };
    const handleDelete = async (supplierId, supplierName) => {
        if (!window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${supplierName}"?`)) return;
        
        const { error } = await supabase.from('Suppliers').delete().eq('id', supplierId);
        if (error) {
            toast.error("Lỗi xóa NCC: " + error.message);
        } else {
            toast.success("Đã xóa nhà cung cấp.");
            fetchSuppliers(false); 
        }
    };
    // --- Hết logic Modal NCC ---

    // --- Logic UI Dashboard ---
    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) return suppliers;
        return suppliers.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    // Logic trạng thái
    const getStatus = (supplier) => {
        if (!supplier.user_id) {
             return { text: 'Ngừng', className: 'badge-status-inactive' };
        }
        return { text: 'Hoạt động', className: 'badge-status-active' };
    };
    
    const getRating = (id) => {
        const num = (id.charCodeAt(id.length - 1) % 15 + 35) / 10.0;
        return num.toFixed(1);
    };
    // --- Hết logic UI ---

     if (loading && suppliers.length === 0) { 
        return (
          <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-slate-900">
            <CircleNotch size={40} className="animate-spin text-sky-500" />
            <p className="text-slate-500 mt-3 font-medium"> Đang tải danh sách nhà cung cấp... </p>
          </div>
        );
      }

    return (
        <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white">
            
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Quản Lý Nhà Cung Cấp
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quản lý nhà cung cấp dịch vụ du lịch
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="button-primary-dark flex items-center gap-1.5"
                >
                    <Plus size={18} weight="bold" /> Thêm Nhà Cung Cấp
                </button>
            </div>
            
            {/* (FIX 2) Sửa Thẻ Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard 
                    title="Tổng nhà cung cấp" 
                    value={suppliers.length} 
                    icon={<Briefcase size={22} weight="duotone"/>}
                />
                 <StatCard 
                    title="Dịch vụ Khách sạn" 
                    value={productStats.hotel} 
                    icon={<Buildings size={22} weight="duotone"/>}
                />
                 <StatCard 
                    title="Dịch vụ Hàng không" 
                    value={productStats.flight} 
                    icon={<AirplaneTilt size={22} weight="duotone"/>}
                />
                 <StatCard 
                    title="Dịch vụ Vận chuyển" 
                    value={productStats.transport} 
                    icon={<Car size={22} weight="duotone"/>}
                />
            </div>
            
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Danh Sách Nhà Cung Cấp</h3>
                    <div className="flex items-center gap-2">
                        <button className="button-filter-active flex items-center gap-1.5" disabled>
                            <Funnel size={16} /> Tất cả
                        </button>
                        <div className="relative">
                            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm nhà cung cấp..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="search-input-style"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative">
                    {(isFetchingPage && !loading) && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/40">
                            <tr>
                                <th scope="col" className="th-style-new">Mã NCC</th>
                                <th scope="col" className="th-style-new">Tên công ty</th>
                                <th scope="col" className="th-style-new">Loại</th>
                                <th scope="col" className="th-style-new">Người liên hệ</th>
                                <th scope="col" className="th-style-new">Liên hệ</th>
                                <th scope="col" className="th-style-new">Đánh giá</th>
                                <th scope="col" className="th-style-new">Trạng thái</th>
                                <th scope="col" className="th-style-new text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredSuppliers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-neutral-500 italic">Không tìm thấy nhà cung cấp nào.</td>
                                </tr>
                            )}
                            {filteredSuppliers.map((supplier) => {
                                const typeInfo = getSupplierType(supplier.name);
                                const statusInfo = getStatus(supplier);

                                return (
                                <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 align-top transition-colors">
                                    <td className="td-style-new font-mono">NCC-{supplier.id.slice(-4).toUpperCase()}</td>
                                    <td className="td-style-new max-w-xs">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={18} weight="duotone" className="text-gray-500 flex-shrink-0" />
                                            <span className="font-semibold text-gray-800 dark:text-white truncate">{supplier.name}</span>
                                        </div>
                                    </td>
                                    <td className="td-style-new">
                                        <span className={`badge-base ${typeInfo.className}`}>{typeInfo.type}</span>
                                    </td>
                                    
                                    {/* (FIX 3) Thêm Icon Người liên hệ */}
                                    <td className="td-style-new">
                                        {supplier.managing_user ? (
                                            <div className="flex items-center gap-2">
                                                <UserCircle size={18} className="text-gray-400 flex-shrink-0" />
                                                <span title={supplier.managing_user.email}>{supplier.managing_user.full_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">N/A</span>
                                        )}
                                    </td>
                                    
                                    {/* (FIX 3) Thêm Icon Liên hệ */}
                                    <td className="td-style-new text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="flex-shrink-0" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2 truncate max-w-[180px]">
                                                <Envelope size={14} className="flex-shrink-0" />
                                                <span className="truncate">{supplier.email}</span>
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td className="td-style-new">
                                        <div className="flex items-center gap-1">
                                            <Star size={15} weight="fill" className="text-yellow-400" />
                                            <span className="font-medium">{getRating(supplier.id)}</span>
                                        </div>
                                    </td>
                                    
                                    {/* (FIX 1) Sửa Trạng thái (Clickable) */}
                                    <td className="td-style-new">
                                        <button 
                                            onClick={() => handleOpenModal(supplier)} 
                                            title="Sửa trạng thái (liên kết tài khoản)"
                                            className="cursor-pointer transition-transform hover:scale-105 focus:outline-none"
                                        >
                                            <span className={`badge-base ${statusInfo.className}`}>{statusInfo.text}</span>
                                        </button>
                                    </td>
                                    
                                    <td className="td-style-new text-right whitespace-nowrap">
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => setViewingServicesFor(supplier)} className="action-button text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50" title="Quản lý Dịch vụ"><List size={16} /></button>
                                            <button onClick={() => handleOpenModal(supplier)} className="action-button text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" title="Sửa NCC"><Pencil size={16} /></button>
                                            <button onClick={() => handleDelete(supplier.id, supplier.name)} className="action-button text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30" title="Xóa NCC"><Trash size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Thêm/Sửa NCC chính */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex justify-between items-center p-5 border-b dark:border-slate-700">
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                                    {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                                </h3>
                                <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="text-gray-400 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label htmlFor="name" className="label-style">Tên Nhà cung cấp *</label>
                                    <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                                </div>
                                <div>
                                    <label htmlFor="user_id" className="label-style">Tài khoản quản lý (Quyết định Trạng thái)</label>
                                    <select id="user_id" name="user_id" value={formData.user_id} onChange={handleChange} className="input-style">
                                        <option value="">-- Không liên kết (Trạng thái: Ngừng) --</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="phone" className="label-style">Số điện thoại (NCC)</label>
                                        <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-style" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="label-style">Email (NCC)</label>
                                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="input-style" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="address" className="label-style">Địa chỉ (NCC)</label>
                                    <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows="3" className="input-style resize-y"></textarea>
                                </div>
                            </div>
                            
                            <div className="p-5 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                                <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="modal-button-secondary">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="modal-button-primary flex items-center justify-center gap-1.5">
                                    {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
                                    Lưu Nhà cung cấp
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
             )}

            {/* Modal Dịch vụ con */}
            {viewingServicesFor && (
                <ServicesModal 
                    supplier={viewingServicesFor} 
                    onClose={() => setViewingServicesFor(null)} 
                />
            )}

            {/* CSS */}
            <style jsx>{`
                .button-primary-dark { 
                    @apply bg-gray-800 hover:bg-gray-900 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md; 
                }
                .button-filter-active {
                    @apply bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold px-3 py-1.5 rounded-lg text-sm;
                }
                .search-input-style {
                    @apply border border-gray-300 dark:border-slate-600 p-2 pl-9 rounded-lg w-full sm:w-64 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm;
                }
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .th-style-new { @apply px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style-new { @apply px-4 py-3 text-sm text-gray-700 dark:text-gray-300 align-middle; } 
                .action-button { @apply p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
                .badge-base { @apply px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center; }
                .badge-blue { @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200; }
                .badge-green { @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200; }
                .badge-purple { @apply bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200; }
                .badge-orange { @apply bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200; }
                .badge-status-active { @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300; }
                .badge-status-inactive { @apply bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-100; }
                .badge-sm-base { @apply px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1.5; }
                .badge-green-sm { @apply badge-sm-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow-sm { @apply badge-sm-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red-sm { @apply badge-sm-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-2.5 rounded-md w-full dark:bg-slate-700 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5; }
                .modal-button-secondary { @apply px-5 py-2.5 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-5 py-2.5 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 text-sm disabled:opacity-50; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
            `}</style>
        </div>
    );
}

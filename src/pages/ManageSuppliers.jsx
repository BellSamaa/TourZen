// src/pages/ManageSuppliers.jsx
// (UPGRADED V4: Sửa logic Thống kê, Sửa Trạng thái click, Thêm Icons)
// (Nâng cấp giao diện: Tăng kích thước font, padding; Thêm nhiều icon; Nút bấm màu sắc đa dạng hơn với gradient, hover effects; Cải thiện layout cho dễ nhìn)

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
    Star, MagnifyingGlass, Funnel, List,
    GlobeHemisphereEast, UsersThree, ArrowCircleRight, ShieldCheck, CurrencyCircleDollar
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
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 flex items-center gap-5 transform hover:scale-105 transition-transform duration-300">
        {icon && <div className="text-sky-600 dark:text-sky-400 text-4xl">{icon}</div>}
        <div>
            <div className="text-base font-semibold text-gray-600 dark:text-gray-300">{title}</div>
            <div className="text-4xl font-extrabold text-gray-900 dark:text-white">{value}</div>
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
                        <label htmlFor="tour_code" className="label-style text-lg">Mã Chuyến bay (tour_code) *</label>
                        <input id="tour_code" type="text" name="tour_code" value={formData.tour_code || ''} onChange={handleChange} required className="input-style text-lg" />
                    </div>
                    <div>
                        <label htmlFor="airline" className="label-style text-lg">Hãng bay (details.airline)</label>
                        <input id="airline" type="text" name="airline" value={formData.details?.airline || ''} onChange={handleChange} className="input-style text-lg" />
                    </div>
                    <div>
                        <label htmlFor="route" className="label-style text-lg">Tuyến bay (details.route)</label>
                        <input id="route" type="text" name="route" value={formData.details?.route || ''} onChange={handleChange} className="input-style text-lg" />
                    </div>
                </>
            );
        }
        
        if (type === 'transport') {
             return (
                <>
                    <div>
                        <label htmlFor="tour_code" className="label-style text-lg">Mã Dịch vụ (tour_code) *</label>
                        <input id="tour_code" type="text" name="tour_code" value={formData.tour_code || ''} onChange={handleChange} required className="input-style text-lg" />
                    </div>
                    <div>
                        <label htmlFor="vehicle_type" className="label-style text-lg">Loại xe (details.vehicle_type)</label>
                        <input id="vehicle_type" type="text" name="vehicle_type" value={formData.details?.vehicle_type || ''} onChange={handleChange} className="input-style text-lg" />
                    </div>
                     <div>
                        <label htmlFor="seats" className="label-style text-lg">Số chỗ (details.seats)</label>
                        <input id="seats" type="number" name="seats" value={formData.details?.seats || 0} onChange={handleChange} className="input-style text-lg" />
                    </div>
                </>
            );
        }

         return (
             <div>
                <label htmlFor="description" className="label-style text-lg">Mô tả</label>
                <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows="4" className="input-style text-lg resize-y"></textarea>
            </div>
         );
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-6">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col border border-sky-200 dark:border-sky-700">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <ShieldCheck size={28} className="text-sky-600" />
                            {isNew ? 'Thêm Dịch vụ mới' : 'Chỉnh sửa Dịch vụ'}
                        </h3>
                        <button type="button" onClick={onClose} disabled={loading} className="text-gray-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                        <div>
                            <label htmlFor="edit-product-type" className="label-style text-lg">Loại Dịch vụ *</label>
                            <select id="edit-product-type" name="product_type" value={formData.product_type} onChange={handleChange} required className="input-style text-lg !text-base" disabled={!isNew}>
                                <option value="hotel">Hotel (Khách sạn)</option>
                                <option value="transport">Transport (Vận chuyển)</option>
                                <option value="flight">Flight (Hàng không)</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="edit-product-name" className="label-style text-lg">Tên Dịch vụ *</label>
                            <input id="edit-product-name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style text-lg" />
                        </div>
                        <div>
                            <label htmlFor="edit-product-price" className="label-style text-lg">Giá (VNĐ) *</label>
                            <input id="edit-product-price" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1000" className="input-style text-lg" />
                        </div>
                         <div>
                            <label htmlFor="edit-product-inventory" className="label-style text-lg">Số lượng (Inventory) *</label>
                            <input id="edit-product-inventory" type="number" name="inventory" value={formData.inventory} onChange={handleChange} required min="0" className="input-style text-lg" />
                        </div>
                        
                        <div className="md:col-span-2 space-y-5 border-t dark:border-slate-700 pt-5 mt-3">
                             {renderDynamicFields()}
                        </div>
                    </div>
                    <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-b-2xl">
                        <button type="button" onClick={onClose} disabled={loading} className="modal-button-secondary text-lg px-6 py-3">Hủy</button>
                        <button type="submit" disabled={loading} className="modal-button-primary flex items-center justify-center gap-2 text-lg px-6 py-3">
                            {loading && <CircleNotch size={24} className="animate-spin" />}
                            <FloppyDisk size={24} /> Lưu
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
        const iconSize = 24;
        if (type === 'hotel') return <Buildings size={iconSize} title="Hotel" className="text-green-500" />;
        if (type === 'transport') return <Car size={iconSize} title="Vận chuyển (Transport)" className="text-orange-500" />;
        if (type === 'flight') return <AirplaneTilt size={iconSize} title="Hàng không (Flight)" className="text-purple-500" />;
        return <Package size={iconSize} className="text-blue-500" />;
    };
    
    const ApprovalBadge = ({ status }) => {
      const iconSize = 20;
      switch (status) {
        case "approved":
          return <span className="badge-green-sm text-lg"><CheckCircle size={iconSize} /> Đã duyệt</span>;
        case "rejected":
          return <span className="badge-red-sm text-lg"><XCircle size={iconSize} /> Bị từ chối</span>;
        default:
          return <span className="badge-yellow-sm text-lg"><Clock size={iconSize} /> Chờ duyệt</span>;
      }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h4 className="text-xl font-bold text-sky-700 dark:text-sky-400 flex items-center gap-3">
                    <GlobeHemisphereEast size={28} /> Dịch vụ (Hotel, Transport, Flight)
                 </h4>
                <button 
                    onClick={() => setEditingProduct({ isNew: true })}
                    className="button-primary !text-base !px-5 !py-2.5 flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                    title="Thêm dịch vụ (do Admin tạo)"
                >
                    <Plus size={20} /> Thêm DV
                </button>
            </div>
          
            <div className="mt-4 space-y-3">
                {loading ? ( 
                    <div className="py-3 flex items-center gap-2 text-base text-neutral-500"> <CircleNotch size={20} className="animate-spin" /> Đang tải... </div>
                ) 
                : !loading && products.length === 0 ? (
                    <p className="text-base italic text-neutral-500 py-2">Chưa có dịch vụ.</p>
                ) : (
                    <ul className="divide-y dark:divide-neutral-700 border-t dark:border-neutral-700">
                        {products.map(p => (
                            <li key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                                <div className="flex items-center gap-3 flex-grow min-w-[200px]">
                                    <ProductIcon type={p.product_type} />
                                    <span className="font-bold text-lg dark:text-neutral-100" title={p.description || p.name}>{p.name}</span>
                                    <span className="text-sky-600 dark:text-sky-400 font-bold text-lg">({formatCurrency(p.price)})</span>
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">(SL: {p.inventory ?? 'N/A'})</span>
                                </div>
                                
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <ApprovalBadge status={p.approval_status} />
                                    <button
                                        onClick={() => handleTogglePublished(p)}
                                        title={p.is_published ? "Đang Hiển thị (Bấm để Ngừng)" : "Đang Ngừng (Bấm để Hiển thị)"}
                                        disabled={p.approval_status !== 'approved'}
                                        className={`disabled:opacity-30 text-2xl ${p.is_published ? 'text-green-600' : 'text-gray-500'}`}
                                    >
                                        {p.is_published ? <ToggleRight size={28} weight="fill" /> : <ToggleLeft size={28} />}
                                    </button>
                                    
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setEditingProduct(p)} className="action-button text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/40 p-2" title="Sửa"><Pencil size={20}/></button>
                                        <button onClick={() => handleDelete(p.id)} className="action-button text-red-600 hover:bg-red-200 dark:hover:bg-red-900/40 p-2" title="Xóa"><Trash size={20}/></button>

                                        {p.approval_status === 'pending' && (
                                            <>
                                            <button onClick={() => handleApproval(p.id, 'approved')} className="action-button text-green-600 hover:bg-green-200 dark:hover:bg-green-900/40 p-2" title="Duyệt"><CheckCircle size={20}/></button>
                                            <button onClick={() => handleApproval(p.id, 'rejected')} className="action-button text-red-600 hover:bg-red-200 dark:hover:bg-red-900/40 p-2" title="Từ chối"><XCircle size={20}/></button>
                                            </>
                                        )}
                                        {(p.approval_status === 'approved' || p.approval_status === 'rejected') && (
                                             <button onClick={() => handleApproval(p.id, 'pending')} className="action-button text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700/60 p-2" title="Đặt lại chờ duyệt"><Clock size={20}/></button>
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
        <div className="mt-6">
            <h4 className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-3">
                <ArrowCircleRight size={28} /> Quản lý Đặt chỗ (Xe/Bay/KS)
            </h4>
             
            <div className="mt-4 space-y-3">
                 {loading ? (
                     <div className="py-3 flex items-center gap-2 text-base text-neutral-500"> <CircleNotch size={20} className="animate-spin" /> Đang tải đặt chỗ... </div>
                 ) : (
                     <p className="text-base italic text-neutral-500 py-2">
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
      <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col border border-indigo-200 dark:border-indigo-700">
          <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <UsersThree size={28} className="text-indigo-600" /> Quản lý Dịch vụ & Đặt chỗ
              </h3>
              <button type="button" onClick={onClose} className="text-gray-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  <X size={24} />
              </button>
          </div>
          <div className="p-8 space-y-8 overflow-y-auto">
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <Briefcase size={24} className="text-sky-600" /> Nhà cung cấp: <span className="text-sky-600 dark:text-sky-400">{supplier.name}</span>
            </h4>
            
            <SupplierProductsApproval 
              supplierId={supplier.id} 
              supplierName={supplier.name}
            />
            
            <hr className="dark:border-slate-700 my-8 border-2 rounded"/>

            <SupplierBookingsManagement
              supplierId={supplier.id}
              supplierContact={supplier}
            />
          </div>
          <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-b-2xl">
              <button type="button" onClick={onClose} className="modal-button-secondary text-lg px-6 py-3">Đóng</button>
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
          <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <CircleNotch size={50} className="animate-spin text-sky-500" />
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-xl font-semibold"> Đang tải danh sách nhà cung cấp... </p>
          </div>
        );
      }

    return (
        <div className="p-6 sm:p-8 space-y-8 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 dark:text-white">
            
            <div className="flex flex-wrap justify-between items-center gap-5">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <Briefcase size={36} className="text-indigo-600" /> Quản Lý Nhà Cung Cấp
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
                        <GlobeHemisphereEast size={20} /> Quản lý nhà cung cấp dịch vụ du lịch
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="button-primary-dark flex items-center gap-2 text-lg px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-xl"
                >
                    <Plus size={24} weight="bold" /> Thêm Nhà Cung Cấp
                </button>
            </div>
            
            {/* (FIX 2) Sửa Thẻ Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title="Tổng nhà cung cấp" 
                    value={suppliers.length} 
                    icon={<Briefcase size={28} weight="duotone"/>}
                />
                 <StatCard 
                    title="Dịch vụ Khách sạn" 
                    value={productStats.hotel} 
                    icon={<Buildings size={28} weight="duotone"/>}
                />
                 <StatCard 
                    title="Dịch vụ Hàng không" 
                    value={productStats.flight} 
                    icon={<AirplaneTilt size={28} weight="duotone"/>}
                />
                 <StatCard 
                    title="Dịch vụ Vận chuyển" 
                    value={productStats.transport} 
                    icon={<Car size={28} weight="duotone"/>}
                />
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-5 p-6 border-b dark:border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <List size={28} className="text-sky-600" /> Danh Sách Nhà Cung Cấp
                    </h3>
                    <div className="flex items-center gap-3">
                        <button className="button-filter-active flex items-center gap-2 text-lg px-5 py-2.5" disabled>
                            <Funnel size={20} /> Tất cả
                        </button>
                        <div className="relative">
                            <MagnifyingGlass size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm nhà cung cấp..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="search-input-style text-lg pl-12 pr-4 py-3 w-full sm:w-72"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative">
                    {(isFetchingPage && !loading) && ( <div className="loading-overlay"> <CircleNotch size={40} className="animate-spin text-sky-500" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
                            <tr>
                                <th scope="col" className="th-style-new text-base">Mã NCC</th>
                                <th scope="col" className="th-style-new text-base">Tên công ty</th>
                                <th scope="col" className="th-style-new text-base">Loại</th>
                                <th scope="col" className="th-style-new text-base">Người liên hệ</th>
                                <th scope="col" className="th-style-new text-base">Liên hệ</th>
                                <th scope="col" className="th-style-new text-base">Đánh giá</th>
                                <th scope="col" className="th-style-new text-base">Trạng thái</th>
                                <th scope="col" className="th-style-new text-right text-base">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                            {filteredSuppliers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-neutral-600 italic text-lg">Không tìm thấy nhà cung cấp nào.</td>
                                </tr>
                            )}
                            {filteredSuppliers.map((supplier) => {
                                const typeInfo = getSupplierType(supplier.name);
                                const statusInfo = getStatus(supplier);

                                return (
                                <tr key={supplier.id} className="hover:bg-gray-100 dark:hover:bg-slate-700/40 align-top transition-colors duration-300">
                                    <td className="td-style-new font-mono text-lg">NCC-{supplier.id.slice(-4).toUpperCase()}</td>
                                    <td className="td-style-new max-w-md">
                                        <div className="flex items-center gap-3">
                                            <Briefcase size={24} weight="duotone" className="text-gray-600 flex-shrink-0" />
                                            <span className="font-bold text-lg text-gray-900 dark:text-white truncate">{supplier.name}</span>
                                        </div>
                                    </td>
                                    <td className="td-style-new">
                                        <span className={`badge-base ${typeInfo.className} text-lg`}>{typeInfo.type}</span>
                                    </td>
                                    
                                    {/* (FIX 3) Thêm Icon Người liên hệ */}
                                    <td className="td-style-new text-lg">
                                        {supplier.managing_user ? (
                                            <div className="flex items-center gap-3">
                                                <UserCircle size={24} className="text-gray-500 flex-shrink-0" />
                                                <span title={supplier.managing_user.email}>{supplier.managing_user.full_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">N/A</span>
                                        )}
                                    </td>
                                    
                                    {/* (FIX 3) Thêm Icon Liên hệ */}
                                    <td className="td-style-new text-base text-gray-700 dark:text-gray-300 space-y-2">
                                        {supplier.phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone size={20} className="flex-shrink-0 text-green-500" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-3 truncate max-w-[220px]">
                                                <Envelope size={20} className="flex-shrink-0 text-blue-500" />
                                                <span className="truncate">{supplier.email}</span>
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td className="td-style-new">
                                        <div className="flex items-center gap-2">
                                            <Star size={20} weight="fill" className="text-yellow-500" />
                                            <span className="font-bold text-lg">{getRating(supplier.id)}</span>
                                        </div>
                                    </td>
                                    
                                    {/* (FIX 1) Sửa Trạng thái (Clickable) */}
                                    <td className="td-style-new">
                                        <button 
                                            onClick={() => handleOpenModal(supplier)} 
                                            title="Sửa trạng thái (liên kết tài khoản)"
                                            className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <span className={`badge-base ${statusInfo.className} text-lg`}>{statusInfo.text}</span>
                                        </button>
                                    </td>
                                    
                                    <td className="td-style-new text-right whitespace-nowrap">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setViewingServicesFor(supplier)} className="action-button text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700/60 p-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg" title="Quản lý Dịch vụ"><List size={20} /></button>
                                            <button onClick={() => handleOpenModal(supplier)} className="action-button text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/40 p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg" title="Sửa NCC"><Pencil size={20} /></button>
                                            <button onClick={() => handleDelete(supplier.id, supplier.name)} className="action-button text-red-600 hover:bg-red-200 dark:hover:bg-red-900/40 p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg" title="Xóa NCC"><Trash size={20} /></button>
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
                <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col border border-sky-200 dark:border-sky-700">
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <CurrencyCircleDollar size={28} className="text-sky-600" />
                                    {editingId ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
                                </h3>
                                <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="text-gray-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-5 overflow-y-auto">
                                <div>
                                    <label htmlFor="name" className="label-style text-lg">Tên Nhà cung cấp *</label>
                                    <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style text-lg" />
                                </div>
                                <div>
                                    <label htmlFor="user_id" className="label-style text-lg">Tài khoản quản lý (Quyết định Trạng thái)</label>
                                    <select id="user_id" name="user_id" value={formData.user_id} onChange={handleChange} className="input-style text-lg">
                                        <option value="">-- Không liên kết (Trạng thái: Ngừng) --</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                     <div>
                                        <label htmlFor="phone" className="label-style text-lg">Số điện thoại (NCC)</label>
                                        <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-style text-lg" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="label-style text-lg">Email (NCC)</label>
                                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="input-style text-lg" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="address" className="label-style text-lg">Địa chỉ (NCC)</label>
                                    <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows="4" className="input-style text-lg resize-y"></textarea>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t dark:border-slate-700 flex justify-end gap-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-b-2xl">
                                <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="modal-button-secondary text-lg px-6 py-3">Hủy</button>
                                <button type="submit" disabled={isSubmitting} className="modal-button-primary flex items-center justify-center gap-2 text-lg px-6 py-3">
                                    {isSubmitting && <CircleNotch size={24} className="animate-spin" />}
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
                    @apply bg-gray-800 hover:bg-gray-900 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-xl transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl; 
                }
                .button-filter-active {
                    @apply bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-gray-200 font-bold px-4 py-2.5 rounded-xl text-base;
                }
                .search-input-style {
                    @apply border border-gray-300 dark:border-slate-600 p-3 pl-12 rounded-xl w-full sm:w-80 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-base shadow-md;
                }
                .loading-overlay { @apply absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10; }
                .th-style-new { @apply px-5 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style-new { @apply px-5 py-4 text-base text-gray-800 dark:text-gray-200 align-middle; } 
                .action-button { @apply p-2.5 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md; }
                .badge-base { @apply px-3.5 py-1.5 text-base font-bold rounded-full inline-flex items-center gap-2; }
                .badge-blue { @apply bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-300; }
                .badge-green { @apply bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-300; }
                .badge-purple { @apply bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-300; }
                .badge-orange { @apply bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-300; }
                .badge-status-active { @apply bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-400; }
                .badge-status-inactive { @apply bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200; }
                .badge-sm-base { @apply px-3.5 py-1.5 text-base font-semibold rounded-full inline-flex items-center gap-2; }
                .badge-green-sm { @apply badge-sm-base bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-400; }
                .badge-yellow-sm { @apply badge-sm-base bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400; }
                .badge-red-sm { @apply badge-sm-base bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-400; }
                .input-style { @apply border border-gray-300 dark:border-slate-600 p-3.5 rounded-xl w-full dark:bg-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-base shadow-md; }
                .label-style { @apply block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2; }
                .modal-button-secondary { @apply px-7 py-3.5 bg-gradient-to-r from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-700 rounded-xl font-bold hover:from-neutral-400 hover:to-neutral-500 dark:hover:from-neutral-700 dark:hover:to-neutral-800 text-base disabled:opacity-50 shadow-lg; }
                .modal-button-primary { @apply px-7 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-bold hover:from-sky-600 hover:to-sky-700 text-base disabled:opacity-50 shadow-lg; }
                .button-primary { @apply bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-xl transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed; }
            `}</style>
        </div>
    );
}
// src/pages/SupplierAddQuickTour.jsx
// (NÂNG CẤP: Xóa bỏ logic 'inventory' cũ)

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { TOURS } from "../data/tours";
import { FaPlus, FaCheckCircle, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import toast from "react-hot-toast"; // (MỚI) Dùng toast thay vì alert

const supabase = getSupabase();

// --- Hàm format tiền tệ ---
const formatCurrency = (number) => {
    if (typeof number !== "number" || isNaN(number)) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(number);
};

// --- Component con Loading ---
const LoadingComponent = () => (
    <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
    </div>
);

export default function SupplierAddQuickTour() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [localTours, setLocalTours] = useState(TOURS); 
    const [addingStatus, setAddingStatus] = useState({}); 
    const [loadingData, setLoadingData] = useState(true); 
    const [dbTourCodes, setDbTourCodes] = useState(new Set());
    const [loggedInSupplierId, setLoggedInSupplierId] = useState(null); 

    const fetchData = useCallback(async () => {
        if (!user) {
            setLoadingData(false);
            return;
        }
        setLoadingData(true);
        setLoggedInSupplierId(null); 

        try { 
            const [productRes, supplierRes] = await Promise.all([
                supabase.from('Products').select('tour_code').eq('product_type', 'tour'),
                supabase.from('Suppliers').select('id').eq('user_id', user.id).maybeSingle()
            ]);

            if (productRes.error) {
                console.error('Lỗi fetch existing tour codes:', productRes.error);
            } else if (productRes.data) {
                setDbTourCodes(new Set(productRes.data.map(p => p.tour_code)));
            }

            if (supplierRes.error) {
                console.error('Lỗi fetch supplier ID for user:', supplierRes.error);
                toast.error("Lỗi: Không tìm thấy thông tin Nhà cung cấp của bạn.");
                setLoggedInSupplierId(null);
            } else if (supplierRes.data) {
                setLoggedInSupplierId(supplierRes.data.id);
            } else {
                 toast.error("Lỗi: Tài khoản của bạn chưa được liên kết với Nhà cung cấp.");
                 setLoggedInSupplierId(null);
            }
        } catch (err) {
            console.error("Lỗi fetch data:", err);
            toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hàm xử lý thêm tour
    const handleAddTour = async (tourToAdd) => {
        const tourCode = String(tourToAdd.id);

        if (!user || !loggedInSupplierId) {
            toast.error("Lỗi: Không thể xác định Nhà cung cấp. Vui lòng đăng nhập lại.");
            return;
        }

        if (dbTourCodes.has(tourCode)) {
           setAddingStatus((prev) => ({ ...prev, [tourCode]: 'exists' }));
           return;
        }

        setAddingStatus((prev) => ({ ...prev, [tourCode]: 'adding' }));

        // (SỬA) Xóa bỏ 'inventory' vì đã lỗi thời
        // Slots bây giờ được quản lý bằng bảng 'Departures'
        const productData = {
            name: tourToAdd.title,
            tour_code: tourCode,
            price: tourToAdd.price || 0,
            // inventory: tourToAdd.inventory || 10, // <-- (ĐÃ XÓA)
            product_type: 'tour',
            supplier_id: loggedInSupplierId,
            approval_status: 'pending', // Chờ Admin duyệt
            image_url: tourToAdd.image,
            description: tourToAdd.description,
            duration: tourToAdd.duration,
            location: tourToAdd.location,
            rating: tourToAdd.rating,
            galleryImages: tourToAdd.galleryImages,
            itinerary: tourToAdd.itinerary?.map(day => `${day.day}: ${day.description}`),
        };

        const { error: insertError } = await supabase
            .from('Products')
            .insert(productData);

        if (insertError) {
            console.error('Lỗi insert tour:', insertError);
            setAddingStatus((prev) => ({ ...prev, [tourCode]: 'error' }));
             if (insertError.code === '23505') {
                 toast.error(`Lỗi: Mã Tour "${tourCode}" đã tồn tại.`);
                 setAddingStatus((prev) => ({ ...prev, [tourCode]: 'exists' }));
                 setDbTourCodes(prev => new Set(prev).add(tourCode));
             } else {
                 toast.error(`Lỗi khi thêm tour: ${insertError.message}`);
             }
        } else {
            setAddingStatus((prev) => ({ ...prev, [tourCode]: 'added' }));
            setDbTourCodes(prev => new Set(prev).add(tourCode));
            toast.success(`Đã thêm tour "${tourToAdd.title}"!\nTour đang chờ Admin phê duyệt.`);
        }
    };

    // --- RENDER ---

     if (!user) {
         return (
             <div className="p-6 text-center text-red-500 dark:text-red-400">
                 Vui lòng <Link to="/login" className="underline font-bold text-sky-600 dark:text-sky-400">đăng nhập</Link> với tài khoản Nhà cung cấp để sử dụng chức năng này.
             </div>
         );
     }
     if (loadingData) {
         return <LoadingComponent />;
     }
     if (!loggedInSupplierId) {
          return (
             <div className="p-6 text-center text-red-500 dark:text-red-400">
                 Lỗi: Không tìm thấy thông tin Nhà cung cấp liên kết với tài khoản của bạn. Vui lòng liên hệ Admin để được hỗ trợ.
             </div>
          );
     }


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Thêm Nhanh Tour Mẫu
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-400 mb-8">
                Chọn các tour mẫu có sẵn dưới đây để thêm vào danh mục sản phẩm của bạn. Các tour mới sẽ cần được Admin phê duyệt.
                <br/>
                <span className="font-semibold text-sky-600 dark:text-sky-400">Lưu ý:</span> Sau khi thêm, bạn cần vào "Quản lý Tour" để thêm Lịch khởi hành và Slots cho tour.
            </p>

            <div className="bg-white dark:bg-neutral-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {localTours.map((tour) => {
                        const tourCodeString = String(tour.id);
                        let status = addingStatus[tourCodeString] || 'idle';
                        if (status === 'idle' && dbTourCodes.has(tourCodeString)) {
                             status = 'exists';
                        }

                        return (
                            <li key={tour.id} className={`px-6 py-4 flex items-center justify-between transition-colors duration-200 ${status === 'added' ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-neutral-700/50'}`}>
                                <div className="flex items-center space-x-4 min-w-0 flex-1 mr-4">
                                    <img
                                        src={tour.image || 'https://placehold.co/80x80/eee/ccc?text=Img'}
                                        alt={tour.title}
                                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 shadow-sm"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{tour.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Mã: {tour.id}</p>
                                        <p className="text-sm text-red-600 font-medium">{formatCurrency(tour.price)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                                    {status === 'idle' && (
                                        <button
                                            onClick={() => handleAddTour(tour)}
                                            className="p-3 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all transform hover:scale-110"
                                            title="Thêm tour này (chờ duyệt)"
                                        >
                                            <FaPlus size={16} />
                                        </button>
                                    )}
                                    {status === 'adding' && (
                                        <FaSpinner className="animate-spin text-sky-500 text-2xl" />
                                    )}
                                    {status === 'added' && (
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
                                             <FaCheckCircle size={18}/>
                                             <span>Đã thêm</span>
                                        </div>
                                    )}
                                    {status === 'exists' && (
                                        <span className="text-sm text-gray-400 dark:text-gray-500 italic" title="Tour này đã tồn tại trong hệ thống">Đã tồn tại</span>
                                    )}
                                    {status === 'error' && (
                                        <button onClick={() => handleAddTour(tour)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30" title="Lỗi! Bấm để thử lại">
                                            <FaExclamationCircle size={18}/>
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
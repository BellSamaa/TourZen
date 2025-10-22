// src/pages/SupplierAddQuickTour.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
// 👇 1. Import dữ liệu tour mẫu (Đảm bảo đường dẫn và tên biến đúng) 👇
import { TOURS } from "../data/tours"; // Sửa lại tên file nếu cần
import { FaPlus, FaCheckCircle, FaSpinner, FaExclamationCircle } from "react-icons/fa";

const supabase = getSupabase();

// --- Component con Loading ---
const LoadingComponent = () => (
    <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
    </div>
);

export default function SupplierAddQuickTour() {
    const navigate = useNavigate();
    const { user } = useAuth(); // Lấy user đang đăng nhập
    const [localTours, setLocalTours] = useState(TOURS); // Dùng TOURS từ file data
    const [addingStatus, setAddingStatus] = useState({}); // Trạng thái thêm từng tour
    const [loadingData, setLoadingData] = useState(true); // Trạng thái load ban đầu
    const [dbTourCodes, setDbTourCodes] = useState(new Set()); // Mã tour đã có trong DB
    const [loggedInSupplierId, setLoggedInSupplierId] = useState(null); // ID của Supplier này

    // Fetch dữ liệu cần thiết: mã tour đã có VÀ supplier_id của user đang đăng nhập
    const fetchData = useCallback(async () => {
        if (!user) {
            setLoadingData(false);
            return;
        }
        setLoadingData(true);
        setLoggedInSupplierId(null); // Reset supplier ID trước khi fetch

        try { // Thêm try...catch để bắt lỗi
            const [productRes, supplierRes] = await Promise.all([
                supabase.from('Products').select('tour_code').eq('product_type', 'tour'),
                supabase.from('Suppliers').select('id').eq('user_id', user.id).maybeSingle()
            ]);

            // Xử lý product codes
            if (productRes.error) {
                console.error('Lỗi fetch existing tour codes:', productRes.error);
                // Có thể không cần báo lỗi nghiêm trọng ở đây
            } else if (productRes.data) {
                setDbTourCodes(new Set(productRes.data.map(p => p.tour_code)));
            }

            // Xử lý supplier ID
            if (supplierRes.error) {
                console.error('Lỗi fetch supplier ID for user:', supplierRes.error);
                // Không tìm thấy NCC liên kết -> Báo lỗi quan trọng
                alert("Lỗi: Không tìm thấy thông tin Nhà cung cấp liên kết với tài khoản của bạn. Vui lòng liên hệ Admin.");
                setLoggedInSupplierId(null); // Đảm bảo là null
            } else if (supplierRes.data) {
                setLoggedInSupplierId(supplierRes.data.id); // Lưu lại ID
            } else {
                 // Dữ liệu trả về null -> User này chưa liên kết
                 alert("Lỗi: Tài khoản của bạn chưa được liên kết với Nhà cung cấp nào. Vui lòng liên hệ Admin.");
                 setLoggedInSupplierId(null);
            }
        } catch (err) {
            console.error("Lỗi fetch data:", err);
            alert("Đã xảy ra lỗi khi tải dữ liệu cần thiết.");
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Hàm xử lý thêm tour
    const handleAddTour = async (tourToAdd) => {
        const tourCode = String(tourToAdd.id); // Dùng id từ data làm tour_code

        if (!user || !loggedInSupplierId) {
            alert("Lỗi: Không thể xác định Nhà cung cấp. Vui lòng đăng nhập lại hoặc liên hệ Admin.");
            return;
        }

        // Kiểm tra lại lần nữa phòng trường hợp state chưa kịp cập nhật
        if (dbTourCodes.has(tourCode)) {
           setAddingStatus((prev) => ({ ...prev, [tourCode]: 'exists' }));
           return;
        }

        setAddingStatus((prev) => ({ ...prev, [tourCode]: 'adding' }));

        // Chuẩn bị dữ liệu để insert
        const productData = {
            name: tourToAdd.title,
            tour_code: tourCode,
            price: tourToAdd.price || 0,
            inventory: tourToAdd.inventory || 10, // Số lượng tồn kho mặc định
            product_type: 'tour',
            supplier_id: loggedInSupplierId, // ID của NCC đang đăng nhập
            approval_status: 'pending', // Trạng thái chờ duyệt
            image_url: tourToAdd.image,
            description: tourToAdd.description,
            duration: tourToAdd.duration,
            location: tourToAdd.location,
            rating: tourToAdd.rating,
            galleryImages: tourToAdd.galleryImages,
            // Chuyển itinerary sang mảng text (nếu cột itinerary là text[])
            itinerary: tourToAdd.itinerary?.map(day => `${day.day}: ${day.description}`),
        };

        // Thực hiện INSERT
        const { error: insertError } = await supabase
            .from('Products')
            .insert(productData);

        if (insertError) {
            console.error('Lỗi insert tour:', insertError);
            setAddingStatus((prev) => ({ ...prev, [tourCode]: 'error' }));
             if (insertError.code === '23505') {
                 alert(`Lỗi khi thêm tour "${tourToAdd.title}": Mã Tour "${tourCode}" đã tồn tại.`);
                 setAddingStatus((prev) => ({ ...prev, [tourCode]: 'exists' }));
                 setDbTourCodes(prev => new Set(prev).add(tourCode));
             } else {
                 alert(`Lỗi khi thêm tour "${tourToAdd.title}": ${insertError.message}`);
             }
        } else {
            setAddingStatus((prev) => ({ ...prev, [tourCode]: 'added' }));
            setDbTourCodes(prev => new Set(prev).add(tourCode));
            alert(`Đã thêm tour "${tourToAdd.title}" thành công.\nTour đang chờ Admin phê duyệt.`);
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
     // Quan trọng: Kiểm tra lại loggedInSupplierId sau khi loading xong
     if (!loggedInSupplierId) {
          return (
             <div className="p-6 text-center text-red-500 dark:text-red-400">
                 Lỗi: Không tìm thấy thông tin Nhà cung cấp liên kết với tài khoản của bạn. Vui lòng liên hệ Admin để được hỗ trợ.
             </div>
          );
     }


    return (
        <div className="p-6 max-w-4xl mx-auto"> {/* Thêm max-w */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Thêm Nhanh Tour Mẫu
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-400 mb-8"> {/* Tăng cỡ chữ, mb */}
                Chọn các tour mẫu có sẵn dưới đây để thêm vào danh mục sản phẩm của bạn. Các tour mới sẽ cần được Admin phê duyệt trước khi hiển thị công khai.
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
                                <div className="flex items-center space-x-4 min-w-0 flex-1 mr-4"> {/* Thêm flex-1, mr-4 */}
                                    <img
                                        src={tour.image || 'https://placehold.co/80x80/eee/ccc?text=Img'} // Ảnh lớn hơn
                                        alt={tour.title}
                                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 shadow-sm" // Tăng kích thước, thêm shadow
                                    />
                                    <div className="min-w-0">
                                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{tour.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Mã: {tour.id}</p>
                                        <p className="text-sm text-red-600 font-medium">{formatCurrency(tour.price)}</p> {/* Hiển thị giá */}
                                    </div>
                                </div>

                                {/* Nút Thêm và Trạng thái */}
                                <div className="flex items-center space-x-3 flex-shrink-0 ml-4"> {/* Tăng space */}
                                    {status === 'idle' && (
                                        <button
                                            onClick={() => handleAddTour(tour)}
                                            className="p-3 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all transform hover:scale-110" // Nút to hơn, hiệu ứng
                                            title="Thêm tour này (chờ duyệt)"
                                        >
                                            <FaPlus size={16} />
                                        </button>
                                    )}
                                    {status === 'adding' && (
                                        <FaSpinner className="animate-spin text-sky-500 text-2xl" /> // Icon to hơn
                                    )}
                                    {status === 'added' && (
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium"> {/* Style đẹp hơn */}
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
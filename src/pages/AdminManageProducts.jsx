// src/pages/AdminManageProducts.jsx
// (NÂNG CẤP GIAO DIỆN V2: Thêm Card View, Slot Summary cho Admin)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from 'react-router-dom';
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaSpinner, FaSyncAlt, FaThList, FaThLarge, FaImage } from "react-icons/fa"; // Giữ lại icon cần thiết
import { 
    CheckSquare, Package, CaretLeft, CaretRight, CircleNotch, X, MagnifyingGlass, CalendarPlus, 
    PencilLine, UploadSimple, WarningCircle, CheckCircle, Clock, XCircle, Ticket, Triangle, // Icons Phosphor
    Trash // Thêm Trash từ Phosphor
} from "@phosphor-icons/react";

const supabase = getSupabase();

// --- Hook Debounce (Giữ nguyên) ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Helper Pagination Window (Giữ nguyên) ---
const getPaginationWindow = (currentPage, totalPages, width = 2) => {
  if (totalPages <= 1) return [];
  if (totalPages <= 5 + width * 2) { return Array.from({ length: totalPages }, (_, i) => i + 1); }
  const pages = new Set([1]);
  for (let i = Math.max(2, currentPage - width); i <= Math.min(totalPages - 1, currentPage + width); i++) { pages.add(i); }
  pages.add(totalPages);
  const sortedPages = [...pages].sort((a, b) => a - b);
  const finalPages = []; let lastPage = 0;
  for (const page of sortedPages) { if (lastPage !== 0 && page - lastPage > 1) { finalPages.push("..."); } finalPages.push(page); lastPage = page; }
  return finalPages;
};

// --- (MỚI) Component Trạng thái Phê duyệt (có icon) ---
const ApprovalStatus = ({ status }) => {
  switch (status) {
    case "approved":
      return <span className="badge-green"><CheckCircle weight="bold" /> Đã duyệt</span>;
    case "rejected":
      return <span className="badge-red"><XCircle weight="bold" /> Bị từ chối</span>;
    default:
      return <span className="badge-yellow"><Clock weight="bold" /> Chờ duyệt</span>;
  }
};

// --- (MỚI) Component Tóm tắt Slot ---
const SlotSummary = ({ departures }) => {
    // Kiểm tra departures có phải là mảng không
    if (!Array.isArray(departures)) {
        console.warn("Departures data is not an array:", departures);
        return <span className="badge-gray"><Triangle weight="bold" /> Lỗi slot</span>;
    }
    const today = new Date().toISOString().split('T')[0];
    const upcomingDepartures = useMemo(() => 
        departures.filter(d => d.departure_date >= today),
    [departures, today]);
    
    if (upcomingDepartures.length === 0) {
        return <span className="badge-gray"><Triangle weight="bold" /> Chưa có lịch</span>;
    }
    
    const totalRemaining = upcomingDepartures.reduce((sum, d) => {
        const remaining = (d.max_slots || 0) - (d.booked_slots || 0);
        return sum + Math.max(0, remaining); // Đảm bảo không âm
    }, 0);

    return (
        <span className={totalRemaining > 0 ? "badge-blue" : "badge-red"}>
            <Ticket weight="bold" /> {totalRemaining > 0 ? `Còn ${totalRemaining} chỗ` : 'Hết chỗ'}
            <span className="font-normal opacity-75">({upcomingDepartures.length} lịch)</span>
        </span>
    );
};


// --- Component con DeparturesManager (Giữ nguyên từ code trước) ---
const DeparturesManager = ({ tourId }) => {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRow, setEditingRow] = useState(null); 

    const fetchDepartures = useCallback(async () => {
        setLoading(true); setError(null);
        const { data, error } = await supabase.from("Departures").select("*").eq("product_id", tourId).order("departure_date", { ascending: true });
        if (error) { console.error("Lỗi tải departures:", error); setError(error.message); } 
        else { setDepartures(data || []); } // Ensure data is an array
        setLoading(false);
    }, [tourId]);

    useEffect(() => { fetchDepartures(); }, [fetchDepartures]);

    const handleAddNew = () => { /* ... (giữ nguyên) ... */ };
    const handleEdit = (row) => { /* ... (giữ nguyên) ... */ };
    const handleCancel = () => { /* ... (giữ nguyên) ... */ };
    const handleDelete = async (id) => { /* ... (giữ nguyên) ... */ };
    const handleSave = async () => { /* ... (giữ nguyên) ... */ };
    const handleFormChange = (e) => { /* ... (giữ nguyên) ... */ };

    return ( <div className="border-t pt-4 dark:border-neutral-700 space-y-3"> {/* ... JSX giữ nguyên ... */} </div> );
};


// --- Modal Chỉnh sửa Tour (Giữ nguyên từ code trước) ---
const EditTourModal = ({ tour, onClose, onSuccess, suppliers }) => {
    const [formData, setFormData] = useState({ /* ... αρχικά state ... */ });
    const [loading, setLoading] = useState(false);
    useEffect(() => { /* ... load data ... */ }, [tour]);
    const handleChange = (e) => { /* ... */ };
    const handleItineraryChange = (index, field, value) => { /* ... */ };
    const addItineraryItem = () => { /* ... */ };
    const removeItineraryItem = (index) => { /* ... */ };
    const handleSubmit = async (e) => { /* ... (logic submit giữ nguyên) ... */ };
    
    // (MỚI) Thêm hàm format tiền tệ vào modal này
    const formatCurrency = (num) => { /* ... */ }; 

    return ( <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4"> {/* ... JSX giữ nguyên ... */} </div> );
};


// --- Component chính: Quản lý Sản phẩm (Tour) ---
export default function AdminManageProducts() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [modalTour, setModalTour] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [viewMode, setViewMode] = useState('list'); // Mặc định là list
    const ITEMS_PER_PAGE = viewMode === 'grid' ? 12 : 10; // Số item tùy view
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // --- (SỬA) Fetch data (Thêm Departures) ---
    const fetchProducts = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE; 
            const to = from + ITEMS_PER_PAGE - 1;

            // (SỬA) Đảm bảo lấy đủ các trường cần thiết
            const selectQuery = `
                id, name, price, location, duration, supplier_id,
                approval_status, is_published, created_at,
                description, itinerary, image_url, tour_code,
                supplier:Suppliers(id, name),
                Departures (id, departure_date, max_slots, booked_slots)
            `;

            let query = supabase.from("Products").select(selectQuery, { count: 'exact' })
                            .eq('product_type', 'tour');

            if (debouncedSearch.trim() !== "") {
                const searchTermLike = `%${debouncedSearch.trim()}%`;
                 query = query.or(`name.ilike.${searchTermLike},supplier.name.ilike.${searchTermLike},tour_code.ilike.${searchTermLike}`);
            }
            // Sắp xếp ưu tiên: Chờ duyệt > Chưa đăng > Mới nhất
            query = query.order('approval_status', { ascending: true }) 
                         .order('is_published', { ascending: true })
                         .order("created_at", { ascending: false })
                         .range(from, to);

            const { data, count, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            
            setProducts(data || []); // Đảm bảo data là mảng
            setTotalItems(count || 0);

            if (isInitialLoad && suppliers.length === 0) {
                const { data: sData } = await supabase.from("Suppliers").select("id, name");
                if (sData) setSuppliers(sData);
            }
            // Reset về trang 1 nếu trang hiện tại trống (khi xóa hết item trang cuối)
            if (!isInitialLoad && data?.length === 0 && count > 0 && currentPage > 1) {
                setCurrentPage(1); 
            }
        } catch (err) {
            console.error("Lỗi tải tour:", err);
            setError(err.message || "Đã xảy ra lỗi khi tải tour."); 
            toast.error(`Lỗi tải danh sách tour: ${err.message}`);
            setProducts([]); setTotalItems(0);
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch, suppliers.length, ITEMS_PER_PAGE]); // Thêm ITEMS_PER_PAGE

    // --- (Các hàm handlers giữ nguyên) ---
    useEffect(() => { fetchProducts(true); }, [fetchProducts]); // Load lần đầu
    useEffect(() => { if (currentPage !== 1) { setCurrentPage(1); } }, [debouncedSearch]); // Reset page khi search

    const handleSetStatus = async (id, newStatus) => {
        const actionText = newStatus === 'approved' ? 'Duyệt' : (newStatus === 'rejected' ? 'Từ chối' : 'Đặt lại chờ');
        const confirmMsg = newStatus === 'approved'
            ? `Duyệt tour này? (Tour sẽ cần thêm 1 bước 'Sửa & Đăng' để hiển thị)`
            : `Bạn chắc muốn ${actionText} tour này?`;
        if (!window.confirm(confirmMsg)) return;

        setIsFetchingPage(true);
        const { error } = await supabase.from("Products")
            .update({ approval_status: newStatus, is_published: false }) // Luôn tắt đăng khi đổi status
            .eq("id", id);
        setIsFetchingPage(false);
        if (error) { toast.error("Lỗi: " + error.message); }
        else { toast.success(`Đã ${actionText} tour!`); fetchProducts(false); }
    };
    
    const handleDelete = async (tour) => {
         if (!window.confirm(`XÓA VĨNH VIỄN tour "${tour.name}"?\nTất cả lịch khởi hành và slots của tour này cũng sẽ bị xóa!\nThao tác này không thể hoàn tác!`)) return;
         setIsFetchingPage(true);
         const { error } = await supabase.from("Products").delete().eq("id", tour.id);
         setIsFetchingPage(false);
         if (error) { toast.error("Lỗi xóa: " + error.message); }
         else { toast.success("Đã xóa tour."); fetchProducts(false); }
    };
    
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

    // (MỚI) JSX cho Nút bấm Actions (dùng chung cho Card và List)
    const ActionButtons = ({ product }) => (
        <div className="flex items-center justify-end gap-1 flex-wrap"> {/* Thêm flex-wrap */}
            {product.approval_status === 'pending' && (
                <>
                <button onClick={() => handleSetStatus(product.id, 'approved')} disabled={isFetchingPage} className="button-icon-green" title="Duyệt tour"><CheckSquare weight="bold" size={16}/></button>
                <button onClick={() => handleSetStatus(product.id, 'rejected')} disabled={isFetchingPage} className="button-icon-red" title="Từ chối tour"><XCircle weight="bold" size={16}/></button>
                </>
            )}
            {product.approval_status === 'approved' && !product.is_published && (
                <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-blue text-xs flex items-center gap-1 !px-2.5 !py-1"> <UploadSimple size={14}/> Sửa & Đăng </button>
            )}
            {product.approval_status === 'approved' && ( // Luôn cho sửa nếu đã duyệt
                <button onClick={() => setModalTour(product)} disabled={isFetchingPage} className="button-icon-sky" title="Sửa thông tin & Lịch khởi hành"> <PencilLine weight="bold" size={16}/> </button>
            )}
             {(product.approval_status === 'approved' || product.approval_status === 'rejected') && (
                <button onClick={() => handleSetStatus(product.id, 'pending')} disabled={isFetchingPage} className="button-icon-gray" title="Đặt lại trạng thái chờ duyệt (sẽ ẩn tour)"> ↩️ </button>
             )}
            <button onClick={() => handleDelete(product)} disabled={isFetchingPage} className="button-icon-red" title="Xóa vĩnh viễn tour"> <Trash weight="bold" size={16}/> </button>
        </div>
    );
    
    // (MỚI) JSX cho Card tour
    const TourCard = ({ product }) => (
        <div className="flex flex-col bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border dark:border-slate-700 transition-all duration-300 hover:shadow-xl">
            <div className="relative h-48 w-full flex-shrink-0">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" 
                         onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Error'; }} />
                ) : (
                    <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <FaImage className="text-4xl text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                {/* Overlay trạng thái */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90"></div>
                {/* Badge Trạng thái */}
                <div className="absolute top-2 right-2 z-10"><ApprovalStatus status={product.approval_status} /></div>
                <div className="absolute bottom-2 left-2 z-10"><SlotSummary departures={product.Departures} /></div>
                {/* Badge Đăng bài */}
                {product.approval_status === 'approved' && (
                    <div className="absolute top-2 left-2 z-10">
                        {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 line-clamp-2" title={product.name}>
                    {product.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    NCC: <Link to={`/admin/suppliers?search=${product.supplier?.name}`} className="font-medium hover:underline">{product.supplier?.name || 'N/A'}</Link>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Mã: {product.tour_code || "N/A"}
                </p>
                
                <div className="mt-auto pt-3 border-t dark:border-slate-700">
                    <ActionButtons product={product} />
                </div>
            </div>
        </div>
    );

    // (MỚI) JSX cho List Item
    const TourListItem = ({ product }) => (
        <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-12 w-16 object-cover rounded-md flex-shrink-0" 
                             onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}/>
                    ) : (
                        <div className="h-12 w-16 bg-slate-200 dark:bg-slate-700 flex items-center justify-center rounded-md flex-shrink-0">
                            <FaImage className="text-2xl text-slate-400 dark:text-slate-500" />
                        </div>
                    )}
                    <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{product.tour_code || "N/A"}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                 <Link to={`/admin/suppliers?search=${product.supplier?.name}`} className="link-style hover:text-sky-500" title={`Xem NCC ${product.supplier?.name}`}>
                    {product.supplier?.name || "N/A"}
                 </Link>
            </td>
            <td className="px-6 py-4 text-sm"><SlotSummary departures={product.Departures} /></td>
            <td className="px-6 py-4 text-sm"><ApprovalStatus status={product.approval_status} /></td>
            <td className="px-6 py-4 text-sm">
                {product.is_published ? <span className="badge-blue">Đã đăng</span> : <span className="badge-gray">Chưa đăng</span>}
            </td>
            <td className="px-6 py-4 text-right text-sm">
                <ActionButtons product={product} />
            </td>
        </tr>
    );


    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header + Search + Refresh */}
             <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Package weight="duotone" className="text-sky-600" size={28} />
                    Quản lý Sản phẩm Tour
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                     <div className="relative w-full sm:w-64">
                         <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                         <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên tour, NCC, mã..." className="search-input"/>
                     </div>
                     {/* Nút đổi View */}
                     <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`} title="Xem dạng danh sách"><FaThList /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow' : 'text-slate-600 dark:text-slate-300'}`} title="Xem dạng lưới"><FaThLarge /></button>
                     </div>
                     <button onClick={() => fetchProducts(true)} disabled={loading || isFetchingPage} className={`button-secondary flex items-center gap-2 flex-shrink-0 ${isFetchingPage ? 'opacity-50 cursor-not-allowed' : ''}`}> <FaSyncAlt className={isFetchingPage ? "animate-spin" : ""} /> Làm mới </button>
                </div>
            </div>

            {/* Hiển thị Grid hoặc List */}
            {loading ? (
                <div className="flex justify-center items-center h-[calc(100vh-250px)]">
                    <CircleNotch size={48} className="animate-spin text-sky-500" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">{error}</div>
            ) : products.length === 0 ? (
                 <div className="text-center py-20 text-gray-500 dark:text-gray-400 italic">
                    {debouncedSearch ? "Không tìm thấy tour nào khớp." : "Chưa có tour nào."}
                 </div>
            ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <TourCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                // List View (Table)
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                    <div className="overflow-x-auto relative">
                        {isFetchingPage && ( <div className="loading-overlay"> <CircleNotch size={32} className="animate-spin text-sky-500" /> </div> )}
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="th-style">Tên Tour</th>
                                    <th className="th-style">Nhà Cung Cấp</th>
                                    <th className="th-style">Tồn kho (Slots)</th>
                                    <th className="th-style">Trạng thái Duyệt</th>
                                    <th className="th-style">Trạng thái Đăng</th>
                                    <th className="th-style text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {products.map((product) => (
                                    <TourListItem key={product.id} product={product} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Pagination UI (Giữ nguyên) */}
             {!loading && totalItems > ITEMS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                      <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> tours </div>
                      <div className="flex items-center gap-1 mt-3 sm:mt-0">
                          {/* ... (JSX Pagination giữ nguyên) ... */}
                      </div>
                  </div>
             )}

            {/* Modal Edit (Giữ nguyên) */}
            {modalTour && ( <EditTourModal tour={modalTour} onClose={() => setModalTour(null)} onSuccess={() => fetchProducts(false)} suppliers={suppliers} /> )}

            {/* (MỚI) Thêm CSS cho các Badge và Nút */}
            <style jsx>{`
                /* (CSS cơ bản giữ nguyên) */
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .link-style { @apply hover:underline; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                
                /* (CSS trong Modal giữ nguyên) */
                .input-style { @apply border border-gray-300 p-2 rounded-md w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 text-sm; }
                .label-style { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
                .modal-button-secondary { @apply px-4 py-2 bg-neutral-200 dark:bg-neutral-600 rounded-md font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-500 dark:text-neutral-100 text-sm disabled:opacity-50; }
                .modal-button-primary { @apply px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors duration-200 text-sm disabled:opacity-50; }
                
                /* (MỚI) Badge & Nút bấm */
                .badge-base { @apply px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 whitespace-nowrap; }
                .badge-green { @apply badge-base bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300; }
                .badge-yellow { @apply badge-base bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300; }
                .badge-red { @apply badge-base bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300; }
                .badge-blue { @apply badge-base bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300; }
                .badge-gray { @apply badge-base bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 italic; }
                
                .button-icon-base { @apply p-1.5 rounded-full w-7 h-7 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed; }
                .button-icon-green { @apply button-icon-base text-green-500 hover:bg-green-100 hover:text-green-600 dark:text-green-400 dark:hover:bg-green-900/30 focus:ring-green-400; }
                .button-icon-red { @apply button-icon-base text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 focus:ring-red-400; }
                .button-icon-sky { @apply button-icon-base text-sky-500 hover:bg-sky-100 hover:text-sky-600 dark:text-sky-400 dark:hover:bg-sky-900/30 focus:ring-sky-400; }
                .button-icon-gray { @apply button-icon-base text-gray-500 hover:bg-gray-200 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 focus:ring-gray-300; }
                
                .button-blue { @apply px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed; }
            `}</style>
        </div>
    );
}
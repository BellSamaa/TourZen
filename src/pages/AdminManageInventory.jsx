// src/pages/AdminManageInventory.jsx
// (MỚI) Trang quản lý tồn kho (slots) của tất cả tour

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { FaSpinner, FaSyncAlt } from "react-icons/fa";
import { 
    Stack, // Icon cho Tồn kho
    MagnifyingGlass, 
    CaretLeft, 
    CaretRight,
    CalendarBlank
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
  // (Copy y hệt từ file AdminManageProducts)
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

// --- Component chính: Quản lý Tồn Kho ---
export default function AdminManageInventory() {
    const [departures, setDepartures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingPage, setIsFetchingPage] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("upcoming"); // 'upcoming', 'all', 'past'
    const debouncedSearch = useDebounce(searchTerm, 400);
    const ITEMS_PER_PAGE = 15;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // --- Fetch data (Lịch khởi hành) ---
    const fetchInventory = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsFetchingPage(true); setError(null);
        try {
            const from = (currentPage - 1) * ITEMS_PER_PAGE; const to = from + ITEMS_PER_PAGE - 1;

            // Query: Lấy lịch khởi hành, join với Bảng Products
            const selectQuery = `
                id, 
                departure_date,
                adult_price,
                max_slots,
                booked_slots,
                product:Products(id, name)
            `;

            let query = supabase.from("Departures").select(selectQuery, { count: 'exact' });

            // Lọc theo thời gian
            const today = new Date().toISOString().split('T')[0];
            if (filter === "upcoming") {
                query = query.gte('departure_date', today); // Lớn hơn hoặc bằng hôm nay
            } else if (filter === "past") {
                query = query.lt('departure_date', today); // Nhỏ hơn hôm nay
            }
            // 'all' thì không lọc

            // Tìm kiếm
            if (debouncedSearch.trim() !== "") {
                const searchTermLike = `%${debouncedSearch.trim()}%`;
                 query = query.ilike('product.name', searchTermLike); // Chỉ tìm theo tên tour
            }
            
            // Sắp xếp: tour sắp diễn ra lên đầu
            query = query.order("departure_date", { ascending: filter !== 'past' }).range(from, to);

            const { data, count, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            setDepartures(data || []);
            setTotalItems(count || 0);

            if (!isInitialLoad && data.length === 0 && count > 0 && currentPage > 1) {
                setCurrentPage(1); // Reset về trang 1 nếu trang hiện tại không còn data
            }
        } catch (err) {
            console.error("Lỗi tải tồn kho:", err);
            setError(err); 
            toast.error(`Lỗi tải danh sách tồn kho: ${err.message}`);
            setDepartures([]); setTotalItems(0);
        } finally {
            if (isInitialLoad) setLoading(false);
            setIsFetchingPage(false);
        }
    }, [currentPage, debouncedSearch, filter]); // Dependencies

    // --- Trigger fetch ---
    useEffect(() => { const isInitial = departures.length === 0 && loading; fetchInventory(isInitial); }, [fetchInventory, departures.length, loading]);

    // --- Reset page on search/filter ---
    useEffect(() => { if (currentPage !== 1) { setCurrentPage(1); } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, filter]);
    
    // --- Pagination Window ---
    const paginationWindow = useMemo(() => getPaginationWindow(currentPage, totalPages, 2), [currentPage, totalPages]);

     // --- Loading ban đầu ---
     if (loading) { return ( <div className="flex justify-center items-center h-[calc(100vh-150px)]"> <FaSpinner className="animate-spin text-4xl text-sky-500" /> </div> ); }

    // --- JSX ---
    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen dark:bg-slate-900 dark:text-white">
            {/* Header + Search + Filter */}
             <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Stack weight="duotone" className="text-sky-600" size={28} />
                    Quản lý Tồn kho (Slots)
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                     {/* Filter Thời gian */}
                     <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="search-input !pl-3"
                    >
                         <option value="upcoming">Tour sắp khởi hành</option>
                         <option value="past">Tour đã qua</option>
                         <option value="all">Tất cả tour</option>
                     </select>
                     {/* Search */}
                     <div className="relative w-full sm:w-64">
                         <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                         <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm tên tour..." className="search-input"/>
                     </div>
                     <button onClick={() => fetchInventory(true)} disabled={loading || isFetchingPage} className={`button-secondary flex items-center gap-2 flex-shrink-0 ${isFetchingPage ? 'opacity-50 cursor-not-allowed' : ''}`}> <FaSyncAlt className={isFetchingPage ? "animate-spin" : ""} /> Làm mới </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
             <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                <div className="overflow-x-auto relative">
                    {isFetchingPage && ( <div className="loading-overlay"> <FaSpinner className="animate-spin text-sky-500 text-3xl" /> </div> )}
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="th-style">Tên Tour</th>
                                <th className="th-style">Ngày khởi hành</th>
                                <th className="th-style text-right">Giá Người lớn</th>
                                <th className="th-style text-right">Tổng chỗ</th>
                                <th className="th-style text-right">Đã đặt</th>
                                <th className="th-style text-right">Còn lại</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                             {error && !isFetchingPage && ( <tr><td colSpan="6" className="td-center text-red-500">{`Lỗi: ${error.message}`}</td></tr> )}
                             {!error && loading && departures.length === 0 && ( <tr><td colSpan="6" className="td-center"><FaSpinner className="animate-spin text-2xl mx-auto text-sky-500" /></td></tr> )}
                             {!error && !loading && !isFetchingPage && departures.length === 0 && ( <tr><td colSpan="6" className="td-center text-gray-500 italic">{debouncedSearch || filter !== 'all' ? "Không tìm thấy lịch khởi hành." : "Chưa có lịch khởi hành."}</td></tr> )}
                             
                             {!error && departures.map((dep) => {
                                const remaining = dep.max_slots - dep.booked_slots;
                                return (
                                    <tr key={dep.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <td className="td-style font-medium dark:text-white">{dep.product?.name || "Lỗi: Không tìm thấy tour"}</td>
                                        <td className="td-style font-mono text-gray-700 dark:text-gray-300">{dep.departure_date}</td>
                                        <td className="td-style text-right text-gray-800 dark:text-gray-200">{dep.adult_price?.toLocaleString('vi-VN')}</td>
                                        <td className="td-style text-right font-medium">{dep.max_slots}</td>
                                        <td className="td-style text-right font-medium">{dep.booked_slots}</td>
                                        <td className={`td-style text-right font-bold ${remaining <= 0 ? 'text-red-500' : (remaining <= 5 ? 'text-yellow-600' : 'text-green-600')}`}>
                                            {remaining}
                                        </td>
                                    </tr>
                                );
                             })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI (Giữ nguyên) */}
             {!loading && totalItems > ITEMS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                      <div> Hiển thị <span className="font-semibold dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> / <span className="font-semibold dark:text-white">{totalItems}</span> lịch </div>
                      <div className="flex items-center gap-1 mt-3 sm:mt-0">
                          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1 || isFetchingPage} className="pagination-arrow" aria-label="Trang trước"><CaretLeft weight="bold" /></button>
                          {paginationWindow.map((pageNumber, idx) => pageNumber === "..." ? ( <span key={`dots-${idx}`} className="pagination-dots">...</span> ) : (
                              <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} disabled={isFetchingPage} className={`pagination-number ${ currentPage === pageNumber ? "pagination-active" : "" }`}>{pageNumber}</button>
                          ))}
                          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || isFetchingPage} className="pagination-arrow" aria-label="Trang sau"><CaretRight weight="bold" /></button>
                      </div>
                  </div>
             )}
            
            {/* CSS (Copy từ AdminManageProducts.jsx) */}
            <style jsx>{`
                /* (Toàn bộ CSS giống hệt file AdminManageProducts.jsx) */
                .loading-overlay { @apply absolute inset-0 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center z-10; }
                .search-input { @apply w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-sky-400 outline-none transition disabled:opacity-50; }
                .th-style { @apply px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap; }
                .td-style { @apply px-6 py-4 text-sm whitespace-nowrap; }
                .td-center { @apply px-6 py-10 text-center; }
                .button-secondary { @apply bg-slate-200 hover:bg-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-slate-800 dark:text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-arrow { @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
                .pagination-number { @apply w-8 h-8 rounded-md font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed; }
                .pagination-active { @apply bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-600; }
                .pagination-dots { @apply px-2 py-1 text-gray-500 dark:text-gray-400; }
            `}</style>
        </div>
    );
}
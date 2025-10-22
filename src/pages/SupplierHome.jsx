// src/pages/SupplierHome.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from 'react-router-dom';
import { FaSpinner, FaBoxOpen, FaCheckCircle, FaClock, FaTimesCircle, FaUmbrellaBeach, FaCar, FaPlane, FaHotel } from "react-icons/fa";

const supabase = getSupabase();

// --- Helper: Lấy Icon cho Sản phẩm ---
const ProductIcon = ({ type, size = 18 }) => {
    switch (type) {
        case 'hotel': return <FaHotel className="text-blue-500" size={size} />;
        case 'flight': return <FaPlane className="text-indigo-500" size={size} />;
        case 'transport': return <FaCar className="text-orange-500" size={size} />;
        case 'tour':
        default: return <FaUmbrellaBeach className="text-teal-500" size={size} />;
    }
};

// --- Helper: Badge Trạng thái ---
const ApprovalBadge = ({ status }) => {
    switch (status) {
        case "approved": return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
        case "rejected": return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Bị từ chối</span>;
        default: return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
    }
};

// --- Helper: Card Thống kê ---
const StatCard = ({ title, value, icon, loading }) => (
    <div className="p-5 rounded-lg shadow-md bg-white dark:bg-neutral-800 border dark:border-neutral-700">
        <div className="flex justify-between items-center">
            <div className="flex-shrink-0">{icon}</div>
            {loading ? (
                <FaSpinner className="animate-spin text-2xl text-gray-400" />
            ) : (
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
            )}
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{title}</p>
    </div>
);

// --- Component Chính ---
export default function SupplierHome() {
    const { user } = useAuth();
    const [supplierId, setSupplierId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [recentProducts, setRecentProducts] = useState([]);
    
    // 1. Lấy supplierId từ user.id
    useEffect(() => {
        if (!user) return;
        
        const fetchSupplierId = async () => {
            const { data, error } = await supabase
                .from('Suppliers')
                .select('id')
                .eq('user_id', user.id)
                .single();
            
            if (error) {
                console.error("Lỗi liên kết nhà cung cấp:", error);
            } else if (data) {
                setSupplierId(data.id);
            }
        };
        fetchSupplierId();
    }, [user]);

    // 2. Tải dữ liệu thống kê (KPIs) và Hoạt động mới
    const fetchDashboardData = useCallback(async () => {
        if (!supplierId) return; // Chỉ chạy khi có supplierId

        setLoading(true);
        try {
            // Lấy song song 2 luồng dữ liệu
            const [statsPromise, recentPromise] = await Promise.all([
                // Lấy TẤT CẢ trạng thái sản phẩm của NCC này để đếm
                supabase
                    .from('Products')
                    .select('approval_status')
                    .eq('supplier_id', supplierId),
                
                // Lấy 5 SẢN PHẨM MỚI NHẤT của NCC này (theo yêu cầu "thêm vào")
                supabase
                    .from('Products')
                    .select('*')
                    .eq('supplier_id', supplierId)
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            // Xử lý dữ liệu Thống kê
            if (statsPromise.error) throw statsPromise.error;
            const allProducts = statsPromise.data || [];
            
            const newStats = {
                total: allProducts.length,
                approved: allProducts.filter(p => p.approval_status === 'approved').length,
                pending: allProducts.filter(p => p.approval_status === 'pending').length,
                rejected: allProducts.filter(p => p.approval_status === 'rejected').length
            };
            setStats(newStats);

            // Xử lý Hoạt động Mới
            if (recentPromise.error) throw recentPromise.error;
            setRecentProducts(recentPromise.data || []);

        } catch (error) {
            console.error("Lỗi tải dữ liệu Supplier Dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, [supplierId]);

    // 3. Kích hoạt tải dữ liệu khi supplierId thay đổi
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Tổng quan Nhà cung cấp
            </h1>

            {/* === 1. Các thẻ KPIs (Thống kê) === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Tổng sản phẩm"
                    value={stats.total}
                    icon={<FaBoxOpen size={24} className="text-blue-500" />}
                    loading={loading}
                />
                <StatCard
                    title="Đã được duyệt"
                    value={stats.approved}
                    icon={<FaCheckCircle size={24} className="text-green-500" />}
                    loading={loading}
                />
                <StatCard
                    title="Đang chờ duyệt"
                    value={stats.pending}
                    icon={<FaClock size={24} className="text-yellow-500" />}
                    loading={loading}
                />
                <StatCard
                    title="Bị từ chối"
                    value={stats.rejected}
                    icon={<FaTimesCircle size={24} className="text-red-500" />}
                    loading={loading}
                />
            </div>

            {/* === 2. Hoạt động mới (Các sản phẩm vừa thêm) === */}
            <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg border dark:border-neutral-700">
                <div className="p-5 border-b border-gray-200 dark:border-neutral-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Hoạt động mới
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Các dịch vụ bạn vừa thêm gần đây.
                    </p>
                </div>
                
                {loading && recentProducts.length === 0 ? (
                    <div className="p-10 text-center"><FaSpinner className="animate-spin text-2xl mx-auto text-gray-400" /></div>
                ) : recentProducts.length === 0 ? (
                     <p className="text-center text-gray-500 italic py-10">Bạn chưa thêm sản phẩm nào.</p>
                ) : (
                    <div className="flow-root">
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-neutral-700">
                            {recentProducts.map(product => (
                                <li key={product.id} className="p-5 flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <span className="h-10 w-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center">
                                            <ProductIcon type={product.product_type} />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Loại: {product.product_type}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <ApprovalBadge status={product.approval_status} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 <div className="p-4 text-center bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
                    <Link to="/supplier/add-quick-tour" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                        Thêm Tour nhanh &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
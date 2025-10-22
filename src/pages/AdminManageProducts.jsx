import React, { useEffect, useState } from 'react';
import { getSupabase } from "../lib/supabaseClient";
import { SpinnerGap, CheckCircle, XCircle, MagnifyingGlass } from '@phosphor-icons/react';

export default function AdminManageProducts() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // --- Lấy dữ liệu ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('Products').select('*');

      if (filter !== 'all') query = query.eq('category', filter);
      if (search) query = query.ilike('product_name', `%${search}%`);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) console.error('Lỗi khi lấy dữ liệu:', error);
      else setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [filter, search, refresh]);

  // --- Duyệt sản phẩm ---
  const approveProduct = async (id, status) => {
    const { error } = await supabase
      .from('Products')
      .update({ approval_status: status })
      .eq('id', id);
    if (error) {
      alert('Lỗi khi cập nhật trạng thái!');
      console.error(error);
    } else {
      setRefresh(!refresh);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Tiêu đề --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Quản lý Sản phẩm
        </h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          />
          <MagnifyingGlass size={20} className="text-slate-500" />
        </div>
      </div>

      {/* --- Bộ lọc loại sản phẩm --- */}
      <div className="flex flex-wrap gap-2">
        {['all', 'tour', 'hotel', 'flight', 'car'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              filter === cat
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat === 'all' ? 'Tất cả' :
             cat === 'tour' ? 'Tour' :
             cat === 'hotel' ? 'Khách sạn' :
             cat === 'flight' ? 'Chuyến bay' : 'Xe'}
          </button>
        ))}
      </div>

      {/* --- Bảng sản phẩm --- */}
      <div className="bg-white dark:bg-slate-900 shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Tên sản phẩm</th>
              <th className="px-4 py-3 text-left">Loại</th>
              <th className="px-4 py-3 text-left">Điểm đến</th>
              <th className="px-4 py-3 text-left">Ngày bắt đầu</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  <SpinnerGap size={24} className="animate-spin inline-block mr-2" />
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  Không có sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <td className="px-4 py-3">{p.product_name}</td>
                  <td className="px-4 py-3 capitalize">{p.category || '-'}</td>
                  <td className="px-4 py-3">{p.destination || '-'}</td>
                  <td className="px-4 py-3">{p.start_date || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        p.approval_status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : p.approval_status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {p.approval_status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => approveProduct(p.id, 'approved')}
                      className="text-green-600 hover:text-green-800"
                      title="Duyệt"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => approveProduct(p.id, 'rejected')}
                      className="text-red-500 hover:text-red-700"
                      title="Từ chối"
                    >
                      <XCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

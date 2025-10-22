// src/pages/ManageCustomers.jsx
import React, { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";
// --- Đổi sang icon Phosphor (nếu bạn đã cài @phosphor-icons/react) ---
// import { Spinner, Users, UserGear, Buildings, Trash } from "@phosphor-icons/react";
// Hoặc giữ lại react-icons
import { FaSpinner, FaUsers, FaUserCog, FaBuilding, FaTrash } from "react-icons/fa";
import { UserList } from "@phosphor-icons/react"; // Dùng icon tiêu đề

const supabase = getSupabase();

// --- Helper lấy icon và màu cho Role ---
const getRoleStyle = (role) => {
    switch (role) {
        case 'admin':
            // return { icon: <UserGear size={18} className="text-red-500 flex-shrink-0" />, color: "text-red-600 dark:text-red-400 font-semibold" };
            return { icon: <FaUserCog className="text-red-500 flex-shrink-0" />, color: "text-red-600 dark:text-red-400 font-semibold" };
        case 'supplier':
            // return { icon: <Buildings size={18} className="text-blue-500 flex-shrink-0" />, color: "text-blue-600 dark:text-blue-400 font-semibold" };
            return { icon: <FaBuilding className="text-blue-500 flex-shrink-0" />, color: "text-blue-600 dark:text-blue-400 font-semibold" };
        case 'user':
        default:
            // return { icon: <Users size={18} className="text-green-500 flex-shrink-0" />, color: "text-green-600 dark:text-green-400" };
            return { icon: <FaUsers className="text-green-500 flex-shrink-0" />, color: "text-green-600 dark:text-green-400" };
    }
};


export default function ManageCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm fetch dữ liệu khách hàng
    async function fetchCustomers() {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase.from("Users")
                                        .select("*")
                                        .order('full_name', { ascending: true });

        if (fetchError) {
            console.error("Lỗi fetch khách hàng:", fetchError);
            setError("Không thể tải danh sách khách hàng: " + fetchError.message);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Hàm thay đổi vai trò (có xác nhận)
    const handleRoleChange = async (customerId, currentRole, newRole) => {
        // Không cho phép đổi vai trò của chính mình (nếu cần)
        // const { data: { user } } = await supabase.auth.getUser();
        // if (user && user.id === customerId) {
        //     alert("Bạn không thể thay đổi vai trò của chính mình.");
        //     // Reset select box
        //     setCustomers(customers.map((cust) => cust.id === customerId ? { ...cust, role: currentRole } : cust));
        //     return;
        // }


        if (!window.confirm(`Bạn có chắc muốn đổi vai trò của người dùng này từ '${currentRole}' thành '${newRole}'?`)) {
            // Nếu hủy, reset lại select box về giá trị cũ (quan trọng!)
             setCustomers(customers.map((cust) => cust.id === customerId ? { ...cust, role: currentRole } : cust));
             return;
        }

        // Cập nhật state trước để UI phản hồi nhanh
        setCustomers(customers.map((cust) => cust.id === customerId ? { ...cust, role: newRole } : cust));


        const { error } = await supabase
            .from("Users")
            .update({ role: newRole })
            .eq("id", customerId);

        if (error) {
            alert("Lỗi cập nhật vai trò: " + error.message);
            // Nếu lỗi, rollback state và fetch lại
            setCustomers(customers.map((cust) => cust.id === customerId ? { ...cust, role: currentRole } : cust)); // Rollback
            fetchCustomers(); // Fetch lại cho chắc
        } else {
             alert("Cập nhật vai trò thành công!");
             // State đã được cập nhật trước đó
        }

        // Gợi ý: Kiểm tra liên kết Supplier
        if (newRole === 'supplier') {
            const { data: supplierLink, error: checkError } = await supabase
                .from('Suppliers')
                .select('id')
                .eq('user_id', customerId)
                .maybeSingle(); // Lấy 0 hoặc 1

            if (!checkError && !supplierLink) {
                 alert(`Lưu ý: Người dùng này đã được gán vai trò Supplier, nhưng chưa được liên kết với hồ sơ Nhà cung cấp nào. Bạn cần vào mục "Đối tác (Nhà Cung Cấp)" để tạo hoặc cập nhật liên kết.`);
            }
        }
    };

    // Hàm xử lý xóa user (Cơ bản - chỉ xóa profile)
    const handleDeleteUser = async (userId, userName) => {
         if (!window.confirm(`XÓA HỒ SƠ NGƯỜI DÙNG?\nBạn có chắc muốn xóa hồ sơ của "${userName}"? \n(Lưu ý: Hành động này chỉ xóa thông tin profile, không xóa tài khoản đăng nhập. Để xóa hoàn toàn, cần thực hiện trong Supabase Auth hoặc dùng Edge Function.)`)) {
             return;
         }

         setLoading(true);
         const { error: deleteProfileError } = await supabase
             .from('Users')
             .delete()
             .eq('id', userId);

         if (deleteProfileError) {
              alert("Lỗi khi xóa hồ sơ người dùng: " + deleteProfileError.message);
         } else {
              alert(`Đã xóa hồ sơ người dùng "${userName}"!`);
              fetchCustomers(); // Tải lại danh sách
         }
         setLoading(false);
    };

    if (loading && customers.length === 0) {
        return ( /* ... Loading spinner ... */ );
    }

    if (error) {
        return <div className="text-red-500 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <UserList size={28} weight="duotone" className="text-sky-600"/> {/* Thay icon */}
                Quản lý Tài khoản & Khách hàng
            </h1>

            {/* Thêm ô tìm kiếm (ví dụ) */}
            {/* <input type="text" placeholder="Tìm kiếm theo tên hoặc email..." className="w-full md:w-1/2 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/> */}

            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                {/* ... th ... */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"> Tên đầy đủ </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"> Email </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"> Vai trò (Role) </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"> Hành động </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {customers.map((customer) => { // Mở map
                                const roleStyle = getRoleStyle(customer.role);
                                return ( // Mở return tr
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {customer.full_name || <span className="italic text-gray-400">Chưa cập nhật</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {customer.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                 {roleStyle.icon}
                                                <select
                                                    value={customer.role}
                                                    // Truyền cả role cũ vào handleRoleChange để rollback nếu lỗi
                                                    onChange={(e) => handleRoleChange(customer.id, customer.role, e.target.value)}
                                                    className={`p-1.5 rounded-md text-xs border bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 ${roleStyle.color} border-current appearance-none pr-6`} // Thêm appearance-none, pr-6
                                                    style={{ backgroundImage: 'none' }} // Bỏ mũi tên mặc định (nếu cần)
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    {/* 👇 THÊM TÙY CHỌN SUPPLIER 👇 */}
                                                    <option value="supplier">Supplier</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Nút Xóa (nên có xác nhận) */}
                                            <button
                                                onClick={() => handleDeleteUser(customer.id, customer.full_name || customer.email)}
                                                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                title="Xóa hồ sơ người dùng"
                                            >
                                                {/* <Trash size={18} /> */}
                                                 <FaTrash size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ); // Đóng return tr
                            })} {/* Đóng map */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ); // Đóng return div chính
} // Đóng component ManageCustomers
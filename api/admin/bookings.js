// api/tours.js

// File này sẽ tự động trở thành một API endpoint tại /api/tours
// khi bạn deploy lên Vercel.

// Import kết nối supabase đã tạo ở file trước
import { supabase } from '../src/lib/supabaseClient';

export default async function handler(req, res) {
  // Chỉ xử lý yêu cầu GET
  if (req.method === 'GET') {
    try {
      // Lấy tất cả dữ liệu từ bảng 'Tours'
      let { data: tours, error } = await supabase
        .from('Tours') // Tên bảng phải khớp với tên bạn tạo trên Supabase
        .select('*')
        .order('created_at', { ascending: false }); // Sắp xếp tour mới nhất lên đầu

      if (error) {
        throw error;
      }

      // Trả về danh sách tour dưới dạng JSON
      return res.status(200).json(tours);

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    // Nếu không phải GET, báo lỗi
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const isServer = typeof window === 'undefined'

const supabaseUrl = isServer
  ? process.env.SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey = isServer
  ? process.env.SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY

// Kiểm tra lại lần cuối xem biến có giá trị không
if (!supabaseUrl || !supabaseAnonKey) {
   console.error("LỖI NGHIÊM TRỌNG: Supabase URL hoặc Key bị thiếu sau khi đọc env!");
   console.error("URL:", supabaseUrl); // In ra để xem giá trị
   console.error("Key loaded:", supabaseAnonKey ? "Yes" : "NO!"); // In ra để xem giá trị
   // Ném lỗi ở đây sẽ rõ ràng hơn
   throw new Error("Supabase URL hoặc Anon Key không được tải đúng cách từ biến môi trường.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
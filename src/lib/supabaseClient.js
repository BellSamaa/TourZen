// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

console.log("--- Loading supabaseClient.js (Singleton Pattern) ---");

const isServer = typeof window === 'undefined'

const supabaseUrl = isServer
  ? process.env.SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey = isServer
  ? process.env.SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Supabase URL is required but was not found in environment variables.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key is required but was not found in environment variables.");
}

// 1. Tạo instance client MỘT LẦN DUY NHẤT
const supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey)

console.log("--- Supabase client instance created (Singleton) ---");

// 2. Export một hàm LUÔN TRẢ VỀ instance đã tạo đó
export const getSupabase = () => supabaseClientInstance

// Tùy chọn: Bạn có thể export trực tiếp instance nếu muốn dùng như cũ
// export const supabase = supabaseClientInstance;
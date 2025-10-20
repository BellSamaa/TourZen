// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

console.log("--- Loading supabaseClient.js ---"); // Thêm log để biết khi nào file này chạy

const isServer = typeof window === 'undefined'

const supabaseUrl = isServer
  ? process.env.SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey = isServer
  ? process.env.SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY

// Thêm kiểm tra chặt chẽ hơn
if (!supabaseUrl) {
  console.error("LỖI NGHIÊM TRỌNG: Supabase URL bị thiếu!");
  throw new Error("Supabase URL is required but was not found in environment variables.");
}
if (!supabaseAnonKey) {
  console.error("LỖI NGHIÊM TRỌNG: Supabase Anon Key bị thiếu!");
  throw new Error("Supabase Anon Key is required but was not found in environment variables.");
}

console.log("Supabase URL loaded:", supabaseUrl ? "OK" : "MISSING!");
console.log("Supabase Anon Key loaded:", supabaseAnonKey ? "OK" : "MISSING!");

// Chỉ tạo MỘT client duy nhất và export nó
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log("--- Supabase client instance created ---");
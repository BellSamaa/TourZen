// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

let supabaseClient;

export function getSupabase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Kiểm tra debug: Nếu thiếu biến, log lỗi
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL hoặc Anon Key bị thiếu! Kiểm tra biến môi trường VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong Vercel hoặc file .env.local.');
    throw new Error('Cấu hình Supabase không đầy đủ.');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}
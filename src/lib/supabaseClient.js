// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Code sẽ tự động lấy thông tin từ file .env.local của bạn
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Tạo và export kết nối để sử dụng trong toàn bộ dự án
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
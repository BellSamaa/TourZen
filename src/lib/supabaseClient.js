// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// URL ĐÚNG (với chữ 'w', không có dấu \ ở cuối)
const supabaseUrl = "https://zdwvpjgypsxxqpvhovct.supabase.co"; 

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdndwamdweXN4eHFwdmhvdmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjQzODUsImV4cCI6MjA3NjI0MDM4NX0.tmFvQDXSUdJlJKBuYoqvuJArZ5apYpb-eNQ90uYBJf0";

let supabaseClient;

export function getSupabase() {
  // Bạn có thể xóa các dòng console.log này đi nếu muốn
  // console.log("--- Loading supabaseClient.js (Singleton Pattern) ---");
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    // console.log("--- Supabase client instance created (Singleton) ---");
  }
  return supabaseClient;
}
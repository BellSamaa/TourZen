// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Thông tin Supabase của bạn
// URL BỊ SAI LÀ: "https://zdwpjgpysxxqpvhovct.supabase.co"
// URL ĐÚNG LÀ:
const supabaseUrl = "https://zdwvpjgypsxxqpvhovct.supabase.co"; 

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdndwamdweXN4eHFwdmhvdmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjQzODUsImV4cCI6MjA3NjI0MDM4NX0.tmFvQDXSUdJlJKBuYoqvuJArZ5apYpb-eNQ90uYBJf0";

let supabaseClient;

export function getSupabase() {
  // Những dòng log này bạn có thể giữ hoặc xóa đi
  console.log("--- Loading supabaseClient.js (Singleton Pattern) ---");
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("--- Supabase client instance created (Singleton) ---");
  }
  return supabaseClient;
}
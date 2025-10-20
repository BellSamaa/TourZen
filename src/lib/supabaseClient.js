// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

console.log("!!! ĐANG TẢI FILE supabaseClient.js !!!");

const supabaseUrl = "https://zdwpjgpysxxqpvhovct.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdndwamdweXN4eHFwdmhvdmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjQzODUsImV4cCI6MjA3NjI0MDM4NX0.tmFvDXSUdJlJKBuYoqvuJArZ5apYpb-eNQ90uYBJf0";

if (!supabaseUrl) {
  // Dừng ứng dụng ngay lập tức nếu URL bị thiếu
  throw new Error("DỪNG LẠI: supabaseUrl BỊ THIẾU TRONG supabaseClient.js");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
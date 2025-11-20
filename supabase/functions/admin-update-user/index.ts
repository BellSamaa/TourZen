// File: supabase/functions/admin-update-user/index.ts
// (PHIÊN BẢN SỬA LỖI - Kiểm tra auth.users thay vì role)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts'

// DANH SÁCH CÁC TRANG WEB ĐƯỢC PHÉP GỌI
const allowedOrigins = [
  'https://tour-zen.vercel.app', // URL Production của bạn
  'http://localhost:5173',        // URL Local dev
  'http://localhost:3000',
]

// Admin Client (dùng service_role)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

serve(async (req) => {
  
  // === XỬ LÝ CORS (Giữ nguyên) ===
  const origin = req.headers.get('Origin') || ''
  const isAllowed = allowedOrigins.includes(origin)
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  // === KẾT THÚC CORS ===


  try {
    // 1. Lấy dữ liệu từ body
    const { 
      user_id, 
      full_name, 
      address, 
      phone_number, 
      role,         // Đây là role MỚI
      is_active, 
      password      // Mật khẩu MỚI (nếu có)
    } = await req.json()

    // 2. === SỬA LOGIC: KIỂM TRA USER "THẬT" HAY "ẢO" ===
    // Thử lấy user từ auth.users bằng ID
    let isRealAuthUser = false;
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (authUser && authUser.user && !authUserError) {
        // Tìm thấy user trong auth.users -> Đây là user "thật"
        isRealAuthUser = true;
    } else if (authUserError && authUserError.message !== 'User not found') {
        // Nếu là lỗi khác (không phải 'User not found'), thì đó là lỗi nghiêm trọng
        throw new Error(`Lỗi kiểm tra Auth: ${authUserError.message}`);
    }
    // Nếu authUserError.message == 'User not found', isRealAuthUser vẫn là false (Đây là user "ảo")
    

    // 3. === XỬ LÝ HỆ THỐNG AUTH (Nếu là tài khoản "thật") ===
    if (isRealAuthUser) {
      console.log(`Đang cập nhật user "thật" (SupaAuth): ${user_id}`)
      const authUpdateData: { password?: string; data?: { [key: string]: any } } = {}
      
      if (password) {
        authUpdateData.password = password
      }
      if (full_name !== undefined) {
        // Cập nhật 'full_name' trong 'raw_user_meta_data' của Auth
        authUpdateData.data = { full_name: full_name }
      }

      if (Object.keys(authUpdateData).length > 0) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          authUpdateData
        )
        if (authError) {
          // Logic mới này đã ngăn lỗi "User not found" ở đây
          throw new Error(`Lỗi cập nhật Auth: ${authError.message}`)
        }
      }
    } else {
       console.log(`Đang cập nhật user "ảo" (Bypass Auth): ${user_id}`)
    }

    // 4. === XỬ LÝ HỆ THỐNG PROFILE (public.Users) ===
    // (Luôn luôn chạy cho cả hai loại tài khoản)
    const profileUpdateData: { [key: string]: any } = {}
    
    if (role !== undefined) profileUpdateData.role = role
    if (is_active !== undefined) profileUpdateData.is_active = is_active
    if (full_name !== undefined) profileUpdateData.full_name = full_name
    if (address !== undefined) profileUpdateData.address = address
    if (phone_number !== undefined) profileUpdateData.phone_number = phone_number

    // === XỬ LÝ MẬT KHẨU CHO USER "ẢO" ===
    if (!isRealAuthUser && password) {
      profileUpdateData.password = encode(password) 
    }
    
    // Cập nhật bảng public.Users
    if (Object.keys(profileUpdateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('Users')
        .update(profileUpdateData)
        .eq('id', user_id)
        
      if (profileError) {
        throw new Error(`Lỗi cập nhật Profile: ${profileError.message}`)
      }
    }

    // 5. Trả về thành công
    return new Response(
      JSON.stringify({ message: 'Cập nhật tài khoản thành công!' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    // 6. Trả về lỗi
    console.error('Lỗi nghiêm trọng trong Edge Function:', error.message)
    return new Response(
      JSON.stringify({ error: `Lỗi Edge Function: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500, // Trả về 500
      }
    )
  }
})
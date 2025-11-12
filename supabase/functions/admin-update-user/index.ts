// File: supabase/functions/admin-update-user/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// DANH SÁCH CÁC TRANG WEB ĐƯỢC PHÉP GỌI FUNCTION NÀY
const allowedOrigins = [
  'https://tour-zen.vercel.app', // URL Production của bạn
  'http://localhost:5173',        // URL Local dev (thay 5173 bằng port của bạn)
  'http://localhost:3000',        // (Thêm các port dev khác nếu cần)
]

// Hàm tạo Supabase Admin Client (có toàn quyền)
// (Rất quan trọng: Phải lấy từ Environment Variables)
function createAdminClient(reqHeaders: Headers) {
  // Lấy header 'Authorization' (JWT của user đang gọi)
  const authHeader = reqHeaders.get('Authorization')!
  
  // Tạo client với quyền service_role để có thể bypass RLS
  // và thực hiện các hành động admin (như đổi role, đổi mật khẩu)
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        // Tự động refresh token nếu cần
        autoRefreshToken: true,
        persistSession: false
      }
    }
  )
}

// Logic chính của Function
serve(async (req) => {
  // Lấy origin (trang web) đang gọi
  const origin = req.headers.get('Origin') || ''
  const isAllowed = allowedOrigins.includes(origin)

  // === SỬA LỖI CORS ===
  // Tạo các header CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Quan trọng: Phải có OPTIONS
  }

  // Xử lý Preflight Request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  // === KẾT THÚC SỬA LỖI CORS ===


  try {
    // 1. Lấy dữ liệu từ body
    const { 
      user_id, 
      full_name, 
      address, 
      phone_number, 
      role, 
      is_active, 
      password 
    } = await req.json()

    // 2. Tạo Admin Client
    const supabaseAdmin = createAdminClient(req.headers)

    // 3. Chuẩn bị dữ liệu để update trong 'auth.users'
    const authUpdateData: { password?: string; data?: { [key: string]: any } } = {}
    
    // Nếu có mật khẩu mới thì thêm vào
    if (password) {
      authUpdateData.password = password
    }
    
    // Thêm full_name vào 'data' (raw_user_meta_data)
    // (Lưu ý: role không nằm trong auth.users)
    if (full_name !== undefined) {
      authUpdateData.data = { ...authUpdateData.data, full_name: full_name }
    }

    // 4. Cập nhật 'auth.users' (Mật khẩu, Họ tên)
    if (Object.keys(authUpdateData).length > 0) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        authUpdateData
      )
      if (authError) {
        console.error('Lỗi cập nhật auth.users:', authError.message)
        throw new Error(`Lỗi Auth: ${authError.message}`)
      }
    }

    // 5. Chuẩn bị dữ liệu để update trong 'public.Users' (bảng profile)
    const profileUpdateData: { [key: string]: any } = {}
    
    // Chỉ thêm các trường nếu chúng được cung cấp (không phải undefined)
    if (role !== undefined) profileUpdateData.role = role
    if (is_active !== undefined) profileUpdateData.is_active = is_active
    if (full_name !== undefined) profileUpdateData.full_name = full_name
    if (address !== undefined) profileUpdateData.address = address
    if (phone_number !== undefined) profileUpdateData.phone_number = phone_number

    // 6. Cập nhật 'public.Users' (Role, Trạng thái, SĐT, Địa chỉ, Họ tên)
    if (Object.keys(profileUpdateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('Users')
        .update(profileUpdateData)
        .eq('id', user_id)
        
      if (profileError) {
        console.error('Lỗi cập nhật public.Users:', profileError.message)
        throw new Error(`Lỗi Profile: ${profileError.message}`)
      }
    }

    // 7. Trả về thành công (KÈM HEADER CORS)
    return new Response(
      JSON.stringify({ message: 'Cập nhật tài khoản thành công!' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    // 8. Trả về lỗi (KÈM HEADER CORS)
    return new Response(
      JSON.stringify({ error: `Lỗi Edge Function: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
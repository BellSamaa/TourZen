// File: supabase/functions/admin-update-user/index.ts
// (PHIÊN BẢN SỬA LỖI - Sửa SyntaxError: 'btoa' -> 'encode')

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// === SỬA LỖI: Import đúng hàm 'encode' ===
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

    // 2. === KIỂM TRA ROLE GỐC ===
    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from('Users')
      .select('role') // Chỉ cần lấy role gốc
      .eq('id', user_id)
      .single()

    if (lookupError) throw new Error(`Không tìm thấy user: ${lookupError.message}`)
    
    const original_role = existingUser.role
    const isRealAuthUser = (original_role === 'admin' || original_role === 'supplier')
    
    // 3. === XỬ LÝ HỆ THỐNG AUTH (Nếu là tài khoản "thật") ===
    if (isRealAuthUser) {
      console.log(`Đang cập nhật user "thật" (SupaAuth): ${user_id}`)
      const authUpdateData: { password?: string; data?: { [key: string]: any } } = {}
      
      if (password) {
        authUpdateData.password = password
      }
      if (full_name !== undefined) {
        authUpdateData.data = { full_name: full_name }
      }

      if (Object.keys(authUpdateData).length > 0) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          authUpdateData
        )
        if (authError) {
          // Lỗi "user not allowed" trước đó là ở đây
          throw new Error(`Lỗi cập nhật Auth: ${authError.message}`)
        }
      }
    } else {
       console.log(`Đang cập nhật user "ảo" (Bypass Auth): ${user_id}`)
    }

    // 4. === XỬ LÝ HỆ THỐNG PROFILE (public.Users) ===
    const profileUpdateData: { [key: string]: any } = {}
    
    if (role !== undefined) profileUpdateData.role = role
    if (is_active !== undefined) profileUpdateData.is_active = is_active
    if (full_name !== undefined) profileUpdateData.full_name = full_name
    if (address !== undefined) profileUpdateData.address = address
    if (phone_number !== undefined) profileUpdateData.phone_number = phone_number

    // === XỬ LÝ MẬT KHẨU CHO USER "ẢO" ===
    if (!isRealAuthUser && password) {
      // === SỬA LỖI: Dùng 'encode' thay vì 'btoa' ===
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
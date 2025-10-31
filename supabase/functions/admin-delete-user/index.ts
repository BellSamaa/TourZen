// supabase/functions/admin-delete-user/index.ts
// (SỬA v4) Thêm logic để xóa cả trong bảng 'public.Users'

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cấu hình CORS (Giữ nguyên)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Hàm kiểm tra Admin (Giữ nguyên)
async function isUserAdmin(supabaseClient: SupabaseClient) {
  try {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error("User not found (isUserAdmin)")

    const { data: adminData, error: rpcError } = await supabaseClient
      .from('Users') // << Tên bảng public của bạn
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (rpcError) throw rpcError
    
    if (adminData?.role !== 'admin') {
      throw new Error("Permission denied: User is not an admin.")
    }
    return true
  } catch (error) {
    throw new Error(`Admin check failed: ${error.message}`)
  }
}

// Hàm chính của Edge Function (ĐÃ CẬP NHẬT)
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    if (!user_id) throw new Error("Missing 'user_id' in request body")

    // 1. Tạo client (người gọi) để check quyền (Giữ nguyên)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('MY_SUPABASE_ANON_KEY') ?? '', 
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Xác thực admin (Giữ nguyên)
    await isUserAdmin(supabaseClient)

    // 3. Tạo Admin client (service_role) để XÓA (Giữ nguyên)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // --- (SỬA v4) THÊM BƯỚC XÓA TRONG BẢNG 'public.Users' ---
    
    // BƯỚC 4.1: Xóa trong 'public.Users' (bảng profile)
    const { error: profileDeleteError } = await supabaseAdmin
      .from('Users') // << Tên bảng public của bạn
      .delete()
      .eq('id', user_id) // Xóa dòng có ID tương ứng

    if (profileDeleteError) {
      throw new Error(`Failed to delete from public.Users: ${profileDeleteError.message}`)
    }
    
    // BƯỚC 4.2: Xóa trong 'auth.users' (bảng đăng nhập)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user_id,
      true // true = xóa vĩnh viễn
    )

    if (authDeleteError) {
      throw new Error(`Failed to delete from auth.users: ${authDeleteError.message}`)
    }

    // 5. Trả về thành công
    return new Response(JSON.stringify({ message: `User ${user_id} deleted from auth and public tables` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // 6. Trả về lỗi
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
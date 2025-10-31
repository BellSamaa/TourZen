// supabase/functions/admin-delete-user/index.ts
// Code này được thiết kế để:
// 1. Xác thực người gọi (Phải là 'admin')
// 2. Xóa vĩnh viễn người dùng khỏi hệ thống (Auth)

import { serve } from 'https-deno-land-std-http-server.ts'
import { createClient, SupabaseClient } from 'https-esm-sh-supabase.ts'

// Cấu hình CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Hàm này kiểm tra xem người đang GỌI function có phải là admin không
async function isUserAdmin(supabaseClient: SupabaseClient) {
  try {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error("User not found (isUserAdmin)")

    // Truy vấn bảng 'Users' của bạn (hoặc 'profiles' nếu tên bảng khác)
    const { data: adminData, error: rpcError } = await supabaseClient
      .from('Users') // << Đảm bảo đây là đúng tên bảng public của bạn
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (rpcError) throw rpcError
    
    // Nếu vai trò không phải 'admin', báo lỗi
    if (adminData?.role !== 'admin') {
      throw new Error("Permission denied: User is not an admin.")
    }
    return true
  } catch (error) {
    throw new Error(`Admin check failed: ${error.message}`)
  }
}

// Hàm chính của Edge Function
serve(async (req) => {
  // Xử lý CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Lấy user_id CẦN XÓA từ body của request
    const { user_id } = await req.json()
    if (!user_id) throw new Error("Missing 'user_id' in request body")

    // 2. Tạo một client với quyền của NGƯỜI GỌI (để kiểm tra)
    // Cần có SUPABASE_ANON_KEY
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Dùng Anon key
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Xác thực: Người gọi có phải là admin không?
    // Dòng này sẽ báo lỗi nếu người gọi không phải admin
    await isUserAdmin(supabaseClient)

    // 4. QUAN TRỌNG: Tạo Admin client (Service Role) để THỰC HIỆN xóa
    // Cần có SUPABASE_SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. Thực hiện xóa người dùng vĩnh viễn
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user_id,
      true // true = xóa vĩnh viễn
    )

    if (deleteError) throw deleteError

    // 6. Trả về thành công
    return new Response(JSON.stringify({ message: `User ${user_id} deleted successfully` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // 7. Trả về lỗi
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
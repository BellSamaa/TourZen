// supabase/functions/admin-delete-user/index.ts
// (SỬA v2) Đổi tên biến để fix lỗi "cannot start with SUPABASE_"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { data: adminData, error: rpcError } = await supabaseClient
      .from('Users') // << Đảm bảo đây là đúng tên bảng public của bạn
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

// Hàm chính của Edge Function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    if (!user_id) throw new Error("Missing 'user_id' in request body")

    // 1. (SỬA v2) Dùng biến MY_SUPABASE_URL và MY_SUPABASE_ANON_KEY
    const supabaseClient = createClient(
      Deno.env.get('MY_SUPABASE_URL') ?? '',
      Deno.env.get('MY_SUPABASE_ANON_KEY') ?? '', // Dùng Anon key
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Xác thực admin
    await isUserAdmin(supabaseClient)

    // 3. (SỬA v2) Dùng biến MY_SUPABASE_SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      Deno.env.get('MY_SUPABASE_URL') ?? '',
      Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Thực hiện xóa vĩnh viễn
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user_id,
      true // true = xóa vĩnh viễn
    )

    if (deleteError) throw deleteError

    // 5. Trả về thành công
    return new Response(JSON.stringify({ message: `User ${user_id} deleted successfully` }), {
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
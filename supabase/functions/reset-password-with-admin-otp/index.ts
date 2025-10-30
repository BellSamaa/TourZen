// supabase/functions/reset-password-with-admin-otp/index.ts
//
// 1. Tạo Supabase client (dùng service_role)
// 2. Lấy email, otp, newPassword từ request
// 3. Tìm yêu cầu trong `password_reset_requests`
// 4. Kiểm tra OTP, email, và thời gian hết hạn
// 5. Dùng `service_role` để tìm user_id từ email
// 6. Dùng `service_role` để CẬP NHẬT mật khẩu cho user_id đó
// 7. Cập nhật `is_resolved = true` trong `password_reset_requests`
// 8. Trả về success hoặc error

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Tạo Supabase Admin Client (dùng service_role)
    // Biến này phải được set trong Supabase project secrets:
    // SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SERVICE_KEY') ?? '' 
);

    // 2. Lấy dữ liệu
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return new Response(JSON.stringify({ error: 'Thiếu email, OTP, hoặc mật khẩu mới' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Tìm yêu cầu trong `password_reset_requests`
    const { data: requests, error: findError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('email', email)
      .eq('token', otp)
      .eq('is_resolved', false);

    if (findError || !requests || requests.length === 0) {
      return new Response(JSON.stringify({ error: 'Mã OTP không hợp lệ hoặc không tìm thấy yêu cầu' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const request = requests[0];

    // 4. Kiểm tra thời gian hết hạn (từ file ManageCustomers là 10 phút)
    if (new Date(request.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu lại.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 5. Lấy User ID từ email (dùng service_role)
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (userError || !user) {
         return new Response(JSON.stringify({ error: 'Không tìm thấy người dùng (admin)' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
         });
    }

    // 6. CẬP NHẬT MẬT KHẨU (dùng service_role)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Lỗi Admin Update Mật Khẩu:', updateError);
      return new Response(JSON.stringify({ error: `Lỗi cập nhật mật khẩu: ${updateError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 7. Đánh dấu yêu cầu là đã giải quyết
    await supabaseAdmin
      .from('password_reset_requests')
      .update({ is_resolved: true })
      .eq('id', request.id);

    // 8. Trả về thành công
    return new Response(JSON.stringify({ success: true, message: 'Đổi mật khẩu thành công' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
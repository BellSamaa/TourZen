// supabase/functions/reset-password-with-admin-otp/index.ts
// (SỬA v5: Lọc chính xác tài khoản 'email', bỏ qua tài khoản SSO)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Tạo Supabase Admin Client (dùng service_role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_KEY') ?? ''
    );

    // 2. Lấy dữ liệu
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      const errorMsg = 'Thiếu email, OTP, hoặc mật khẩu mới';
      console.error(errorMsg); 
      return new Response(JSON.stringify({ error: errorMsg }), {
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
      const errorMsg = 'Mã OTP không hợp lệ hoặc không tìm thấy yêu cầu';
      console.error(errorMsg, findError); 
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const request = requests[0];

    // 4. Kiểm tra thời gian hết hạn
    if (new Date(request.expires_at) < new Date()) {
      const errorMsg = 'Mã OTP đã hết hạn. Vui lòng yêu cầu lại.';
      console.error(errorMsg); 
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- (*** SỬA LỖI v5 TẠI ĐÂY ***) ---
    // 5. Lấy User ID từ email (dùng service_role)
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      email: email,
    });

    if (listError) {
      const errorMsg = 'Lỗi khi tìm người dùng (admin)';
      console.error(errorMsg, listError);
      return new Response(JSON.stringify({ error: errorMsg }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 500,
      });
    }

    // Lọc để CHỈ tìm user có danh tính 'email' (không phải Google, Facebook, v.v.)
    const user = listData.users.find(u => 
      u.identities && u.identities.some(identity => identity.provider === 'email')
    );

    if (!user) {
      const errorMsg = 'Không tìm thấy tài khoản (email/password) khớp. (Có thể là tài khoản Google/SSO?)';
      console.error(errorMsg, 'No email provider found for:', email);
      return new Response(JSON.stringify({ error: errorMsg }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 404,
      });
    }
    // --- (*** KẾT THÚC SỬA LỖI v5 ***) ---


    // 6. CẬP NHẬT MẬT KHẨU (dùng service_role)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      const errorMsg = `Lỗi cập nhật mật khẩu: ${updateError.message}`;
      console.error('Lỗi Admin Update Mật Khẩu:', updateError); 
      return new Response(JSON.stringify({ error: errorMsg }), {
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
    console.log(`Đổi mật khẩu thành công cho (Email Provider): ${email}`); 
    return new Response(JSON.stringify({ success: true, message: 'Đổi mật khẩu thành công' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('LỖI FUNCTION CRASH:', err.message);

    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
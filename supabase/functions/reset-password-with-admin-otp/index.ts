// supabase/functions/reset-password-with-admin-otp/index.ts
// (CẢNH BÁO: ĐÃ GỠ BỎ SỬA LỖI v5 - Sẽ cố gắng đổi mật khẩu CẢ TÀI KHOẢN GOOGLE/SSO)

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

    // --- (*** ĐÃ GỠ BỎ KHỐI SỬA LỖI v5 ***) ---
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

    // Lấy user đầu tiên tìm thấy (BẤT KỂ LÀ GOOGLE HAY EMAIL)
    if (!listData.users || listData.users.length === 0) {
       const errorMsg = 'Không tìm thấy tài khoản nào khớp với email này.';
       console.error(errorMsg, 'No user found for:', email);
       return new Response(JSON.stringify({ error: errorMsg }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
       });
    }
    const user = listData.users[0];
    // (Kết thúc khối đã sửa)


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
    console.log(`Đổi mật khẩu thành công cho (Bất kỳ Provider): ${email}`); 
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
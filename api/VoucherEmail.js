// src/emails/VoucherEmail.js
export default function VoucherEmail({ 
  userEmail, 
  voucherCode, 
  discountPercent, 
  promoTitle, 
  expiryDate 
}) {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voucher TourZen</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f9fc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🎁 Voucher Giảm Giá ${discountPercent}%
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Xin chào <strong style="color: #667eea;">${userEmail}</strong>,
              </p>
              
              <!-- Message -->
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #666666;">
                Chúng tôi gửi bạn voucher giảm giá đặc biệt cho chương trình:<br>
                <strong style="color: #333333; font-size: 18px;">${promoTitle}</strong>
              </p>
              
              <!-- Voucher Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%); border: 3px dashed #667eea; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 40px 20px; text-align: center;">
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                      MÃ VOUCHER CỦA BẠN
                    </p>
                    <div style="background-color: #ffffff; display: inline-block; padding: 20px 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2); margin: 10px 0;">
                      <p style="margin: 0; font-size: 42px; font-weight: 800; color: #667eea; letter-spacing: 6px; font-family: 'Courier New', monospace;">
                        ${voucherCode}
                      </p>
                    </div>
                    <p style="margin: 20px 0 0 0; font-size: 24px; color: #ff6b6b; font-weight: 700;">
                      🎉 Giảm ${discountPercent}%
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Expiry Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff9e6; border-left: 4px solid #ffd93d; border-radius: 6px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                      ⏰ <strong>Thời hạn sử dụng:</strong> Đến hết ngày <strong>${expiryDate}</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Instructions -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333; font-weight: 600;">
                  📋 Cách sử dụng:
                </p>
                <ol style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Chọn tour du lịch yêu thích</li>
                  <li>Nhập mã voucher khi thanh toán</li>
                  <li>Nhận ngay ưu đãi ${discountPercent}%</li>
                </ol>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; font-size: 14px; text-align: center; color: #666666;">
                Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của <strong style="color: #667eea;">TourZen</strong>! 🌟
              </p>
              <p style="margin: 0; font-size: 12px; text-align: center; color: #999999;">
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
// supabase/functions/_shared/cors.ts
// Đây là các cài đặt CORS (Cross-Origin Resource Sharing)
// cho phép ứng dụng Vercel của bạn gọi được function này.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Hoặc 'https://your-domain.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
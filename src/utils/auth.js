// src/utils/auth.js

const TOKEN_KEY = "token"; // JWT lưu ở localStorage

// Kiểm tra user đã login chưa
export const isLoggedIn = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  // Tùy chọn: decode token để kiểm tra expiry
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
};

// Lấy token để gọi API
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Lưu token sau khi login/register
export const setUser = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Logout
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

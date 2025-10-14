// src/utils/format.js
export function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("vi-VN");
}

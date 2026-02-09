/**
 * Date formatting utilities
 */

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return ""
  
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

/**
 * Format date for input[type="date"]
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return ""
  
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return ""
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  
  return `${year}-${month}-${day}`
}

/**
 * Get relative time (e.g., "2 giờ trước")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "vừa xong"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  
  return formatDate(d)
}

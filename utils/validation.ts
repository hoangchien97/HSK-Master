/**
 * Validation utilities for portal
 */

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation (Vietnamese format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// Date validation
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// File validation
export interface FileValidationOptions {
  maxSizeInMB?: number
  allowedTypes?: string[]
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const { maxSizeInMB = 5, allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"] } = options

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `Kích thước file không được vượt quá ${maxSizeInMB}MB`,
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Chỉ chấp nhận các định dạng: ${allowedTypes.map(t => t.split("/")[1].toUpperCase()).join(", ")}`,
    }
  }

  return { valid: true }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

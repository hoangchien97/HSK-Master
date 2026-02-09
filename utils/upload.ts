/**
 * Avatar and image upload utilities
 */

import type { AvatarUploadResponse } from "@/interfaces/portal"

/**
 * Convert file to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Resize image before upload
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to resize image"))
            }
          },
          file.type,
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

/**
 * Upload avatar to server
 */
export async function uploadAvatar(file: File): Promise<AvatarUploadResponse> {
  try {
    // Resize image before upload
    const resizedBlob = await resizeImage(file, 400, 400, 0.85)
    const resizedFile = new File([resizedBlob], file.name, { type: file.type })

    // Convert to base64
    const base64 = await fileToBase64(resizedFile)

    // Upload to API
    const response = await fetch("/api/portal/upload/avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64,
        fileName: file.name,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Upload thất bại",
      }
    }

    return {
      success: true,
      url: data.url,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: "Có lỗi xảy ra khi upload ảnh",
    }
  }
}

/**
 * Get avatar fallback initials
 */
export function getAvatarInitials(name: string): string {
  if (!name) return "?"
  
  const parts = name.trim().split(" ")
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Get avatar color based on name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

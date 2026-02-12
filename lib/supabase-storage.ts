/**
 * Supabase Storage utilities using REST API
 * No SDK needed - uses fetch directly
 */

interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Upload file to Supabase Storage using REST API
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  path: string,
  bucket: string = "avatars"
): Promise<UploadResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration")
    }

    // Upload to Supabase Storage
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "true", // Overwrite if exists
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      throw new Error(`Upload failed: ${error}`)
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`

    return {
      success: true,
      url: publicUrl,
      path: path,
    }
  } catch (error) {
    console.error("Supabase storage upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabaseStorage(
  path: string,
  bucket: string = "avatars"
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration")
    }

    const deleteUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`
    
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Supabase storage delete error:", error)
    return false
  }
}

/**
 * Generate unique file path for avatar
 */
export function generateAvatarPath(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const ext = fileName.split(".").pop() || "jpg"
  return `${userId}/${timestamp}.${ext}`
}

/**
 * Generate unique file path for assignment / submission attachments
 * @param folder  "assignments" | "submissions"
 */
export function generateFilePath(
  folder: string,
  userId: string,
  fileName: string,
): string {
  const timestamp = Date.now()
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `${folder}/${userId}/${timestamp}_${safeName}`
}

/**
 * Allowed MIME types for assignment / submission file uploads
 */
export const ALLOWED_FILE_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Text
  "text/plain",
  "text/csv",
]

/** Max file size: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

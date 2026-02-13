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
 * Get Supabase config, preferring service role key for server-side operations.
 * Falls back to anon key if service role key is missing or not a valid JWT.
 */
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")

  // Service role key must be a valid JWT (3 base64 parts separated by dots)
  const isValidJwt = serviceRoleKey && serviceRoleKey.split(".").length === 3
  const supabaseKey = isValidJwt ? serviceRoleKey : anonKey

  if (!supabaseKey) throw new Error("Missing Supabase API key")

  return { supabaseUrl, supabaseKey }
}

/**
 * Ensure a storage bucket exists, creating it if needed.
 */
async function ensureBucket(bucket: string): Promise<void> {
  try {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig()

    // Check if bucket exists
    const checkRes = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
    })

    if (checkRes.ok) return // Bucket exists

    // Try to create bucket
    const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: true,
        file_size_limit: MAX_FILE_SIZE,
      }),
    })

    if (!createRes.ok) {
      const error = await createRes.text()
      console.warn(`Could not create bucket "${bucket}": ${error}. Please create it manually in Supabase dashboard.`)
    }
  } catch (error) {
    console.warn(`Bucket check/create failed for "${bucket}":`, error)
  }
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
    const { supabaseUrl, supabaseKey } = getSupabaseConfig()

    // Ensure bucket exists
    await ensureBucket(bucket)

    // Upload to Supabase Storage
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true", // Overwrite if exists
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      throw new Error(`Upload failed (${uploadResponse.status}): ${error}`)
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
    const { supabaseUrl, supabaseKey } = getSupabaseConfig()

    const deleteUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
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

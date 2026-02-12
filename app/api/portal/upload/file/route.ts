import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  generateFilePath,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/supabase-storage"

/**
 * POST - Upload one or more files to Supabase Storage
 * Accepts multipart/form-data with field "files" (multiple)
 * Query params:
 *   folder = "assignments" | "submissions" (default: "assignments")
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folder =
      req.nextUrl.searchParams.get("folder") || "assignments"

    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files.length) {
      return NextResponse.json(
        { error: "Không có file nào được chọn" },
        { status: 400 },
      )
    }

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File "${file.name}" có định dạng không được hỗ trợ (${file.type})`,
          },
          { status: 400 },
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" vượt quá 10 MB`,
          },
          { status: 400 },
        )
      }
    }

    const uploaded: { name: string; url: string; path: string; size: number; type: string }[] = []
    const errors: string[] = []

    for (const file of files) {
      const path = generateFilePath(folder, session.user.id, file.name)
      const result = await uploadToSupabaseStorage(file, path, "portal-files")

      if (result.success && result.url) {
        uploaded.push({
          name: file.name,
          url: result.url,
          path: result.path!,
          size: file.size,
          type: file.type,
        })
      } else {
        errors.push(`${file.name}: ${result.error}`)
      }
    }

    if (uploaded.length === 0) {
      return NextResponse.json(
        { error: "Upload thất bại", details: errors },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      files: uploaded,
      ...(errors.length > 0 && { partialErrors: errors }),
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "Upload thất bại" },
      { status: 500 },
    )
  }
}

/**
 * DELETE - Remove a file from Supabase Storage
 * Body: { path: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { path } = await req.json()
    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 })
    }

    // Security: only allow deleting own files
    if (!path.includes(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ok = await deleteFromSupabaseStorage(path, "portal-files")
    if (!ok) {
      return NextResponse.json({ error: "Xóa file thất bại" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("File delete error:", error)
    return NextResponse.json({ error: "Xóa file thất bại" }, { status: 500 })
  }
}

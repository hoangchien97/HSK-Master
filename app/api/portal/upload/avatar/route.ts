import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { uploadToSupabaseStorage, generateAvatarPath } from "@/lib/supabase-storage"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { image, fileName } = body

    if (!image || !fileName) {
      return NextResponse.json(
        { error: "Missing image or fileName" },
        { status: 400 }
      )
    }

    // Extract base64 data and convert to Blob
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    const mimeType = image.match(/data:image\/(\w+);base64/)?.[0] || "image/jpeg"
    const blob = new Blob([buffer], { type: mimeType })

    // Generate unique path
    const path = generateAvatarPath(session.user.id, fileName)

    // Upload to Supabase Storage
    const result = await uploadToSupabaseStorage(blob, path, "avatars")

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      url: result.url,
      path: result.path 
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    )
  }
}

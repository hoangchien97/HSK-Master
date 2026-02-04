import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { ProfileService } from "@/app/services/portal"
import type { UpdateProfileDTO } from "@/app/interfaces/portal"

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json() as UpdateProfileDTO & { userId: string }
    const { userId, name, image, studentProfile, teacherProfile } = body

    // Verify the user is updating their own profile
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Update profile using service
    const result = await ProfileService.updateProfile(userId, {
      name,
      image,
      studentProfile,
      teacherProfile,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

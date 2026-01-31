import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, name, firstName, lastName, phoneNumber, address, dateOfBirth } = body

    // Verify the user is updating their own profile
    const user = await prisma.portalUser.findUnique({
      where: { id: userId },
      include: { student: true, teacher: true },
    })

    if (!user || user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Update user name
    await prisma.portalUser.update({
      where: { id: userId },
      data: { name },
    })

    // Update student profile if exists
    if (user.student) {
      await prisma.portalStudent.update({
        where: { id: user.student.id },
        data: {
          firstName,
          lastName,
          phoneNumber: phoneNumber || null,
          address: address || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      })
    }

    // Update teacher profile if exists
    if (user.teacher) {
      await prisma.portalTeacher.update({
        where: { id: user.teacher.id },
        data: {
          firstName,
          lastName,
          phoneNumber: phoneNumber || null,
          address: address || null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Cập nhật hồ sơ thất bại" },
      { status: 500 }
    )
  }
}

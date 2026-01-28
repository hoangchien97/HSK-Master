import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Check if user already exists
    const existingUser = await prisma.portalUser.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 400 }
      )
    }

    // Create new user
    const user = await prisma.portalUser.create({
      data: {
        name,
        email,
        password, // Already hashed from client
        role: "STUDENT",
      },
    })

    return NextResponse.json(
      {
        message: "Đăng ký thành công",
        userId: user.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng ký" },
      { status: 500 }
    )
  }
}

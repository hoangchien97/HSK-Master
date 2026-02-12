import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/portal/users/search - Search users by email or name
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.portalUser.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only teachers and admins can search users
    if (user.role !== "TEACHER" && user.role !== "SYSTEM_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || searchParams.get("search") || ""
    const role = searchParams.get("role") // Filter by role (e.g., STUDENT)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")))

    // Build where clause
    const where: any = {
      AND: [
        ...(query.length >= 1
          ? [
              {
                OR: [
                  { email: { contains: query, mode: "insensitive" } },
                  { name: { contains: query, mode: "insensitive" } },
                  { username: { contains: query, mode: "insensitive" } },
                ],
              },
            ]
          : []),
        ...(role ? [{ role: role as any }] : []),
      ],
    }

    // Search users by email or name
    const [users, total] = await Promise.all([
      prisma.portalUser.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          image: true,
          role: true,
          phoneNumber: true,
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.portalUser.count({ where }),
    ])

    return NextResponse.json({ items: users, total })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { USER_ROLE } from "@/constants/portal/roles"

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
    if (user.role !== USER_ROLE.TEACHER && user.role !== USER_ROLE.SYSTEM_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || searchParams.get("search") || ""
    const role = searchParams.get("role") // Filter by role (e.g., STUDENT)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")))

    // Build where clause
    const where: Prisma.PortalUserWhereInput = {
      AND: [
        ...(query.length >= 1
          ? [
              {
                OR: [
                  { email: { contains: query, mode: "insensitive" as const } },
                  { name: { contains: query, mode: "insensitive" as const } },
                  { username: { contains: query, mode: "insensitive" as const } },
                ],
              },
            ]
          : []),
        ...(role ? [{ role: role as Prisma.EnumUserRoleFilter<"PortalUser"> }] : []),
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

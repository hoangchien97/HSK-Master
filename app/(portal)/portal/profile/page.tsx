import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileClient from "./ProfileClient"

async function getUserProfile(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      student: true,
      teacher: true,
    },
  })
  return user
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const userProfile = await getUserProfile(session.user.email)

  if (!userProfile) {
    redirect("/portal/login")
  }

  return (
    <ProfileClient
      user={{
        id: userProfile.id,
        name: userProfile.name || "",
        email: userProfile.email,
        image: userProfile.image,
        role: userProfile.role as any, // Type assertion for Prisma enum compatibility
        status: userProfile.status as any,
        createdAt: userProfile.createdAt.toISOString(),
      }}
      studentProfile={
        userProfile.student
          ? {
              id: userProfile.student.id,
              userId: userProfile.student.userId,
              studentCode: userProfile.student.studentCode,
              firstName: userProfile.student.firstName,
              lastName: userProfile.student.lastName,
              phoneNumber: userProfile.student.phoneNumber || "",
              address: userProfile.student.address || "",
              dateOfBirth: userProfile.student.dateOfBirth?.toISOString() || "",
              level: userProfile.student.level || "",
              status: userProfile.student.status,
            }
          : null
      }
      teacherProfile={
        userProfile.teacher
          ? {
              id: userProfile.teacher.id,
              userId: userProfile.teacher.userId,
              teacherCode: userProfile.teacher.teacherCode,
              firstName: userProfile.teacher.firstName,
              lastName: userProfile.teacher.lastName,
              phoneNumber: userProfile.teacher.phoneNumber || "",
              address: userProfile.teacher.address || "",
              specialization: userProfile.teacher.specialization || "",
              biography: userProfile.teacher.biography || "",
              status: userProfile.teacher.status,
            }
          : null
      }
    />
  )
}

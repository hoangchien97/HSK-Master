import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ProfileClient from "./ProfileClient"

const prisma = new PrismaClient()

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
        role: userProfile.role,
        createdAt: userProfile.createdAt.toISOString(),
      }}
      student={
        userProfile.student
          ? {
              id: userProfile.student.id,
              studentCode: userProfile.student.studentCode,
              firstName: userProfile.student.firstName,
              lastName: userProfile.student.lastName,
              phoneNumber: userProfile.student.phoneNumber,
              address: userProfile.student.address,
              dateOfBirth: userProfile.student.dateOfBirth?.toISOString(),
              level: userProfile.student.level,
              status: userProfile.student.status,
            }
          : null
      }
      teacher={
        userProfile.teacher
          ? {
              id: userProfile.teacher.id,
              teacherCode: userProfile.teacher.teacherCode,
              firstName: userProfile.teacher.firstName,
              lastName: userProfile.teacher.lastName,
              phoneNumber: userProfile.teacher.phoneNumber,
              address: userProfile.teacher.address,
              specialization: userProfile.teacher.specialization,
              biography: userProfile.teacher.biography,
              status: userProfile.teacher.status,
            }
          : null
      }
    />
  )
}

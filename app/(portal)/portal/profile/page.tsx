import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileClient from "./ProfileClient"
import type { PortalUser } from "@/app/interfaces/portal/profile.types"

async function getUserProfile(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
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

  const user: PortalUser = {
    id: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    image: userProfile.image,
    role: userProfile.role as any,
    status: userProfile.status as any,
    fullName: userProfile.fullName,
    phoneNumber: userProfile.phoneNumber,
    address: userProfile.address,
    dateOfBirth: userProfile.dateOfBirth?.toISOString(),
    biography: userProfile.biography,
    createdAt: userProfile.createdAt.toISOString(),
    updatedAt: userProfile.updatedAt.toISOString(),
  }

  return <ProfileClient user={user} />
}

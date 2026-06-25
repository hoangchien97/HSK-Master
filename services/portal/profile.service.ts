import { prisma } from '@/lib/prisma'
import type { PortalUser, UpdateProfileDTO, ProfileUpdateResponse } from '@/interfaces/portal/profile'

const PROFILE_SELECT = {
  id: true, name: true, username: true, email: true,
  image: true, role: true, status: true,
  phoneNumber: true, address: true, dateOfBirth: true,
  biography: true, createdAt: true, updatedAt: true,
  // password and notes excluded
} as const

export class ProfileService {
  static async getUserProfile(userId: string): Promise<PortalUser | null> {
    const user = await prisma.portalUser.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    })
    return user as unknown as PortalUser
  }

  static async updateProfile(
    userId: string,
    data: UpdateProfileDTO
  ): Promise<ProfileUpdateResponse> {
    try {
      const user = await prisma.portalUser.update({
        where: { id: userId },
        data: {
          name: data.name,
          phoneNumber: data.phoneNumber,
          address: data.address,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          biography: data.biography,
          image: data.image,
        },
        select: PROFILE_SELECT,
      })
      return {
        success: true,
        message: "Cập nhật hồ sơ thành công",
        user: user as unknown as PortalUser,
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      return {
        success: false,
        message: "Có lỗi xảy ra khi cập nhật hồ sơ",
      }
    }
  }

  static async updateAvatar(userId: string, imageUrl: string): Promise<PortalUser | null> {
    const user = await prisma.portalUser.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: PROFILE_SELECT,
    })
    return user as unknown as PortalUser
  }
}

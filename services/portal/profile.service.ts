import { prisma } from '@/lib/prisma'
import type { PortalUser, UpdateProfileDTO, ProfileUpdateResponse } from '@/interfaces/portal/profile'

export class ProfileService {
  /**
   * Get complete user profile
   */
  static async getUserProfile(userId: string): Promise<PortalUser | null> {
    const user = await prisma.portalUser.findUnique({
      where: { id: userId },
    })

    return user as unknown as PortalUser
  }

  /**
   * Update user profile
   */
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

  /**
   * Update avatar
   */
  static async updateAvatar(userId: string, imageUrl: string): Promise<PortalUser | null> {
    const user = await prisma.portalUser.update({
      where: { id: userId },
      data: { image: imageUrl },
    })
    return user as unknown as PortalUser
  }
}

import { prisma } from "@/lib/prisma"
import type {
  UpdateProfileDTO,
  ProfileUpdateResponse,
  StudentProfile,
  TeacherProfile
} from "@/app/interfaces/portal"

export class ProfileService {
  /**
   * Get complete user profile with student/teacher data
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.portalUser.findUnique({
      where: { id: userId },
    })

    return user
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: UpdateProfileDTO
  ): Promise<ProfileUpdateResponse> {
    try {
      // Update base user data
      const user = await prisma.portalUser.update({
        where: { id: userId },
        data: {
          name: data.name,
          image: data.image,
        },
      })

      let studentProfile: StudentProfile | undefined
      let teacherProfile: TeacherProfile | undefined

      // Update student profile if exists
      if (data.studentProfile) {
        const existingStudent = await prisma.portalStudent.findUnique({
          where: { userId },
        })

        if (existingStudent) {
          studentProfile = await prisma.portalStudent.update({
            where: { userId },
            data: {
              firstName: data.studentProfile.firstName,
              lastName: data.studentProfile.lastName,
              phoneNumber: data.studentProfile.phoneNumber || null,
              address: data.studentProfile.address || null,
              dateOfBirth: data.studentProfile.dateOfBirth
                ? new Date(data.studentProfile.dateOfBirth)
                : null,
              level: data.studentProfile.level || null,
            },
          })
        }
      }

      // Update teacher profile if exists
      if (data.teacherProfile) {
        const existingTeacher = await prisma.portalTeacher.findUnique({
          where: { userId },
        })

        if (existingTeacher) {
          teacherProfile = await prisma.portalTeacher.update({
            where: { userId },
            data: {
              firstName: data.teacherProfile.firstName,
              lastName: data.teacherProfile.lastName,
              phoneNumber: data.teacherProfile.phoneNumber || null,
              address: data.teacherProfile.address || null,
              specialization: data.teacherProfile.specialization || null,
              biography: data.teacherProfile.biography || null,
            },
          })
        }
      }

      return {
        success: true,
        message: "Cập nhật hồ sơ thành công",
        user,
        studentProfile,
        teacherProfile,
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
  static async updateAvatar(userId: string, imageUrl: string) {
    return await prisma.portalUser.update({
      where: { id: userId },
      data: { image: imageUrl },
    })
  }
}

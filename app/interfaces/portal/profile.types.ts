// Portal User Types
export interface PortalUser {
  id: string
  email: string
  name: string
  image?: string | null
  role: UserRole
  status: UserStatus
  createdAt: Date | string
  updatedAt?: Date | string
}

export enum UserRole {
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED",
}

// Student Profile Types
export interface StudentProfile {
  id: string
  userId: string
  studentCode: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  address?: string | null
  dateOfBirth?: Date | string | null
  level?: string | null
  status: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

// Teacher Profile Types
export interface TeacherProfile {
  id: string
  userId: string
  teacherCode: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  address?: string | null
  specialization?: string | null
  biography?: string | null
  status: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

// Profile Update DTOs
export interface UpdateStudentProfileDTO {
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  dateOfBirth?: string
  level?: string
}

export interface UpdateTeacherProfileDTO {
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  specialization?: string
  biography?: string
}

export interface UpdateProfileDTO {
  name: string
  image?: string
  studentProfile?: UpdateStudentProfileDTO
  teacherProfile?: UpdateTeacherProfileDTO
}

// Avatar Upload
export interface AvatarUploadResponse {
  success: boolean
  url?: string
  error?: string
}

// API Response Types
export interface ProfileUpdateResponse {
  success: boolean
  message: string
  user?: PortalUser
  studentProfile?: StudentProfile
  teacherProfile?: TeacherProfile
}

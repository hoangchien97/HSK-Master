// Portal User Types
export interface PortalUser {
  id: string
  name: string // Display name (e.g., "Hoang Chien")
  username: string // Unique slug for URL
  email: string
  emailVerified?: Date | string | null
  image?: string | null
  role: UserRole
  status: UserStatus

  // Profile fields
  phoneNumber?: string | null
  address?: string | null
  dateOfBirth?: Date | string | null
  biography?: string | null

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

// Profile Update DTOs
export interface UpdateProfileDTO {
  name?: string
  phoneNumber?: string
  address?: string
  dateOfBirth?: string
  biography?: string
  image?: string
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
}

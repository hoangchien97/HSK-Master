import { UserRole, UserStatus } from "@/enums/portal";

export interface IUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date | string | null;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
  fullName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: Date | string | null;
  biography?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface IUpdateProfileDTO {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  biography?: string;
  image?: string;
}

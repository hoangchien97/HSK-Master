import { UserRole, UserStatus } from "@/enums/portal";

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerified?: Date | string | null;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: Date | string | null;
  biography?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface IUpdateProfileDTO {
  name?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  biography?: string;
  image?: string;
}

import { ClassStatus, EnrollmentStatus } from "@/enums/portal";
import type { IPaginationParams, IPaginatedResponse } from "./api";

export interface IClass {
  id: string;
  className: string;
  classCode: string;
  description?: string | null;
  level?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  status: ClassStatus | string;
  teacherId: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  _count?: {
    enrollments: number;
    schedules: number;
  };
  enrollments?: IEnrollment[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IEnrollment {
  id: string;
  classId: string;
  studentId: string;
  status: EnrollmentStatus | string;
  enrolledAt: Date | string;
  finalGrade?: number | null;
  student?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    username: string;
  };
  class?: IClass;
}

export interface ICreateClassDTO {
  className: string;
  classCode: string;
  description?: string;
  level?: string;
  startDate: string;
  endDate?: string;
  studentIds?: string[];
}

export interface IUpdateClassDTO extends Partial<ICreateClassDTO> {
  status?: ClassStatus;
}

/* ───────── API params / response ───────── */

export interface IGetClassParams extends IPaginationParams {
  search?: string
  status?: string
}

export type IGetClassResponse = IPaginatedResponse<IClass>

import type { IPaginationParams, IPaginatedResponse } from "./api"

/* ───────── Student entity ───────── */

export interface IStudentClassInfo {
  id: string
  className: string
  classCode: string
}

export interface IStudent {
  id: string
  name: string
  username: string
  email: string
  phoneNumber?: string | null
  image?: string | null
  level?: string | null
  status: string
  classes: IStudentClassInfo[]
}

/* ───────── API params / response ───────── */

export interface IGetStudentParams extends IPaginationParams {
  search?: string
  level?: string
  classId?: string
}

export type IGetStudentResponse = IPaginatedResponse<IStudent>

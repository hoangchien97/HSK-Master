import { AttendanceStatus } from "@/app/enums/portal";

export interface IAttendance {
  id: string;
  scheduleId: string;
  studentId: string;
  status: AttendanceStatus | string;
  note?: string | null;
  markedAt: Date | string;
  schedule?: {
    id: string;
    title: string;
    startTime: Date | string;
    class?: {
      className: string;
      classCode: string;
    };
  };
  student?: {
    id: string;
    fullName: string | null;
    email: string;
    image?: string | null;
  };
}

export interface IMarkAttendanceDTO {
  scheduleId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

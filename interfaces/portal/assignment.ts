import { AssignmentStatus, SubmissionStatus } from "@/enums/portal";

export interface IAssignment {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description?: string | null;
  dueDate: Date | string;
  maxScore: number;
  attachments: string[];
  status: AssignmentStatus | string;
  createdAt: Date | string;
  class?: {
    id: string;
    className: string;
    classCode: string;
  };
  _count?: {
    submissions: number;
  };
}

export interface ISubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string | null;
  attachments: string[];
  submittedAt: Date | string;
  score?: number | null;
  feedback?: string | null;
  status: SubmissionStatus | string;
  student?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface ICreateAssignmentDTO {
  classId: string;
  title: string;
  description?: string;
  dueDate: string;
  maxScore: number;
  attachments?: string[];
}

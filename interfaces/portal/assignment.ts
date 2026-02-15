import { AssignmentStatus, SubmissionStatus } from "@/enums/portal";

export interface IAssignment {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description?: string | null;
  dueDate: Date | string | null;
  maxScore: number;
  attachments: string[];
  tags: string[];
  externalLink?: string | null;
  status: AssignmentStatus | string;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  class?: {
    id: string;
    className: string;
    classCode: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
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
    username?: string | null;
  };
}

export interface ICreateAssignmentDTO {
  classId: string;
  title: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  status?: string;
  attachments?: string[];
  tags?: string[];
  externalLink?: string;
}

export interface IUpdateAssignmentDTO extends Partial<ICreateAssignmentDTO> {}

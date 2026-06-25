"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Avatar } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArrowLeft, Users, Calendar, BookOpen, UserPlus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { CSpinner } from "@/components/portal/common";
import type { IClass, IEnrollment } from "@/interfaces/portal";
import { ENROLLMENT_STATUS_COLOR_MAP, ENROLLMENT_STATUS_LABEL_MAP } from "@/constants/portal";
import { MSG_CLASS, MSG } from "@/constants/portal/messages";
import { USER_ROLE } from "@/constants/portal/roles";
import { PAGINATION } from "@/constants/portal/pagination";
import { usePortalUI } from "@/providers/portal-ui-provider";
import api from "@/lib/http/client";

interface ClassDetailViewProps {
  classId: string;
  role: string;
}

export default function ClassDetailView({ classId, role }: ClassDetailViewProps) {
  const router = useRouter();
  const { setDynamicLabel } = usePortalUI();
  const [classData, setClassData] = useState<IClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollEmail, setEnrollEmail] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Pagination for enrollments
  const [page, setPage] = useState(1);
  const rowsPerPage = PAGINATION.DEFAULT_PAGE_SIZE;

  const fetchClass = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<IClass>(`/portal/classes/${classId}`);
      setClassData(data);
      // Set dynamic breadcrumb label for classId segment
      if (data?.className) {
        setDynamicLabel(classId, data.className);
      }
    } catch {
      toast.error(MSG_CLASS.ERROR_LOAD);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [classId, router, setDynamicLabel]);

  useEffect(() => {
    fetchClass();
  }, [fetchClass]);

  const handleEnroll = async () => {
    if (!enrollEmail.trim()) return;
    setIsEnrolling(true);
    try {
      await api.post(`/portal/classes/${classId}/enrollments`, { email: enrollEmail }, { meta: { loading: false } });
      toast.success(MSG_CLASS.STUDENT_ADDED);
      setEnrollEmail("");
      fetchClass();
    } catch (error: unknown) {
      const err = error as { normalized?: { message?: string }; message?: string };
      toast.error(err?.normalized?.message || MSG_CLASS.STUDENT_ADDED);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    try {
      await api.delete(`/portal/classes/${classId}/enrollments`, {
        data: { enrollmentId },
        meta: { loading: false },
      });
      toast.success(MSG_CLASS.STUDENT_REMOVED);
      fetchClass();
    } catch {
      toast.error(MSG.ERROR_GENERIC);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CSpinner message="Đang tải..." />
      </div>
    );
  }

  if (!classData) return null;

  const enrollments = classData.enrollments || [];
  const totalPages = Math.ceil(enrollments.length / rowsPerPage);
  const paginatedEnrollments = enrollments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{classData.className}</h1>
          <p className="text-(--color-muted) text-sm">Mã: {classData.classCode}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
          <div className="flex flex-row items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Users className="w-5 h-5 text-(--color-vermillion)" />
            </div>
            <div>
              <p className="text-sm text-(--color-muted)">Học viên</p>
              <p className="text-xl font-bold">
                {classData._count?.enrollments ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
          <div className="flex flex-row items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Calendar className="w-5 h-5 text-(--color-vermillion)" />
            </div>
            <div>
              <p className="text-sm text-(--color-muted)">Buổi học</p>
              <p className="text-xl font-bold">
                {classData._count?.schedules ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
          <div className="flex flex-row items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-(--color-vermillion)" />
            </div>
            <div>
              <p className="text-sm text-(--color-muted)">Trình độ</p>
              <p className="text-xl font-bold">{classData.level || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {classData.description && (
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Mô tả</h3>
          <hr className="border-t border-(--color-smoke) mb-3" />
          <p className="text-(--color-ink)">{classData.description}</p>
        </div>
      )}

      {/* Enrollment Management */}
      <div className="rounded-xl border border-(--color-smoke) bg-white shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-(--color-smoke)">
          <h3 className="font-semibold">Danh sách học viên</h3>
          {role === USER_ROLE.TEACHER.toLowerCase() && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Input
                placeholder="Email học viên..."
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                wrapperClassName="w-full sm:w-64"
                onKeyDown={(e) => e.key === "Enter" && handleEnroll()}
              />
              <Button
                size="sm"
                variant="primary"
                isLoading={isEnrolling}
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={handleEnroll}
              >
                Thêm
              </Button>
            </div>
          )}
        </div>
        <div className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-smoke) text-(--color-muted) text-xs">
                <th className="text-left px-4 py-2 font-medium">Học viên</th>
                <th className="text-left px-4 py-2 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-2 font-medium">Ngày tham gia</th>
                {role === USER_ROLE.TEACHER.toLowerCase() && (
                  <th className="text-right px-4 py-2 font-medium">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={role === USER_ROLE.TEACHER.toLowerCase() ? 4 : 3} className="text-center py-8 text-(--color-muted)">
                    Chưa có học viên nào
                  </td>
                </tr>
              ) : (
                paginatedEnrollments.map((enrollment: IEnrollment) => (
                  <tr key={enrollment.id} className="border-b border-(--color-smoke) last:border-0 hover:bg-(--color-paper) transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={enrollment.student?.image || undefined}
                          name={enrollment.student?.name || enrollment.student?.email || ""}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium">{enrollment.student?.name || enrollment.student?.email || ""}</p>
                          <p className="text-xs text-gray-400">{enrollment.student?.username ? `@${enrollment.student.username}` : enrollment.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        size="sm"
                        variant={ENROLLMENT_STATUS_COLOR_MAP[enrollment.status] || "default"}
                      >
                        {ENROLLMENT_STATUS_LABEL_MAP[enrollment.status] || enrollment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {dayjs(enrollment.enrolledAt).format("DD/MM/YYYY")}
                    </td>
                    {role === USER_ROLE.TEACHER.toLowerCase() && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(enrollment.id)}
                          className="p-1.5 rounded-md hover:bg-(--color-smoke) text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex w-full justify-center items-center gap-2 py-3 border-t border-(--color-smoke)">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-(--color-smoke) disabled:opacity-40 hover:bg-(--color-paper) transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-(--color-muted)">{page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-(--color-smoke) disabled:opacity-40 hover:bg-(--color-paper) transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

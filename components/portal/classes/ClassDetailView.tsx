"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  User as UserAvatar,
  Divider,
  Pagination,
} from "@heroui/react";
import { ArrowLeft, Users, Calendar, BookOpen, UserPlus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import type { IClass, IEnrollment } from "@/interfaces/portal";
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
  const rowsPerPage = 10;

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
      toast.error("Không tìm thấy lớp học");
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
      toast.success("Thêm học viên thành công!");
      setEnrollEmail("");
      fetchClass();
    } catch (error: any) {
      toast.error(error?.normalized?.message || "Thêm học viên thất bại");
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
      toast.success("Đã xóa học viên!");
      fetchClass();
    } catch {
      toast.error("Không thể xóa học viên");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Đang tải..." />
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
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          onPress={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{classData.className}</h1>
          <p className="text-default-500 text-sm">Mã: {classData.classCode}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Học viên</p>
              <p className="text-xl font-bold">
                {classData._count?.enrollments ?? 0}/{classData.maxStudents}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Buổi học</p>
              <p className="text-xl font-bold">
                {classData._count?.schedules ?? 0}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Trình độ</p>
              <p className="text-xl font-bold">{classData.level || "—"}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Description */}
      {classData.description && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Mô tả</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-default-600">{classData.description}</p>
          </CardBody>
        </Card>
      )}

      {/* Enrollment Management */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="font-semibold">Danh sách học viên</h3>
          {role === "teacher" && (
            <div className="flex items-center gap-2">
              <Input
                size="sm"
                placeholder="Email học viên..."
                value={enrollEmail}
                onValueChange={setEnrollEmail}
                className="w-64"
                onKeyDown={(e) => e.key === "Enter" && handleEnroll()}
              />
              <Button
                size="sm"
                color="primary"
                isLoading={isEnrolling}
                startContent={<UserPlus className="w-4 h-4" />}
                onPress={handleEnroll}
              >
                Thêm
              </Button>
            </div>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table
            aria-label="Danh sách học viên"
            removeWrapper
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-center py-2">
                  <Pagination
                    isCompact
                    showControls
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>Học viên</TableColumn>
              <TableColumn>Trạng thái</TableColumn>
              <TableColumn>Ngày tham gia</TableColumn>
              {role === "teacher" ? (
                <TableColumn align="end">Thao tác</TableColumn>
              ) : (
                <TableColumn className="hidden">_</TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={paginatedEnrollments}
              emptyContent="Chưa có học viên nào"
            >
              {(enrollment: IEnrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <UserAvatar
                      name={enrollment.student?.fullName || enrollment.student?.email || ""}
                      description={enrollment.student?.email}
                      avatarProps={{
                        src: enrollment.student?.image || undefined,
                        size: "sm",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={
                        enrollment.status === "ENROLLED"
                          ? "success"
                          : enrollment.status === "DROPPED"
                          ? "danger"
                          : "default"
                      }
                      variant="flat"
                    >
                      {enrollment.status === "ENROLLED"
                        ? "Đang học"
                        : enrollment.status === "DROPPED"
                        ? "Đã nghỉ"
                        : "Hoàn thành"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {dayjs(enrollment.enrolledAt).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>
                    {role === "teacher" && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleRemoveStudent(enrollment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}

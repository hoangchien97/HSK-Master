"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Select,
  SelectItem,
  Chip,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  ButtonGroup,
  Input,
  Divider,
  Pagination,
} from "@heroui/react"
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Download,
  Save,
  Clock,
  AlertCircle,
} from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/http/client"
import dayjs from "dayjs"
import "dayjs/locale/vi"

dayjs.locale("vi")

/* ──────────────────────── types ──────────────────────── */

interface StudentData {
  id: string
  name: string
  image?: string | null
}

interface ClassEnrollment {
  id: string
  student: StudentData
}

interface ClassData {
  id: string
  className: string
  classCode: string
  enrollments: ClassEnrollment[]
}

interface AttendanceRecord {
  id: string
  date: Date
  status: string
  student: { id: string; name: string }
  class: { className: string }
}

type AttendanceStatus = "present" | "absent" | "late" | "excused"

interface AttendanceViewProps {
  classes: ClassData[]
  recentAttendances: AttendanceRecord[]
}

/* ──────────────────── status config ──────────────────── */

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: "success" | "danger" | "warning" | "primary" }
> = {
  present: { label: "Có mặt", color: "success" },
  absent: { label: "Vắng", color: "danger" },
  late: { label: "Muộn", color: "warning" },
  excused: { label: "Có phép", color: "primary" },
}

const HISTORY_STATUS: Record<string, { label: string; color: "success" | "danger" | "warning" | "primary" }> = {
  PRESENT: { label: "Có mặt", color: "success" },
  ABSENT: { label: "Vắng", color: "danger" },
  LATE: { label: "Muộn", color: "warning" },
  EXCUSED: { label: "Có phép", color: "primary" },
}

const HISTORY_COLUMNS = [
  { key: "date", label: "Ngày" },
  { key: "class", label: "Lớp" },
  { key: "student", label: "Học viên" },
  { key: "status", label: "Trạng thái" },
]

/* ──────────────────── component ──────────────────────── */

export default function AttendanceView({
  classes,
  recentAttendances,
}: AttendanceViewProps) {
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const historyRowsPerPage = 10

  /* derived data */
  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  )

  const students = useMemo(
    () =>
      selectedClass?.enrollments.map((e) => ({
        id: e.student.id,
        name: e.student.name,
        image: e.student.image,
      })) ?? [],
    [selectedClass],
  )

  /* auto-initialize attendance map */
  useMemo(() => {
    if (students.length > 0 && Object.keys(attendance).length === 0) {
      const initial: Record<string, AttendanceStatus> = {}
      students.forEach((s) => { initial[s.id] = "present" })
      setAttendance(initial)
    }
  }, [students]) // eslint-disable-line react-hooks/exhaustive-deps

  /* summary counts */
  const summary = useMemo(() => {
    const vals = Object.values(attendance)
    return {
      present: vals.filter((s) => s === "present").length || students.length,
      absent: vals.filter((s) => s === "absent").length,
      late: vals.filter((s) => s === "late").length,
      excused: vals.filter((s) => s === "excused").length,
    }
  }, [attendance, students.length])

  /* handlers */
  const handleStatusChange = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setAttendance((prev) => ({ ...prev, [studentId]: status }))
    },
    [],
  )

  const handleClassChange = useCallback(
    (value: string) => {
      setSelectedClassId(value)
      setAttendance({})
    },
    [],
  )

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedDate) return

    setLoading(true)
    try {
      const attendanceData = students.map((student) => ({
        studentId: student.id,
        status: attendance[student.id] || "present",
      }))

      await api.post("/portal/attendance", {
        classId: selectedClassId,
        date: selectedDate,
        attendance: attendanceData,
      }, { meta: { loading: false } })

      toast.success("Điểm danh thành công!")
      router.refresh()
    } catch {
      toast.error("Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  /* history pagination */
  const historyPages = Math.ceil(recentAttendances.length / historyRowsPerPage)
  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * historyRowsPerPage
    return recentAttendances.slice(start, start + historyRowsPerPage)
  }, [recentAttendances, historyPage])

  /* ──────────────────── render ──────────────────────── */

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Users className="w-16 h-16 text-default-300" />
        <p className="text-lg font-semibold text-default-500">Chưa có lớp học nào</p>
        <p className="text-sm text-default-400">Tạo lớp học để bắt đầu điểm danh</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Điểm danh</h1>
          <p className="text-default-500 text-sm mt-1">
            Điểm danh học viên theo buổi học
          </p>
        </div>
        <Button
          variant="bordered"
          startContent={<Download className="w-4 h-4" />}
        >
          Xuất báo cáo
        </Button>
      </div>

      {/* ─── Filters ─── */}
      <Card shadow="sm">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Lớp học"
              selectedKeys={selectedClassId ? [selectedClassId] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string
                if (val) handleClassChange(val)
              }}
              className="flex-1"
            >
              {classes.map((c) => (
                <SelectItem key={c.id}>
                  {c.className} ({c.classCode})
                </SelectItem>
              ))}
            </Select>

            <Input
              type="date"
              label="Ngày điểm danh"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 max-w-xs"
            />
          </div>
        </CardBody>
      </Card>

      {/* ─── Summary ─── */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { key: "present" as const, icon: CheckCircle, label: "Có mặt" },
            { key: "absent" as const, icon: XCircle, label: "Vắng" },
            { key: "late" as const, icon: Clock, label: "Muộn" },
            { key: "excused" as const, icon: AlertCircle, label: "Có phép" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <Card key={key} shadow="sm">
              <CardBody className="flex flex-row items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    key === "present"
                      ? "bg-success-100 text-success-600"
                      : key === "absent"
                        ? "bg-danger-100 text-danger-600"
                        : key === "late"
                          ? "bg-warning-100 text-warning-600"
                          : "bg-primary-100 text-primary-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary[key]}</p>
                  <p className="text-xs text-default-500">{label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Attendance Table ─── */}
      <Card shadow="sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">Danh sách học viên</h3>
            <p className="text-sm text-default-500">
              {selectedClass?.className} –{" "}
              {dayjs(selectedDate).format("dddd, DD/MM/YYYY")}
            </p>
          </div>
          <Button
            color="primary"
            isLoading={loading}
            isDisabled={students.length === 0}
            startContent={!loading && <Save className="w-4 h-4" />}
            onPress={handleSubmit}
          >
            {loading ? "Đang lưu..." : "Lưu điểm danh"}
          </Button>
        </CardHeader>

        <Divider />

        {students.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center py-8 gap-2">
              <Users className="w-12 h-12 text-default-300" />
              <p className="text-default-500">Lớp học chưa có học viên</p>
            </div>
          </CardBody>
        ) : (
          <Table
            aria-label="Bảng điểm danh"
            removeWrapper
            isStriped
          >
            <TableHeader>
              <TableColumn>STT</TableColumn>
              <TableColumn>Học viên</TableColumn>
              <TableColumn className="text-center">Trạng thái</TableColumn>
            </TableHeader>
            <TableBody>
              {students.map((student, idx) => {
                const currentStatus = attendance[student.id] || "present"
                return (
                  <TableRow key={student.id}>
                    <TableCell className="w-14">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={student.image || undefined}
                          name={student.name.charAt(0)}
                          size="sm"
                        />
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ButtonGroup size="sm" className="justify-center">
                        {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(
                          (status) => (
                            <Button
                              key={status}
                              color={STATUS_CONFIG[status].color}
                              variant={currentStatus === status ? "solid" : "bordered"}
                              onPress={() => handleStatusChange(student.id, status)}
                              size="sm"
                            >
                              {STATUS_CONFIG[status].label}
                            </Button>
                          ),
                        )}
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ─── Recent History ─── */}
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Lịch sử điểm danh gần đây</h3>
        </CardHeader>
        <Divider />

        {recentAttendances.length === 0 ? (
          <CardBody>
            <div className="flex flex-col items-center py-8 gap-2">
              <Calendar className="w-12 h-12 text-default-300" />
              <p className="text-default-500">Chưa có lịch sử điểm danh</p>
            </div>
          </CardBody>
        ) : (
          <>
            <Table
              aria-label="Lịch sử điểm danh"
              removeWrapper
              isStriped
            >
              <TableHeader columns={HISTORY_COLUMNS}>
                {(column) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={paginatedHistory}>
                {(record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {dayjs(record.date).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>{record.class.className}</TableCell>
                    <TableCell>
                      {record.student.name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={
                          HISTORY_STATUS[record.status]?.color ?? "default"
                        }
                        variant="flat"
                      >
                        {HISTORY_STATUS[record.status]?.label ?? record.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {historyPages > 1 && (
              <CardBody className="flex items-center justify-center">
                <Pagination
                  total={historyPages}
                  page={historyPage}
                  onChange={setHistoryPage}
                  showControls
                  color="primary"
                />
              </CardBody>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

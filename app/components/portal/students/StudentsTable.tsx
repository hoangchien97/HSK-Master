"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  SelectItem,
  Chip,
  Avatar,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react"
import {
  Search,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Users,
} from "lucide-react"

/* ──────────────────────── types ──────────────────────── */

interface ClassInfo {
  id: string
  className: string
  classCode: string
}

interface StudentData {
  id: string
  name: string
  fullName?: string | null
  email: string
  phoneNumber?: string | null
  image?: string | null
  level?: string | null
  status: string
  classes: ClassInfo[]
}

interface StudentsTableProps {
  students: StudentData[]
}

/* ──────────────────── config ──────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "warning" | "primary" | "default" }> = {
  ACTIVE: { label: "Đang học", color: "success" },
  INACTIVE: { label: "Tạm nghỉ", color: "warning" },
  GRADUATED: { label: "Tốt nghiệp", color: "primary" },
}

const HSK_LEVELS = [
  { key: "ALL", label: "Tất cả trình độ" },
  { key: "HSK1", label: "HSK 1" },
  { key: "HSK2", label: "HSK 2" },
  { key: "HSK3", label: "HSK 3" },
  { key: "HSK4", label: "HSK 4" },
  { key: "HSK5", label: "HSK 5" },
  { key: "HSK6", label: "HSK 6" },
]

const COLUMNS = [
  { key: "student", label: "Học viên" },
  { key: "level", label: "Trình độ" },
  { key: "classes", label: "Lớp học" },
  { key: "status", label: "Trạng thái" },
  { key: "actions", label: "" },
]

/* ──────────────────── component ──────────────────────── */

export default function StudentsTable({ students }: StudentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  /* filtering */
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        (s.fullName || s.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchLevel = levelFilter === "ALL" || s.level === levelFilter
      return matchSearch && matchLevel
    })
  }, [students, searchQuery, levelFilter])

  /* pagination */
  const pages = Math.ceil(filteredStudents.length / rowsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredStudents.slice(start, start + rowsPerPage)
  }, [filteredStudents, page])

  /* render cell */
  const renderCell = useCallback(
    (student: StudentData, columnKey: string) => {
      switch (columnKey) {
        case "student":
          return (
            <div className="flex items-center gap-3">
              <Avatar
                src={student.image || undefined}
                name={(student.fullName || student.name).charAt(0)}
                size="sm"
              />
              <div>
                <p className="font-medium">
                  {student.fullName || student.name}
                </p>
                <p className="text-xs text-default-400">{student.email}</p>
              </div>
            </div>
          )

        case "level":
          return student.level ? (
            <Chip
              size="sm"
              color="primary"
              variant="flat"
              startContent={<GraduationCap className="w-3 h-3" />}
            >
              {student.level}
            </Chip>
          ) : (
            <span className="text-default-400">—</span>
          )

        case "classes":
          return (
            <div className="flex flex-wrap gap-1">
              {student.classes.slice(0, 2).map((c) => (
                <Chip key={c.id} size="sm" variant="flat">
                  {c.classCode}
                </Chip>
              ))}
              {student.classes.length > 2 && (
                <Chip size="sm" variant="flat">
                  +{student.classes.length - 2}
                </Chip>
              )}
              {student.classes.length === 0 && (
                <span className="text-default-400 text-sm">Chưa có lớp</span>
              )}
            </div>
          )

        case "status":
          return (
            <Chip
              size="sm"
              color={STATUS_CONFIG[student.status]?.color ?? "default"}
              variant="flat"
            >
              {STATUS_CONFIG[student.status]?.label ?? student.status}
            </Chip>
          )

        case "actions":
          return (
            <div className="flex justify-end items-center gap-1">
              {student.email && (
                <Button
                  as="a"
                  href={`mailto:${student.email}`}
                  isIconOnly
                  size="sm"
                  variant="light"
                  title="Gửi email"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              )}
              {student.phoneNumber && (
                <Button
                  as="a"
                  href={`tel:${student.phoneNumber}`}
                  isIconOnly
                  size="sm"
                  variant="light"
                  title="Gọi điện"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              )}
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Thao tác">
                  <DropdownItem
                    key="view"
                    startContent={<Eye className="w-4 h-4" />}
                    href={`/portal/teacher/students/${student.id}`}
                  >
                    Xem chi tiết
                  </DropdownItem>
                  <DropdownItem
                    key="progress"
                    startContent={<GraduationCap className="w-4 h-4" />}
                    href={`/portal/teacher/students/${student.id}/progress`}
                  >
                    Xem tiến độ
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )

        default:
          return null
      }
    },
    [],
  )

  /* top content */
  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý học viên</h1>
          <p className="text-default-500 text-sm mt-1">
            Tổng cộng {students.length} học viên
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            isClearable
            placeholder="Tìm kiếm học viên..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchQuery}
            onValueChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            className="w-full sm:max-w-sm"
          />
          <Select
            placeholder="Tất cả trình độ"
            selectedKeys={[levelFilter]}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string
              setLevelFilter(val || "ALL")
              setPage(1)
            }}
            className="w-full sm:w-48"
          >
            {HSK_LEVELS.map((l) => (
              <SelectItem key={l.key}>{l.label}</SelectItem>
            ))}
          </Select>
        </div>
      </div>
    ),
    [students.length, searchQuery, levelFilter],
  )

  /* bottom content */
  const bottomContent = useMemo(
    () =>
      pages > 1 ? (
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-sm text-default-400">
            {filteredStudents.length} học viên
          </span>
          <Pagination
            total={pages}
            page={page}
            onChange={setPage}
            showControls
            color="primary"
          />
        </div>
      ) : null,
    [pages, page, filteredStudents.length],
  )

  return (
    <Table
      aria-label="Bảng học viên"
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      isStriped
    >
      <TableHeader columns={COLUMNS}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === "actions" ? "end" : "start"}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={paginatedItems}
        emptyContent={
          <div className="flex flex-col items-center py-10 gap-2">
            <Users className="w-12 h-12 text-default-300" />
            <p className="text-default-500">Chưa có học viên nào</p>
          </div>
        }
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey as string)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

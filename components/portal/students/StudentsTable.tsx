"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Chip, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Tooltip,
} from "@heroui/react"
import {
  MoreVertical, Eye, Mail, Phone, GraduationCap, Users, UserPlus,
} from "lucide-react"
import { toast } from "react-toastify"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PAGINATION, STUDENT_STATUS_CONFIG } from "@/constants/portal"
import { CTable, type CTableColumn } from "@/components/portal/common"
import StudentsToolbar from "./StudentsToolbar"
import { fetchStudents, fetchClassesForFilter } from "@/actions/student.actions"
import type { IStudent, IGetStudentResponse } from "@/interfaces/portal"
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams"

export default function StudentsTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const urlSearch = searchParams.get("search") || ""
  const urlLevel = searchParams.get("level") || "ALL"
  const urlClassId = searchParams.get("classId") || "ALL"
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE)
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE)

  const [search, setSearch] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(search, 350)

  const [data, setData] = useState<IGetStudentResponse>({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<{ id: string; className: string; classCode: string }[]>([])

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      let shouldResetPage = false

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "ALL") {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
        if (key !== "page") shouldResetPage = true
      }

      if (shouldResetPage && !("page" in updates)) {
        newParams.delete("page")
      }

      const qs = newParams.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  /* ─── Load classes for filter dropdown ─── */
  useEffect(() => {
    const loadClasses = async () => {
      const result = await fetchClassesForFilter()
      if (result.success && result.classes) {
        setClasses(result.classes)
      }
    }
    loadClasses()
  }, [])

  /* ─── Load students via server action ─── */
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchStudents({
        search: debouncedSearch || undefined,
        level: urlLevel !== "ALL" ? urlLevel : undefined,
        classId: urlClassId !== "ALL" ? urlClassId : undefined,
        page: urlPage,
        pageSize: urlPageSize,
      })
      if (result.success && result.data) {
        setData(result.data)
      } else {
        toast.error(result.error || "Không thể tải danh sách học viên")
      }
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error("Không thể tải danh sách học viên")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, urlLevel, urlClassId, urlPage, urlPageSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  useSyncSearchToUrl(debouncedSearch, updateUrl)

  const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams)

  const columns: CTableColumn<IStudent & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]",
      render: (_v, _row, index) => (
        <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + index + 1}</span>
      ),
    },
    {
      key: "student", label: "Học viên", sortable: true,
      render: (_v, row) => (
        <div className="flex items-center gap-3 max-w-50">
          <Avatar src={row.image || undefined} name={(row.name)?.charAt(0)} size="sm" className="shrink-0" />
          <div className="min-w-0">
            <Tooltip content={row.name} placement="top" delay={500}>
              <p className="font-medium text-sm truncate">{row.name}</p>
            </Tooltip>
            <p className="text-xs text-default-400 truncate">@{row.username || row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "level", label: "Trình độ", sortable: true, headerClassName: "w-[100px]",
      render: (_v, row) =>
        row.level ? (
          <Chip size="sm" color="primary" variant="flat">
            {row.level}
          </Chip>
        ) : (<span className="text-default-400">—</span>),
    },
    {
      key: "classes", label: "Lớp học", headerClassName: "w-[160px]",
      render: (_v, row) => {
        if (!row.classes || row.classes.length === 0) {
          return <span className="text-default-400 text-sm">Chưa có lớp</span>
        }
        const displayText = row.classes.map(c => c.classCode).join(", ")
        return (
          <Tooltip content={displayText} placement="top" delay={500}>
            <span className="text-sm truncate block max-w-40">{displayText}</span>
          </Tooltip>
        )
      },
    },
    {
      key: "status", label: "Trạng thái", sortable: true, headerClassName: "w-[110px]",
      render: (_v, row) => (
        <Chip size="sm" color={STUDENT_STATUS_CONFIG[row.status]?.color ?? "default"} variant="flat">
          {STUDENT_STATUS_CONFIG[row.status]?.label ?? row.status}
        </Chip>
      ),
    },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[100px]",
      render: (_v, row) => (
        <div className="flex justify-end items-center gap-1">
          {row.email && (
            <Button as="a" href={`mailto:${row.email}`} isIconOnly size="sm" variant="light" title="Gửi email">
              <Mail className="w-4 h-4" />
            </Button>
          )}
          {row.phoneNumber && (
            <Button as="a" href={`tel:${row.phoneNumber}`} isIconOnly size="sm" variant="light" title="Gọi điện">
              <Phone className="w-4 h-4" />
            </Button>
          )}
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Thao tác">
              <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />} href={`/portal/teacher/students/${row.id}`}>
                Xem chi tiết
              </DropdownItem>
              <DropdownItem key="progress" startContent={<GraduationCap className="w-4 h-4" />} href={`/portal/teacher/students/${row.id}/progress`}>
                Xem tiến độ
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ], [urlPage, urlPageSize])

  return (
    <CTable<IStudent & Record<string, unknown>>
      columns={columns}
      data={data.items as (IStudent & Record<string, unknown>)[]}
      rowKey="id"
      page={urlPage}
      pageSize={urlPageSize}
      total={data.total}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      isLoading={isLoading}
      onPageChange={(p) => updateUrl({ page: String(p) })}
      onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
      ariaLabel="Bảng học viên"
      emptyContent={{
        icon: <Users className="w-12 h-12" />,
        title: "Chưa có học viên nào",
        description: "Thêm học viên vào lớp để quản lý",
      }}
      actions={undefined}
      toolbar={
        <StudentsToolbar
          search={search}
          onSearchChange={setSearch}
          levelFilter={urlLevel}
          onLevelChange={(v) => updateUrl({ level: v })}
          classFilter={urlClassId}
          onClassChange={(v) => updateUrl({ classId: v })}
          classes={classes}
        />
      }
    />
  )
}

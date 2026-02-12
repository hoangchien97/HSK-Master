"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Chip, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button,
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
import { useDebouncedValue } from "@/hooks/useTableParams"
import { usePortalUI } from "@/providers/portal-ui-provider"

export default function StudentsTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { startLoading, stopLoading } = usePortalUI()

  const urlSearch = searchParams.get("search") || ""
  const urlLevel = searchParams.get("level") || "ALL"
  const urlClassId = searchParams.get("classId") || "ALL"
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE)
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE)

  const [search, setSearch] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(search, 350)

  const [data, setData] = useState<IGetStudentResponse>({ items: [], total: 0 })
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
    startLoading()
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
    stopLoading()
  }, [debouncedSearch, urlLevel, urlClassId, urlPage, urlPageSize, startLoading, stopLoading])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    updateUrl({ search: debouncedSearch })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const columns: CTableColumn<IStudent & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "stt", label: "STT", align: "center" as const, headerClassName: "w-12",
      render: (_v, _row, index) => (
        <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + index + 1}</span>
      ),
    },
    {
      key: "student", label: "Học viên",
      render: (_v, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.image || undefined} name={(row.name)?.charAt(0)} size="sm" />
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-default-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "level", label: "Trình độ",
      render: (_v, row) =>
        row.level ? (
          <Chip size="sm" color="primary" variant="flat" startContent={<GraduationCap className="w-3 h-3" />}>
            {row.level}
          </Chip>
        ) : (<span className="text-default-400">—</span>),
    },
    {
      key: "classes", label: "Lớp học",
      render: (_v, row) => (
        <div className="flex flex-wrap gap-1">
          {row.classes?.slice(0, 2).map((c) => (
            <Chip key={c.id} size="sm" variant="flat">{c.classCode}</Chip>
          ))}
          {(row.classes?.length ?? 0) > 2 && (
            <Chip size="sm" variant="flat">+{row.classes!.length - 2}</Chip>
          )}
          {(!row.classes || row.classes.length === 0) && (
            <span className="text-default-400 text-sm">Chưa có lớp</span>
          )}
        </div>
      ),
    },
    {
      key: "status", label: "Trạng thái",
      render: (_v, row) => (
        <Chip size="sm" color={STUDENT_STATUS_CONFIG[row.status]?.color ?? "default"} variant="flat">
          {STUDENT_STATUS_CONFIG[row.status]?.label ?? row.status}
        </Chip>
      ),
    },
    {
      key: "actions", label: "", align: "end" as const,
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

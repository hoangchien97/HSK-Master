"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Chip, useDisclosure } from "@heroui/react"
import { Users, Calendar } from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { IClass, IGetClassResponse } from "@/interfaces/portal"
import { PAGINATION, CLASS_STATUS_COLOR_MAP, CLASS_STATUS_LABEL_MAP } from "@/constants/portal"
import { CTable, type CTableColumn } from "@/components/portal/common"
import ClassesToolbar from "./ClassesToolbar"
import ClassDetailDrawer from "./ClassDetailDrawer"
import { fetchClasses } from "@/actions/class.actions"
import { useDebouncedValue } from "@/hooks/useTableParams"
import { usePortalUI } from "@/providers/portal-ui-provider"

dayjs.locale("vi")

export default function StudentClassesView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { startLoading, stopLoading } = usePortalUI()

  const urlSearch = searchParams.get("search") || ""
  const urlStatus = searchParams.get("status") || "ALL"
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE)
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE)

  const [search, setSearch] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(search, 350)
  const [data, setData] = useState<IGetClassResponse>({ items: [], total: 0 })

  const detailDrawer = useDisclosure()
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null)

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

  /* ─── Load data via server action (role-aware) ─── */
  const loadData = useCallback(async () => {
    startLoading()
    const result = await fetchClasses({
      search: debouncedSearch || undefined,
      status: urlStatus !== "ALL" ? urlStatus : undefined,
      page: urlPage,
      pageSize: urlPageSize,
    })
    if (result.success && result.data) {
      setData(result.data)
    } else {
      toast.error(result.error || "Không thể tải danh sách lớp")
    }
    stopLoading()
  }, [debouncedSearch, urlStatus, urlPage, urlPageSize, startLoading, stopLoading])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    updateUrl({ search: debouncedSearch })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  /* ─── Handlers ─── */
  const handleViewDetail = useCallback(
    (cls: IClass) => {
      setSelectedClass(cls)
      detailDrawer.onOpen()
    },
    [detailDrawer],
  )

  /* ─── Columns (read-only — no actions column) ─── */
  const columns: CTableColumn<IClass & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "stt",
      label: "STT",
      align: "center" as const,
      headerClassName: "w-12",
      render: (_v, _row, index) => (
        <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + index + 1}</span>
      ),
    },
    {
      key: "className",
      label: "Tên lớp",
      render: (_v, row) => (
        <button
          className="text-left hover:text-primary transition-colors"
          onClick={() => handleViewDetail(row as IClass)}
        >
          <p className="font-semibold text-sm">{row.className}</p>
          {row.teacher && (
            <p className="text-xs text-default-400">GV: {row.teacher.name || row.teacher.email}</p>
          )}
        </button>
      ),
    },
    {
      key: "classCode",
      label: "Mã lớp",
      render: (_v, row) => <Chip size="sm" variant="flat">{row.classCode}</Chip>,
    },
    {
      key: "level",
      label: "Trình độ",
      render: (_v, row) => row.level
        ? <Chip size="sm" color="primary" variant="flat">{row.level}</Chip>
        : <span className="text-default-300">—</span>,
    },
    {
      key: "students",
      label: "Học viên",
      render: (_v, row) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-default-400" />
          <span className="text-sm">{row._count?.enrollments ?? 0}</span>
        </div>
      ),
    },
    {
      key: "startDate",
      label: "Ngày bắt đầu",
      render: (_v, row) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-default-400" />
          <span className="text-sm">{dayjs(row.startDate).format("DD/MM/YYYY")}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_v, row) => (
        <Chip size="sm" color={CLASS_STATUS_COLOR_MAP[row.status] || "default"} variant="flat">
          {CLASS_STATUS_LABEL_MAP[row.status] || row.status}
        </Chip>
      ),
    },
  ], [urlPage, urlPageSize, handleViewDetail])

  return (
    <>
      <CTable<IClass & Record<string, unknown>>
        columns={columns}
        data={data.items as (IClass & Record<string, unknown>)[]}
        rowKey="id"
        page={urlPage}
        pageSize={urlPageSize}
        total={data.total}
        onPageChange={(p) => updateUrl({ page: String(p) })}
        onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Danh sách lớp học"
        emptyContent={{
          icon: <Users className="w-12 h-12" />,
          title: "Chưa tham gia lớp học nào",
          description: "Liên hệ giáo viên để được thêm vào lớp học",
        }}
        toolbar={
          <ClassesToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={urlStatus}
            onStatusChange={(v) => updateUrl({ status: v })}
          />
        }
      />

      <ClassDetailDrawer
        isOpen={detailDrawer.isOpen}
        onOpenChange={detailDrawer.onOpenChange}
        classData={selectedClass}
      />
    </>
  )
}

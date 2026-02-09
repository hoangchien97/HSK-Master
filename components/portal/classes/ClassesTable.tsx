"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Chip,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Plus, Edit2, Trash2, MoreVertical, Users, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IClass, IGetClassResponse } from "@/interfaces/portal";
import { PAGINATION, CLASS_STATUS_COLOR_MAP, CLASS_STATUS_LABEL_MAP } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import ClassesToolbar from "./ClassesToolbar";
import ClassFormModal from "./ClassFormModal";
import DeleteClassModal from "./DeleteClassModal";
import api from "@/lib/http/client";
import { useDebouncedValue } from "@/hooks/useTableParams";

/* ──────────────────── component ──────────────────── */

export default function ClassesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /* ─── URL params ─── */
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "ALL";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  /* ─── Local state ─── */
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetClassResponse>({ items: [], total: 0 });

  /* ─── Modals ─── */
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);

  /* ─── Refresh trigger ─── */
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  /* ─── URL updater: keeps existing params, resets page on filter change ─── */
  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      let shouldResetPage = false;

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "ALL") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
        if (key !== "page") shouldResetPage = true;
      }

      // Reset page to 1 when any filter (non-page) changes
      if (shouldResetPage && !("page" in updates)) {
        newParams.delete("page");
      }

      const qs = newParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  /* ─── Fetch data (uses global loading) ─── */
  useEffect(() => {
    let cancelled = false;
    const fetchClasses = async () => {
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (urlStatus !== "ALL") params.set("status", urlStatus);
        params.set("page", String(urlPage));
        params.set("pageSize", String(urlPageSize));

        const { data: res } = await api.get<IGetClassResponse>(
          `/portal/classes?${params}`,
        );
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) toast.error("Không thể tải danh sách lớp");
      }
    };
    fetchClasses();
    return () => { cancelled = true; };
  }, [debouncedSearch, urlStatus, urlPage, urlPageSize, refreshKey]);

  /* ─── Sync search → URL ─── */
  useEffect(() => {
    updateUrl({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  /* ─── Handlers ─── */
  const handleEdit = (cls: IClass) => { setSelectedClass(cls); editModal.onOpen(); };
  const handleDelete = (cls: IClass) => { setSelectedClass(cls); deleteModal.onOpen(); };

  /* ─── Columns ─── */
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
          onClick={() => router.push(`/portal/teacher/classes/${row.id}`)}
        >
          <p className="font-semibold text-sm">{row.className}</p>
          {row.teacher && (
            <p className="text-xs text-default-400">GV: {row.teacher.fullName || row.teacher.email}</p>
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
          <span className="text-sm">{row._count?.enrollments ?? 0}/{row.maxStudents}</span>
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
    {
      key: "actions",
      label: "",
      align: "end" as const,
      render: (_v, row) => (
        <div className="flex justify-end">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Thao tác">
              <DropdownItem key="edit" startContent={<Edit2 className="w-4 h-4" />} onPress={() => handleEdit(row as IClass)}>
                Chỉnh sửa
              </DropdownItem>
              <DropdownItem key="delete" startContent={<Trash2 className="w-4 h-4" />} className="text-danger" color="danger" onPress={() => handleDelete(row as IClass)}>
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [urlPage, urlPageSize, router]);

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
          title: "Chưa có lớp học nào",
          description: "Tạo lớp học mới để bắt đầu",
        }}
        actions={
          <Button color="primary" size="sm" startContent={<Plus className="w-4 h-4" />} onPress={createModal.onOpen}>
            Tạo lớp mới
          </Button>
        }
        toolbar={
          <ClassesToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={urlStatus}
            onStatusChange={(v) => updateUrl({ status: v })}
          />
        }
      />

      {/* Modals */}
      <ClassFormModal isOpen={createModal.isOpen} onClose={createModal.onClose} onSuccess={refresh} />
      {selectedClass && (
        <ClassFormModal
          isOpen={editModal.isOpen}
          onClose={() => { editModal.onClose(); setSelectedClass(null); }}
          onSuccess={refresh}
          initialData={selectedClass}
        />
      )}
      {selectedClass && (
        <DeleteClassModal
          isOpen={deleteModal.isOpen}
          onClose={() => { deleteModal.onClose(); setSelectedClass(null); }}
          onSuccess={refresh}
          classData={selectedClass}
        />
      )}
    </>
  );
}

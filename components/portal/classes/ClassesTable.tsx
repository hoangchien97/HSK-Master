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
  Tooltip,
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
import { fetchClasses } from "@/actions/class.actions";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";

export default function ClassesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "ALL";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetClassResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);

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

      if (shouldResetPage && !("page" in updates)) {
        newParams.delete("page");
      }

      const qs = newParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams);

  /* ─── Load data via server action ─── */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchClasses({
        search: debouncedSearch || undefined,
        status: urlStatus !== "ALL" ? urlStatus : undefined,
        page: urlPage,
        pageSize: urlPageSize,
      });
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || "Không thể tải danh sách lớp");
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error("Không thể tải danh sách lớp");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, urlStatus, urlPage, urlPageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useSyncSearchToUrl(debouncedSearch, updateUrl);

  /* ─── Optimistic handlers ─── */
  const handleCreateSuccess = useCallback(
    (newClass: IClass) => {
      setData((prev) => ({
        items: [newClass, ...prev.items],
        total: prev.total + 1,
      }));
    },
    [],
  );

  const handleUpdateSuccess = useCallback(
    (updated: IClass) => {
      setData((prev) => ({
        ...prev,
        items: prev.items.map((c) => (c.id === updated.id ? updated : c)),
      }));
    },
    [],
  );

  const handleDeleteSuccess = useCallback(
    (classId: string) => {
      setData((prev) => ({
        items: prev.items.filter((c) => c.id !== classId),
        total: prev.total - 1,
      }));
    },
    [],
  );

  const handleEdit = useCallback((cls: IClass) => { setSelectedClass(cls); editModal.onOpen(); }, [editModal]);
  const handleDelete = useCallback((cls: IClass) => { setSelectedClass(cls); deleteModal.onOpen(); }, [deleteModal]);

  const columns: CTableColumn<IClass & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "stt",
      label: "STT",
      align: "center" as const,
      headerClassName: "w-[50px]",
      render: (_v, _row, index) => (
        <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + index + 1}</span>
      ),
    },
    {
      key: "className",
      label: "Tên lớp",
      sortable: true,
      render: (_v, row) => (
        <button
          className="text-left hover:text-primary transition-colors max-w-50"
          onClick={() => router.push(`/portal/teacher/classes/${row.id}`)}
        >
          <Tooltip content={row.className} placement="top" delay={500}>
            <p className="font-semibold text-sm truncate">{row.className}</p>
          </Tooltip>
        </button>
      ),
    },
    {
      key: "classCode",
      label: "Mã lớp",
      headerClassName: "w-[120px]",
      render: (_v, row) => (
        <Tooltip content={row.classCode} placement="top" delay={500}>
          <span className="text-sm text-default-600 truncate block max-w-30">{row.classCode}</span>
        </Tooltip>
      ),
    },
    {
      key: "level",
      label: "Trình độ",
      sortable: true,
      headerClassName: "w-[100px]",
      render: (_v, row) => row.level
        ? <Chip size="sm" color="primary" variant="flat">{row.level}</Chip>
        : <span className="text-default-300">—</span>,
    },
    {
      key: "students",
      label: "Học viên",
      align: "center" as const,
      headerClassName: "w-[90px]",
      render: (_v, row) => (
        <div className="flex items-center gap-1.5 justify-center">
          <Users className="w-4 h-4 text-default-400" />
          <span className="text-sm">{row._count?.enrollments ?? 0}</span>
        </div>
      ),
    },
    {
      key: "startDate",
      label: "Ngày bắt đầu",
      sortable: true,
      headerClassName: "w-[140px]",
      render: (_v, row) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-default-400 shrink-0" />
          <span className="text-sm whitespace-nowrap">{dayjs(row.startDate).format("DD/MM/YYYY")}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      headerClassName: "w-[110px]",
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
      headerClassName: "w-[60px]",
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
  ], [urlPage, urlPageSize, router, handleEdit, handleDelete]);

  return (
    <>
      <CTable<IClass & Record<string, unknown>>
        columns={columns}
        data={data.items as (IClass & Record<string, unknown>)[]}
        rowKey="id"
        page={urlPage}
        pageSize={urlPageSize}
        total={data.total}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        isLoading={isLoading}
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

      <ClassFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={handleCreateSuccess}
      />
      {selectedClass && (
        <ClassFormModal
          isOpen={editModal.isOpen}
          onClose={() => { editModal.onClose(); setSelectedClass(null); }}
          onSuccess={handleUpdateSuccess}
          initialData={selectedClass}
        />
      )}
      {selectedClass && (
        <DeleteClassModal
          isOpen={deleteModal.isOpen}
          onClose={() => { deleteModal.onClose(); setSelectedClass(null); }}
          onSuccess={handleDeleteSuccess}
          classData={selectedClass}
        />
      )}
    </>
  );
}

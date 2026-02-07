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
  Tooltip,
  Pagination,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  User as UserAvatar,
  Select,
  SelectItem,
} from "@heroui/react";
import { Plus, Search, Eye, Edit2, Trash2, MoreVertical, Users, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import type { IClass } from "@/app/interfaces/portal";
import { ClassStatus } from "@/app/enums/portal";
import { PAGINATION } from "@/app/constants/portal";
import ClassFormModal from "./ClassFormModal";
import DeleteClassModal from "./DeleteClassModal";

const statusColorMap: Record<string, "success" | "primary" | "danger" | "default"> = {
  ACTIVE: "success",
  COMPLETED: "primary",
  CANCELLED: "danger",
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
};

const COLUMNS = [
  { key: "className", label: "Tên lớp" },
  { key: "classCode", label: "Mã lớp" },
  { key: "level", label: "Trình độ" },
  { key: "students", label: "Học viên" },
  { key: "startDate", label: "Ngày bắt đầu" },
  { key: "status", label: "Trạng thái" },
  { key: "actions", label: "" },
];

export default function ClassesTable() {
  const router = useRouter();
  const [classes, setClasses] = useState<IClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(PAGINATION.INITIAL_PAGE);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE);

  // Modals
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/portal/classes");
      if (res.ok) {
        setClasses(await res.json());
      }
    } catch {
      toast.error("Không thể tải danh sách lớp");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filtered = classes.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.className.toLowerCase().includes(q) ||
      c.classCode.toLowerCase().includes(q) ||
      (c.level?.toLowerCase().includes(q) ?? false)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleEdit = (cls: IClass) => {
    setSelectedClass(cls);
    editModal.onOpen();
  };

  const handleDelete = (cls: IClass) => {
    setSelectedClass(cls);
    deleteModal.onOpen();
  };

  const renderCell = (cls: IClass, columnKey: string) => {
    switch (columnKey) {
      case "className":
        return (
          <div>
            <p className="font-semibold text-sm">{cls.className}</p>
            {cls.teacher && (
              <p className="text-xs text-default-400">
                GV: {cls.teacher.fullName || cls.teacher.email}
              </p>
            )}
          </div>
        );
      case "classCode":
        return <Chip size="sm" variant="flat">{cls.classCode}</Chip>;
      case "level":
        return cls.level ? (
          <Chip size="sm" color="primary" variant="flat">{cls.level}</Chip>
        ) : (
          <span className="text-default-300">—</span>
        );
      case "students":
        return (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-default-400" />
            <span className="text-sm">
              {cls._count?.enrollments ?? 0}/{cls.maxStudents}
            </span>
          </div>
        );
      case "startDate":
        return (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-default-400" />
            <span className="text-sm">{dayjs(cls.startDate).format("DD/MM/YYYY")}</span>
          </div>
        );
      case "status":
        return (
          <Chip
            size="sm"
            color={statusColorMap[cls.status] || "default"}
            variant="flat"
          >
            {statusLabelMap[cls.status] || cls.status}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex justify-end">
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
                  onPress={() => router.push(`/portal/teacher/classes/${cls.id}`)}
                >
                  Chi tiết
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit2 className="w-4 h-4" />}
                  onPress={() => handleEdit(cls)}
                >
                  Chỉnh sửa
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  startContent={<Trash2 className="w-4 h-4" />}
                  className="text-danger"
                  color="danger"
                  onPress={() => handleDelete(cls)}
                >
                  Xóa
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-3 flex-1">
          <Input
            isClearable
            className="w-full sm:max-w-xs"
            placeholder="Tìm kiếm lớp học..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={search}
            onValueChange={setSearch}
            onClear={() => setSearch("")}
            size="sm"
          />
          <Select
            label="Hiển thị"
            size="sm"
            selectedKeys={[String(rowsPerPage)]}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(PAGINATION.INITIAL_PAGE);
            }}
            className="w-32"
          >
            {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </Select>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={createModal.onOpen}
          size="sm"
        >
          Tạo lớp mới
        </Button>
      </div>

      {/* Table */}
      <Table
        aria-label="Danh sách lớp học"
        bottomContent={
          totalPages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
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
          isLoading={isLoading}
          loadingContent={<Spinner label="Đang tải..." />}
          emptyContent="Chưa có lớp học nào"
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

      {/* Create Modal */}
      <ClassFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={fetchClasses}
      />

      {/* Edit Modal */}
      {selectedClass && (
        <ClassFormModal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.onClose();
            setSelectedClass(null);
          }}
          onSuccess={fetchClasses}
          initialData={selectedClass}
        />
      )}

      {/* Delete Modal */}
      {selectedClass && (
        <DeleteClassModal
          isOpen={deleteModal.isOpen}
          onClose={() => {
            deleteModal.onClose();
            setSelectedClass(null);
          }}
          onSuccess={fetchClasses}
          classData={selectedClass}
        />
      )}
    </div>
  );
}

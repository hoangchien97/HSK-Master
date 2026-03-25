"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Chip, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input, Select, SelectItem } from "@heroui/react";
import { Plus, Edit2, Trash2, MoreVertical, MessageSquare, Search, Star, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IReview, IGetReviewResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchReviews, deleteReviewAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";
import ReviewFormModal from "./ReviewFormModal";

export default function ReviewsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") || "";
  const urlStatus = searchParams.get("status") || "ALL";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetReviewResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selected, setSelected] = useState<IReview | null>(null);

  const updateUrl = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    let resetPage = false;
    for (const [k, v] of Object.entries(updates)) { if (!v) newParams.delete(k); else newParams.set(k, v); if (k !== "page") resetPage = true; }
    if (resetPage && !("page" in updates)) newParams.delete("page");
    router.replace(`${pathname}${newParams.toString() ? `?${newParams}` : ""}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const isApproved = urlStatus === "APPROVED" ? true : urlStatus === "PENDING" ? false : undefined;
      const result = await fetchReviews({ search: debouncedSearch || undefined, isApproved, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data); else toast.error(result.error || "Lỗi tải dữ liệu");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlStatus, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const handleCreateSuccess = useCallback((item: IReview) => {
    setData((p) => ({ items: [item, ...p.items], total: p.total + 1 }));
  }, []);

  const handleUpdateSuccess = useCallback((updated: IReview) => {
    setData((p) => ({ ...p, items: p.items.map((i) => (i.id === updated.id ? updated : i)) }));
  }, []);

  const handleEdit = useCallback((item: IReview) => {
    setSelected(item);
    editModal.onOpen();
  }, [editModal]);

  const handleDelete = useCallback((item: IReview) => {
    setSelected(item);
    deleteModal.onOpen();
  }, [deleteModal]);

  const columns: CTableColumn<IReview & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "studentName", label: "Học viên", sortable: true,
      render: (_v: unknown, row: IReview) => (
        <div>
          <p className="font-semibold text-sm">{row.studentName}</p>
          <p className="text-xs text-default-500 mt-1">Khóa: {row.className}</p>
        </div>
      ),
    },
    { key: "content", label: "Nhận xét", render: (_v: unknown, row: IReview) => <div className="text-sm max-w-[300px] line-clamp-3" title={row.content}>"{row.content}"</div> },
    {
      key: "rating", label: "Đánh giá", align: "center" as const, sortable: true, headerClassName: "w-[120px]",
      render: (_v: unknown, row: IReview) => (
        <div className="flex gap-1 justify-center text-warning">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < row.rating ? "fill-warning" : "text-default-300"}`} />
          ))}
        </div>
      )
    },
    {
      key: "isApproved", label: "Trạng thái hiển thị", headerClassName: "w-[150px]", align: "center" as const,
      render: (_v: unknown, row: IReview) => (
        <Chip
          size="sm"
          color={row.isApproved ? "success" : "warning"}
          variant="flat"
          startContent={row.isApproved ? <CheckCircle2 className="w-3 h-3 ml-1" /> : <XCircle className="w-3 h-3 ml-1" />}
        >
          {row.isApproved ? "Đã duyệt" : "Chờ duyệt"}
        </Chip>
      )
    },
    {
      key: "createdAt", label: "Ngày tạo", headerClassName: "w-[120px]",
      render: (_v: unknown, row: IReview) => <span className="text-sm text-default-500">{new Date(row.createdAt).toLocaleDateString("vi-VN")}</span>
    },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IReview) => (
        <Dropdown>
          <DropdownTrigger><Button isIconOnly size="sm" variant="light"><MoreVertical className="w-4 h-4" /></Button></DropdownTrigger>
          <DropdownMenu aria-label="Thao tác">
            <DropdownItem key="edit" startContent={<Edit2 className="w-4 h-4" />} onPress={() => handleEdit(row)}>Chỉnh sửa</DropdownItem>
            <DropdownItem key="delete" startContent={<Trash2 className="w-4 h-4" />} className="text-danger" color="danger" onPress={() => handleDelete(row)}>Xóa</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ], [urlPage, urlPageSize, handleEdit, handleDelete]);

  return (
    <>
      <CTable<IReview & Record<string, unknown>>
        columns={columns} data={data.items as (IReview & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Đánh giá từ học viên" emptyContent={{ icon: <MessageSquare className="w-12 h-12" />, title: "Chưa có đánh giá nào", description: "Các đánh giá của học viên sẽ xuất hiện ở đây" }}
        toolbar={
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full">
            <div className="flex w-full sm:max-w-md gap-3">
              <Input isClearable className="flex-1" placeholder="Tìm tên/nội dung..." startContent={<Search className="w-4 h-4 text-default-400" />} value={search} onValueChange={setSearch} onClear={() => setSearch("")} size="sm" />
              <Select size="sm" className="w-[140px]" selectedKeys={[urlStatus]} onChange={(e) => updateUrl({ status: e.target.value, page: "1" })} aria-label="Loại đánh giá">
                <SelectItem key="ALL">Tất cả</SelectItem>
                <SelectItem key="APPROVED">Đã duyệt</SelectItem>
                <SelectItem key="PENDING">Chờ duyệt</SelectItem>
              </Select>
            </div>
            <Button color="primary" size="sm" className="w-full sm:w-auto" startContent={<Plus className="w-4 h-4" />} onPress={createModal.onOpen}>Thêm đánh giá</Button>
          </div>
        }
      />
      <ReviewFormModal isOpen={createModal.isOpen} onClose={createModal.onClose} onSuccess={handleCreateSuccess} />
      {selected && <ReviewFormModal isOpen={editModal.isOpen} onClose={() => { editModal.onClose(); setSelected(null); }} onSuccess={handleUpdateSuccess} initialData={selected} />}
      {selected && <DeleteConfirmModal isOpen={deleteModal.isOpen} onClose={() => { deleteModal.onClose(); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={`Đánh giá của ${selected.studentName}`} entityLabel="đánh giá" deleteAction={deleteReviewAction} />}
    </>
  );
}

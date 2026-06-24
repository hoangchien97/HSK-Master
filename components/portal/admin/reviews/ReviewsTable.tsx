"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Dropdown } from "@/components/ui";
import { Select, type SelectOption } from "@/components/ui";
import { Plus, Edit2, Trash2, MoreVertical, MessageSquare, Search, Star, CheckCircle2, XCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IReview, IGetReviewResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchReviews, deleteReviewAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";
import ReviewFormModal from "./ReviewFormModal";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "PENDING", label: "Chờ duyệt" },
];

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback((item: IReview) => {
    setSelected(item);
    setIsDeleteOpen(true);
  }, []);

  const columns: CTableColumn<IReview & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-(--color-muted)">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "studentName", label: "Học viên", sortable: true,
      render: (_v: unknown, row: IReview) => (
        <div>
          <p className="font-semibold text-sm">{row.studentName}</p>
          <p className="text-xs text-(--color-muted) mt-1">Khóa: {row.className}</p>
        </div>
      ),
    },
    { key: "content", label: "Nhận xét", render: (_v: unknown, row: IReview) => <div className="text-sm max-w-[300px] line-clamp-3" title={row.content}>"{row.content}"</div> },
    {
      key: "rating", label: "Đánh giá", align: "center" as const, sortable: true, headerClassName: "w-[120px]",
      render: (_v: unknown, row: IReview) => (
        <div className="flex gap-1 justify-center text-amber-600">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < row.rating ? "fill-amber-500" : "text-gray-300"}`} />
          ))}
        </div>
      )
    },
    {
      key: "isApproved", label: "Trạng thái hiển thị", headerClassName: "w-[150px]", align: "center" as const,
      render: (_v: unknown, row: IReview) => (
        <Badge
          size="sm"
          variant={row.isApproved ? "success" : "warning"}
        >
          {row.isApproved ? <><CheckCircle2 className="w-3 h-3 inline mr-1" />Đã duyệt</> : <><XCircle className="w-3 h-3 inline mr-1" />Chờ duyệt</>}
        </Badge>
      )
    },
    {
      key: "createdAt", label: "Ngày tạo", headerClassName: "w-[120px]",
      render: (_v: unknown, row: IReview) => <span className="text-sm text-(--color-muted)">{new Date(row.createdAt).toLocaleDateString("vi-VN")}</span>
    },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IReview) => (
        <Dropdown
          trigger={
            <button type="button" className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={[
            { label: "Chỉnh sửa", icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(row) },
            { label: "Xóa", icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(row) },
          ]}
        />
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm tên/nội dung..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full pl-9 pr-8 rounded-md border border-(--color-smoke) bg-white text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-vermillion) focus:border-(--color-vermillion)"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-ink) transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="w-[140px]">
                <Select
                  options={STATUS_OPTIONS}
                  value={urlStatus}
                  onChange={(v) => updateUrl({ status: v, page: "1" })}
                />
              </div>
            </div>
            <Button variant="primary" size="sm" className="w-full sm:w-auto" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>Thêm đánh giá</Button>
          </div>
        }
      />
      <ReviewFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleCreateSuccess} />
      {selected && <ReviewFormModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelected(null); }} onSuccess={handleUpdateSuccess} initialData={selected} />}
      {selected && <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={`Đánh giá của ${selected.studentName}`} entityLabel="đánh giá" deleteAction={deleteReviewAction} />}
    </>
  );
}

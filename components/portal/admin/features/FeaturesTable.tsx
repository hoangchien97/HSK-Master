"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Badge, Dropdown } from "@/components/ui";
import { Plus, Edit2, Trash2, MoreVertical, Star, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IFeature, IGetFeatureResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchFeatures, deleteFeatureAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";
import FeatureFormModal from "./FeatureFormModal";
import * as LucideIcons from "lucide-react";

export default function FeaturesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetFeatureResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<IFeature | null>(null);

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
      const result = await fetchFeatures({ search: debouncedSearch || undefined, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data); else toast.error(result.error || "Lỗi tải dữ liệu");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const handleCreateSuccess = useCallback((item: IFeature) => {
    setData((p) => ({ items: [item, ...p.items], total: p.total + 1 }));
  }, []);

  const handleUpdateSuccess = useCallback((updated: IFeature) => {
    setData((p) => ({ ...p, items: p.items.map((i) => (i.id === updated.id ? updated : i)) }));
  }, []);

  const handleEdit = useCallback((item: IFeature) => {
    setSelected(item);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback((item: IFeature) => {
    setSelected(item);
    setIsDeleteOpen(true);
  }, []);

  const columns: CTableColumn<IFeature & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-(--color-muted)">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "iconName", label: "Icon", headerClassName: "w-[80px]", align: "center",
      render: (_v: unknown, row: IFeature) => {
        const Icon = (LucideIcons as any)[row.iconName] || LucideIcons.Star;
        return <div className="p-2 bg-primary-50 rounded-lg text-(--color-vermillion) mx-auto w-max"><Icon className="w-5 h-5" /></div>;
      },
    },
    {
      key: "title", label: "Tính năng nổi bật", sortable: true,
      render: (_v: unknown, row: IFeature) => <div><p className="font-semibold text-sm">{row.title}</p><p className="text-xs text-gray-400 truncate max-w-[300px] mt-1">{row.description}</p></div>,
    },
    { key: "order", label: "Thứ tự", align: "center" as const, sortable: true, headerClassName: "w-[80px]", render: (_v: unknown, row: IFeature) => <Badge size="sm">{row.order}</Badge> },
    { key: "isActive", label: "Trạng thái", headerClassName: "w-[100px]", render: (_v: unknown, row: IFeature) => <Badge size="sm" variant={row.isActive ? "success" : undefined}>{row.isActive ? "Hiển thị" : "Ẩn"}</Badge> },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IFeature) => (
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
      <CTable<IFeature & Record<string, unknown>>
        columns={columns} data={data.items as (IFeature & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Features" emptyContent={{ icon: <Star className="w-12 h-12" />, title: "Chưa có tính năng", description: "Các tính năng nổi bật sẽ xuất hiện ở đây" }}
        toolbar={
          <div className="flex justify-between items-center rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên..."
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
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>Thêm tính năng</Button>
          </div>
        }
      />
      <FeatureFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleCreateSuccess} />
      {selected && <FeatureFormModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelected(null); }} onSuccess={handleUpdateSuccess} initialData={selected} />}
      {selected && <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={selected.title} entityLabel="tính năng" deleteAction={deleteFeatureAction} />}
    </>
  );
}

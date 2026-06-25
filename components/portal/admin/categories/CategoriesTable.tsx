"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Badge, Dropdown } from "@/components/ui";
import { Plus, Edit2, Trash2, MoreVertical, FolderTree, Search, X, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ICategory, IGetCategoryResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchCategories, deleteCategoryAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";
import CategoryFormModal from "./CategoryFormModal";

export default function CategoriesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetCategoryResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<ICategory | null>(null);

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
      const result = await fetchCategories({ search: debouncedSearch || undefined, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data); else toast.error(result.error || "Lỗi tải dữ liệu");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const handleCreateSuccess = useCallback((item: ICategory) => {
    setData((p) => ({ items: [item, ...p.items], total: p.total + 1 }));
  }, []);

  const handleUpdateSuccess = useCallback((updated: ICategory) => {
    setData((p) => ({ ...p, items: p.items.map((i) => (i.id === updated.id ? updated : i)) }));
  }, []);

  const handleEdit = useCallback((item: ICategory) => {
    setSelected(item);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback((item: ICategory) => {
    setSelected(item);
    setIsDeleteOpen(true);
  }, []);

  const columns: CTableColumn<ICategory & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-(--color-muted)">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "name", label: "Danh mục", sortable: true,
      render: (_v: unknown, row: ICategory) => (
        <div>
          <p className="font-semibold text-sm">{row.name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <ExternalLink className="w-3 h-3" /> /{row.slug}
          </div>
        </div>
      ),
    },
    { key: "description", label: "Mô tả", render: (_v: unknown, row: ICategory) => <span className="text-sm text-(--color-muted) truncate max-w-[300px] block">{row.description || "—"}</span> },
    {
      key: "courses", label: "Khóa học", align: "center" as const, headerClassName: "w-[120px]",
      render: (_v: unknown, row: ICategory) => <Badge size="sm" variant="primary">{row._count?.courses || 0} khóa học</Badge>
    },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: ICategory) => (
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
      <CTable<ICategory & Record<string, unknown>>
        columns={columns} data={data.items as (ICategory & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Danh mục khóa học" emptyContent={{ icon: <FolderTree className="w-12 h-12" />, title: "Chưa có danh mục", description: "Tạo danh mục để phân loại khóa học của bạn" }}
        toolbar={
          <div className="flex justify-between items-center rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
              <input
                type="text"
                placeholder="Tên danh mục, slug..."
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
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>Tạo danh mục</Button>
          </div>
        }
      />
      <CategoryFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleCreateSuccess} />
      {selected && <CategoryFormModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelected(null); }} onSuccess={handleUpdateSuccess} initialData={selected} />}
      {selected && <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={selected.name} entityLabel="danh mục" deleteAction={deleteCategoryAction} warningMessage={selected._count?.courses ? `Danh mục này đang có ${selected._count.courses} khóa học. Việc xóa có thể ảnh hưởng đến các khóa học thuộc danh mục này.` : undefined} />}
    </>
  );
}

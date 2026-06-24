"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui";
import { Dropdown } from "@/components/ui";
import { Trash2, MoreVertical, Globe, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IPageMetadata, IGetPageMetadataResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchPageMetadata, deletePageMetadataAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";

export default function SeoTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetPageMetadataResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<IPageMetadata | null>(null);

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
      const result = await fetchPageMetadata({ search: debouncedSearch || undefined, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data); else toast.error(result.error || "Lỗi");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const columns: CTableColumn<IPageMetadata & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-(--color-muted)">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "pageName", label: "Trang", sortable: true,
      render: (_v: unknown, row: IPageMetadata) => <div><p className="font-semibold text-sm">{row.pageName}</p><p className="text-xs text-gray-400">{row.pagePath}</p></div>,
    },
    { key: "title", label: "SEO Title", render: (_v: unknown, row: IPageMetadata) => <p className="text-sm truncate max-w-[200px]">{row.title}</p> },
    { key: "description", label: "Meta Description", render: (_v: unknown, row: IPageMetadata) => <p className="text-sm text-(--color-muted) truncate max-w-[200px]">{row.description}</p> },
    { key: "isActive", label: "Trạng thái", headerClassName: "w-[100px]", render: (_v: unknown, row: IPageMetadata) => <Badge size="sm" variant={row.isActive ? "success" : "default"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IPageMetadata) => (
        <Dropdown
          trigger={
            <button type="button" className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={[
            { label: "Xóa", icon: <Trash2 className="w-4 h-4" />, onClick: () => { setSelected(row); setIsDeleteOpen(true); } },
          ]}
        />
      ),
    },
  ], [urlPage, urlPageSize]);

  return (
    <>
      <CTable<IPageMetadata & Record<string, unknown>>
        columns={columns} data={data.items as (IPageMetadata & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="SEO Metadata" emptyContent={{ icon: <Globe className="w-12 h-12" />, title: "Chưa có metadata", description: "SEO metadata sẽ xuất hiện ở đây" }}
        toolbar={
          <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm metadata..."
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
          </div>
        }
      />
      {selected && <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={selected.pageName} entityLabel="metadata" deleteAction={deletePageMetadataAction} />}
    </>
  );
}

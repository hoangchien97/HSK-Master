"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Badge, Dropdown } from "@/components/ui";
import { Plus, Edit2, Trash2, MoreVertical, Images, Search, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IAlbum, IGetAlbumResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchAlbums, deleteAlbumAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";
import AlbumFormModal from "./AlbumFormModal";
import AlbumPhotosModal from "./AlbumPhotosModal";
import ImagePreviewModal from "@/components/portal/admin/common/ImagePreviewModal";

export default function AlbumsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetAlbumResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [selected, setSelected] = useState<IAlbum | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
      const result = await fetchAlbums({ search: debouncedSearch || undefined, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data); else toast.error(result.error || "Lỗi");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const handleCreateSuccess = useCallback((item: IAlbum) => {
    setData((p) => ({ items: [item, ...p.items], total: p.total + 1 }));
  }, []);

  const handleUpdateSuccess = useCallback((updated: IAlbum) => {
    setData((p) => ({ ...p, items: p.items.map((i) => (i.id === updated.id ? updated : i)) }));
  }, []);

  const handleEdit = useCallback((item: IAlbum) => {
    setSelected(item);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback((item: IAlbum) => {
    setSelected(item);
    setIsDeleteOpen(true);
  }, []);

  const handleManagePhotos = useCallback((item: IAlbum) => {
    setSelected(item);
    setIsPhotosOpen(true);
  }, []);

  const columns: CTableColumn<IAlbum & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-(--color-muted)">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "thumbnail", label: "Ảnh đại diện", headerClassName: "w-[90px]",
      render: (_v: unknown, row: IAlbum) => (
        <div
          className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => { setPreviewUrl(row.thumbnail); setIsPreviewOpen(true); }}
        >
          <img src={row.thumbnail} alt={row.title} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      key: "title", label: "Tên album", sortable: true,
      render: (_v: unknown, row: IAlbum) => <div><p className="font-semibold text-sm">{row.title}</p><p className="text-xs text-gray-400 truncate max-w-[200px]">{row.description || ""}</p></div>,
    },
    { key: "photoCount", label: "Số lượng ảnh", align: "center" as const, headerClassName: "w-[120px]",
      render: (_v: unknown, row: IAlbum) => (
        <button type="button" onClick={() => handleManagePhotos(row)} className="focus:outline-none">
          <Badge variant="primary" size="sm">{row.photoCount || (row.photos?.length ?? 0)} ảnh</Badge>
        </button>
      )
    },
    { key: "order", label: "Thứ tự", align: "center" as const, sortable: true, headerClassName: "w-[80px]", render: (_v: unknown, row: IAlbum) => <Badge size="sm">{row.order}</Badge> },
    { key: "isActive", label: "Trạng thái", headerClassName: "w-[100px]", render: (_v: unknown, row: IAlbum) => <Badge size="sm" variant={row.isActive ? "success" : undefined}>{row.isActive ? "Hiển thị" : "Ẩn"}</Badge> },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IAlbum) => (
        <Dropdown
          trigger={
            <button type="button" className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={[
            { label: "Quản lý ảnh", icon: <Images className="w-4 h-4" />, onClick: () => handleManagePhotos(row) },
            { label: "Chỉnh sửa", icon: <Edit2 className="w-4 h-4" />, onClick: () => handleEdit(row) },
            { label: "Xóa", icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(row) },
          ]}
        />
      ),
    },
  ], [urlPage, urlPageSize, handleEdit, handleDelete, handleManagePhotos]);

  return (
    <>
      <CTable<IAlbum & Record<string, unknown>>
        columns={columns} data={data.items as (IAlbum & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Album ảnh" emptyContent={{ icon: <Images className="w-12 h-12" />, title: "Chưa có album", description: "Album ảnh sẽ xuất hiện ở đây" }}
        toolbar={
          <div className="flex justify-between items-center rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm album..."
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
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>Tạo album</Button>
          </div>
        }
      />
      <AlbumFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={handleCreateSuccess} />
      {selected && <AlbumFormModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelected(null); }} onSuccess={handleUpdateSuccess} initialData={selected} />}
      {selected && <AlbumPhotosModal isOpen={isPhotosOpen} onClose={() => { setIsPhotosOpen(false); setSelected(null); loadData(); }} album={selected} />}
      {selected && <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={selected.title} entityLabel="album" deleteAction={deleteAlbumAction} />}
      <ImagePreviewModal isOpen={isPreviewOpen} onOpenChange={() => setIsPreviewOpen(false)} url={previewUrl} />
    </>
  );
}

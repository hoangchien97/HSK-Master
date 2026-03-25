"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Chip, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@heroui/react";
import { Plus, Edit2, Trash2, MoreVertical, Images, Search, Image as ImageIcon } from "lucide-react";
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

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const photosModal = useDisclosure();
  const previewModal = useDisclosure();

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
    editModal.onOpen();
  }, [editModal]);

  const handleDelete = useCallback((item: IAlbum) => {
    setSelected(item);
    deleteModal.onOpen();
  }, [deleteModal]);

  const handleManagePhotos = useCallback((item: IAlbum) => {
    setSelected(item);
    photosModal.onOpen();
  }, [photosModal]);

  const columns: CTableColumn<IAlbum & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "thumbnail", label: "Ảnh đại diện", headerClassName: "w-[90px]",
      render: (_v: unknown, row: IAlbum) => (
        <div
          className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => { setPreviewUrl(row.thumbnail); previewModal.onOpen(); }}
        >
          <img src={row.thumbnail} alt={row.title} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      key: "title", label: "Tên album", sortable: true,
      render: (_v: unknown, row: IAlbum) => <div><p className="font-semibold text-sm">{row.title}</p><p className="text-xs text-default-400 truncate max-w-[200px]">{row.description || ""}</p></div>,
    },
    { key: "photoCount", label: "Số lượng ảnh", align: "center" as const, headerClassName: "w-[120px]",
      render: (_v: unknown, row: IAlbum) => (
        <Chip size="sm" variant="flat" color="primary" className="cursor-pointer" onClick={() => handleManagePhotos(row)}>
          {row.photoCount || (row.photos?.length ?? 0)} ảnh
        </Chip>
      )
    },
    { key: "order", label: "Thứ tự", align: "center" as const, sortable: true, headerClassName: "w-[80px]", render: (_v: unknown, row: IAlbum) => <Chip size="sm" variant="flat">{row.order}</Chip> },
    { key: "isActive", label: "Trạng thái", headerClassName: "w-[100px]", render: (_v: unknown, row: IAlbum) => <Chip size="sm" color={row.isActive ? "success" : "default"} variant="flat">{row.isActive ? "Hiển thị" : "Ẩn"}</Chip> },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IAlbum) => (
        <Dropdown>
          <DropdownTrigger><Button isIconOnly size="sm" variant="light"><MoreVertical className="w-4 h-4" /></Button></DropdownTrigger>
          <DropdownMenu aria-label="Thao tác">
            <DropdownItem key="photos" startContent={<Images className="w-4 h-4" />} onPress={() => handleManagePhotos(row)}>Quản lý ảnh</DropdownItem>
            <DropdownItem key="edit" startContent={<Edit2 className="w-4 h-4" />} onPress={() => handleEdit(row)}>Chỉnh sửa</DropdownItem>
            <DropdownItem key="delete" startContent={<Trash2 className="w-4 h-4" />} className="text-danger" color="danger" onPress={() => handleDelete(row)}>Xóa</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ], [urlPage, urlPageSize, handleEdit, handleDelete, handleManagePhotos, previewModal]);

  return (
    <>
      <CTable<IAlbum & Record<string, unknown>>
        columns={columns} data={data.items as (IAlbum & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Album ảnh" emptyContent={{ icon: <Images className="w-12 h-12" />, title: "Chưa có album", description: "Album ảnh sẽ xuất hiện ở đây" }}
        toolbar={
          <div className="flex justify-between items-center rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full">
            <Input isClearable className="w-full sm:max-w-xs" placeholder="Tìm album..." startContent={<Search className="w-4 h-4 text-default-400" />} value={search} onValueChange={setSearch} onClear={() => setSearch("")} size="sm" />
            <Button color="primary" size="sm" startContent={<Plus className="w-4 h-4" />} onPress={createModal.onOpen}>Tạo album</Button>
          </div>
        }
      />
      <AlbumFormModal isOpen={createModal.isOpen} onClose={createModal.onClose} onSuccess={handleCreateSuccess} />
      {selected && <AlbumFormModal isOpen={editModal.isOpen} onClose={() => { editModal.onClose(); setSelected(null); }} onSuccess={handleUpdateSuccess} initialData={selected} />}
      {selected && <AlbumPhotosModal isOpen={photosModal.isOpen} onClose={() => { photosModal.onClose(); setSelected(null); loadData(); }} album={selected} />}
      {selected && <DeleteConfirmModal isOpen={deleteModal.isOpen} onClose={() => { deleteModal.onClose(); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={selected.title} entityLabel="album" deleteAction={deleteAlbumAction} />}
      <ImagePreviewModal isOpen={previewModal.isOpen} onOpenChange={previewModal.onOpenChange} url={previewUrl} />
    </>
  );
}

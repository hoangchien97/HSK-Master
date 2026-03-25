"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Chip, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@heroui/react";
import { Plus, Edit2, Trash2, MoreVertical, Search, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IPageMetadata, IGetPageMetadataResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchPageMetadata, deletePageMetadataAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";
import PageMetadataFormModal from "./PageMetadataFormModal";

export default function PageMetadataTable() {
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

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
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
      if (result.success && result.data) setData(result.data); else toast.error(result.error || "Lỗi tải dữ liệu");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const handleCreateSuccess = useCallback((item: IPageMetadata) => {
    setData((p) => ({ items: [item, ...p.items], total: p.total + 1 }));
  }, []);

  const handleUpdateSuccess = useCallback((updated: IPageMetadata) => {
    setData((p) => ({ ...p, items: p.items.map((i) => (i.id === updated.id ? updated : i)) }));
  }, []);

  const handleEdit = useCallback((item: IPageMetadata) => {
    setSelected(item);
    editModal.onOpen();
  }, [editModal]);

  const handleDelete = useCallback((item: IPageMetadata) => {
    setSelected(item);
    deleteModal.onOpen();
  }, [deleteModal]);

  const columns: CTableColumn<IPageMetadata & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "pagePath", label: "Đường dẫn", sortable: true,
      render: (_v: unknown, row: IPageMetadata) => (
        <div>
          <p className="font-semibold text-sm">{row.pagePath}</p>
          <p className="text-xs text-default-400 mt-1">{row.pageName}</p>
        </div>
      ),
    },
    { key: "title", label: "Tiêu đề & Mô tả", render: (_v: unknown, row: IPageMetadata) => <div className="max-w-[400px]"><p className="text-sm font-medium line-clamp-1">{row.title}</p><p className="line-clamp-2 text-xs text-default-500 mt-1">{row.description}</p></div> },
    { key: "isActive", label: "Trạng thái", headerClassName: "w-[120px]", align: "center" as const, render: (_v: unknown, row: IPageMetadata) => <Chip size="sm" color={row.isActive ? "success" : "default"} variant="flat">{row.isActive ? "Kích hoạt" : "Không áp dụng"}</Chip> },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IPageMetadata) => (
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
      <CTable<IPageMetadata & Record<string, unknown>>
        columns={columns} data={data.items as (IPageMetadata & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Cấu hình SEO" emptyContent={{ icon: <Globe className="w-12 h-12" />, title: "Chưa thiết lập Meta SEO", description: "Các cấu hình thẻ Meta thẻ OpenGraph cho trang sẽ xuất hiện ở đây" }}
        toolbar={
          <div className="flex justify-between items-center rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm w-full">
            <Input isClearable className="w-full sm:max-w-xs" placeholder="Tìm theo đường dẫn, thẻ title..." startContent={<Search className="w-4 h-4 text-default-400" />} value={search} onValueChange={setSearch} onClear={() => setSearch("")} size="sm" />
            <Button color="primary" size="sm" startContent={<Plus className="w-4 h-4" />} onPress={createModal.onOpen}>Thêm thiết lập</Button>
          </div>
        }
      />
      <PageMetadataFormModal isOpen={createModal.isOpen} onClose={createModal.onClose} onSuccess={handleCreateSuccess} />
      {selected && <PageMetadataFormModal isOpen={editModal.isOpen} onClose={() => { editModal.onClose(); setSelected(null); }} onSuccess={handleUpdateSuccess} initialData={selected} />}
      {selected && <DeleteConfirmModal isOpen={deleteModal.isOpen} onClose={() => { deleteModal.onClose(); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={selected.pagePath} entityLabel="thiết lập SEO" deleteAction={deletePageMetadataAction} />}
    </>
  );
}

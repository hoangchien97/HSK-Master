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
  Input,
} from "@heroui/react";
import { Plus, Edit2, Trash2, MoreVertical, Image, Search } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IHeroSlide, IGetHeroSlideResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchHeroSlides, deleteHeroSlideAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";
import HeroSlideFormModal from "./HeroSlideFormModal";
import ImagePreviewModal from "@/components/portal/admin/common/ImagePreviewModal";

export default function HeroSlidesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetHeroSlideResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const previewModal = useDisclosure();
  const [selected, setSelected] = useState<IHeroSlide | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      let shouldResetPage = false;
      for (const [key, value] of Object.entries(updates)) {
        if (!value) newParams.delete(key);
        else newParams.set(key, value);
        if (key !== "page") shouldResetPage = true;
      }
      if (shouldResetPage && !("page" in updates)) newParams.delete("page");
      const qs = newParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchHeroSlides({
        search: debouncedSearch || undefined,
        page: urlPage,
        pageSize: urlPageSize,
      });
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || "Không thể tải danh sách");
      }
    } catch {
      toast.error("Không thể tải danh sách");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const handleCreateSuccess = useCallback((item: IHeroSlide) => {
    setData((prev) => ({ items: [item, ...prev.items], total: prev.total + 1 }));
  }, []);

  const handleUpdateSuccess = useCallback((updated: IHeroSlide) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === updated.id ? updated : i)),
    }));
  }, []);

  const handleDeleteSuccess = useCallback((id: string) => {
    setData((prev) => ({
      items: prev.items.filter((i) => i.id !== id),
      total: prev.total - 1,
    }));
  }, []);

  const handleEdit = useCallback((item: IHeroSlide) => {
    setSelected(item);
    editModal.onOpen();
  }, [editModal]);

  const handleDelete = useCallback((item: IHeroSlide) => {
    setSelected(item);
    deleteModal.onOpen();
  }, [deleteModal]);

  const columns: CTableColumn<IHeroSlide & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "stt",
      label: "STT",
      align: "center" as const,
      headerClassName: "w-[50px]",
      render: (_v: unknown, _row: unknown, index: number) => (
        <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + index + 1}</span>
      ),
    },
    {
      key: "image",
      label: "Hình ảnh",
      headerClassName: "w-[80px]",
      render: (_v: unknown, row: IHeroSlide) => (
        <div
          className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setPreviewUrl(row.image);
            previewModal.onOpen();
          }}
        >
          <img src={row.image} alt={row.title} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      key: "title",
      label: "Tiêu đề",
      sortable: true,
      render: (_v: unknown, row: IHeroSlide) => (
        <div className="max-w-[200px]">
          <p className="font-semibold text-sm truncate">{row.title}</p>
          <p className="text-xs text-default-400 truncate">{row.badge}</p>
        </div>
      ),
    },
    {
      key: "order",
      label: "Thứ tự",
      align: "center" as const,
      sortable: true,
      headerClassName: "w-[80px]",
      render: (_v: unknown, row: IHeroSlide) => (
        <Chip size="sm" variant="flat">{row.order}</Chip>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      headerClassName: "w-[100px]",
      render: (_v: unknown, row: IHeroSlide) => (
        <Chip size="sm" color={row.isActive ? "success" : "default"} variant="flat">
          {row.isActive ? "Hiển thị" : "Ẩn"}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "end" as const,
      headerClassName: "w-[60px]",
      render: (_v: unknown, row: IHeroSlide) => (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Thao tác">
            <DropdownItem key="edit" startContent={<Edit2 className="w-4 h-4" />} onPress={() => handleEdit(row)}>
              Chỉnh sửa
            </DropdownItem>
            <DropdownItem key="delete" startContent={<Trash2 className="w-4 h-4" />} className="text-danger" color="danger" onPress={() => handleDelete(row)}>
              Xóa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ], [urlPage, urlPageSize, handleEdit, handleDelete]);

  return (
    <>
      <CTable<IHeroSlide & Record<string, unknown>>
        columns={columns}
        data={data.items as (IHeroSlide & Record<string, unknown>)[]}
        rowKey="id"
        page={urlPage}
        pageSize={urlPageSize}
        total={data.total}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })}
        onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Danh sách Hero Slides"
        emptyContent={{
          icon: <Image className="w-12 h-12" />,
          title: "Chưa có slide nào",
          description: "Tạo slide mới để bắt đầu",
        }}
        actions={
          <Button color="primary" size="sm" startContent={<Plus className="w-4 h-4" />} onPress={createModal.onOpen}>
            Thêm slide
          </Button>
        }
        toolbar={
          <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
            <Input
              isClearable
              className="w-full sm:max-w-xs"
              placeholder="Tìm kiếm slide..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={search}
              onValueChange={setSearch}
              onClear={() => setSearch("")}
              size="sm"
            />
          </div>
        }
      />

      <HeroSlideFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        onSuccess={handleCreateSuccess}
      />
      {selected && (
        <HeroSlideFormModal
          isOpen={editModal.isOpen}
          onClose={() => { editModal.onClose(); setSelected(null); }}
          onSuccess={handleUpdateSuccess}
          initialData={selected}
        />
      )}
      {selected && (
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => { deleteModal.onClose(); setSelected(null); }}
          onSuccess={handleDeleteSuccess}
          itemId={selected.id}
          itemName={selected.title}
          entityLabel="slide"
          deleteAction={deleteHeroSlideAction}
        />
      )}
      <ImagePreviewModal
        isOpen={previewModal.isOpen}
        onOpenChange={previewModal.onOpenChange}
        url={previewUrl}
      />
    </>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Chip, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@heroui/react";
import { Trash2, MoreVertical, FileText, Search, Phone, Mail } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { IRegistration, IGetRegistrationResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchRegistrations, deleteRegistrationAction } from "@/actions/admin.actions";
import DeleteConfirmModal from "@/components/portal/admin/common/DeleteConfirmModal";

export default function RegistrationsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetRegistrationResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const deleteModal = useDisclosure();
  const [selected, setSelected] = useState<IRegistration | null>(null);

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
      const result = await fetchRegistrations({ search: debouncedSearch || undefined, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data); else toast.error(result.error || "Lỗi");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const columns: CTableColumn<IRegistration & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    { key: "name", label: "Họ tên", sortable: true, render: (_v: unknown, row: IRegistration) => <p className="font-semibold text-sm">{row.name}</p> },
    {
      key: "phone", label: "Liên hệ",
      render: (_v: unknown, row: IRegistration) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-default-400" /><span className="text-sm">{row.phone}</span></div>
          {row.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-default-400" /><span className="text-sm text-default-500">{row.email}</span></div>}
        </div>
      ),
    },
    { key: "course", label: "Khóa học", render: (_v: unknown, row: IRegistration) => row.course ? <Chip size="sm" color="primary" variant="flat">{row.course.title}</Chip> : <span className="text-default-300">—</span> },
    { key: "note", label: "Ghi chú", render: (_v: unknown, row: IRegistration) => <p className="text-sm text-default-500 truncate max-w-[150px]">{row.note || "—"}</p> },
    { key: "createdAt", label: "Ngày đăng ký", sortable: true, headerClassName: "w-[120px]", render: (_v: unknown, row: IRegistration) => <span className="text-sm text-default-500">{dayjs(row.createdAt).format("DD/MM/YYYY HH:mm")}</span> },
    {
      key: "actions", label: "", align: "end" as const, headerClassName: "w-[60px]",
      render: (_v: unknown, row: IRegistration) => (
        <Dropdown><DropdownTrigger><Button isIconOnly size="sm" variant="light"><MoreVertical className="w-4 h-4" /></Button></DropdownTrigger>
          <DropdownMenu aria-label="Thao tác"><DropdownItem key="delete" startContent={<Trash2 className="w-4 h-4" />} className="text-danger" color="danger" onPress={() => { setSelected(row); deleteModal.onOpen(); }}>Xóa</DropdownItem></DropdownMenu>
        </Dropdown>
      ),
    },
  ], [urlPage, urlPageSize, deleteModal]);

  return (
    <>
      <CTable<IRegistration & Record<string, unknown>>
        columns={columns} data={data.items as (IRegistration & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
        sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Đăng ký khóa học" emptyContent={{ icon: <FileText className="w-12 h-12" />, title: "Chưa có đăng ký", description: "Đăng ký khóa học sẽ xuất hiện ở đây" }}
        toolbar={<div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm"><Input isClearable className="w-full sm:max-w-xs" placeholder="Tìm đăng ký..." startContent={<Search className="w-4 h-4 text-default-400" />} value={search} onValueChange={setSearch} onClear={() => setSearch("")} size="sm" /></div>}
      />
      {selected && <DeleteConfirmModal isOpen={deleteModal.isOpen} onClose={() => { deleteModal.onClose(); setSelected(null); }} onSuccess={(id) => setData((p) => ({ items: p.items.filter((i) => i.id !== id), total: p.total - 1 }))} itemId={selected.id} itemName={selected.name} entityLabel="đăng ký" deleteAction={deleteRegistrationAction} />}
    </>
  );
}

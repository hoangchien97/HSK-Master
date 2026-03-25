"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Chip, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input } from "@heroui/react";
import { Plus, Edit2, Trash2, MoreVertical, BookOpen, Search } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ICourseAdmin, IGetCourseAdminResponse } from "@/interfaces/portal";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchCoursesAdmin } from "@/actions/admin.actions";

export default function CoursesTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<IGetCourseAdminResponse>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

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
      const result = await fetchCoursesAdmin({ search: debouncedSearch || undefined, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data);
      else toast.error(result.error || "Không thể tải danh sách");
    } catch { toast.error("Không thể tải danh sách"); }
    finally { setIsLoading(false); }
  }, [debouncedSearch, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const columns: CTableColumn<ICourseAdmin & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]",
      render: (_v: unknown, _row: unknown, index: number) => <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + index + 1}</span>,
    },
    {
      key: "title", label: "Khóa học", sortable: true,
      render: (_v: unknown, row: ICourseAdmin) => (
        <div className="max-w-[250px]">
          <p className="font-semibold text-sm truncate">{row.title}</p>
          <p className="text-xs text-default-400 truncate">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "category", label: "Danh mục", headerClassName: "w-[120px]",
      render: (_v: unknown, row: ICourseAdmin) => <span className="text-sm">{row.category?.name || "—"}</span>,
    },
    {
      key: "level", label: "HSK", headerClassName: "w-[80px]",
      render: (_v: unknown, row: ICourseAdmin) => row.hskLevel ? <Chip size="sm" color="primary" variant="flat">{row.hskLevel.title}</Chip> : <span className="text-default-300">—</span>,
    },
    {
      key: "isPublished", label: "Trạng thái", headerClassName: "w-[100px]",
      render: (_v: unknown, row: ICourseAdmin) => <Chip size="sm" color={row.isPublished ? "success" : "warning"} variant="flat">{row.isPublished ? "Đã xuất bản" : "Nháp"}</Chip>,
    },
    {
      key: "enrollmentCount", label: "Đăng ký", align: "center" as const, headerClassName: "w-[80px]",
      render: (_v: unknown, row: ICourseAdmin) => <span className="text-sm">{row.enrollmentCount}</span>,
    },
  ], [urlPage, urlPageSize]);

  return (
    <CTable<ICourseAdmin & Record<string, unknown>>
      columns={columns}
      data={data.items as (ICourseAdmin & Record<string, unknown>)[]}
      rowKey="id"
      page={urlPage}
      pageSize={urlPageSize}
      total={data.total}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      isLoading={isLoading}
      onPageChange={(p) => updateUrl({ page: String(p) })}
      onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
      ariaLabel="Danh sách khóa học"
      emptyContent={{ icon: <BookOpen className="w-12 h-12" />, title: "Chưa có khóa học nào", description: "Khóa học sẽ xuất hiện ở đây" }}
      toolbar={
        <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
          <Input isClearable className="w-full sm:max-w-xs" placeholder="Tìm kiếm khóa học..." startContent={<Search className="w-4 h-4 text-default-400" />} value={search} onValueChange={setSearch} onClear={() => setSearch("")} size="sm" />
        </div>
      }
    />
  );
}

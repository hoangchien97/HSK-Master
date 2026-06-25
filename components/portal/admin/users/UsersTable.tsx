"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui";
import { Select, type SelectOption } from "@/components/ui";
import { Trash2, MoreVertical, Users, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PAGINATION } from "@/constants/portal";
import { CTable, type CTableColumn } from "@/components/portal/common";
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams";
import { fetchUsersAdmin } from "@/actions/admin.actions";

const ROLE_OPTIONS_SELECT: SelectOption[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "STUDENT", label: "Học viên" },
  { value: "TEACHER", label: "Giáo viên" },
  { value: "SYSTEM_ADMIN", label: "Admin" },
];

const ROLE_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: "STUDENT", label: "Học viên" },
  { key: "TEACHER", label: "Giáo viên" },
  { key: "SYSTEM_ADMIN", label: "Admin" },
];

const ROLE_BADGE_MAP: Record<string, "primary" | "success" | "danger" | "default"> = {
  STUDENT: "primary",
  TEACHER: "success",
  SYSTEM_ADMIN: "danger",
};

interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string | null;
  role: string;
  status: string;
  phoneNumber?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function UsersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSearch = searchParams.get("search") || "";
  const urlRole = searchParams.get("role") || "ALL";
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE);
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE);

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const [data, setData] = useState<{ items: UserRow[]; total: number }>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const updateUrl = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    let resetPage = false;
    for (const [k, v] of Object.entries(updates)) { if (!v || v === "ALL") newParams.delete(k); else newParams.set(k, v); if (k !== "page") resetPage = true; }
    if (resetPage && !("page" in updates)) newParams.delete("page");
    router.replace(`${pathname}${newParams.toString() ? `?${newParams}` : ""}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchUsersAdmin({ search: debouncedSearch || undefined, role: urlRole !== "ALL" ? urlRole : undefined, page: urlPage, pageSize: urlPageSize });
      if (result.success && result.data) setData(result.data as { items: UserRow[]; total: number });
      else toast.error(result.error || "Lỗi");
    } catch { toast.error("Lỗi tải dữ liệu"); } finally { setIsLoading(false); }
  }, [debouncedSearch, urlRole, urlPage, urlPageSize]);

  useEffect(() => { loadData(); }, [loadData]);
  useSyncSearchToUrl(debouncedSearch, updateUrl);

  const columns: CTableColumn<UserRow & Record<string, unknown>>[] = useMemo(() => [
    { key: "stt", label: "STT", align: "center" as const, headerClassName: "w-[50px]", render: (_v: unknown, _r: unknown, i: number) => <span className="text-sm text-(--color-muted)">{(urlPage - 1) * urlPageSize + i + 1}</span> },
    {
      key: "name", label: "Người dùng", sortable: true,
      render: (_v: unknown, row: UserRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {row.image ? <img src={row.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-semibold text-gray-500">{row.name?.charAt(0)}</span>}
          </div>
          <div><p className="font-semibold text-sm">{row.name}</p><p className="text-xs text-gray-400">{row.email}</p></div>
        </div>
      ),
    },
    { key: "username", label: "Username", headerClassName: "w-[120px]", render: (_v: unknown, row: UserRow) => <span className="text-sm text-(--color-muted)">{row.username}</span> },
    { key: "role", label: "Vai trò", headerClassName: "w-[120px]", render: (_v: unknown, row: UserRow) => <Badge size="sm" variant={ROLE_BADGE_MAP[row.role] || "default"}>{ROLE_OPTIONS.find(r => r.key === row.role)?.label || row.role}</Badge> },
    { key: "status", label: "Trạng thái", headerClassName: "w-[100px]", render: (_v: unknown, row: UserRow) => <Badge size="sm" variant={row.status === "ACTIVE" ? "success" : "warning"}>{row.status === "ACTIVE" ? "Hoạt động" : row.status}</Badge> },
    { key: "createdAt", label: "Ngày tạo", headerClassName: "w-[120px]", render: (_v: unknown, row: UserRow) => <span className="text-sm text-(--color-muted)">{dayjs(row.createdAt).format("DD/MM/YYYY")}</span> },
  ], [urlPage, urlPageSize]);

  return (
    <CTable<UserRow & Record<string, unknown>>
      columns={columns} data={data.items as (UserRow & Record<string, unknown>)[]} rowKey="id" page={urlPage} pageSize={urlPageSize} total={data.total}
      sortDescriptor={sortDescriptor} onSortChange={onSortChange} isLoading={isLoading}
      onPageChange={(p) => updateUrl({ page: String(p) })} onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
      ariaLabel="Người dùng" emptyContent={{ icon: <Users className="w-12 h-12" />, title: "Chưa có người dùng", description: "Người dùng sẽ xuất hiện ở đây" }}
      toolbar={
        <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm người dùng..."
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
            <div className="w-full sm:w-40">
              <Select
                options={ROLE_OPTIONS_SELECT}
                value={urlRole}
                onChange={(v) => updateUrl({ role: v || "ALL" })}
                placeholder="Vai trò"
              />
            </div>
          </div>
        </div>
      }
    />
  );
}

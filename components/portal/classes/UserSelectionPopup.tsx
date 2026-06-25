"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar } from "@/components/ui";
import { Button } from "@/components/ui";
import { Check, Search, Users, X } from "lucide-react";
import { CModal } from "@/components/portal/common/CModal";
import { CSpinner } from "@/components/portal/common";
import api from "@/lib/http/client";
import { USER_ROLE } from "@/constants/portal/roles";

export interface UserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  image?: string | null;
}

interface UserSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: UserItem[];
  onSelectionChange: (users: UserItem[]) => void;
  role?: string;
}

export default function UserSelectionPopup({
  isOpen,
  onClose,
  selectedUsers,
  onSelectionChange,
  role = USER_ROLE.STUDENT,
}: UserSelectionPopupProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  const fetchUsers = useCallback(
    async (searchStr: string, pageNum: number, reset = false) => {
      setIsLoading(true);
      try {
        const { data } = await api.get<{ items: UserItem[]; total: number }>(
          `/portal/users/search?search=${encodeURIComponent(searchStr)}&role=${role}&page=${pageNum}&pageSize=20`,
          { meta: { loading: false } }
        );
        if (reset) {
          setUsers(data.items);
        } else {
          setUsers((prev) => [...prev, ...data.items]);
        }
        setHasMore(data.items.length === 20);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    },
    [role]
  );

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchUsers(search, 1, true);
    }
  }, [isOpen, search, fetchUsers]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setUsers([]);
      setPage(1);
      setHasMore(true);
    }
  }, [isOpen]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || isLoading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(search, nextPage);
    }
  };

  const toggleUser = (user: UserItem) => {
    if (selectedIds.has(user.id)) {
      onSelectionChange(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      onSelectionChange([...selectedUsers, user]);
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-(--color-vermillion)" />
          <span>Chọn học viên</span>
        </div>
      }
      size="md"
      scrollBehavior="inside"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-(--color-muted)">
            Đã chọn: <strong>{selectedUsers.length}</strong> học viên
          </span>
          <Button size="sm" variant="primary" onClick={onClose}>
            Xong
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-[50vh]">
        {/* Search - Sticky */}
        <div className="sticky top-0 z-10 bg-white dark:bg-content1 pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc username..."
              className="h-9 w-full pl-9 pr-8 rounded-md border border-(--color-smoke) bg-white text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-vermillion)"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-ink)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* User List - Scrollable */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto -mx-1 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          onScroll={handleScroll}
        >
          {users.map((user) => {
            const isSelected = selectedIds.has(user.id);
            return (
              <div
                key={user.id}
                onClick={() => toggleUser(user)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all my-0.5
                  ${
                    isSelected
                      ? "bg-red-50 border-2 border-(--color-vermillion)"
                      : "border-2 border-transparent hover:bg-red-50/60"
                  }`}
              >
                <Avatar
                  src={user.image || undefined}
                  name={user.name?.charAt(0)}
                  size="sm"
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-(--color-vermillion) flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <CSpinner size="sm" className="py-3" />
          )}
          {!isLoading && users.length === 0 && (
            <p className="text-center text-sm text-(--color-muted) py-8">
              Không tìm thấy học viên
            </p>
          )}
        </div>
      </div>
    </CModal>
  );
}

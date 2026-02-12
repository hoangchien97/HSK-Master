"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar, Button, Input, Spinner } from "@heroui/react";
import { Check, Search, X } from "lucide-react";
import api from "@/lib/http/client";

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
  role = "STUDENT",
}: UserSelectionPopupProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track selected IDs locally for quick lookup
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

  // Load on open & search change
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchUsers(search, 1, true);
    }
  }, [isOpen, search, fetchUsers]);

  // Reset state when closed
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-100 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-content1 rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-default-200">
          <h3 className="font-semibold text-lg">Chọn học viên</h3>
          <Button isIconOnly size="sm" variant="light" onPress={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-default-100">
          <Input
            placeholder="Tìm theo tên hoặc username..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            size="sm"
            value={search}
            onValueChange={setSearch}
            isClearable
            onClear={() => setSearch("")}
          />
        </div>

        {/* User List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-2 py-1"
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
                      ? "bg-primary-50 border-2 border-primary"
                      : "border-2 border-transparent hover:bg-primary-50/60"
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
                  <p className="text-xs text-default-400 truncate">@{user.username}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-center py-3">
              <Spinner size="sm" />
            </div>
          )}
          {!isLoading && users.length === 0 && (
            <p className="text-center text-sm text-default-400 py-8">
              Không tìm thấy học viên
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-default-200 flex items-center justify-between">
          <span className="text-sm text-default-500">
            Đã chọn: <strong>{selectedUsers.length}</strong> học viên
          </span>
          <Button size="sm" color="primary" onPress={onClose}>
            Xong
          </Button>
        </div>
      </div>
    </div>
  );
}

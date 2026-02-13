"use client";

import { memo } from "react";
import {
  Button,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Textarea,
} from "@heroui/react";
import { Check, X, StickyNote } from "lucide-react";

/* ───────────────── Types ───────────────── */

type AttendanceStatus = "PRESENT" | "ABSENT" | "UNMARKED";

interface AttendanceCellProps {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  isPending: boolean;
  isToday: boolean;
  isFuture: boolean;
  note: string;
  notePopover: { studentId: string; date: string } | null;
  noteText: string;
  onStatusChange: (
    studentId: string,
    date: string,
    status: AttendanceStatus
  ) => void;
  onNotePopoverOpen: (studentId: string, date: string, note: string) => void;
  onNotePopoverClose: () => void;
  onNoteTextChange: (text: string) => void;
  onNoteSave: (studentId: string, date: string, note: string) => void;
}

/* ───────────────── Component ───────────────── */

function AttendanceCell({
  studentId,
  date,
  status,
  isPending,
  isToday,
  isFuture,
  note,
  notePopover,
  noteText,
  onStatusChange,
  onNotePopoverOpen,
  onNotePopoverClose,
  onNoteTextChange,
  onNoteSave,
}: AttendanceCellProps) {
  const isNoteOpen =
    notePopover?.studentId === studentId && notePopover?.date === date;

  if (isFuture) {
    return (
      <td className="px-2 py-2 text-center border-r border-gray-100 bg-gray-50/50 opacity-40">
        <span className="text-gray-300 text-xs">—</span>
      </td>
    );
  }

  // For today: show two clickable options side by side
  if (isToday) {
    return (
      <td className="px-1.5 py-2 text-center border-r border-gray-100 bg-blue-50/30">
        <div className="relative">
          <div className="flex items-center justify-center gap-1.5">
            {/* PRESENT button */}
            <Tooltip content="Có mặt" placement="top" delay={300}>
              <button
                type="button"
                onClick={() => onStatusChange(studentId, date, "PRESENT")}
                className={`group w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer outline-none ${
                  status === "PRESENT"
                    ? "border-2 border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300 scale-110 shadow-md shadow-emerald-200"
                    : "border-2 border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 hover:scale-105"
                }`}
              >
                <Check
                  className={`w-4 h-4 stroke-[2.5] ${status === "PRESENT" ? "text-emerald-600" : "text-gray-300 group-hover:text-emerald-500"}`}
                />
              </button>
            </Tooltip>

            {/* ABSENT button */}
            <Tooltip content="Vắng" placement="top" delay={300}>
              <button
                type="button"
                onClick={() => onStatusChange(studentId, date, "ABSENT")}
                className={`group w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer outline-none ${
                  status === "ABSENT"
                    ? "border-2 border-red-500 bg-red-50 ring-2 ring-red-300 scale-110 shadow-md shadow-red-200"
                    : "border-2 border-gray-200 bg-white hover:border-red-400 hover:bg-red-50 hover:scale-105"
                }`}
              >
                <X
                  className={`w-4 h-4 stroke-[2.5] ${status === "ABSENT" ? "text-red-600" : "text-gray-300 group-hover:text-red-500"}`}
                />
              </button>
            </Tooltip>

            {/* Note button - inline next to actions */}
            <Popover
              isOpen={isNoteOpen}
              onOpenChange={(open) => {
                if (open) {
                  onNotePopoverOpen(studentId, date, note);
                } else {
                  onNotePopoverClose();
                }
              }}
              placement="bottom-start"
            >
              <PopoverTrigger>
                <button
                  type="button"
                  className={`w-4 h-4 flex items-center justify-center rounded transition-colors ${
                    note
                      ? "text-amber-500 hover:bg-amber-50"
                      : "text-gray-300 hover:text-gray-400 hover:bg-gray-100"
                  }`}
                  title="Ghi chú"
                >
                  <StickyNote className="w-3 h-3 cursor-pointer" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-3 w-64">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ghi chú</p>
                  <Textarea
                    size="sm"
                    placeholder="Nhập ghi chú..."
                    value={noteText}
                    onValueChange={onNoteTextChange}
                    minRows={2}
                  />
                  <Button
                    size="sm"
                    color="primary"
                    className="w-full"
                    onPress={() => onNoteSave(studentId, date, noteText)}
                  >
                    Lưu ghi chú
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </td>
    );
  }

  // For past dates: read-only status display
  const renderPastIcon = () => {
    const size = "w-4 h-4 md:w-5 md:h-5";
    switch (status) {
      case "PRESENT":
        return (
          <div
            className={`${size} rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          </div>
        );
      case "ABSENT":
        return (
          <div
            className={`${size} rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center`}
          >
            <X className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div
            className={`${size} rounded-full border-2 border-gray-200 bg-white flex items-center justify-center`}
          >
            <span className="w-2.5 h-0.5 bg-gray-300 rounded" />
          </div>
        );
    }
  };

  return (
    <td className="px-2 py-2 text-center border-r border-gray-100">
      <div className="flex items-center justify-center relative">
        <Tooltip
          content={
            status === "PRESENT"
              ? "Có mặt"
              : status === "ABSENT"
                ? "Vắng"
                : "Chưa điểm danh"
          }
          placement="top"
          delay={300}
        >
          <span className="cursor-default">{renderPastIcon()}</span>
        </Tooltip>
        {
          note && (
            <Tooltip content={note} placement="bottom" delay={300}>
              <StickyNote className="absolute -bottom-1.5 right-[4px] w-3 h-3 text-amber-500 cursor-default" />
            </Tooltip>
          )
        }
      </div>
    </td>
  );
}

export default memo(AttendanceCell);

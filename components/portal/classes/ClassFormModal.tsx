"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Avatar } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Select, type SelectOption } from "@/components/ui";
import { toast } from "react-toastify";
import type { IClass } from "@/interfaces/portal";
import dayjs from "dayjs";
import { CModal } from "@/components/portal/common";
import { FileEdit, PlusCircle, Users, X } from "lucide-react";
import { createClassAction, updateClassAction } from "@/actions/class.actions";
import { FORMAT_DATE_INPUT } from "@/constants/portal/date";
import { USER_ROLE } from "@/constants/portal/roles";
import { MSG_CLASS, MSG } from "@/constants/portal/messages";
import { HSK_LEVELS } from "@/constants/portal/student";
import UserSelectionPopup, { type UserItem } from "./UserSelectionPopup";

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (classData: IClass) => void;
  initialData?: IClass;
}

/** Map HSK_LEVELS to Select-friendly format (skip the 'ALL' entry) */
const LEVEL_OPTIONS: SelectOption[] = HSK_LEVELS
  .filter((l) => l.key !== "ALL")
  .map((l) => ({ value: l.key, label: l.label }));

export default function ClassFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ClassFormModalProps) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Student selection state
  const [selectedStudents, setSelectedStudents] = useState<UserItem[]>([]);
  const [showUserPopup, setShowUserPopup] = useState(false);

  // Form field state
  const [level, setLevel] = useState(initialData?.level || "HSK1");

  // Load enrolled students when editing
  useEffect(() => {
    if (isOpen && isEdit && initialData?.enrollments) {
      const enrolled: UserItem[] = initialData.enrollments.map((e) => {
        const student = e.student as UserItem | undefined;
        return {
          id: student?.id || e.studentId,
          name: student?.name || "",
          username: student?.username || "",
          email: student?.email || "",
          image: student?.image,
        };
      });
      setSelectedStudents(enrolled);
      setLevel(initialData.level || "HSK1");
    } else if (!isOpen) {
      setSelectedStudents([]);
      setShowUserPopup(false);
      setLevel("HSK1");
    }
  }, [isOpen, isEdit, initialData]);

  const removeStudent = (id: string) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        className: formData.className as string,
        classCode: formData.classCode as string,
        description: (formData.description as string) || "",
        level: level,
        startDate: formData.startDate as string,
        endDate: (formData.endDate as string) || "",
        studentIds: selectedStudents.map((s) => s.id),
      };

      if (isEdit) {
        const result = await updateClassAction(initialData!.id, payload);
        if (!result.success) throw new Error(result.error);
        toast.success(MSG_CLASS.UPDATED);
        onClose();
        if (result.classData) onSuccess(result.classData);
      } else {
        const result = await createClassAction(payload);
        if (!result.success) throw new Error(result.error);
        toast.success(MSG_CLASS.CREATED);
        onClose();
        if (result.classData) onSuccess(result.classData);
      }
    } catch (error: unknown) {
      const err = error as { normalized?: { message?: string }; message?: string };
      toast.error(err?.normalized?.message || err?.message || MSG.ERROR_GENERIC);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CModal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        title={
          <div className="flex items-center gap-2">
            {isEdit ? <FileEdit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            {isEdit ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} form="class-form">
              {isEdit ? "Cập nhật" : "Tạo lớp"}
            </Button>
          </>
        }
      >
        <form
          id="class-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <Input
            required
            label="Tên lớp"
            name="className"
            placeholder="HSK 1 - Sáng thứ 2, 4, 6"
            defaultValue={initialData?.className || ""}
            error={errors.className}
          />

          <Input
            required
            label="Mã lớp"
            name="classCode"
            placeholder="HSK1-MWF-AM-2025"
            defaultValue={initialData?.classCode || ""}
            error={errors.classCode}
          />

          <Textarea
            label="Mô tả"
            name="description"
            placeholder="Mô tả về lớp học..."
            defaultValue={initialData?.description || ""}
          />

          <Select
            label="Trình độ"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              required
              type="date"
              label="Ngày bắt đầu"
              name="startDate"
              placeholder="dd/mm/yyyy"
              defaultValue={
                initialData?.startDate
                  ? dayjs(initialData.startDate).format(FORMAT_DATE_INPUT)
                  : ""
              }
              error={errors.startDate}
            />

            <Input
              type="date"
              label="Ngày kết thúc"
              name="endDate"
              placeholder="dd/mm/yyyy"
              defaultValue={
                initialData?.endDate
                  ? dayjs(initialData.endDate).format(FORMAT_DATE_INPUT)
                  : ""
              }
            />
          </div>

          {/* Student Selection */}
          <div className="space-y-2 w-full">
            <label className="text-sm font-medium">
              Học viên {selectedStudents.length > 0 && `(${selectedStudents.length})`}
            </label>
            <div
              className="w-full border border-(--color-smoke) rounded-lg p-3 cursor-pointer hover:border-(--color-vermillion) hover:bg-red-50/30 transition-colors min-h-[60px] flex items-center gap-2 flex-wrap"
              onClick={() => setShowUserPopup(true)}
            >
              {selectedStudents.length > 0 ? (
                selectedStudents.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium"
                  >
                    <Avatar src={s.image || undefined} name={s.name?.charAt(0)} size="sm" />
                    {s.username || s.name}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeStudent(s.id); }}
                      className="ml-0.5 hover:text-red-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-(--color-muted) text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Nhấn để chọn học viên...
                </span>
              )}
            </div>
          </div>
        </form>
      </CModal>

      {/* User Selection Popup - separate component */}
      <UserSelectionPopup
        isOpen={showUserPopup}
        onClose={() => setShowUserPopup(false)}
        selectedUsers={selectedStudents}
        onSelectionChange={setSelectedStudents}
        role={USER_ROLE.STUDENT}
      />
    </>
  );
}

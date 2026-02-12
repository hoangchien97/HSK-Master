"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Textarea,
  Select,
  SelectItem,
  Avatar,
  Chip,
} from "@heroui/react";
import { toast } from "react-toastify";
import type { IClass } from "@/interfaces/portal";
import dayjs from "dayjs";
import { CModal } from "@/components/portal/common";
import { FileEdit, PlusCircle, Users } from "lucide-react";
import { createClassAction, updateClassAction } from "@/actions/class.actions";
import { FORMAT_DATE_INPUT } from "@/constants/portal/date";
import UserSelectionPopup, { type UserItem } from "./UserSelectionPopup";

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (classData: IClass) => void;
  initialData?: IClass;
}

const LEVELS = [
  { value: "HSK1", label: "HSK 1" },
  { value: "HSK2", label: "HSK 2" },
  { value: "HSK3", label: "HSK 3" },
  { value: "HSK4", label: "HSK 4" },
  { value: "HSK5", label: "HSK 5" },
  { value: "HSK6", label: "HSK 6" },
];

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
    } else if (!isOpen) {
      setSelectedStudents([]);
      setShowUserPopup(false);
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
        level: formData.level as string,
        startDate: formData.startDate as string,
        endDate: (formData.endDate as string) || "",
        studentIds: selectedStudents.map((s) => s.id),
      };

      if (isEdit) {
        const result = await updateClassAction(initialData!.id, payload);
        if (!result.success) throw new Error(result.error);
        toast.success("Cập nhật lớp thành công!");
        onClose();
        if (result.classData) onSuccess(result.classData);
      } else {
        const result = await createClassAction(payload);
        if (!result.success) throw new Error(result.error);
        toast.success("Tạo lớp thành công!");
        onClose();
        if (result.classData) onSuccess(result.classData);
      }
    } catch (error: unknown) {
      const err = error as { normalized?: { message?: string }; message?: string };
      toast.error(err?.normalized?.message || err?.message || "Có lỗi xảy ra");
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
            <Button variant="flat" onPress={onClose}>
              Hủy
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting} form="class-form">
              {isEdit ? "Cập nhật" : "Tạo lớp"}
            </Button>
          </>
        }
      >
        <Form
          id="class-form"
          validationErrors={errors}
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <Input
            isRequired
            label="Tên lớp"
            name="className"
            placeholder="HSK 1 - Sáng thứ 2, 4, 6"
            labelPlacement="outside"
            defaultValue={initialData?.className || ""}
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng nhập tên lớp";
              }
            }}
          />

          <Input
            isRequired
            label="Mã lớp"
            name="classCode"
            placeholder="HSK1-MWF-AM-2025"
            labelPlacement="outside"
            defaultValue={initialData?.classCode || ""}
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng nhập mã lớp";
              }
            }}
          />

          <Textarea
            label="Mô tả"
            name="description"
            placeholder="Mô tả về lớp học..."
            labelPlacement="outside"
            defaultValue={initialData?.description || ""}
          />

          <Select
            label="Trình độ"
            name="level"
            labelPlacement="outside"
            defaultSelectedKeys={initialData?.level ? [initialData.level] : ["HSK1"]}
          >
            {LEVELS.map((level) => (
              <SelectItem key={level.value}>{level.label}</SelectItem>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              isRequired
              type="date"
              label="Ngày bắt đầu"
              name="startDate"
              labelPlacement="outside"
              defaultValue={
                initialData?.startDate
                  ? dayjs(initialData.startDate).format(FORMAT_DATE_INPUT)
                  : ""
              }
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing) {
                  return "Vui lòng chọn ngày bắt đầu";
                }
              }}
            />

            <Input
              type="date"
              label="Ngày kết thúc"
              name="endDate"
              labelPlacement="outside"
              defaultValue={
                initialData?.endDate
                  ? dayjs(initialData.endDate).format(FORMAT_DATE_INPUT)
                  : ""
              }
            />
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Học viên</label>
            <div
              className="border border-default-200 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors min-h-11 flex items-center gap-2 flex-wrap"
              onClick={() => setShowUserPopup(true)}
            >
              {selectedStudents.length > 0 ? (
                selectedStudents.map((s) => (
                  <Chip
                    key={s.id}
                    size="sm"
                    variant="flat"
                    onClose={() => removeStudent(s.id)}
                    avatar={<Avatar src={s.image || undefined} name={s.name?.charAt(0)} size="sm" />}
                  >
                    {s.username || s.name}
                  </Chip>
                ))
              ) : (
                <span className="text-default-400 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Chọn học viên...
                </span>
              )}
            </div>
          </div>
        </Form>
      </CModal>

      {/* User Selection Popup - separate component */}
      <UserSelectionPopup
        isOpen={showUserPopup}
        onClose={() => setShowUserPopup(false)}
        selectedUsers={selectedStudents}
        onSelectionChange={setSelectedStudents}
        role="STUDENT"
      />
    </>
  );
}


"use client";

import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { toast } from "react-toastify";
import type { IClass } from "@/app/interfaces/portal";
import dayjs from "dayjs";
import { CModal } from "@/app/components/portal/common";
import { FileEdit, PlusCircle } from "lucide-react";

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));

    setErrors({});
    setIsSubmitting(true);

    try {
      const url = isEdit
        ? `/api/portal/classes/${initialData!.id}`
        : "/api/portal/classes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: formData.className,
          classCode: formData.classCode,
          description: formData.description || "",
          level: formData.level,
          startDate: formData.startDate,
          endDate: formData.endDate || "",
          maxStudents: Number(formData.maxStudents),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Có lỗi xảy ra");
      }

      toast.success(
        isEdit ? "Cập nhật lớp thành công!" : "Tạo lớp thành công!"
      );
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

        <div className="grid grid-cols-2 gap-4">
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

          <Input
            isRequired
            type="number"
            label="Số học viên tối đa"
            name="maxStudents"
            labelPlacement="outside"
            min={1}
            max={100}
            defaultValue={initialData?.maxStudents?.toString() || "20"}
            errorMessage={({ validationDetails }) => {
              if (validationDetails.valueMissing) {
                return "Vui lòng nhập số học viên";
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            isRequired
            type="date"
            label="Ngày bắt đầu"
            name="startDate"
            labelPlacement="outside"
            defaultValue={
              initialData?.startDate
                ? dayjs(initialData.startDate).format("YYYY-MM-DD")
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
                ? dayjs(initialData.endDate).format("YYYY-MM-DD")
                : ""
            }
          />
        </div>
      </Form>
    </CModal>
  );
}


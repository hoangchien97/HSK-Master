"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { toast } from "react-toastify";
import { classSchema, type ClassFormValues } from "@/app/validators";
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: initialData
      ? {
          className: initialData.className,
          classCode: initialData.classCode,
          description: initialData.description || "",
          level: initialData.level || "",
          startDate: dayjs(initialData.startDate).format("YYYY-MM-DD"),
          endDate: initialData.endDate
            ? dayjs(initialData.endDate).format("YYYY-MM-DD")
            : "",
          maxStudents: initialData.maxStudents,
        }
      : {
          className: "",
          classCode: "",
          description: "",
          level: "HSK1",
          startDate: "",
          endDate: "",
          maxStudents: 20,
        },
  });

  const onSubmit = async (data: ClassFormValues) => {
    try {
      const url = isEdit
        ? `/api/portal/classes/${initialData!.id}`
        : "/api/portal/classes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Có lỗi xảy ra");
      }

      toast.success(
        isEdit ? "Cập nhật lớp thành công!" : "Tạo lớp thành công!"
      );
      reset();
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      closeIcon={isEdit ? FileEdit : PlusCircle}
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
      <form id="class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Tên lớp"
              placeholder="HSK 1 - Sáng thứ 2, 4, 6"
              isRequired
              isInvalid={!!errors.className}
              errorMessage={errors.className?.message}
              {...register("className")}
            />
            <Input
              label="Mã lớp"
              placeholder="HSK1-MWF-AM-2025"
              isRequired
              isInvalid={!!errors.classCode}
              errorMessage={errors.classCode?.message}
              {...register("classCode")}
            />
            <Textarea
              label="Mô tả"
              placeholder="Mô tả về lớp học..."
              {...register("description")}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Trình độ"
                defaultSelectedKeys={
                  initialData?.level ? [initialData.level] : ["HSK1"]
                }
                {...register("level")}
              >
                {LEVELS.map((level) => (
                  <SelectItem key={level.value}>{level.label}</SelectItem>
                ))}
              </Select>
              <Input
                type="number"
                label="Số học viên tối đa"
                min={1}
                max={100}
                isInvalid={!!errors.maxStudents}
                errorMessage={errors.maxStudents?.message}
                {...register("maxStudents", { valueAsNumber: true })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Ngày bắt đầu"
                isRequired
                isInvalid={!!errors.startDate}
                errorMessage={errors.startDate?.message}
                {...register("startDate")}
              />
              <Input
                type="date"
                label="Ngày kết thúc"
                {...register("endDate")}
              />
            </div>
        </form>
    </CModal>
  );
}


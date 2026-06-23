"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { IReview } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createReviewAction, updateReviewAction } from "@/actions/admin.actions";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { FormField } from "@/components/ui/forms/FormField";
import { Select } from "@/components/ui/forms/Select";
import type { SelectOption } from "@/components/ui/forms/Select";
import { Switch } from "@/components/ui/forms/Switch";

const schema = z.object({
  studentName: z.string().min(1, "Nhập tên học viên"),
  className: z.string().min(1, "Nhập tên khóa học"),
  content: z.string().min(1, "Nhập nội dung đánh giá"),
  rating: z.coerce.number().min(1).max(5).default(5),
  isApproved: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const ratingOptions: SelectOption[] = [
  { value: "5", label: "5 Sao (Tuyệt vời)" },
  { value: "4", label: "4 Sao (Tốt)" },
  { value: "3", label: "3 Sao (Bình thường)" },
  { value: "2", label: "2 Sao (Kém)" },
  { value: "1", label: "1 Sao (Tệ)" },
];

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: IReview) => void;
  initialData?: IReview;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ReviewFormModalProps) {
  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentName: initialData?.studentName ?? "",
      className: initialData?.className ?? "",
      content: initialData?.content ?? "",
      rating: initialData?.rating ?? 5,
      isApproved: initialData?.isApproved ?? true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      studentName: initialData?.studentName ?? "",
      className: initialData?.className ?? "",
      content: initialData?.content ?? "",
      rating: initialData?.rating ?? 5,
      isApproved: initialData?.isApproved ?? true,
    });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormData) => {
    try {
      const result = isEdit
        ? await updateReviewAction(initialData!.id, data)
        : await createReviewAction(data);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật đánh giá thành công!" : "Tạo đánh giá thành công!");
      onSuccess(result.data!);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thao tác thất bại");
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={isEdit ? "Chỉnh sửa Đánh giá" : "Thêm Đánh giá mới"}
      footer={
        <>
          <Button variant="flat" onPress={onClose}>Hủy</Button>
          <Button color="primary" isLoading={isSubmitting} onPress={() => void handleSubmit(onSubmit)()}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên học viên"
            placeholder="Ví dụ: Nguyễn Văn A"
            required
            error={errors.studentName?.message}
            {...register("studentName")}
          />
          <Input
            label="Tên khóa học"
            placeholder="Ví dụ: HSK 4 Đầu ra"
            required
            error={errors.className?.message}
            {...register("className")}
          />
        </div>

        <Textarea
          label="Nội dung đánh giá"
          placeholder="Nhập nhận xét của học viên..."
          required
          error={errors.content?.message}
          {...register("content")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-default-200 pt-4">
          <FormField
            control={control}
            name="rating"
            render={({ field, fieldState }) => (
              <Select
                label="Số sao"
                options={ratingOptions}
                value={String(field.value)}
                onChange={(v) => field.onChange(Number(v))}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="px-2 pt-2">
            <FormField
              control={control}
              name="isApproved"
              render={({ field, fieldState: _fs }) => (
                <Switch
                  checked={field.value ?? true}
                  onChange={field.onChange}
                  label="Phê duyệt (Hiển thị)"
                  description={
                    field.value
                      ? "Đánh giá sẽ được hiển thị trên trang chủ"
                      : "Đánh giá đang ẩn chờ duyệt"
                  }
                />
              )}
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

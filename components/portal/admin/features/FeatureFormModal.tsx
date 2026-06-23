"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { IFeature } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createFeatureAction, updateFeatureAction } from "@/actions/admin.actions";
import * as LucideIcons from "lucide-react";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { FormField } from "@/components/ui/forms/FormField";
import { Switch } from "@/components/ui/forms/Switch";

const schema = z.object({
  title: z.string().min(1, "Nhập tên tính năng"),
  description: z.string().min(1, "Nhập mô tả"),
  iconName: z.string().min(1, "Nhập tên icon"),
  order: z.coerce.number().default(1),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface FeatureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: IFeature) => void;
  initialData?: IFeature;
}

export default function FeatureFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: FeatureFormModalProps) {
  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      iconName: initialData?.iconName ?? "Star",
      order: initialData?.order ?? 1,
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      iconName: initialData?.iconName ?? "Star",
      order: initialData?.order ?? 1,
      isActive: initialData?.isActive ?? true,
    });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const iconNameValue = watch("iconName") || "Star";
  const IconComponent = (LucideIcons as any)[iconNameValue] || LucideIcons.Star;

  const onSubmit = async (data: FormData) => {
    try {
      const result = isEdit
        ? await updateFeatureAction(initialData!.id, data)
        : await createFeatureAction(data);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật tính năng thành công!" : "Thêm tính năng thành công!");
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
      title={isEdit ? "Chỉnh sửa Tính năng nổi bật" : "Thêm Tính năng nổi bật"}
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
        <Input
          label="Tên tính năng"
          placeholder="Ví dụ: Lộ trình học rõ ràng"
          required
          error={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả cho tính năng"
          required
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên Lucide Icon"
            placeholder="Ví dụ: Star, BookOpen, User..."
            hint="Tìm tên icon tại lucide.dev"
            required
            error={errors.iconName?.message}
            rightIcon={
              <div className="p-1 bg-default-100 rounded-md text-primary">
                <IconComponent className="w-5 h-5" />
              </div>
            }
            {...register("iconName")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-default-200 pt-4">
          <Input
            label="Thứ tự hiển thị"
            type="number"
            placeholder="1"
            error={errors.order?.message}
            {...register("order")}
          />
          <div className="px-2 pt-2 text-sm font-medium">
            <FormField
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value ?? true}
                  onChange={field.onChange}
                  label="Hiển thị tính năng này"
                />
              )}
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { IAlbum, ICreateAlbumDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createAlbumAction, updateAlbumAction } from "@/actions/admin.actions";
import ImageUpload from "@/components/portal/admin/common/ImageUpload";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { FormField } from "@/components/ui/forms/FormField";

const schema = z.object({
  title: z.string().min(1, "Nhập tên album"),
  description: z.string().optional(),
  thumbnail: z.string().min(1, "Chọn ảnh đại diện"),
  order: z.coerce.number().min(1).default(1),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface AlbumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: IAlbum) => void;
  initialData?: IAlbum;
}

export default function AlbumFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AlbumFormModalProps) {
  const isEdit = !!initialData;

  const emptyDefaults: FormData = {
    title: "",
    description: "",
    thumbnail: "",
    order: 1,
    isActive: true,
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      isEdit
        ? {
            title: initialData.title,
            description: initialData.description ?? "",
            thumbnail: initialData.thumbnail,
            order: initialData.order,
            isActive: initialData.isActive,
          }
        : emptyDefaults,
    );
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormData) => {
    try {
      const dto: ICreateAlbumDTO = {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        order: data.order,
        isActive: data.isActive,
      };

      const result = isEdit
        ? await updateAlbumAction(initialData!.id, dto)
        : await createAlbumAction(dto);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật album thành công!" : "Tạo album thành công!");
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
      title={isEdit ? "Chỉnh sửa Album" : "Tạo Album mới"}
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
          label="Tên album"
          placeholder="Nhập tên album"
          required
          error={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả album"
          error={errors.description?.message}
          {...register("description")}
        />

        <FormField
          control={control}
          name="thumbnail"
          render={({ field }) => (
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Ảnh đại diện <span className="text-red-500">*</span>
              </label>
              <ImageUpload value={field.value} onChange={field.onChange} />
              {errors.thumbnail && (
                <p className="text-xs text-red-600">{errors.thumbnail.message}</p>
              )}
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Thứ tự hiển thị"
            type="number"
            placeholder="1"
            error={errors.order?.message}
            {...register("order")}
          />
          <div className="flex items-center h-full px-2">
            <FormField
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  label="Hiển thị"
                  checked={field.value ?? true}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

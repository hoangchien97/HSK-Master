"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { IHeroSlide } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createHeroSlideAction, updateHeroSlideAction } from "@/actions/admin.actions";
import ImageUpload from "@/components/portal/admin/common/ImageUpload";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { FormField } from "@/components/ui/forms/FormField";

const schema = z.object({
  title: z.string().min(1, "Nhập tiêu đề slide"),
  badge: z.string().min(1, "Nhập badge"),
  image: z.string().min(1, "Chọn hình ảnh"),
  description: z.string().default(""),
  primaryCtaText: z.string().default("Đăng ký ngay"),
  primaryCtaHref: z.string().default("/contact"),
  secondaryCtaText: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
  badgeColor: z.string().default("#EF4444"),
  order: z.coerce.number().min(1).default(1),
  overlayGradient: z.string().default("from-black/60 via-black/30 to-transparent"),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const emptyDefaults: FormData = {
  title: "",
  badge: "",
  image: "",
  description: "",
  primaryCtaText: "Đăng ký ngay",
  primaryCtaHref: "/contact",
  secondaryCtaText: "",
  secondaryCtaHref: "",
  badgeColor: "#EF4444",
  order: 1,
  overlayGradient: "from-black/60 via-black/30 to-transparent",
  isActive: true,
};

interface HeroSlideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: IHeroSlide) => void;
  initialData?: IHeroSlide;
}

export default function HeroSlideFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: HeroSlideFormModalProps) {
  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
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
            title: initialData.title ?? "",
            badge: initialData.badge ?? "",
            image: initialData.image ?? "",
            description: initialData.description ?? "",
            primaryCtaText: initialData.primaryCtaText ?? "Đăng ký ngay",
            primaryCtaHref: initialData.primaryCtaHref ?? "/contact",
            secondaryCtaText: initialData.secondaryCtaText ?? "",
            secondaryCtaHref: initialData.secondaryCtaHref ?? "",
            badgeColor: initialData.badgeColor ?? "#EF4444",
            order: initialData.order ?? 1,
            overlayGradient:
              initialData.overlayGradient ??
              "from-black/60 via-black/30 to-transparent",
            isActive: initialData.isActive ?? true,
          }
        : emptyDefaults,
    );
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormData) => {
    try {
      const result = isEdit
        ? await updateHeroSlideAction(initialData!.id, data)
        : await createHeroSlideAction(data);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật slide thành công!" : "Tạo slide thành công!");
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
      size="3xl"
      title={isEdit ? "Chỉnh sửa Hero Slide" : "Thêm Hero Slide mới"}
      footer={
        <>
          <Button variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            isLoading={isSubmitting}
            onPress={() => void handleSubmit(onSubmit)()}
          >
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tiêu đề"
            placeholder="Nhập tiêu đề slide"
            required
            error={errors.title?.message}
            {...register("title")}
          />
          <Input
            label="Badge"
            placeholder="VD: Ưu đãi"
            required
            error={errors.badge?.message}
            {...register("badge")}
          />
        </div>

        <FormField
          control={control}
          name="image"
          render={({ field }) => (
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Hình ảnh <span className="text-red-500">*</span>
              </label>
              <ImageUpload value={field.value} onChange={field.onChange} />
              {errors.image && (
                <p className="text-xs text-red-600">{errors.image.message}</p>
              )}
            </div>
          )}
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả slide"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CTA chính - Text"
            placeholder="Đăng ký ngay"
            error={errors.primaryCtaText?.message}
            {...register("primaryCtaText")}
          />
          <Input
            label="CTA chính - URL"
            placeholder="/contact"
            error={errors.primaryCtaHref?.message}
            {...register("primaryCtaHref")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CTA phụ - Text"
            placeholder="Tìm hiểu thêm"
            error={errors.secondaryCtaText?.message}
            {...register("secondaryCtaText")}
          />
          <Input
            label="CTA phụ - URL"
            placeholder="/about"
            error={errors.secondaryCtaHref?.message}
            {...register("secondaryCtaHref")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Màu badge"
            placeholder="#EF4444"
            error={errors.badgeColor?.message}
            {...register("badgeColor")}
          />
          <Input
            label="Thứ tự"
            type="number"
            placeholder="1"
            error={errors.order?.message}
            {...register("order")}
          />
          <Input
            label="Overlay gradient"
            placeholder="from-black/60..."
            error={errors.overlayGradient?.message}
            {...register("overlayGradient")}
          />
        </div>

        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch
              checked={field.value ?? true}
              onChange={field.onChange}
              label="Hiển thị"
            />
          )}
        />
      </div>
    </CModal>
  );
}

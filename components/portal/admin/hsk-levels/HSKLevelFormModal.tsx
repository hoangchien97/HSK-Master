"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { IHSKLevel, ICreateHSKLevelDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createHSKLevelAction, updateHSKLevelAction } from "@/actions/admin.actions";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { FormField } from "@/components/ui/forms/FormField";

const schema = z.object({
  title: z.string().min(1, "Nhập tên cấp độ"),
  level: z.coerce.number({ message: "Phải là số" }).min(1).max(6),
  badge: z.string().min(1, "Nhập badge"),
  badgeColor: z.string().optional(),
  description: z.string().optional(),
  vocabularyCount: z.string().optional(),
  lessonCount: z.coerce.number().min(0).default(0),
  duration: z.string().optional(),
  targetAudience: z.string().optional(),
  targetIcon: z.string().optional(),
  accentColor: z.string().optional(),
  bgGradient: z.string().optional(),
  href: z.string().optional(),
  order: z.coerce.number().min(1).default(1),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const emptyDefaults: FormData = {
  title: "",
  level: 1,
  badge: "",
  badgeColor: "default",
  description: "",
  vocabularyCount: "",
  lessonCount: 0,
  duration: "",
  targetAudience: "",
  targetIcon: "Target",
  accentColor: "blue-500",
  bgGradient: "from-blue-50 to-transparent",
  href: "",
  order: 1,
  isActive: true,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
};

interface HSKLevelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: IHSKLevel) => void;
  initialData?: IHSKLevel;
}

export default function HSKLevelFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: HSKLevelFormModalProps) {
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
            title: initialData!.title,
            level: initialData!.level,
            badge: initialData!.badge,
            badgeColor: initialData!.badgeColor ?? "default",
            description: initialData!.description ?? "",
            vocabularyCount: initialData!.vocabularyCount ?? "",
            lessonCount: initialData!.lessonCount ?? 0,
            duration: initialData!.duration ?? "",
            targetAudience: initialData!.targetAudience ?? "",
            targetIcon: initialData!.targetIcon ?? "Target",
            accentColor: initialData!.accentColor ?? "blue-500",
            bgGradient: initialData!.bgGradient ?? "from-blue-50 to-transparent",
            href: initialData!.href ?? "",
            order: initialData!.order,
            isActive: initialData!.isActive,
            metaTitle: initialData!.metaTitle ?? "",
            metaDescription: initialData!.metaDescription ?? "",
            keywords: initialData!.keywords ?? "",
          }
        : emptyDefaults,
    );
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormData) => {
    try {
      const payload = data as ICreateHSKLevelDTO;
      const result = isEdit
        ? await updateHSKLevelAction(initialData!.id, payload)
        : await createHSKLevelAction(payload);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật cấp độ thành công!" : "Tạo cấp độ thành công!");
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
      title={isEdit ? "Chỉnh sửa Cấp độ HSK" : "Thêm Cấp độ HSK mới"}
      scrollBehavior="inside"
      footer={
        <>
          <Button variant="flat" onPress={onClose}>Hủy</Button>
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
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <div>
          <h4 className="text-sm font-semibold mb-3 border-b border-(--color-smoke) pb-1">
            Thông tin cơ bản
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên cấp độ"
              placeholder="VD: HSK 1 - Sơ cấp"
              required
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label="Level (Số)"
              type="number"
              placeholder="1"
              required
              error={errors.level?.message}
              {...register("level")}
            />
            <Input
              label="Badge / Nhãn"
              placeholder="VD: Nền tảng vững chắc"
              required
              error={errors.badge?.message}
              {...register("badge")}
            />
            <Input
              label="Màu nhãn (Tailwind color)"
              placeholder="VD: text-blue-600 bg-blue-100"
              error={errors.badgeColor?.message}
              {...register("badgeColor")}
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Mô tả"
              placeholder="Nhập mô tả cho cấp độ"
              rows={2}
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div>
          <h4 className="text-sm font-semibold mb-3 border-b border-(--color-smoke) pb-1">
            Thông tin chi tiết
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Số từ vựng"
              placeholder="VD: 150 từ vựng"
              error={errors.vocabularyCount?.message}
              {...register("vocabularyCount")}
            />
            <Input
              label="Số bài học"
              type="number"
              placeholder="VD: 15"
              error={errors.lessonCount?.message}
              {...register("lessonCount")}
            />
            <Input
              label="Thời lượng"
              placeholder="VD: 3 tháng"
              error={errors.duration?.message}
              {...register("duration")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Mục tiêu / Đối tượng"
              placeholder="VD: Dành cho người mới bắt đầu"
              error={errors.targetAudience?.message}
              {...register("targetAudience")}
            />
            <Input
              label="Lucide Icon (cho mục tiêu)"
              placeholder="VD: Target, Users"
              error={errors.targetIcon?.message}
              {...register("targetIcon")}
            />
          </div>
        </div>

        {/* Giao diện & SEO */}
        <div>
          <h4 className="text-sm font-semibold mb-3 border-b border-(--color-smoke) pb-1">
            Giao diện &amp; SEO
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Màu chủ đạo (Tailwind)"
              placeholder="VD: blue-500"
              error={errors.accentColor?.message}
              {...register("accentColor")}
            />
            <Input
              label="Link liên kết"
              placeholder="VD: /khoa-hoc/hsk-1"
              hint="Nơi người dùng được chuyển đến khi click"
              error={errors.href?.message}
              {...register("href")}
            />
            <div className="md:col-span-2">
              <Input
                label="Gradient nền (Tailwind)"
                placeholder="VD: from-blue-50 to-transparent"
                error={errors.bgGradient?.message}
                {...register("bgGradient")}
              />
            </div>

            {/* SEO */}
            <Input
              label="SEO Title"
              placeholder="Tiêu đề SEO"
              error={errors.metaTitle?.message}
              {...register("metaTitle")}
            />
            <Input
              label="SEO Keywords"
              placeholder="Tách nhau bằng dấu phẩy"
              error={errors.keywords?.message}
              {...register("keywords")}
            />
            <div className="md:col-span-2">
              <Textarea
                label="SEO Description"
                placeholder="Mô tả SEO"
                rows={2}
                error={errors.metaDescription?.message}
                {...register("metaDescription")}
              />
            </div>
          </div>
        </div>

        {/* Cài đặt chung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-(--color-paper) p-4 rounded-xl border border-(--color-smoke)">
          <Input
            label="Thứ tự hiển thị"
            type="number"
            placeholder="1"
            error={errors.order?.message}
            {...register("order")}
          />
          <div className="px-2 pt-2 text-sm font-medium">
            <FormField
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Hiển thị cấp độ này"
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

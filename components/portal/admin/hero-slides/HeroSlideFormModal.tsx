"use client";

import { useState } from "react";
import { Button, Input, Textarea, Switch } from "@heroui/react";
import { toast } from "react-toastify";
import type { IHeroSlide, ICreateHeroSlideDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createHeroSlideAction, updateHeroSlideAction } from "@/actions/admin.actions";
import ImageUpload from "@/components/portal/admin/common/ImageUpload";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreateHeroSlideDTO>({
    image: initialData?.image || "",
    badge: initialData?.badge || "",
    badgeColor: initialData?.badgeColor || "#EF4444",
    title: initialData?.title || "",
    description: initialData?.description || "",
    primaryCtaText: initialData?.primaryCtaText || "Đăng ký ngay",
    primaryCtaHref: initialData?.primaryCtaHref || "/contact",
    secondaryCtaText: initialData?.secondaryCtaText || "",
    secondaryCtaHref: initialData?.secondaryCtaHref || "",
    overlayGradient: initialData?.overlayGradient || "from-black/60 via-black/30 to-transparent",
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true,
  });

  const updateField = <K extends keyof ICreateHeroSlideDTO>(key: K, value: ICreateHeroSlideDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.image || !form.badge) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateHeroSlideAction(initialData!.id, form)
        : await createHeroSlideAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật slide thành công!" : "Tạo slide thành công!");
      onSuccess(result.data!);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
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
          <Button variant="flat" onPress={onClose}>Hủy</Button>
          <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
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
            value={form.title}
            onValueChange={(v) => updateField("title", v)}
            isRequired
          />
          <Input
            label="Badge"
            placeholder="VD: Ưu đãi"
            value={form.badge}
            onValueChange={(v) => updateField("badge", v)}
            isRequired
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Hình ảnh</label>
          <ImageUpload
            value={form.image}
            onChange={(url) => updateField("image", url)}
          />
        </div>

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả slide"
          value={form.description}
          onValueChange={(v) => updateField("description", v)}
          minRows={2}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CTA chính - Text"
            placeholder="Đăng ký ngay"
            value={form.primaryCtaText}
            onValueChange={(v) => updateField("primaryCtaText", v)}
          />
          <Input
            label="CTA chính - URL"
            placeholder="/contact"
            value={form.primaryCtaHref}
            onValueChange={(v) => updateField("primaryCtaHref", v)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CTA phụ - Text"
            placeholder="Tìm hiểu thêm"
            value={form.secondaryCtaText || ""}
            onValueChange={(v) => updateField("secondaryCtaText", v)}
          />
          <Input
            label="CTA phụ - URL"
            placeholder="/about"
            value={form.secondaryCtaHref || ""}
            onValueChange={(v) => updateField("secondaryCtaHref", v)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Màu badge"
            placeholder="#EF4444"
            value={form.badgeColor}
            onValueChange={(v) => updateField("badgeColor", v)}
          />
          <Input
            label="Thứ tự"
            type="number"
            placeholder="1"
            value={String(form.order)}
            onValueChange={(v) => updateField("order", Number(v) || 0)}
          />
          <Input
            label="Overlay gradient"
            placeholder="from-black/60..."
            value={form.overlayGradient}
            onValueChange={(v) => updateField("overlayGradient", v)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            isSelected={form.isActive}
            onValueChange={(v) => updateField("isActive", v)}
          >
            Hiển thị
          </Switch>
        </div>
      </div>
    </CModal>
  );
}

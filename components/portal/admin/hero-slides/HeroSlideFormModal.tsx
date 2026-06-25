"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
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
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
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
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
          <Input
            label="Badge"
            placeholder="VD: Ưu đãi"
            value={form.badge}
            onChange={(e) => updateField("badge", e.target.value)}
            required
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
          onChange={(e) => updateField("description", e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CTA chính - Text"
            placeholder="Đăng ký ngay"
            value={form.primaryCtaText}
            onChange={(e) => updateField("primaryCtaText", e.target.value)}
          />
          <Input
            label="CTA chính - URL"
            placeholder="/contact"
            value={form.primaryCtaHref}
            onChange={(e) => updateField("primaryCtaHref", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CTA phụ - Text"
            placeholder="Tìm hiểu thêm"
            value={form.secondaryCtaText || ""}
            onChange={(e) => updateField("secondaryCtaText", e.target.value)}
          />
          <Input
            label="CTA phụ - URL"
            placeholder="/about"
            value={form.secondaryCtaHref || ""}
            onChange={(e) => updateField("secondaryCtaHref", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Màu badge"
            placeholder="#EF4444"
            value={form.badgeColor}
            onChange={(e) => updateField("badgeColor", e.target.value)}
          />
          <Input
            label="Thứ tự"
            type="number"
            placeholder="1"
            value={String(form.order)}
            onChange={(e) => updateField("order", Number(e.target.value) || 0)}
          />
          <Input
            label="Overlay gradient"
            placeholder="from-black/60..."
            value={form.overlayGradient}
            onChange={(e) => updateField("overlayGradient", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={form.isActive}
            onChange={(v) => updateField("isActive", v)}
            label="Hiển thị"
          />
        </div>
      </div>
    </CModal>
  );
}

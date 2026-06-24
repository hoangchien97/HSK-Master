"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { toast } from "react-toastify";
import type { IHSKLevel, ICreateHSKLevelDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createHSKLevelAction, updateHSKLevelAction } from "@/actions/admin.actions";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreateHSKLevelDTO>({
    title: initialData?.title || "",
    level: initialData?.level || 1,
    badge: initialData?.badge || "",
    badgeColor: initialData?.badgeColor || "default",
    description: initialData?.description || "",
    vocabularyCount: initialData?.vocabularyCount || "",
    lessonCount: initialData?.lessonCount || 0,
    duration: initialData?.duration || "",
    targetAudience: initialData?.targetAudience || "",
    targetIcon: initialData?.targetIcon || "Target",
    accentColor: initialData?.accentColor || "blue-500",
    bgGradient: initialData?.bgGradient || "from-blue-50 to-transparent",
    href: initialData?.href || "",
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true,
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    keywords: initialData?.keywords || "",
  });

  const updateField = <K extends keyof ICreateHSKLevelDTO>(key: K, value: ICreateHSKLevelDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.level || !form.badge) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc (Tiêu đề, Level, Badge)");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateHSKLevelAction(initialData!.id, form)
        : await createHSKLevelAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật cấp độ thành công!" : "Tạo cấp độ thành công!");
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
      title={isEdit ? "Chỉnh sửa Cấp độ HSK" : "Thêm Cấp độ HSK mới"}
      scrollBehavior="inside"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <div>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Thông tin cơ bản</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên cấp độ"
              placeholder="VD: HSK 1 - Sơ cấp"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
            <Input
              label="Level (Số)"
              type="number"
              placeholder="1"
              value={String(form.level)}
              onChange={(e) => updateField("level", Number(e.target.value) || 1)}
              required
            />
            <Input
              label="Badge / Nhãn"
              placeholder="VD: Nền tảng vững chắc"
              value={form.badge}
              onChange={(e) => updateField("badge", e.target.value)}
              required
            />
            <Input
              label="Màu nhãn (Tailwind color)"
              placeholder="VD: text-blue-600 bg-blue-100"
              value={form.badgeColor}
              onChange={(e) => updateField("badgeColor", e.target.value)}
            />
          </div>
          <Textarea
            label="Mô tả"
            placeholder="Nhập mô tả cho cấp độ"
            className="mt-4"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        {/* Thông tin khóa học & Đối tượng */}
        <div>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Thông tin chi tiết</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Số từ vựng"
              placeholder="VD: 150 từ vựng"
              value={form.vocabularyCount}
              onChange={(e) => updateField("vocabularyCount", e.target.value)}
            />
            <Input
              label="Số bài học"
              type="number"
              placeholder="VD: 15"
              value={String(form.lessonCount)}
              onChange={(e) => updateField("lessonCount", Number(e.target.value) || 0)}
            />
            <Input
              label="Thời lượng"
              placeholder="VD: 3 tháng"
              value={form.duration}
              onChange={(e) => updateField("duration", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              label="Mục tiêu / Đối tượng"
              placeholder="VD: Dành cho người mới bắt đầu"
              value={form.targetAudience}
              onChange={(e) => updateField("targetAudience", e.target.value)}
            />
            <Input
              label="Lucide Icon (cho mục tiêu)"
              placeholder="VD: Target, Users"
              value={form.targetIcon}
              onChange={(e) => updateField("targetIcon", e.target.value)}
            />
          </div>
        </div>

        {/* Thiết kế & SEO */}
        <div>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Giao diện & SEO</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Màu chủ đạo (Tailwind)"
              placeholder="VD: blue-500"
              value={form.accentColor}
              onChange={(e) => updateField("accentColor", e.target.value)}
            />
            <Input
              label="Link liên kết"
              placeholder="VD: /khoa-hoc/hsk-1"
              value={form.href}
              onChange={(e) => updateField("href", e.target.value)}
              hint="Nơi người dùng được chuyển đến khi click"
            />
            <div className="md:col-span-2">
              <Input
                label="Gradient nền (Tailwind)"
                placeholder="VD: from-blue-50 to-transparent"
                value={form.bgGradient}
                onChange={(e) => updateField("bgGradient", e.target.value)}
              />
            </div>

            {/* SEO */}
            <Input
              label="SEO Title"
              placeholder="Tiêu đề SEO"
              value={form.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
            />
            <Input
              label="SEO Keywords"
              placeholder="Tách nhau bằng dấu phẩy"
              value={form.keywords || ""}
              onChange={(e) => updateField("keywords", e.target.value)}
            />
            <div className="md:col-span-2">
              <Textarea
                label="SEO Description"
                placeholder="Mô tả SEO"
                value={form.metaDescription || ""}
                onChange={(e) => updateField("metaDescription", e.target.value)}
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
            value={String(form.order)}
            onChange={(e) => updateField("order", Number(e.target.value) || 0)}
          />
          <div className="px-2 pt-2 text-sm font-medium">
            <Switch
              checked={form.isActive}
              onChange={(v) => updateField("isActive", v)}
              label="Hiển thị cấp độ này"
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

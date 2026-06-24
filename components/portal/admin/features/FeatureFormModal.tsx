"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { toast } from "react-toastify";
import type { IFeature, ICreateFeatureDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createFeatureAction, updateFeatureAction } from "@/actions/admin.actions";
import * as LucideIcons from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreateFeatureDTO>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    iconName: initialData?.iconName || "Star",
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true,
  });

  const updateField = <K extends keyof ICreateFeatureDTO>(key: K, value: ICreateFeatureDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.iconName) {
      toast.error("Vui lòng nhập tên tính năng và chọn icon");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateFeatureAction(initialData!.id, form)
        : await createFeatureAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật tính năng thành công!" : "Thêm tính năng thành công!");
      onSuccess(result.data!);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = (LucideIcons as any)[form.iconName] || LucideIcons.Star;

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={isEdit ? "Chỉnh sửa Tính năng nổi bật" : "Thêm Tính năng nổi bật"}
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
        <Input
          label="Tên tính năng"
          placeholder="Ví dụ: Lộ trình học rõ ràng"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả cho tính năng"
          value={form.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên Lucide Icon"
            placeholder="Ví dụ: Star, BookOpen, User..."
            value={form.iconName}
            onChange={(e) => updateField("iconName", e.target.value)}
            hint="Tìm tên icon tại lucide.dev"
            rightIcon={
              <div className="p-1 bg-default-100 rounded-md text-(--color-vermillion)">
                <IconComponent className="w-5 h-5" />
              </div>
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-default-200 pt-4">
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
              label="Hiển thị tính năng này"
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

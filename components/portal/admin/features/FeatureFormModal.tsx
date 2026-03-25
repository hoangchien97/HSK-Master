"use client";

import { useState } from "react";
import { Button, Input, Textarea, Switch } from "@heroui/react";
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
          <Button variant="flat" onPress={onClose}>Hủy</Button>
          <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
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
          onValueChange={(v) => updateField("title", v)}
          isRequired
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả cho tính năng"
          value={form.description || ""}
          onValueChange={(v) => updateField("description", v)}
          minRows={2}
          isRequired
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên Lucide Icon"
            placeholder="Ví dụ: Star, BookOpen, User..."
            value={form.iconName}
            onValueChange={(v) => updateField("iconName", v)}
            description="Tìm tên icon tại lucide.dev"
            endContent={
              <div className="p-1 bg-default-100 rounded-md text-primary">
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
            onValueChange={(v) => updateField("order", Number(v) || 0)}
          />
          <div className="px-2 pt-2 text-sm font-medium">
            <Switch
              isSelected={form.isActive}
              onValueChange={(v) => updateField("isActive", v)}
              size="sm"
            >
              Hiển thị tính năng này
            </Switch>
          </div>
        </div>
      </div>
    </CModal>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Switch } from "@/components/ui/forms/Switch";
import { toast } from "react-toastify";
import type { ICtaStat, ICreateCtaStatDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createCtaStatAction, updateCtaStatAction } from "@/actions/admin.actions";

interface CtaStatFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: ICtaStat) => void;
  initialData?: ICtaStat;
}

export default function CtaStatFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CtaStatFormModalProps) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreateCtaStatDTO>({
    value: initialData?.value || 0,
    suffix: initialData?.suffix || "",
    label: initialData?.label || "",
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true,
  });

  const updateField = <K extends keyof ICreateCtaStatDTO>(key: K, value: ICreateCtaStatDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.label) {
      toast.error("Vui lòng nhập tên/nhãn chỉ số");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateCtaStatAction(initialData!.id, form)
        : await createCtaStatAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật chỉ số thành công!" : "Tạo chỉ số thành công!");
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
      size="md"
      title={isEdit ? "Chỉnh sửa Chỉ số" : "Thêm Chỉ số mới"}
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá trị (số)"
            type="number"
            placeholder="Ví dụ: 50"
            value={String(form.value)}
            onChange={(e) => updateField("value", Number(e.target.value) || 0)}
            required
          />
          <Input
            label="Hậu tố"
            placeholder="Ví dụ: +, %"
            value={form.suffix || ""}
            onChange={(e) => updateField("suffix", e.target.value)}
          />
        </div>

        <Input
          label="Tên / Nhãn"
          placeholder="Ví dụ: Bài giảng, Học viên..."
          value={form.label}
          onChange={(e) => updateField("label", e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4 items-center">
          <Input
            label="Thứ tự hiển thị"
            type="number"
            placeholder="1"
            value={String(form.order)}
            onChange={(e) => updateField("order", Number(e.target.value) || 0)}
          />
          <div className="px-2 pt-2">
            <Switch
              checked={form.isActive}
              onChange={(v) => updateField("isActive", v)}
              label="Hiển thị"
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

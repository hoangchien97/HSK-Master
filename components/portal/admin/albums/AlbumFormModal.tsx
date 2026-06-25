"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { toast } from "react-toastify";
import type { IAlbum, ICreateAlbumDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createAlbumAction, updateAlbumAction } from "@/actions/admin.actions";
import ImageUpload from "@/components/portal/admin/common/ImageUpload";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreateAlbumDTO>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    thumbnail: initialData?.thumbnail || "",
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true,
  });

  const updateField = <K extends keyof ICreateAlbumDTO>(key: K, value: ICreateAlbumDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.thumbnail) {
      toast.error("Vui lòng nhập tên album và chọn ảnh đại diện");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateAlbumAction(initialData!.id, form)
        : await createAlbumAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật album thành công!" : "Tạo album thành công!");
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
      size="2xl"
      title={isEdit ? "Chỉnh sửa Album" : "Tạo Album mới"}
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
          label="Tên album"
          placeholder="Nhập tên album"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả album"
          value={form.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
        />

        <div className="space-y-1">
          <label className="text-sm font-medium">Ảnh đại diện</label>
          <ImageUpload
            value={form.thumbnail}
            onChange={(url) => updateField("thumbnail", url)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Thứ tự hiển thị"
            type="number"
            placeholder="1"
            value={String(form.order)}
            onChange={(e) => updateField("order", Number(e.target.value) || 0)}
          />
          <div className="flex items-center h-full px-2">
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

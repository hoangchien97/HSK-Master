"use client";

import { useState } from "react";
import { Button, Input, Textarea, Switch } from "@heroui/react";
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
          <Button variant="flat" onPress={onClose}>Hủy</Button>
          <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
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
          onValueChange={(v) => updateField("title", v)}
          isRequired
        />

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả album"
          value={form.description || ""}
          onValueChange={(v) => updateField("description", v)}
          minRows={2}
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
            onValueChange={(v) => updateField("order", Number(v) || 0)}
          />
          <div className="flex items-center h-full px-2">
            <Switch
              isSelected={form.isActive}
              onValueChange={(v) => updateField("isActive", v)}
            >
              Hiển thị
            </Switch>
          </div>
        </div>
      </div>
    </CModal>
  );
}

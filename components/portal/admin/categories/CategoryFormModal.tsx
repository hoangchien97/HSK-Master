"use client";

import { useState, useEffect } from "react";
import { Button, Input, Textarea } from "@heroui/react";
import { toast } from "react-toastify";
import type { ICategory, ICreateCategoryDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createCategoryAction, updateCategoryAction } from "@/actions/admin.actions";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: ICategory) => void;
  initialData?: ICategory;
}

// Chuyển tiếng Việt có dấu thành không dấu và tạo slug
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CategoryFormModalProps) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreateCategoryDTO>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
  });

  // Tự động generate slug khi sửa name
  useEffect(() => {
    if (!isEdit && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [form.name, isEdit]);

  const updateField = <K extends keyof ICreateCategoryDTO>(key: K, value: ICreateCategoryDTO[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !isEdit) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateCategoryAction(initialData!.id, form)
        : await createCategoryAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật danh mục thành công!" : "Tạo danh mục thành công!");
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
      title={isEdit ? "Chỉnh sửa Danh mục" : "Tạo Danh mục mới"}
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
            label="Tên danh mục"
            placeholder="Ví dụ: Khóa học HSK"
            value={form.name}
            onValueChange={(v) => updateField("name", v)}
            isRequired
          />
          <Input
            label="Slug (tự động)"
            placeholder="khoa-hoc-hsk"
            value={form.slug}
            description="Dùng làm đường dẫn URL"
            isDisabled
          />
        </div>

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả cho danh mục (hiển thị trên trang chủ)"
          value={form.description || ""}
          onValueChange={(v) => updateField("description", v)}
          minRows={2}
        />

        <div className="pt-4 border-t border-default-200 space-y-4">
          <h4 className="text-sm font-semibold text-default-600">SEO (Tùy chọn)</h4>
          <Input
            label="SEO Title"
            placeholder="Tiêu đề hiển thị trên Google"
            value={form.metaTitle || ""}
            onValueChange={(v) => updateField("metaTitle", v)}
          />
          <Textarea
            label="SEO Description"
            placeholder="Mô tả cho công cụ tìm kiếm"
            value={form.metaDescription || ""}
            onValueChange={(v) => updateField("metaDescription", v)}
            minRows={2}
          />
        </div>
      </div>
    </CModal>
  );
}

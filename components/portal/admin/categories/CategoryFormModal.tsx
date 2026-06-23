"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { ICategory, ICreateCategoryDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createCategoryAction, updateCategoryAction } from "@/actions/admin.actions";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";

// Chuyển tiếng Việt có dấu thành không dấu và tạo slug
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const schema = z.object({
  name: z.string().min(1, "Nhập tên danh mục"),
  slug: z.string().min(1, "Slug không được trống"),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: ICategory) => void;
  initialData?: ICategory;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CategoryFormModalProps) {
  const isEdit = !!initialData;

  const emptyDefaults: FormData = {
    name: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      isEdit
        ? {
            name: initialData.name,
            slug: initialData.slug,
            description: initialData.description ?? "",
            metaTitle: initialData.metaTitle ?? "",
            metaDescription: initialData.metaDescription ?? "",
          }
        : emptyDefaults,
    );
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const nameValue = watch("name");
  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue("slug", generateSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, isEdit, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const dto: ICreateCategoryDTO = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      };

      const result = isEdit
        ? await updateCategoryAction(initialData!.id, dto)
        : await createCategoryAction(dto);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật danh mục thành công!" : "Tạo danh mục thành công!");
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
      size="2xl"
      title={isEdit ? "Chỉnh sửa Danh mục" : "Tạo Danh mục mới"}
      footer={
        <>
          <Button variant="flat" onPress={onClose}>Hủy</Button>
          <Button color="primary" isLoading={isSubmitting} onPress={() => void handleSubmit(onSubmit)()}>
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
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Slug (tự động)"
            placeholder="khoa-hoc-hsk"
            hint="Dùng làm đường dẫn URL"
            readOnly={!isEdit}
            error={errors.slug?.message}
            {...register("slug")}
          />
        </div>

        <Textarea
          label="Mô tả"
          placeholder="Nhập mô tả cho danh mục (hiển thị trên trang chủ)"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="pt-4 border-t border-default-200 space-y-4">
          <h4 className="text-sm font-semibold text-default-600">SEO (Tùy chọn)</h4>
          <Input
            label="SEO Title"
            placeholder="Tiêu đề hiển thị trên Google"
            error={errors.metaTitle?.message}
            {...register("metaTitle")}
          />
          <Textarea
            label="SEO Description"
            placeholder="Mô tả cho công cụ tìm kiếm"
            error={errors.metaDescription?.message}
            {...register("metaDescription")}
          />
        </div>
      </div>
    </CModal>
  );
}

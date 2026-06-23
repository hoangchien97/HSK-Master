"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { IPageMetadata, ICreatePageMetadataDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createPageMetadataAction, updatePageMetadataAction } from "@/actions/admin.actions";
import ImageUpload from "@/components/portal/admin/common/ImageUpload";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { FormField } from "@/components/ui/forms/FormField";

const schema = z.object({
  pagePath: z.string().min(1, "Nhập đường dẫn trang"),
  pageName: z.string().default(""),
  title: z.string().min(1, "Nhập tiêu đề SEO"),
  description: z.string().min(1, "Nhập mô tả SEO"),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  ogType: z.string().optional(),
  twitterCard: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  robots: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const emptyDefaults: FormData = {
  pagePath: "/",
  pageName: "",
  title: "",
  description: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  canonicalUrl: "",
  robots: "index, follow",
  isActive: true,
};

interface PageMetadataFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: IPageMetadata) => void;
  initialData?: IPageMetadata;
}

export default function PageMetadataFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: PageMetadataFormModalProps) {
  const isEdit = !!initialData;

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      isEdit
        ? {
            pagePath: initialData!.pagePath,
            pageName: initialData!.pageName ?? "",
            title: initialData!.title,
            description: initialData!.description,
            keywords: initialData!.keywords ?? "",
            ogTitle: initialData!.ogTitle ?? "",
            ogDescription: initialData!.ogDescription ?? "",
            ogImage: initialData!.ogImage ?? "",
            ogType: initialData!.ogType ?? "website",
            twitterCard: initialData!.twitterCard ?? "summary_large_image",
            twitterTitle: initialData!.twitterTitle ?? "",
            twitterDescription: initialData!.twitterDescription ?? "",
            twitterImage: initialData!.twitterImage ?? "",
            canonicalUrl: initialData!.canonicalUrl ?? "",
            robots: initialData!.robots ?? "index, follow",
            isActive: initialData!.isActive,
          }
        : emptyDefaults
    );
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const titleValue = watch("title");
  const isActiveValue = watch("isActive");

  const syncOGAndTwitter = () => {
    const vals = getValues();
    if (!vals.ogTitle) setValue("ogTitle", vals.title);
    if (!vals.ogDescription) setValue("ogDescription", vals.description);
    if (!vals.twitterTitle) setValue("twitterTitle", vals.ogTitle || vals.title);
    if (!vals.twitterDescription) setValue("twitterDescription", vals.ogDescription || vals.description);
    if (!vals.twitterImage) setValue("twitterImage", vals.ogImage || "");
    toast.success("Đã đồng bộ nội dung SEO sang thẻ OG/Twitter!");
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload: ICreatePageMetadataDTO = data;
      const result = isEdit
        ? await updatePageMetadataAction(initialData!.id, payload)
        : await createPageMetadataAction(payload);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật SEO cho trang thành công!" : "Tạo thiết lập SEO thành công!");
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
      size="4xl"
      title={isEdit ? "Chỉnh sửa Metadata SEO" : "Thiết lập Metadata SEO mới"}
      scrollBehavior="inside"
      footer={
        <div className="flex justify-between w-full">
          <Button variant="flat" color="secondary" onPress={syncOGAndTwitter}>
            Đồng bộ (Điền nhanh)
          </Button>
          <div className="space-x-2">
            <Button variant="flat" onPress={onClose}>Hủy</Button>
            <Button color="primary" isLoading={isSubmitting} onPress={() => void handleSubmit(onSubmit)()}>
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Section 1: Cài đặt Trang */}
        <section className="bg-(--color-paper) p-4 rounded-xl border border-(--color-smoke)">
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Cài đặt Trang</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên Quản Lý"
              placeholder="VD: Trang chủ, Khóa học..."
              {...register("pageName")}
              error={errors.pageName?.message}
            />
            <Input
              label="Đường dẫn (Path)"
              placeholder="VD: / hoặc /courses"
              required
              {...register("pagePath")}
              error={errors.pagePath?.message}
              hint="Phải trùng khớp với URL của trang, bắt đầu bằng /"
            />
            <div className="flex items-center">
              <Switch
                checked={isActiveValue ?? true}
                onChange={(v) => setValue("isActive", v)}
                label="Kích hoạt áp dụng SEO cho trang này"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Thẻ Meta Chính */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1 text-(--color-vermillion)">Thẻ Meta Chính (Google Title/Description)</h4>
          <div className="space-y-4">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <Input
                  label="Tiêu đề (Title)"
                  required
                  placeholder="Tiêu đề hiển thị trên Google (tối đa ~60 ký tự)"
                  maxLength={70}
                  hint={`${(field.value?.length || 0)}/70 ký tự (Đề xuất: 50-60 ký tự)`}
                  error={errors.title?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  label="Mô tả (Description)"
                  required
                  placeholder="Đoạn trích giới thiệu (tối đa ~155 ký tự)"
                  showCount
                  maxLength={160}
                  error={errors.description?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
            <Input
              label="Từ khóa (Keywords)"
              placeholder="Thêm các từ khóa, cách nhau bằng dấu phẩy"
              {...register("keywords")}
              error={errors.keywords?.message}
            />
          </div>
        </section>

        {/* Section 3: Open Graph */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1 text-[#1877F2]">Open Graph (Facebook / Zalo / Linkedin)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input
                label="OG Title"
                placeholder="Tiêu đề hiển thị khi share lên FB"
                {...register("ogTitle")}
                error={errors.ogTitle?.message}
              />
              <FormField
                control={control}
                name="ogDescription"
                render={({ field }) => (
                  <Textarea
                    label="OG Description"
                    placeholder="Mô tả khi share"
                    error={errors.ogDescription?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              <Input
                label="OG Type"
                placeholder="website, article..."
                {...register("ogType")}
                error={errors.ogType?.message}
              />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Hình thu nhỏ (OG Image 1200x630)</p>
              <FormField
                control={control}
                name="ogImage"
                render={({ field }) => (
                  <ImageUpload value={field.value || ""} onChange={field.onChange} folder="seo" />
                )}
              />
            </div>
          </div>
        </section>

        {/* Section 4: Twitter Card */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1 text-[#1DA1F2]">Twitter Card</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input
                label="Twitter Card Type"
                placeholder="summary_large_image / summary"
                {...register("twitterCard")}
                error={errors.twitterCard?.message}
              />
              <Input
                label="Twitter Title"
                {...register("twitterTitle")}
                error={errors.twitterTitle?.message}
              />
              <FormField
                control={control}
                name="twitterDescription"
                render={({ field }) => (
                  <Textarea
                    label="Twitter Description"
                    error={errors.twitterDescription?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Hình thu nhỏ (Twitter Image)</p>
              <FormField
                control={control}
                name="twitterImage"
                render={({ field }) => (
                  <ImageUpload value={field.value || ""} onChange={field.onChange} folder="seo" />
                )}
              />
            </div>
          </div>
        </section>

        {/* Section 5: Nâng cao & Lập chỉ mục */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Nâng cao & Lập chỉ mục</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Robots"
              placeholder="VD: index, follow"
              {...register("robots")}
              error={errors.robots?.message}
            />
            <Input
              label="URL Canonical (Canonical URL)"
              placeholder="Chỉ điền nếu muốn Canonical tag khác URL gốc"
              {...register("canonicalUrl")}
              error={errors.canonicalUrl?.message}
            />
          </div>
        </section>
      </div>
    </CModal>
  );
}

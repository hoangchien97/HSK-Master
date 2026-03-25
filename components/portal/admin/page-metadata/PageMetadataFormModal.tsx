"use client";

import { useState } from "react";
import { Button, Input, Textarea, Switch } from "@heroui/react";
import { toast } from "react-toastify";
import type { IPageMetadata, ICreatePageMetadataDTO } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createPageMetadataAction, updatePageMetadataAction } from "@/actions/admin.actions";
import ImageUpload from "@/components/portal/admin/common/ImageUpload";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreatePageMetadataDTO>({
    pagePath: initialData?.pagePath || "/",
    pageName: initialData?.pageName || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    keywords: initialData?.keywords || "",
    ogTitle: initialData?.ogTitle || "",
    ogDescription: initialData?.ogDescription || "",
    ogImage: initialData?.ogImage || "",
    ogType: initialData?.ogType || "website",
    twitterCard: initialData?.twitterCard || "summary_large_image",
    twitterTitle: initialData?.twitterTitle || "",
    twitterDescription: initialData?.twitterDescription || "",
    twitterImage: initialData?.twitterImage || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    robots: initialData?.robots || "index, follow",
    isActive: initialData?.isActive ?? true,
  });

  const updateField = <K extends keyof ICreatePageMetadataDTO>(key: K, value: ICreatePageMetadataDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const syncOGAndTwitter = () => {
    setForm((prev) => ({
      ...prev,
      ogTitle: prev.ogTitle || prev.title,
      ogDescription: prev.ogDescription || prev.description,
      twitterTitle: prev.twitterTitle || prev.ogTitle || prev.title,
      twitterDescription: prev.twitterDescription || prev.ogDescription || prev.description,
      twitterImage: prev.twitterImage || prev.ogImage,
    }));
    toast.success("Đã đồng bộ nội dung SEO sang thẻ OG/Twitter!");
  };

  const handleSubmit = async () => {
    if (!form.pagePath || !form.title || !form.description) {
      toast.error("Vui lòng nhập Đường dẫn, Tiêu đề và Mô tả SEO");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updatePageMetadataAction(initialData!.id, form)
        : await createPageMetadataAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật SEO cho trang thành công!" : "Tạo thiết lập SEO thành công!");
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
            <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Thông tin xác định trang */}
        <section className="bg-default-50 p-4 rounded-xl border border-default-200">
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Cài đặt Trang</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên Quản Lý"
              placeholder="VD: Trang chủ, Khóa học..."
              value={form.pageName}
              onValueChange={(v) => updateField("pageName", v)}
            />
            <div className="space-y-1">
              <Input
                label="Đường dẫn (Path)"
                placeholder="VD: / hoặc /courses"
                value={form.pagePath}
                onValueChange={(v) => updateField("pagePath", v)}
                isRequired
              />
              <p className="text-xs text-default-400 pl-1">Phải trùng khớp với URL của trang, bắt đầu bằng /</p>
            </div>

            <div className="flex items-center">
              <Switch
                isSelected={form.isActive}
                onValueChange={(v) => updateField("isActive", v)}
              >
                Kích hoạt áp dụng SEO cho trang này
              </Switch>
            </div>
          </div>
        </section>

        {/* SEO Cơ bản */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1 text-primary">Thẻ Meta Chính (Google Title/Description)</h4>
          <div className="space-y-4">
            <Input
              label="Tiêu đề (Title)"
              placeholder="Tiêu đề hiển thị trên Google (tối đa ~60 ký tự)"
              value={form.title}
              onValueChange={(v) => updateField("title", v)}
              isRequired
              maxLength={70}
              description={`${form.title?.length || 0}/70 ký tự (Đề xuất: 50-60 ký tự)`}
            />
            <Textarea
              label="Mô tả (Description)"
              placeholder="Đoạn trích giới thiệu (tối đa ~155 ký tự)"
              value={form.description}
              onValueChange={(v) => updateField("description", v)}
              isRequired
              minRows={2}
              maxLength={160}
              description={`${form.description?.length || 0}/160 ký tự`}
            />
            <Input
              label="Từ khóa (Keywords)"
              placeholder="Thêm các từ khóa, cách nhau bằng dấu phẩy"
              value={form.keywords || ""}
              onValueChange={(v) => updateField("keywords", v)}
            />
          </div>
        </section>

        {/* Open Graph / Facebook */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1 text-[#1877F2]">Open Graph (Facebook / Zalo / Linkedin)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input
                label="OG Title"
                placeholder="Tiêu đề hiển thị khi share lên FB"
                value={form.ogTitle || ""}
                onValueChange={(v) => updateField("ogTitle", v)}
              />
              <Textarea
                label="OG Description"
                placeholder="Mô tả khi share"
                value={form.ogDescription || ""}
                onValueChange={(v) => updateField("ogDescription", v)}
                minRows={2}
              />
              <Input
                label="OG Type"
                placeholder="website, article..."
                value={form.ogType || ""}
                onValueChange={(v) => updateField("ogType", v)}
              />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Hình thu nhỏ (OG Image 1200x630)</p>
              <ImageUpload
                value={form.ogImage || ""}
                onChange={(v) => updateField("ogImage", v)}
                folder="seo"
              />
            </div>
          </div>
        </section>

        {/* Twitter */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1 text-[#1DA1F2]">Twitter Card</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input
                label="Twitter Card Type"
                placeholder="summary_large_image / summary"
                value={form.twitterCard || ""}
                onValueChange={(v) => updateField("twitterCard", v)}
              />
              <Input
                label="Twitter Title"
                value={form.twitterTitle || ""}
                onValueChange={(v) => updateField("twitterTitle", v)}
              />
              <Textarea
                label="Twitter Description"
                value={form.twitterDescription || ""}
                onValueChange={(v) => updateField("twitterDescription", v)}
                minRows={2}
              />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Hình thu nhỏ (Twitter Image)</p>
              <ImageUpload
                value={form.twitterImage || ""}
                onChange={(v) => updateField("twitterImage", v)}
                folder="seo"
              />
            </div>
          </div>
        </section>

        {/* Cấu hình nâng cao */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Nâng cao & Lập chỉ mục</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Robots"
              placeholder="VD: index, follow"
              value={form.robots || "index, follow"}
              onValueChange={(v) => updateField("robots", v)}
            />
            <Input
              label="URL Canonical (Canonical URL)"
              placeholder="Chỉ điền nếu muốn Canonical tag khác URL gốc"
              value={form.canonicalUrl || ""}
              onValueChange={(v) => updateField("canonicalUrl", v)}
            />
          </div>
        </section>
      </div>
    </CModal>
  );
}

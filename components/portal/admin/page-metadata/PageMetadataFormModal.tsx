"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
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
          <Button variant="secondary" onClick={syncOGAndTwitter}>
            Đồng bộ (Điền nhanh)
          </Button>
          <div className="space-x-2">
            <Button variant="secondary" onClick={onClose}>Hủy</Button>
            <Button variant="primary" isLoading={isSubmitting} onClick={handleSubmit}>
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Thông tin xác định trang */}
        <section className="bg-(--color-paper) p-4 rounded-xl border border-(--color-smoke)">
          <h4 className="text-sm font-semibold mb-3 border-b pb-1">Cài đặt Trang</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên Quản Lý"
              placeholder="VD: Trang chủ, Khóa học..."
              value={form.pageName}
              onChange={(e) => updateField("pageName", e.target.value)}
            />
            <Input
              label="Đường dẫn (Path)"
              placeholder="VD: / hoặc /courses"
              value={form.pagePath}
              onChange={(e) => updateField("pagePath", e.target.value)}
              required
              hint="Phải trùng khớp với URL của trang, bắt đầu bằng /"
            />

            <div className="flex items-center">
              <Switch
                checked={form.isActive}
                onChange={(v) => updateField("isActive", v)}
                label="Kích hoạt áp dụng SEO cho trang này"
              />
            </div>
          </div>
        </section>

        {/* SEO Cơ bản */}
        <section>
          <h4 className="text-sm font-semibold mb-3 border-b pb-1 text-(--color-vermillion)">Thẻ Meta Chính (Google Title/Description)</h4>
          <div className="space-y-4">
            <Input
              label="Tiêu đề (Title)"
              placeholder="Tiêu đề hiển thị trên Google (tối đa ~60 ký tự)"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              maxLength={70}
              hint={`${form.title?.length || 0}/70 ký tự (Đề xuất: 50-60 ký tự)`}
            />
            <Textarea
              label="Mô tả (Description)"
              placeholder="Đoạn trích giới thiệu (tối đa ~155 ký tự)"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
              maxLength={160}
              hint={`${form.description?.length || 0}/160 ký tự`}
            />
            <Input
              label="Từ khóa (Keywords)"
              placeholder="Thêm các từ khóa, cách nhau bằng dấu phẩy"
              value={form.keywords || ""}
              onChange={(e) => updateField("keywords", e.target.value)}
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
                onChange={(e) => updateField("ogTitle", e.target.value)}
              />
              <Textarea
                label="OG Description"
                placeholder="Mô tả khi share"
                value={form.ogDescription || ""}
                onChange={(e) => updateField("ogDescription", e.target.value)}
              />
              <Input
                label="OG Type"
                placeholder="website, article..."
                value={form.ogType || ""}
                onChange={(e) => updateField("ogType", e.target.value)}
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
                onChange={(e) => updateField("twitterCard", e.target.value)}
              />
              <Input
                label="Twitter Title"
                value={form.twitterTitle || ""}
                onChange={(e) => updateField("twitterTitle", e.target.value)}
              />
              <Textarea
                label="Twitter Description"
                value={form.twitterDescription || ""}
                onChange={(e) => updateField("twitterDescription", e.target.value)}
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
              onChange={(e) => updateField("robots", e.target.value)}
            />
            <Input
              label="URL Canonical (Canonical URL)"
              placeholder="Chỉ điền nếu muốn Canonical tag khác URL gốc"
              value={form.canonicalUrl || ""}
              onChange={(e) => updateField("canonicalUrl", e.target.value)}
            />
          </div>
        </section>
      </div>
    </CModal>
  );
}

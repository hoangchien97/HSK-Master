"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Switch } from "@/components/ui/forms/Switch";
import { Select } from "@/components/ui/forms/Select";
import type { SelectOption } from "@/components/ui/forms/Select";
import { toast } from "react-toastify";
import type { IReview, ICreateReviewDTO } from "@/interfaces/portal";

const ratingOptions: SelectOption[] = [
  { value: "5", label: "5 Sao (Tuyệt vời)" },
  { value: "4", label: "4 Sao (Tốt)" },
  { value: "3", label: "3 Sao (Bình thường)" },
  { value: "2", label: "2 Sao (Kém)" },
  { value: "1", label: "1 Sao (Tệ)" },
];
import { CModal } from "@/components/portal/common";
import { createReviewAction, updateReviewAction } from "@/actions/admin.actions";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: IReview) => void;
  initialData?: IReview;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ReviewFormModalProps) {
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ICreateReviewDTO>({
    studentName: initialData?.studentName || "",
    className: initialData?.className || "",
    content: initialData?.content || "",
    rating: initialData?.rating || 5,
    isApproved: initialData?.isApproved ?? true,
  });

  const updateField = <K extends keyof ICreateReviewDTO>(key: K, value: ICreateReviewDTO[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.studentName || !form.className || !form.content) {
      toast.error("Vui lòng nhập đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateReviewAction(initialData!.id, form)
        : await createReviewAction(form);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật đánh giá thành công!" : "Tạo đánh giá thành công!");
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
      title={isEdit ? "Chỉnh sửa Đánh giá" : "Thêm Đánh giá mới"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên học viên"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={form.studentName}
            onChange={(e) => updateField("studentName", e.target.value)}
            required
          />
          <Input
            label="Tên khóa học"
            placeholder="Ví dụ: HSK 4 Đầu ra"
            value={form.className}
            onChange={(e) => updateField("className", e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Nội dung đánh giá"
          placeholder="Nhập nhận xét của học viên..."
          value={form.content}
          onChange={(e) => updateField("content", e.target.value)}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-default-200 pt-4">
          <Select
            label="Số sao"
            options={ratingOptions}
            value={String(form.rating)}
            onChange={(v) => updateField("rating", Number(v) || 5)}
          />

          <div className="px-2 pt-2">
            <Switch
              checked={form.isApproved}
              onChange={(v) => updateField("isApproved", v)}
              label="Phê duyệt (Hiển thị)"
              description={form.isApproved ? "Đánh giá sẽ được hiển thị trên trang chủ" : "Đánh giá đang ẩn chờ duyệt"}
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

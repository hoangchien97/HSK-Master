"use client";

import { useState } from "react";
import { Button, Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import { toast } from "react-toastify";
import type { IReview, ICreateReviewDTO } from "@/interfaces/portal";
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
            label="Tên học viên"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={form.studentName}
            onValueChange={(v) => updateField("studentName", v)}
            isRequired
          />
          <Input
            label="Tên khóa học"
            placeholder="Ví dụ: HSK 4 Đầu ra"
            value={form.className}
            onValueChange={(v) => updateField("className", v)}
            isRequired
          />
        </div>

        <Textarea
          label="Nội dung đánh giá"
          placeholder="Nhập nhận xét của học viên..."
          value={form.content}
          onValueChange={(v) => updateField("content", v)}
          minRows={3}
          isRequired
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-default-200 pt-4">
          <Select
            label="Số sao"
            className="max-w-xs"
            selectedKeys={[String(form.rating)]}
            onChange={(e) => updateField("rating", Number(e.target.value) || 5)}
          >
            <SelectItem key="5">5 Sao (Tuyệt vời)</SelectItem>
            <SelectItem key="4">4 Sao (Tốt)</SelectItem>
            <SelectItem key="3">3 Sao (Bình thường)</SelectItem>
            <SelectItem key="2">2 Sao (Kém)</SelectItem>
            <SelectItem key="1">1 Sao (Tệ)</SelectItem>
          </Select>

          <div className="px-2 pt-2">
            <Switch
              isSelected={form.isApproved}
              onValueChange={(v) => updateField("isApproved", v)}
              color="success"
            >
              Phê duyệt (Hiển thị)
            </Switch>
            <p className="text-xs text-default-400 mt-1 pl-1">
              {form.isApproved ? "Đánh giá sẽ được hiển thị trên trang chủ" : "Đánh giá đang ẩn chờ duyệt"}
            </p>
          </div>
        </div>
      </div>
    </CModal>
  );
}

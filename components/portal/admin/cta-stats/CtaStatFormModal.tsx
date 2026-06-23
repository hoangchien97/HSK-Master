"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";
import { toast } from "react-toastify";
import type { ICtaStat } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { createCtaStatAction, updateCtaStatAction } from "@/actions/admin.actions";
import { Input } from "@/components/ui/forms/Input";
import { FormField } from "@/components/ui/forms/FormField";
import { Switch } from "@/components/ui/forms/Switch";

const schema = z.object({
  value: z.coerce.number().min(0),
  suffix: z.string().optional(),
  label: z.string().min(1, "Nhập tên/nhãn chỉ số"),
  order: z.coerce.number().default(1),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

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

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      value: initialData?.value ?? 0,
      suffix: initialData?.suffix ?? "",
      label: initialData?.label ?? "",
      order: initialData?.order ?? 1,
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      value: initialData?.value ?? 0,
      suffix: initialData?.suffix ?? "",
      label: initialData?.label ?? "",
      order: initialData?.order ?? 1,
      isActive: initialData?.isActive ?? true,
    });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: FormData) => {
    try {
      const result = isEdit
        ? await updateCtaStatAction(initialData!.id, data)
        : await createCtaStatAction(data);

      if (!result.success) throw new Error(result.error);
      toast.success(isEdit ? "Cập nhật chỉ số thành công!" : "Tạo chỉ số thành công!");
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
      size="md"
      title={isEdit ? "Chỉnh sửa Chỉ số" : "Thêm Chỉ số mới"}
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá trị (số)"
            type="number"
            placeholder="Ví dụ: 50"
            required
            error={errors.value?.message}
            {...register("value")}
          />
          <Input
            label="Hậu tố"
            placeholder="Ví dụ: +, %"
            error={errors.suffix?.message}
            {...register("suffix")}
          />
        </div>

        <Input
          label="Tên / Nhãn"
          placeholder="Ví dụ: Bài giảng, Học viên..."
          required
          error={errors.label?.message}
          {...register("label")}
        />

        <div className="grid grid-cols-2 gap-4 items-center">
          <Input
            label="Thứ tự hiển thị"
            type="number"
            placeholder="1"
            error={errors.order?.message}
            {...register("order")}
          />
          <div className="px-2 pt-2">
            <FormField
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value ?? true}
                  onChange={field.onChange}
                  label="Hiển thị"
                />
              )}
            />
          </div>
        </div>
      </div>
    </CModal>
  );
}

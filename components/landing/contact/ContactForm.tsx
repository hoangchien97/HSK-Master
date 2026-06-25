"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Select, Textarea, Button, FormField } from "@/components/ui";
import { User, Phone, Mail, Send } from "lucide-react";
import { toast } from "react-toastify";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";

interface ContactFormProps {
  submitAction: (formData: FormData) => Promise<void>;
}

export default function ContactForm({ submitAction }: ContactFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val != null && val !== "") formData.append(key, String(val));
      });
      await submitAction(formData);
      toast.success(
        "Tin nhắn đã gửi thành công! Chúng tôi sẽ liên hệ bạn trong vòng 24h."
      );
      reset();
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="rounded-2xl bg-surface-light dark:bg-surface-dark p-8 shadow-lg border-t-4 border-t-red-500 border border-border-light dark:border-border-dark">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Gửi tin nhắn
      </h3>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-8">
        Vui lòng điền thông tin bên dưới, chuyên viên tư vấn sẽ liên hệ lại với
        bạn trong vòng 24h.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Honeypot — hidden from real users; bots will fill this */}
        <input type="text" name="website" tabIndex={-1} aria-hidden="true" className="hidden" autoComplete="off" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                type="text"
                label="Họ và tên"
                icon={<User className="w-5 h-5" />}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <FormField
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                {...field}
                type="tel"
                label="Số điện thoại"
                icon={<Phone className="w-5 h-5" />}
                placeholder="0909xxxxxx"
                autoComplete="tel"
                error={fieldState.error?.message}
                required
              />
            )}
          />
        </div>

        <FormField
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              type="email"
              label="Email"
              icon={<Mail className="w-5 h-5" />}
              placeholder="example@email.com"
              autoComplete="email"
              error={fieldState.error?.message}
            />
          )}
        />

        <FormField
          name="subject"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Bạn quan tâm đến"
              placeholder="Chọn chủ đề"
              options={[
                { value: "hsk", label: "Tư vấn khóa học HSK" },
                { value: "conversation", label: "Tư vấn khóa học Giao tiếp" },
                { value: "hskk", label: "Luyện thi HSKK" },
                { value: "business", label: "Hợp tác doanh nghiệp" },
                { value: "other", label: "Vấn đề khác" },
              ]}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              error={fieldState.error?.message}
            />
          )}
        />

        <FormField
          name="message"
          control={control}
          render={({ field, fieldState }) => (
            <Textarea
              {...field}
              label="Nội dung tin nhắn"
              placeholder="Nhập câu hỏi hoặc nội dung bạn cần hỗ trợ..."
              rows={4}
              error={fieldState.error?.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          icon={<Send className="w-5 h-5" />}
          iconPosition="right"
        >
          Gửi thông tin
        </Button>
      </form>
    </div>
  );
}

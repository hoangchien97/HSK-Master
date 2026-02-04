"use client";

import { Input, Select, Textarea, Button } from "@/app/components/landing/shared";
import { User, Phone, Mail, Send } from "lucide-react";

interface ContactFormProps {
  submitAction: (formData: FormData) => Promise<void>;
}

export default function ContactForm({ submitAction }: ContactFormProps) {
  return (
    <div className="rounded-2xl bg-surface-light dark:bg-surface-dark p-8 shadow-lg border-t-4 border-t-red-500 border border-border-light dark:border-border-dark">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Gửi tin nhắn
      </h3>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-8">
        Vui lòng điền thông tin bên dưới, chuyên viên tư vấn sẽ liên hệ lại với
        bạn trong vòng 24h.
      </p>
      <form action={submitAction} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            type="text"
            name="name"
            label="Họ và tên"
            icon={<User className="w-5 h-5" />}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            required
          />
          <Input
            type="tel"
            name="phone"
            label="Số điện thoại"
            icon={<Phone className="w-5 h-5" />}
            placeholder="0909xxxxxx"
            autoComplete="tel"
            required
          />
        </div>

        <Input
          type="email"
          name="email"
          label="Email"
          icon={<Mail className="w-5 h-5" />}
          placeholder="example@email.com"
          autoComplete="email"
        />

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
        />

        <Textarea
          name="message"
          label="Nội dung tin nhắn"
          placeholder="Nhập câu hỏi hoặc nội dung bạn cần hỗ trợ..."
          rows={4}
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          icon={<Send className="w-5 h-5" />}
          iconPosition="right"
        >
          Gửi thông tin
        </Button>
      </form>
    </div>
  );
}

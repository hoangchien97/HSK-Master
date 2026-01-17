'use client';

import { Input, Select, Textarea } from '../shared';
import { User, Phone, Mail } from 'lucide-react';

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

        <Select name="topic" label="Bạn quan tâm đến">
          <option>Tư vấn khóa học HSK</option>
          <option>Tư vấn khóa học Giao tiếp</option>
          <option>Luyện thi HSKK</option>
          <option>Hợp tác doanh nghiệp</option>
          <option>Vấn đề khác</option>
        </Select>

        <Textarea
          name="message"
          label="Nội dung tin nhắn"
          placeholder="Nhập câu hỏi hoặc nội dung bạn cần hỗ trợ..."
          rows={4}
        />

        <div className="pt-2">
          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-gradient-to-r from-yellow-400 to-red-600 px-3 py-3 text-sm font-bold leading-6 text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Gửi thông tin
          </button>
        </div>
      </form>
    </div>
  );
}

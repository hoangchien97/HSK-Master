import { HelpCircle } from "lucide-react";

export const FAQ_DATA = [
  {
    id: "faq-1",
    question: "Làm sao để bắt đầu học tiếng Trung?",
    answer: "Bạn có thể đăng ký khóa học thử miễn phí hoặc liên hệ với chúng tôi để được tư vấn lộ trình học phù hợp."
  },
  {
    id: "faq-2",
    question: "Học phí như thế nào?",
    answer: "Chi phí linh hoạt tùy theo khóa học. Vui lòng liên hệ để được báo giá chi tiết."
  },
  {
    id: "faq-3",
    question: "Có hỗ trợ học online không?",
    answer: "Có, chúng tôi cung cấp cả hình thức học online và offline linh hoạt."
  },
  {
    id: "faq-4",
    question: "Trung tâm có lớp học thử không?",
    answer: "Có, HSK Ruby cung cấp 2 buổi học thử miễn phí cho tất cả các trình độ để học viên trải nghiệm phương pháp giảng dạy.",
  },
  {
    id: "faq-5",
    question: "Hình thức học như thế nào?",
    answer: "Chúng tôi có cả lớp học Offline tại trung tâm và Online qua Zoom/Google Meet với chất lượng tương đương.",
  },
  {
    id: "faq-6",
    question: "Cam kết đầu ra không?",
    answer: "Có, học viên được ký cam kết đầu ra bằng văn bản. Nếu không đạt, trung tâm sẽ hoàn lại 100% học phí.",
  },
];

export default function ContactFAQ() {
  return (
    <div className="mt-16 md:mt-20 border-t border-border-light dark:border-border-dark pt-12">
      <div className="flex items-center justify-center gap-3 mb-8 md:mb-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          Câu hỏi thường gặp
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {FAQ_DATA.map((faq) => (
          <div
            key={faq.id}
            className="bg-gray-50 dark:bg-surface-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900 transition-colors"
          >
            <h4 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">
              {faq.question}
            </h4>
            <p className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

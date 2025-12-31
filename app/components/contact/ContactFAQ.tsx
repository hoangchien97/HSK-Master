export default function ContactFAQ() {
  const faqs = [
    {
      question: "Trung tâm có lớp học thử không?",
      answer:
        "Có, HSK Master cung cấp 2 buổi học thử miễn phí cho tất cả các trình độ để học viên trải nghiệm phương pháp giảng dạy.",
    },
    {
      question: "Hình thức học như thế nào?",
      answer:
        "Chúng tôi có cả lớp học Offline tại trung tâm và Online qua Zoom/Google Meet với chất lượng tương đương.",
    },
    {
      question: "Cam kết đầu ra không?",
      answer:
        "Có, học viên được ký cam kết đầu ra bằng văn bản. Nếu không đạt, trung tâm sẽ hoàn lại 100% học phí.",
    },
  ];

  return (
    <div className="mt-20 border-t border-border-light dark:border-border-dark pt-12">
      <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-10">
        Câu hỏi thường gặp
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-surface-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
              {faq.question}
            </h4>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

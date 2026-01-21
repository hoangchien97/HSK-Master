export default function WhyChooseUs() {
  const reasons = [
    {
      icon: "verified",
      title: "Lộ trình HSK Chuẩn",
      description:
        "Chương trình học bám sát giáo trình HSK Standard Course, cam kết đầu ra bằng văn bản. Hệ thống bài kiểm tra định kỳ giúp đánh giá chính xác năng lực.",
      color: "red",
    },
    {
      icon: "school",
      title: "Giảng viên chất lượng",
      description:
        "100% giảng viên có trình độ Thạc sĩ chuyên ngành Giáo dục Hán ngữ Quốc tế, phát âm chuẩn phổ thông, giàu kinh nghiệm sư phạm và nhiệt huyết.",
      color: "yellow",
    },
    {
      icon: "devices",
      title: "Công nghệ hỗ trợ",
      description:
        "Nền tảng E-learning hiện đại tích hợp AI chấm điểm phát âm, kho tài liệu số hóa khổng lồ và cộng đồng hỗ trợ học tập 24/7.",
      color: "blue",
    },
  ];

  return (
    <div className="mb-24 rounded-3xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-yellow-500 px-8 py-10 md:px-12 md:py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Tại sao chọn HSK Master?</h2>
        <p className="text-red-100 max-w-2xl mx-auto text-lg">
          Hệ thống đào tạo bài bản, tập trung vào kết quả thực tế và trải nghiệm
          học tập hứng khởi.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 p-8 md:p-12 -mt-8">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-lg border border-border-light dark:border-border-dark relative top-0 md:-top-16 transition-transform hover:-translate-y-2"
            style={{ transitionDelay: `${index * 75}ms` }}
          >
            <div
              className={`size-12 rounded-lg bg-${reason.color}-100 dark:bg-${reason.color}-900/30 text-${reason.color}-600 dark:text-${reason.color}-400 flex items-center justify-center mb-4`}
            >
              <span className="material-symbols-outlined text-2xl">
                {reason.icon}
              </span>
              <div className="icon-send"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {reason.title}
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed">
              {reason.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

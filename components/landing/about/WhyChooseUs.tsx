import { CheckCircle2, GraduationCap, Laptop, Sparkles, Zap, TrendingUp } from "lucide-react";

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: CheckCircle2,
      title: "Lộ trình HSK Chuẩn",
      description:
        "Chương trình học bám sát giáo trình HSK Standard Course, cam kết đầu ra bằng văn bản. Hệ thống bài kiểm tra định kỳ giúp đánh giá chính xác năng lực.",
      color: "from-red-500 to-rose-600",
      bgColor: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      badge: "Đảm bảo chất lượng",
      accentIcon: Sparkles,
    },
    {
      icon: GraduationCap,
      title: "Giảng viên chất lượng",
      description:
        "100% giảng viên có trình độ Thạc sĩ chuyên ngành Giáo dục Hán ngữ Quốc tế, phát âm chuẩn phổ thông, giàu kinh nghiệm sư phạm và nhiệt huyết.",
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      iconBg: "bg-gradient-to-br from-yellow-500 to-orange-600",
      badge: "Chuyên nghiệp",
      accentIcon: Zap,
    },
    {
      icon: Laptop,
      title: "Công nghệ hỗ trợ",
      description:
        "Nền tảng E-learning hiện đại tích hợp AI chấm điểm phát âm, kho tài liệu số hóa khổng lồ và cộng đồng hỗ trợ học tập 24/7.",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      badge: "Hiện đại",
      accentIcon: TrendingUp,
    },
  ];

  return (
    <div className="relative mb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 via-yellow-100/50 to-orange-100/50 dark:from-red-900/10 dark:via-yellow-900/10 dark:to-orange-900/10 rounded-3xl blur-3xl -z-10" />

      <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-border-light dark:border-border-dark shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 px-8 py-12 md:px-12 md:py-20 text-center text-white overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white rounded-full animate-pulse delay-75"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white rounded-full animate-spin-slow"></div>
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-semibold">
                Điểm khác biệt của chúng tôi
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
              Tại sao chọn HSK Ruby?
            </h2>
            <p className="text-red-50 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Hệ thống đào tạo{" "}
              <span className="font-bold text-white">bài bản</span>, tập trung vào{" "}
              <span className="font-bold text-white">kết quả thực tế</span> và trải nghiệm học tập{" "}
              <span className="font-bold text-white">hứng khởi</span>.
            </p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 !pt-4 p-6 md:p-12 -mt-12">
          {reasons.map((reason, index) => {
            const IconComponent = reason.icon;
            const AccentIcon = reason.accentIcon;
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Floating gradient background */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${reason.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity rounded-2xl`}></div>

                <div className={`relative bg-gradient-to-br ${reason.bgColor} border-2 border-gray-200 dark:border-gray-700 group-hover:border-transparent p-8 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl overflow-hidden`}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                    <div className={`w-full h-full bg-gradient-to-br ${reason.color} rounded-full blur-2xl`}></div>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md">
                    <AccentIcon className={`w-3 h-3 bg-gradient-to-r ${reason.color} bg-clip-text text-transparent`} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {reason.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`relative inline-flex w-16 h-16 rounded-2xl ${reason.iconBg} shadow-lg mb-6 items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />

                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${reason.color} blur-md opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:translate-x-1 transition-transform">
                    {reason.title}
                  </h3>
                  <p className="text-sm md:text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed line-clamp-3">
                    {reason.description}
                  </p>

                  {/* Hover accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${reason.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

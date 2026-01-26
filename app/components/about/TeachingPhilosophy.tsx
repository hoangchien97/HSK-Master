import { Quote, BookOpen, Heart, Target, Sparkles, Lightbulb, Users } from "lucide-react";

export default function TeachingPhilosophy() {
  const principles = [
    {
      icon: Target,
      title: "Mục tiêu rõ ràng",
      description: "Xác định mục tiêu cụ thể cho từng giai đoạn, giúp học viên luôn có động lực và định hướng rõ ràng.",
      color: "from-red-500 to-rose-600",
      bgColor: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    },
    {
      icon: Heart,
      title: "Tận tâm & Kiên nhẫn",
      description: "Luôn đồng hành, hỗ trợ học viên vượt qua khó khăn với sự kiên nhẫn và nhiệt tình.",
      color: "from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
    },
    {
      icon: Lightbulb,
      title: "Cá nhân hóa",
      description: "Lộ trình học được thiết kế riêng biệt dựa trên năng lực và mục tiêu của từng học viên.",
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
    },
  ];

  return (
    <div className="relative mb-16 md:mb-24">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-200/30 via-red-200/30 to-orange-200/30 rounded-full blur-3xl -z-10" />

      {/* Section Header */}
      <div className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 border border-red-200 dark:border-red-800 mb-6">
          <Quote className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-semibold text-red-800 dark:text-red-200">
            Triết lý giảng dạy
          </span>
        </div>
      </div>

      {/* Quote Card */}
      <div className="relative group mb-10 md:mb-12">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
        
        <div className="relative bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-red-900/30 dark:via-pink-900/30 dark:to-orange-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 md:p-10 shadow-xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-300/20 to-transparent rounded-full blur-3xl"></div>
          <Quote className="absolute top-6 right-6 w-16 h-16 md:w-20 md:h-20 text-red-200/30 dark:text-red-900/20 group-hover:scale-110 transition-transform" />
          
          <blockquote className="relative">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-red-600 to-pink-600 rounded-full"></div>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-white font-medium italic leading-relaxed">
                "Học tiếng Trung không chỉ là học ngôn ngữ, mà còn là{" "}
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                  khám phá một nền văn hóa phong phú
                </span>. 
                Tôi tin rằng mỗi học viên đều có thể{" "}
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  thành công
                </span>{" "}
                nếu được hướng dẫn đúng cách và có động lực phù hợp."
              </p>
            </div>
            <footer className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
              <span className="text-base md:text-lg font-bold text-red-600 dark:text-red-400">
                — Cô Ngọc
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Kinh nghiệm và phương pháp */}
      <div className="relative group mb-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity"></div>
        
        <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 md:p-10 shadow-lg overflow-hidden">
          {/* Background pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-red-600 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-orange-600 rounded-full"></div>
          </div>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Kinh nghiệm và phương pháp giảng dạy
            </h3>
          </div>
          
          <div className="relative space-y-5 text-sm md:text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-600 to-orange-600 mt-2"></div>
              <p>
                Với <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">5 năm kinh nghiệm</span> giảng dạy tiếng Trung, 
                cô Ngọc đã giúp hàng trăm học viên từ mọi lứa tuổi đạt được mục tiêu học tập của mình, 
                từ HSK1 cơ bản đến HSK6 nâng cao.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 mt-2"></div>
              <p>
                Phương pháp giảng dạy của cô Ngọc tập trung vào việc <span className="font-semibold text-gray-900 dark:text-white">
                kết hợp lý thuyết với thực hành</span>, giúp học viên không chỉ hiểu được kiến thức 
                mà còn có thể ứng dụng thành thạo trong giao tiếp hàng ngày và công việc.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-600 to-red-600 mt-2"></div>
              <p>
                Cô luôn <span className="font-semibold text-gray-900 dark:text-white">tùy chỉnh chương trình học</span> phù hợp 
                với từng học viên, đảm bảo tiến độ học hiệu quả nhất và tạo động lực học tập tích cực.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Principles Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {principles.map((principle, index) => {
          const IconComponent = principle.icon;
          return (
            <div
              key={index}
              className="group relative"
            >
              {/* Floating glow */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${principle.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity rounded-2xl`}></div>
              
              <div className={`relative bg-gradient-to-br ${principle.bgColor} border-2 border-gray-200 dark:border-gray-700 group-hover:border-transparent rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden`}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${principle.color} rounded-full blur-2xl`}></div>
                </div>

                {/* Icon */}
                <div className={`relative inline-flex h-14 w-14 mb-5 items-center justify-center rounded-xl bg-gradient-to-br ${principle.color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <IconComponent className="w-7 h-7 text-white" />
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${principle.color} blur-md opacity-50`}></div>
                </div>
                
                <h4 className="relative font-bold text-base md:text-lg text-gray-900 dark:text-white mb-3">
                  {principle.title}
                </h4>
                <p className="relative text-sm md:text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  {principle.description}
                </p>

                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${principle.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import Image from "next/image";
import { Award, Users, TrendingUp, Sparkles } from "lucide-react";

export default function AboutHero() {
  const stats = [
    { icon: TrendingUp, value: "5+", label: "Năm hoạt động", color: "from-blue-500 to-cyan-500" },
    { icon: Users, value: "10k+", label: "Học viên", color: "from-purple-500 to-pink-500" },
    { icon: Award, value: "98%", label: "Đậu HSK/HSKK", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="relative mb-16 md:mb-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-yellow-200/20 to-red-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-200/20 to-orange-200/20 rounded-full blur-3xl -z-10" />

      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-red-100 dark:from-yellow-900/30 dark:to-red-900/30 border border-yellow-200 dark:border-yellow-800">
            <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              Học tiếng Trung chuyên nghiệp
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Cầu nối ngôn ngữ <br />
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 blur-lg opacity-30"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
                Kiến tạo tương lai
              </span>
            </span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
            Ruby HSK không chỉ là nơi dạy tiếng Trung, chúng tôi xây dựng{" "}
            <span className="font-semibold text-gray-900 dark:text-white">cộng đồng học tập đam mê</span>,
            nơi văn hóa và ngôn ngữ giao thoa. Sứ mệnh của chúng tôi là giúp người Việt chinh phục tiếng Trung một cách{" "}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              tự nhiên và hiệu quả nhất
            </span>.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 md:gap-6 pt-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative flex items-center gap-3 pr-6 md:pr-8 last:pr-0"
                >
                  {/* Animated background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity blur-xl`}></div>

                  {/* Icon */}
                  <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Text */}
                  <div className="relative flex flex-col">
                    <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {stat.value}
                    </span>
                    <span className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">
                      {stat.label}
                    </span>
                  </div>

                  {/* Divider */}
                  {index < stats.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Image section */}
        <div className="order-1 lg:order-2 relative group">
          {/* Animated glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-all duration-1000 animate-pulse"></div>

          {/* Image container */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[4/3] ring-1 ring-gray-200 dark:ring-gray-800">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
              alt="Students learning Chinese together"
              width={800}
              height={600}
              className="object-cover w-full h-full transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transform group-hover:scale-110 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">98%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tỷ lệ đậu</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

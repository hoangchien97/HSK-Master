import Image from "next/image";
import { GraduationCap, Award, Star, Users, Sparkles, Trophy, Target, Heart } from "lucide-react";

export default function TeacherProfile() {
  const achievements = [
    {
      icon: GraduationCap,
      title: "Tốt nghiệp bằng giỏi",
      description: "Đại học Ngoại ngữ - ĐHQG Hà Nội",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Trophy,
      title: "HSK 6 & HSK cao cấp",
      description: "Trình độ cao nhất trong hệ thống HSK",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Star,
      title: "Giải nhất cuộc thi",
      description: "Nghiên cứu khoa học Đổi mới - Sáng tạo",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Award,
      title: "Đại sứ thủ lĩnh",
      description: "Đại học Ngoại ngữ - ĐHQG Hà Nội",
      color: "from-red-500 to-rose-500",
    },
  ];

  const stats = [
    {
      icon: Target,
      number: "5",
      suffix: "+",
      unit: "năm",
      label: "Kinh nghiệm giảng dạy",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: GraduationCap,
      number: "HSK",
      suffix: "",
      unit: "1-6",
      label: "Chuyên môn sâu",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Users,
      number: "200",
      suffix: "+",
      unit: "",
      label: "Học viên thành công",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Heart,
      number: "100",
      suffix: "%",
      unit: "",
      label: "Tận tâm & Linh hoạt",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div className="relative mb-16 md:mb-24">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-200/20 via-orange-200/20 to-red-200/20 rounded-full blur-3xl -z-10" />

      {/* Profile Header */}
      <div className="text-center mb-12 md:mb-16 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-800 mb-8">
          <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
          <span className="text-sm font-semibold text-red-800 dark:text-red-200">
            Giảng viên chính
          </span>
        </div>

        <div className="relative inline-block mb-6">
          {/* Animated rings */}
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 opacity-20 blur-xl"></div>
          </div>
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 opacity-30 animate-spin-slow blur-md"></div>
          
          {/* Image */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop"
              alt="Cô Ngọc"
              width={160}
              height={160}
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-surface-dark"
            />
          </div>

          {/* Verified badge */}
          <div className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-surface-dark shadow-lg">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Cô Ngọc{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-600">
            (Trần Hồng Ngọc)
          </span>
        </h2>
        <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
          5 năm kinh nghiệm giảng dạy tiếng Trung HSK với phương pháp{" "}
          <span className="font-semibold text-gray-900 dark:text-white">hiệu quả</span> và{" "}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">tận tâm</span>
        </p>
      </div>

      {/* Achievements Grid */}
      <div className="mb-12 md:mb-16">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Học vấn & Thành tích
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {achievements.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                
                {/* Icon */}
                <div className={`relative inline-flex h-14 w-14 mx-auto mb-4 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                
                <h4 className="relative font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h4>
                <p className="relative text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Animated background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              {/* Background icon */}
              <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <IconComponent className="w-20 h-20" />
              </div>
              
              {/* Content */}
              <div className="relative">
                <div className={`inline-flex h-12 w-12 mb-3 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="mb-2">
                  <span className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.number}
                  </span>
                  <span className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.suffix}
                  </span>
                  {stat.unit && (
                    <span className="block text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {stat.unit}
                    </span>
                  )}
                </div>
                
                <p className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import SectionHeader from './SectionHeader';

const features = [
  {
    id: 1,
    icon: '📚',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'HSK 1-6 Hoàn chỉnh',
    description: 'Chương trình học từ cơ bản đến nâng cao',
  },
  {
    id: 2,
    icon: '👥',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    title: 'Lớp học nhỏ',
    description: 'Tối đa 4-6 học viên để đảm bảo chất lượng',
  },
  {
    id: 3,
    icon: '🏅',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    title: '5 năm kinh nghiệm',
    description: 'Giáo viên có kinh nghiệm và tận tâm',
  },
  {
    id: 4,
    icon: '⏰',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    title: 'Linh hoạt thời gian',
    description: 'Lịch học phù hợp với công việc của bạn',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          icon="👩‍🏫"
          tag="Ưu điểm vượt trội"
          title="Tại sao chọn học với cô Ngọc?"
          description="Phương pháp giảng dạy hiệu quả được chứng minh qua hàng trăm học viên thành công"
          tagColor="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400"
        />

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 stagger-children">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group hover:cursor-pointer relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent hover-lift hover-glow transition-all duration-500 transform-gpu animate-scale-in stagger-${index + 1}`}
            >
              {/* Icon with Glow Effect */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className={`relative z-10 inline-flex items-center justify-center w-16 h-16 ${feature.iconBg} rounded-2xl text-3xl transition-all duration-300 group-hover:scale-110 group-hover:animate-wiggle`}
                >
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl text-center font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center dark:text-gray-400 text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
                {feature.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-200 to-orange-200 dark:from-red-900/20 dark:to-orange-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

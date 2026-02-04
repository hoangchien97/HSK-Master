import SectionHeader from '@/app/components/landing/shared/SectionHeader';
import { getFeatures } from '@/app/services';

export default async function WhyChooseUsSection() {
  const features = await getFeatures();

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden">
        {/* Section Header */}
        <SectionHeader
          icon="👩‍🏫"
          tag="Ưu điểm vượt trội"
          title="Tại sao chọn học với cô Ngọc?"
          description="Phương pháp giảng dạy hiệu quả được chứng minh qua hàng trăm học viên thành công"
          tagColor="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400"
        />

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 stagger-children">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`group hover:cursor-pointer relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent hover-lift hover-glow transition-all duration-500 transform-gpu animate-scale-in stagger-${index + 1}`}
            >
              {/* Icon with Glow Effect */}
              <div className="relative mb-3 md:mb-4 lg:mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className={`relative z-10 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 ${feature.iconBg} rounded-xl md:rounded-2xl text-2xl md:text-3xl transition-all duration-300 group-hover:scale-110 group-hover:animate-wiggle`}
                >
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-base md:text-lg lg:text-xl text-center font-bold text-gray-900 dark:text-white mb-2 md:mb-3 transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center dark:text-gray-400 text-xs md:text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
                {feature.description}
              </p>

              {/* Decorative Element */}
              <div className="hidden md:block absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-200 to-orange-200 dark:from-red-900/20 dark:to-orange-900/20 rounded-bl-[60px] -mr-4 -mt-4 md:-mr-6 md:-mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

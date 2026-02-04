import HSKLevelCard from './HSKLevelCard';
import SectionHeader from '@/app/components/landing/shared/SectionHeader';
import { getHSKLevels } from '@/app/services';

export default async function HSKLevelsSection() {
  const hskLevels = await getHSKLevels();

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          icon="🎯"
          tag="Lộ trình học tập"
          title="Lộ trình HSK hoàn chỉnh"
          description="Từ người mới bắt đầu đến thành thạo tiếng Trung như người bản ngữ"
          tagColor="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-600 dark:text-orange-400"
        />

        {/* Timeline Container */}
        <div className="relative mt-8 md:mt-12 lg:mt-16">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 top-4 md:top-8 bottom-4 md:bottom-8 w-0.5 md:w-1 bg-linear-to-b from-orange-300 via-red-400 to-blue-500 dark:from-orange-600 dark:via-red-600 dark:to-blue-600 transform -translate-x-1/2" />

          {/* Timeline Items */}
          <div className="space-y-3 md:space-y-4 lg:space-y-6">
            {hskLevels.map((level, index) => (
              <HSKLevelCard
                key={level.level}
                level={level}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

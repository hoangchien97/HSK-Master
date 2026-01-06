import HSKLevelCard, { type HSKLevel } from './HSKLevelCard';
import SectionHeader from '../shared/SectionHeader';
import { getHSKLevels } from '@/app/services';

export default async function HSKLevelsSection() {
  const hskLevels = await getHSKLevels();

  return (
    <section className="py-16 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          icon="🎯"
          tag="Lộ trình học tập"
          title="Lộ trình HSK hoàn chỉnh"
          description="Từ người mới bắt đầu đến thành thạo tiếng Trung như người bản ngữ"
          tagColor="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-600 dark:text-orange-400"
        />

        {/* Timeline Container */}
        <div className="relative mt-16">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-linear-to-b from-orange-300 via-red-400 to-blue-500 dark:from-orange-600 dark:via-red-600 dark:to-blue-600 transform -translate-x-1/2" />

          {/* Timeline Items */}
          <div className="space-y-6">
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

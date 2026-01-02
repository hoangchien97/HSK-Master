import HSKLevelCard, { type HSKLevel } from './HSKLevelCard';
import SectionHeader from '../shared/SectionHeader';
import { getHSKLevels } from '@/app/services';

export default async function HSKLevelsSection() {
  const hskLevels = await getHSKLevels();

  return (
    <section className="py-10 bg-gray-50 dark:bg-surface-dark/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          icon="🎯"
          tag="Lộ trình học tập"
          title="Lộ trình HSK hoàn chỉnh"
          description="Từ người mới bắt đầu đến thành thạo tiếng Trung như người bản ngữ"
          tagColor="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-600 dark:text-orange-400"
        />

        {/* HSK Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hskLevels.map((level) => (
            <HSKLevelCard key={level.level} level={level} />
          ))}
        </div>
      </div>
    </section>
  );
}

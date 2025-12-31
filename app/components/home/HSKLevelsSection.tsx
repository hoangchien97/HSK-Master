import HSKLevelCard, { type HSKLevel } from './HSKLevelCard';
import SectionHeader from '../shared/SectionHeader';

const hskLevels: HSKLevel[] = [
  {
    level: 1,
    title: 'HSK 1',
    badge: '~3 tháng',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
    description: 'Nhìn vào cô ấy chẳng mệt gì đâu. Làm mệt với tâm trí thôi mà sao hết như làm máy.',
    vocabularyCount: '150 từ',
    targetAudience: 'Mới bắt đầu',
    targetIcon: 'group',
    accentColor: 'border-orange-200 bg-orange-50 text-orange-600 dark:bg-surface-dark dark:border-orange-900 dark:text-orange-400',
    bgGradient: 'bg-gradient-to-br from-orange-400 to-yellow-300',
    href: '/courses/hsk-1',
  },
  {
    level: 2,
    title: 'HSK 2',
    badge: '~3-4 tháng',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
    description: 'Giao tiếp cơ bản trong ngày thường. Nội dung của mỗi sư đại như bài học giúp bạn nắm.',
    vocabularyCount: '300 từ',
    targetAudience: 'Sơ cấp',
    targetIcon: 'trending_up',
    accentColor: 'border-orange-200 bg-orange-50 text-orange-600 dark:bg-surface-dark dark:border-orange-900 dark:text-orange-400',
    bgGradient: 'bg-gradient-to-br from-orange-400 to-yellow-300',
    href: '/courses/hsk-2',
  },
  {
    level: 3,
    title: 'HSK 3',
    badge: '~4-5 tháng',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    description: 'Bước vào giao tiếp cấp. Giao tiếp và viết thành thạo hơn bình thường sao cho học với tâm.',
    vocabularyCount: '600 từ',
    targetAudience: 'Trung cấp',
    targetIcon: 'school',
    accentColor: 'border-red-200 bg-red-50 text-red-600 dark:bg-surface-dark dark:border-red-900 dark:text-red-400',
    bgGradient: 'bg-gradient-to-br from-red-400 to-orange-400',
    href: '/courses/hsk-3',
  },
  {
    level: 4,
    title: 'HSK 4',
    badge: '~5-6 tháng',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    description: 'Sẵn sàng cho môi trường du học. Du sĩ tại máy và đại các chúng sẽ trong tình sẽ cấp.',
    vocabularyCount: '1200 từ',
    targetAudience: 'Du học/Làm việc',
    targetIcon: 'work',
    accentColor: 'border-red-200 bg-red-50 text-red-600 dark:bg-surface-dark dark:border-red-900 dark:text-red-400',
    bgGradient: 'bg-gradient-to-br from-red-500 to-red-400',
    href: '/courses/hsk-4',
  },
  {
    level: 5,
    title: 'HSK 5',
    badge: '~6-8 tháng',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
    description: 'Thành thạo vào ngôn đối tài. Đọc báo, xem phim, giao tiếp một ngành dĩnh đại sĩ.',
    vocabularyCount: '2500 từ',
    targetAudience: 'Cao cấp',
    targetIcon: 'stars',
    accentColor: 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-surface-dark dark:border-indigo-900 dark:text-indigo-400',
    bgGradient: 'bg-gradient-to-br from-purple-500 to-indigo-500',
    href: '/courses/hsk-5',
  },
  {
    level: 6,
    title: 'HSK 6',
    badge: '~8-12 tháng',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    description: 'Đạt chân các ngữ giá cao. Hiểu cấu kể đến văn đại thị hải nghị một ngành kính loại.',
    vocabularyCount: '5000+ từ',
    targetAudience: 'Chuyên gia',
    targetIcon: 'psychology',
    accentColor: 'border-blue-200 bg-blue-50 text-blue-600 dark:bg-surface-dark dark:border-blue-900 dark:text-blue-400',
    bgGradient: 'bg-gradient-to-br from-indigo-600 to-blue-600',
    href: '/courses/hsk-6',
  },
];

export default function HSKLevelsSection() {
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

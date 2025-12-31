import Link from 'next/link';

export interface HSKLevel {
  level: number;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  vocabularyCount: string;
  targetAudience: string;
  targetIcon: string;
  accentColor: string;
  bgGradient: string;
  href: string;
}

interface HSKLevelCardProps {
  level: HSKLevel;
}

export default function HSKLevelCard({ level }: HSKLevelCardProps) {
  return (
    <Link
      href={level.href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Decorative Background */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${level.bgGradient} rounded-bl-[100px] -mr-8 -mt-8 opacity-20 group-hover:opacity-100 transition-opacity`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {level.title}
          </h3>
          <span
            className={`inline-flex items-center rounded-full ${level.badgeColor} px-3 py-1 text-xs font-medium`}
          >
            {level.badge}
          </span>
        </div>

        {/* Details */}
        <div className="mb-6">
          <span
            className={`inline-block rounded-full border ${level.accentColor} px-3 py-1 text-sm font-semibold mb-4`}
          >
            Cấp độ {level.level}
          </span>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-4">
            {level.description}
          </p>

          {/* Stats */}
          <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div
              className={`flex items-center gap-1 rounded-full ${level.accentColor.replace(
                'border',
                'bg'
              ).replace('text', 'border')} px-2 py-1`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>{level.vocabularyCount}</span>
            </div>
            <div
              className={`flex items-center gap-1 rounded-full ${level.accentColor.replace(
                'border',
                'bg'
              ).replace('text', 'border')} px-2 py-1`}
            >
              <span className="material-symbols-outlined text-[16px]">{level.targetIcon}</span>
              <span>{level.targetAudience}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover CTA */}
      <div className="mt-4 w-full rounded-lg bg-gradient-to-r from-yellow-400 to-red-600 p-3 text-center text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md flex items-center justify-center gap-2">
        <span>Bắt đầu học HSK {level.level}</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </div>

      {/* Spacer for consistent height */}
      <div aria-hidden="true" className="mt-4 h-[44px] w-full" />
    </Link>
  );
}

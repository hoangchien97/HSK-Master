"use client";

import { Checkbox } from "@/app/components/common/Checkbox";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

interface CourseFilterProps {
  categories: { id: string; name: string; slug: string }[];
  selectedHskLevel: string | null;
  selectedCategory: string | null;
  onHskLevelChange: (level: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CourseFilter({
  categories,
  selectedHskLevel,
  selectedCategory,
  onHskLevelChange,
  onCategoryChange,
}: CourseFilterProps) {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      {/* Main Filter Container */}
      <details className="group rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm" open>
        <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold select-none hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary-500 dark:text-primary-400 w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
              Bộ lọc tìm kiếm
            </span>
          </div>
          <ChevronDown className="transition-transform group-open:rotate-180 text-text-secondary-light dark:text-text-secondary-dark w-5 h-5" />
        </summary>

        <div className="border-t border-border-light dark:border-border-dark p-4">
          <div className="space-y-6">
            {/* HSK Level Filter */}
            <div>
              <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark mb-3">
                Trình độ HSK
              </h4>
              <div className="space-y-3">
                <Checkbox
                  label="Tất cả"
                  checked={selectedHskLevel === null}
                  onChange={() => onHskLevelChange(null)}
                />
                <Checkbox
                  label="Sơ cấp (HSK 1-2)"
                  checked={selectedHskLevel === 'beginner'}
                  onChange={() => onHskLevelChange(selectedHskLevel === 'beginner' ? null : 'beginner')}
                />
                <Checkbox
                  label="Trung cấp (HSK 3-4)"
                  checked={selectedHskLevel === 'intermediate'}
                  onChange={() => onHskLevelChange(selectedHskLevel === 'intermediate' ? null : 'intermediate')}
                />
                <Checkbox
                  label="Cao cấp (HSK 5-6)"
                  checked={selectedHskLevel === 'advanced'}
                  onChange={() => onHskLevelChange(selectedHskLevel === 'advanced' ? null : 'advanced')}
                />
              </div>
            </div>

            {/* Goal Filter (Categories) */}
            <div>
              <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark mb-3">
                Mục tiêu học
              </h4>
              <div className="space-y-3">
                {categories.map((category) => (
                  <Checkbox
                    key={category.id}
                    label={category.name}
                    checked={selectedCategory === category.id}
                    onChange={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </details>
    </aside>
  );
}


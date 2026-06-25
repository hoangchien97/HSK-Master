"use client";

import { Checkbox } from "@/components/ui";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

const HSK_LEVELS = [
  { value: "beginner", label: "Sơ cấp (HSK 1-2)" },
  { value: "intermediate", label: "Trung cấp (HSK 3-4)" },
  { value: "advanced", label: "Cao cấp (HSK 5-6)" },
] as const;

export interface CourseFilterProps {
  categories: { id: string; name: string; slug: string }[];
  selectedHskLevels: string[];
  selectedCategories: string[];
  onHskLevelChange: (levels: string[]) => void;
  onCategoryChange: (categoryIds: string[]) => void;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

/** Shared filter body — used by both the desktop sidebar and the mobile popover. */
export function CourseFilterBody({
  categories,
  selectedHskLevels,
  selectedCategories,
  onHskLevelChange,
  onCategoryChange,
}: CourseFilterProps) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark mb-3">
          Trình độ HSK
        </h4>
        <div className="space-y-3">
          {HSK_LEVELS.map(({ value, label }) => (
            <Checkbox
              key={value}
              label={label}
              checked={selectedHskLevels.includes(value)}
              onCheckedChange={() =>
                onHskLevelChange(toggleItem(selectedHskLevels, value))
              }
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-text-main-light dark:text-text-main-dark mb-3">
          Mục tiêu học
        </h4>
        <div className="space-y-3">
          {categories.map((category) => (
            <Checkbox
              key={category.id}
              label={category.name}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={() =>
                onCategoryChange(toggleItem(selectedCategories, category.id))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Desktop sidebar — hidden on mobile. */
export default function CourseFilter(props: CourseFilterProps) {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <details
        className="group rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm"
        open
      >
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
          <CourseFilterBody {...props} />
        </div>
      </details>
    </aside>
  );
}

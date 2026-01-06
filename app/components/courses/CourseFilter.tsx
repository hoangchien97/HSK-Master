"use client";

import { Checkbox } from "../shared";

interface CourseFilterProps {
  categories: { id: string; name: string; slug: string }[];
}

export default function CourseFilter({ categories }: CourseFilterProps) {
  // TODO: Use categories prop for dynamic filtering in future iteration
  return (
    <aside className="hidden lg:block w-72 shrink-0 space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
          Bộ lọc tìm kiếm
        </h3>

        {/* HSK Level Filter */}
        <details className="group rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm" open>
          <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold select-none hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <span className="text-text-main-light dark:text-text-main-dark">Trình độ HSK</span>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-text-secondary-light dark:text-text-secondary-dark">
              expand_more
            </span>
          </summary>
          <div className="border-t border-border-light dark:border-border-dark px-4 pb-4 pt-3">
            <div className="space-y-3">
              <Checkbox label="Tất cả" defaultChecked />
              <Checkbox label="Sơ cấp (HSK 1-2)" />
              <Checkbox label="Trung cấp (HSK 3-4)" />
              <Checkbox label="Cao cấp (HSK 5-6)" />
            </div>
          </div>
        </details>

        {/* Goal Filter */}
        <details className="group rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
          <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold select-none hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <span className="text-text-main-light dark:text-text-main-dark">Mục tiêu</span>
            <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-text-secondary-light dark:text-text-secondary-dark">
              expand_more
            </span>
          </summary>
          <div className="border-t border-border-light dark:border-border-dark px-4 pb-4 pt-3">
            <div className="space-y-3">
              <Checkbox label="Giao tiếp" />
              <Checkbox label="Luyện thi HSK/HSKK" />
              <Checkbox label="Tiếng Trung thương mại" />
            </div>
          </div>
        </details>
      </div>
    </aside>
  );
}

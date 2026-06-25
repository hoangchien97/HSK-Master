'use client';

interface Filter {
  id: string;
  label: string;
  value: string;
}

interface CourseFilterSidebarProps {
  filters: Filter[];
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  showMobileFilter: boolean;
}

export function CourseFilterSidebar({
  filters,
  selectedFilter,
  onFilterChange,
  showMobileFilter,
}: CourseFilterSidebarProps) {
  const renderFilters = (namePrefix: string) => (
    <div className="space-y-2 pl-1">
      {filters.map((filter) => (
        <label key={filter.id} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={namePrefix}
            value={filter.value}
            checked={selectedFilter === filter.value}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-4 h-4 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600">
            {filter.label}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
        <div className="flex flex-col gap-4 sticky top-24">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">tune</span>
              <span>Bộ lọc</span>
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Trình độ HSK
                </h4>
                {renderFilters("level")}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Dropdown */}
      {showMobileFilter && (
        <div className="lg:hidden p-4 rounded-xl bg-gray-50 dark:bg-surface-dark border border-border-light dark:border-border-dark mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Trình độ HSK
          </h3>
          {renderFilters("level-mobile")}
        </div>
      )}
    </>
  );
}

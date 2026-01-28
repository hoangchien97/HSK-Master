// Filter types and enums for course filtering

export type HSKLevelGroup = 'beginner' | 'intermediate' | 'advanced';

export type CourseSortBy = 'featured' | 'newest';

export interface CourseFilters {
  category?: string | null;
  hskLevel?: HSKLevelGroup | null;
  search?: string | null;
  sort?: CourseSortBy;
  page?: number;
  limit?: number;
}

// URL parameter names
export const FILTER_PARAMS = {
  CATEGORY: 'category',
  HSK_LEVEL: 'hskLevel',
  SEARCH: 'search',
  SORT: 'sort',
  PAGE: 'page',
} as const;

// HSK Level Groups
export const HSK_LEVEL_GROUPS = {
  BEGINNER: 'beginner' as HSKLevelGroup,
  INTERMEDIATE: 'intermediate' as HSKLevelGroup,
  ADVANCED: 'advanced' as HSKLevelGroup,
} as const;

// Sort Options
export const SORT_OPTIONS = {
  FEATURED: 'featured' as CourseSortBy,
  NEWEST: 'newest' as CourseSortBy,
} as const;

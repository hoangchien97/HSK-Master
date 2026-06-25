'use server'

import { getFilteredCourses } from '@/services/course.service'

type HskGroup = 'beginner' | 'intermediate' | 'advanced'

export async function getCoursesAction(filters: {
  categories?: string[]
  hskLevels?: string[]
  search?: string | null
  sort?: string | null
  page?: number
  limit?: number
}) {
  const courseFilters = {
    categoryIds: filters.categories && filters.categories.length > 0 ? filters.categories : undefined,
    hskLevelGroups: filters.hskLevels && filters.hskLevels.length > 0
      ? (filters.hskLevels as HskGroup[])
      : undefined,
    search: filters.search || undefined,
    sortBy: (filters.sort as 'featured' | 'newest') || undefined,
    page: filters.page,
    limit: filters.limit,
  }

  const courses = await getFilteredCourses(courseFilters)

  return { courses }
}

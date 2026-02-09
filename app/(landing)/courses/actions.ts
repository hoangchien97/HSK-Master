'use server'

import { getFilteredCourses } from '@/services/course.service'

export async function getCoursesAction(filters: {
  category?: string | null
  hskLevel?: string | null
  search?: string | null
  sort?: string | null
  page?: number
  limit?: number
}) {
  const courseFilters = {
    categoryId: filters.category || undefined,
    hskLevelGroup: filters.hskLevel as 'beginner' | 'intermediate' | 'advanced' | undefined,
    search: filters.search || undefined,
    sortBy: (filters.sort as 'featured' | 'newest') || undefined,
    page: filters.page,
    limit: filters.limit,
  }

  const courses = await getFilteredCourses(courseFilters)

  return { courses }
}

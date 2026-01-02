import { prisma } from '@/lib/prisma'

export interface Course {
  id: string
  title: string
  slug: string
  description?: string | null
  image?: string | null
  instructor?: string | null
  instructorAvatar?: string | null
  price?: string | null
  originalPrice?: string | null
  students?: string | null
  rating?: string | null
  level?: string | null
  tag?: string | null
  categoryId: string
}

export interface CourseWithCategory extends Course {
  category: {
    id: string
    name: string
    slug: string
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    })

    return courses
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    return []
  }
}

export async function getCoursesByLevel(level: string): Promise<Course[]> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        level: level
      },
      orderBy: { createdAt: 'desc' },
    })

    return courses
  } catch (error) {
    console.error(`Failed to fetch courses for level ${level}:`, error)
    return []
  }
}

export async function getCourseBySlug(slug: string): Promise<CourseWithCategory | null> {
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
    })

    return course
  } catch (error) {
    console.error(`Failed to fetch course with slug ${slug}:`, error)
    return null
  }
}

export async function getCoursesWithCategory(): Promise<CourseWithCategory[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return courses
  } catch (error) {
    console.error('Failed to fetch courses with category:', error)
    return []
  }
}

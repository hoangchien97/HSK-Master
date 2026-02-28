import { prisma } from "@/lib/prisma";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  instructor?: string | null;
  instructorAvatar?: string | null;
  level?: string | null;
  tag?: string | null;
  badgeText?: string | null;
  badgeColor?: string | null;
  vocabularyCount: number;
  grammarCount: number;
  lessonCount: number;
  durationHours: number;
  lectures: number;
  categoryId: string;
  hskLevelId?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  enrollmentCount: number;
  viewCount: number;
  createdAt: Date;
}

export interface CourseWithCategory extends Course {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  hskLevel?: {
    id: string;
    level: number;
    title: string;
  } | null;
}

export interface CourseFilters {
  categoryId?: string;
  hskLevelGroup?: "beginner" | "intermediate" | "advanced"; // HSK 1-2, 3-4, 5-6
  search?: string;
  sortBy?: "featured" | "newest";
  page?: number;
  limit?: number;
}

export async function getCourses(): Promise<Course[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        hskLevel: {
          select: { level: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Sort: HSK 1-6 first (by level asc), then others by createdAt desc
    const hskCourses = courses
      .filter((c) => c.hskLevel)
      .sort((a, b) => (a.hskLevel!.level) - (b.hskLevel!.level));
    const otherCourses = courses.filter((c) => !c.hskLevel);

    console.log("Fetched courses:", courses.length);

    return [...hskCourses, ...otherCourses];
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
}

export async function getFilteredCourses(
  filters: CourseFilters = {}
): Promise<CourseWithCategory[]> {
  try {
    const { categoryId, hskLevelGroup, search, sortBy, page, limit } = filters;

    // Build where clause
    const where: any = { isPublished: true };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (hskLevelGroup) {
      const hskLevels = await prisma.hSKLevel.findMany({
        where: {
          level:
            hskLevelGroup === "beginner"
              ? { in: [1, 2] }
              : hskLevelGroup === "intermediate"
                ? { in: [3, 4] }
                : { in: [5, 6] },
        },
        select: { id: true },
      });
      where.hskLevelId = { in: hskLevels.map((l) => l.id) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const orderBy: any[] = [];
    if (sortBy === "featured") {
      orderBy.push({ isFeatured: "desc" });
    }
    orderBy.push({ createdAt: "desc" });

    // Calculate pagination
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        hskLevel: {
          select: {
            id: true,
            level: true,
            title: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    });

    // Sort: HSK 1-6 first (by level asc), then others
    const hskCourses = courses
      .filter((c) => c.hskLevel)
      .sort((a, b) => (a.hskLevel!.level) - (b.hskLevel!.level));
    const otherCourses = courses.filter((c) => !c.hskLevel);

    return [...hskCourses, ...otherCourses];
  } catch (error) {
    console.error("Failed to fetch filtered courses:", error);
    return [];
  }
}

export async function getCoursesByLevel(level: string): Promise<Course[]> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        level: level,
      },
      orderBy: { createdAt: "desc" },
    });

    return courses;
  } catch (error) {
    console.error(`Failed to fetch courses for level ${level}:`, error);
    return [];
  }
}

export async function getCourseBySlug(
  slug: string
): Promise<CourseWithCategory | null> {
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        hskLevel: {
          select: {
            id: true,
            level: true,
            title: true,
          },
        },
      },
    });

    return course;
  } catch (error) {
    console.error(`Failed to fetch course with slug ${slug}:`, error);
    return null;
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
          },
        },
        hskLevel: {
          select: {
            id: true,
            level: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return courses;
  } catch (error) {
    console.error("Failed to fetch courses with category:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

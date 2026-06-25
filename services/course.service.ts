import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

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
  categoryIds?: string[];
  hskLevelGroups?: ("beginner" | "intermediate" | "advanced")[];
  search?: string;
  sortBy?: "featured" | "newest";
  page?: number;
  limit?: number;
}

export const getCourses = unstable_cache(
  async (): Promise<Course[]> => {
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

      return [...hskCourses, ...otherCourses];
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      return [];
    }
  },
  ["courses-list"],
  { revalidate: 3600, tags: ["courses"] }
);

export async function getFilteredCourses(
  filters: CourseFilters = {}
): Promise<CourseWithCategory[]> {
  try {
    const { categoryIds, hskLevelGroups, search, sortBy, page, limit } = filters;

    // Build where clause
    const where: Record<string, unknown> = { isPublished: true };

    if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    if (hskLevelGroups && hskLevelGroups.length > 0) {
      const GROUP_LEVELS: Record<string, number[]> = {
        beginner: [1, 2],
        intermediate: [3, 4],
        advanced: [5, 6],
      };
      const levelRange = hskLevelGroups.flatMap((g) => GROUP_LEVELS[g] ?? []);
      where.hskLevel = { level: { in: levelRange } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const orderBy: Record<string, string>[] = [];
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

export interface FilteredCoursesResult {
  items: CourseWithCategory[];
  total: number;
}

export async function getFilteredCoursesWithCount(
  filters: CourseFilters = {}
): Promise<FilteredCoursesResult> {
  try {
    const { categoryIds, hskLevelGroups, search, sortBy, page, limit } = filters;

    const where: Record<string, unknown> = { isPublished: true };
    if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }
    if (hskLevelGroups && hskLevelGroups.length > 0) {
      const GROUP_LEVELS: Record<string, number[]> = {
        beginner: [1, 2],
        intermediate: [3, 4],
        advanced: [5, 6],
      };
      const levelRange = hskLevelGroups.flatMap((g) => GROUP_LEVELS[g] ?? []);
      where.hskLevel = { level: { in: levelRange } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string>[] = [];
    if (sortBy === "featured") orderBy.push({ isFeatured: "desc" });
    orderBy.push({ createdAt: "desc" });

    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const include = {
      category: { select: { id: true, name: true, slug: true } },
      hskLevel: { select: { id: true, level: true, title: true } },
    };

    const [courses, total] = await prisma.$transaction([
      prisma.course.findMany({ where, include, orderBy, skip, take }),
      prisma.course.count({ where }),
    ]);

    const hskCourses = courses
      .filter((c) => c.hskLevel)
      .sort((a, b) => a.hskLevel!.level - b.hskLevel!.level);
    const otherCourses = courses.filter((c) => !c.hskLevel);

    return { items: [...hskCourses, ...otherCourses], total };
  } catch (error) {
    console.error("Failed to fetch filtered courses with count:", error);
    return { items: [], total: 0 };
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

export const getCourseBySlug = unstable_cache(
  async (slug: string): Promise<CourseWithCategory | null> => {
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
  },
  ["course-by-slug"],
  { revalidate: 3600, tags: ["courses"] }
);

export const getCoursesWithCategory = unstable_cache(
  async (): Promise<CourseWithCategory[]> => {
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
  },
  ["courses-with-category"],
  { revalidate: 3600, tags: ["courses"] }
);

export const getCategories = unstable_cache(
  async () => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      return categories;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);

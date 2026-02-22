/**
 * Route-to-label mapping used by the breadcrumb builder.
 *
 * Keys are **pathname segments** (the part after `/portal/<role>/`).
 * Static segments only – dynamic segments like `[classId]` are
 * resolved at runtime via `dynamicLabels`.
 */

export interface RouteMeta {
  label: string
  /** If the segment maps to a parent grouping label (e.g. "Quản lý lớp") */
  parent?: string
}

/** Map: relative segment path → label */
export const routeMeta: Record<string, RouteMeta> = {
  // ---------- Dashboard ----------
  admin: { label: "Bảng điều khiển" },
  teacher: { label: "Bảng điều khiển" },
  student: { label: "Trang chủ" },

  // ---------- Shared features ----------
  classes: { label: "Quản lý lớp học" },
  students: { label: "Học viên" },
  schedule: { label: "Lịch giảng dạy" },
  attendance: { label: "Điểm danh" },
  assignments: { label: "Bài tập" },
  practice: { label: "Luyện tập" },
  vocabulary: { label: "Từ vựng" },
  bookmarks: { label: "Đã lưu" },
  quizzes: { label: "Bài kiểm tra" },
  progress: { label: "Tiến độ học tập" },
  profile: { label: "Hồ sơ cá nhân" },

  // ---------- Admin specific ----------
  "hero-slides": { label: "Hero Slides" },
  courses: { label: "Quản lý khóa học" },
  "hsk-levels": { label: "Cấp độ HSK" },
  categories: { label: "Danh mục" },
  albums: { label: "Album ảnh" },
  reviews: { label: "Đánh giá" },
  features: { label: "Tính năng nổi bật" },
  "cta-stats": { label: "CTA Stats" },
  users: { label: "Quản lý người dùng" },
  registrations: { label: "Đăng ký khóa học" },
  seo: { label: "SEO & Metadata" },
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

/**
 * Build breadcrumb items from a pathname.
 *
 * @param pathname   e.g. `/portal/teacher/classes/abc123`
 * @param dynamicLabels  Map of dynamic segment values → display labels
 *                       e.g. `{ "abc123": "Lớp HSK3 – T7" }`
 */
export function buildBreadcrumbItems(
  pathname: string,
  dynamicLabels?: Record<string, string>,
): BreadcrumbItem[] {
  // Split and remove empty strings
  const segments = pathname.split("/").filter(Boolean)
  // Expected: ["portal", "<role>", ...rest]

  if (segments.length < 2) return []

  const roleSegment = segments[1] // admin | teacher | student
  const rest = segments.slice(2) // everything after /portal/<role>

  if (rest.length === 0) {
    // Dashboard page – no breadcrumb
    return []
  }

  const items: BreadcrumbItem[] = []
  let currentPath = `/portal/${roleSegment}`

  for (let i = 0; i < rest.length; i++) {
    const seg = rest[i]
    currentPath += `/${seg}`
    const isLast = i === rest.length - 1
    const meta = routeMeta[seg]

    // Determine label
    let label: string
    if (meta) {
      label = meta.label
    } else if (dynamicLabels?.[seg]) {
      label = dynamicLabels[seg]
    } else {
      // Fallback: capitalise the segment
      label = seg.charAt(0).toUpperCase() + seg.slice(1)
    }

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  }

  // Collapse middle items if > 4 levels deep
  if (items.length > 4) {
    const first = items[0]
    const last2 = items.slice(-2)
    return [
      first,
      { label: "..." },
      ...last2.map((item, idx) => ({
        ...item,
        href: idx === last2.length - 1 ? undefined : item.href,
      })),
    ]
  }

  return items
}

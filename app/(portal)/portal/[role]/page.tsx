import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { AdminDashboard, TeacherDashboard, StudentDashboard } from "@/components/portal/dashboards"
import { routeToRole } from "@/lib/utils/auth"
import { USER_ROLE } from "@/constants/portal/roles"
import {
  getStudentDashboardStats,
  getLastActiveLesson,
  getUpcomingClasses,
  getPendingAssignments,
  getRecentVocabulary,
  getLearningProgressByMode,
} from "@/services/portal/dashboard.service"
import { serializeDates } from "@/utils/serialize"

type Props = {
  params: Promise<{ role: string }>
}

export default async function DashboardPage({ params }: Props) {
  const session = await auth()
  const { role: urlRole } = await params

  // Get role from URL route (guards already handled in layout)
  const userRole = routeToRole(urlRole)

  // Render based on role
  switch (userRole) {
    case USER_ROLE.SYSTEM_ADMIN:
      return <AdminDashboard />
    case USER_ROLE.TEACHER:
      return <TeacherDashboard teacherName={session?.user?.name || undefined} />
    case USER_ROLE.STUDENT: {
      const studentId = session?.user?.id
      if (!studentId) notFound()

      // Fetch all dashboard data in parallel
      const [stats, continueLearning, upcomingClasses, pendingAssignments, recentVocabulary, learningProgress] =
        await Promise.all([
          getStudentDashboardStats(studentId),
          getLastActiveLesson(studentId),
          getUpcomingClasses(studentId, 3),
          getPendingAssignments(studentId, 3),
          getRecentVocabulary(studentId, 5),
          getLearningProgressByMode(studentId),
        ])

      return (
        <StudentDashboard
          studentName={session?.user?.name || undefined}
          stats={stats}
          continueLearning={continueLearning ? serializeDates(continueLearning) : null}
          upcomingClasses={serializeDates(upcomingClasses)}
          pendingAssignments={serializeDates(pendingAssignments)}
          recentVocabulary={recentVocabulary}
          learningProgress={learningProgress}
        />
      )
    }
    default:
      notFound()
  }
}

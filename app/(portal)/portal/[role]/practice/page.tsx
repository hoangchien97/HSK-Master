import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import {
  getCoursesForPractice,
  getStudentEnrolledHskLevels,
} from "@/services/portal/practice.service"
import { getAllLessonSkillProgress, getAllLessonProgressFromSkills, getLastActiveLesson } from "@/services/portal/practice-skill.service"
import PracticeListView from "@/components/portal/practice/PracticeListView"
import { ROLE_ROUTES } from "@/lib/utils/auth"
import { serializeDates } from "@/utils/serialize"

type Props = {
  params: Promise<{ role: string }>
}

export default async function PracticePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole) notFound()

  // Only students can access practice
  if (userRole !== ROLE_ROUTES.STUDENT) notFound()

  // SSR: fetch data server-side for fast initial render
  const enrolledLevels = await getStudentEnrolledHskLevels(session.user.id)
  const [courses, progressMap, skillProgressMap, lastActive] = await Promise.all([
    getCoursesForPractice(enrolledLevels.length > 0 ? enrolledLevels : undefined),
    getAllLessonProgressFromSkills(session.user.id),
    getAllLessonSkillProgress(session.user.id),
    getLastActiveLesson(session.user.id),
  ])

  return (
    <PracticeListView
      initialCourses={serializeDates(courses)}
      initialProgressMap={serializeDates(progressMap)}
      initialSkillProgressMap={serializeDates(skillProgressMap)}
      lastActiveLesson={lastActive ? serializeDates(lastActive) : null}
    />
  )
}

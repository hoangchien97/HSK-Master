import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import StudentScheduleView from "@/components/portal/schedules/StudentScheduleView"
import TeacherScheduleCalendar from "@/components/portal/schedules/TeacherScheduleCalendar"
import { ROLE_ROUTES } from "@/lib/utils/auth"

type Props = {
  params: Promise<{ role: string }>
}

export default async function SchedulePage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()

  // Validate role matches URL
  if (urlRole !== userRole) {
    notFound()
  }

  // Render based on role
  if (userRole === ROLE_ROUTES.STUDENT) {
    return <StudentScheduleView />
  }

  if (userRole === ROLE_ROUTES.TEACHER) {
    return <TeacherScheduleCalendar />
  }

  notFound()
}

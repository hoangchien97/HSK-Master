import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import StudentScheduleView from "@/app/components/portal/schedules/StudentScheduleView"
import TeacherScheduleCalendar from "@/app/components/portal/schedules/TeacherScheduleCalendar"

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
  if (userRole === "student") {
    return <StudentScheduleView />
  }

  if (userRole === "teacher") {
    return <TeacherScheduleCalendar />
  }

  notFound()
}

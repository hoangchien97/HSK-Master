import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import StudentDashboard from "./StudentDashboard"
import TeacherDashboard from "./TeacherDashboard"

type Props = {
  params: Promise<{ role: string }>
}

export default async function DashboardPage({ params }: Props) {
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
    return <StudentDashboard session={session} />
  }

  if (userRole === "teacher") {
    return <TeacherDashboard session={session} />
  }

  notFound()
}

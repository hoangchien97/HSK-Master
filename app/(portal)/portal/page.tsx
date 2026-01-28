import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function PortalPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const isTeacher = session.user?.role === "TEACHER" || session.user?.role === "ADMIN"

  if (isTeacher) {
    redirect("/portal/teacher")
  } else {
    redirect("/portal/student")
  }
}

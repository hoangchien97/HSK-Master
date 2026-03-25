import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import HSKLevelsTable from "@/components/portal/admin/hsk-levels/HSKLevelsTable"

export default async function HSKLevelsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal")
  }
  return <HSKLevelsTable />
}

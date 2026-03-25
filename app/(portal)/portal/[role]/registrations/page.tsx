import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import RegistrationsTable from "@/components/portal/admin/registrations/RegistrationsTable"

export default async function RegistrationsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal")
  }
  return <RegistrationsTable />
}

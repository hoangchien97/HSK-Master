import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import SeoTable from "@/components/portal/admin/seo/SeoTable"

export default async function SeoPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal")
  }
  return <SeoTable />
}

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import CtaStatsTable from "@/components/portal/admin/cta-stats/CtaStatsTable"

export default async function CtaStatsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal")
  }
  return <CtaStatsTable />
}

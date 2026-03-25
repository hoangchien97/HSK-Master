import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import HeroSlidesTable from "@/components/portal/admin/hero-slides/HeroSlidesTable"

export default async function HeroSlidesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal")
  }
  return <HeroSlidesTable />
}

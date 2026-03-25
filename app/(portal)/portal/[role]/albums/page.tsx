import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import AlbumsTable from "@/components/portal/admin/albums/AlbumsTable"

export default async function AlbumsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal")
  }
  return <AlbumsTable />
}

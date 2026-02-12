import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PortalLayoutClient from "./PortalLayoutClient"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check
  const session = await auth()

  if (!session?.user) {
    redirect("/portal/login")
  }

  return (
    <PortalLayoutClient
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
        role: session.user.role || "STUDENT",
        image: session.user.image,
      }}
    >
      {children}
    </PortalLayoutClient>
  )
}

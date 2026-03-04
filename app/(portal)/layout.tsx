import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { HeroUIProvider } from "@/providers"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Suspense } from "react"
import { WebVitals } from "@/components/landing/shared"
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
    <SessionProvider refetchInterval={300} refetchOnWindowFocus={false}>
      <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={100}>
        <HeroUIProvider>
          <Suspense fallback={null}>
            <WebVitals />
          </Suspense>
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
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </HeroUIProvider>
      </TooltipPrimitive.Provider>
    </SessionProvider>
  )
}

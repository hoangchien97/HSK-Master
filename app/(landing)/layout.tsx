import { Header, Footer } from "@/components/landing/shared";
import { LazyFloatingWidgets } from "@/components/landing/shared/LazyFloatingWidgets";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <LazyFloatingWidgets />
    </>
  )
}

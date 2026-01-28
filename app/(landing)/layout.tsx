import { Header, Footer, ScrollToTop, ContactBubbles } from "../components/shared";

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
      <ScrollToTop />
      <ContactBubbles />
    </>
  )
}

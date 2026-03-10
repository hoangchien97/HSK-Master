import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { ROLE_ROUTES } from "@/lib/utils/auth"
import { Construction } from "lucide-react"

type Props = {
  params: Promise<{ role: string }>
}

export default async function QuizzesPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole) notFound()

  // Only students can access quizzes
  if (userRole !== ROLE_ROUTES.STUDENT) notFound()

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang phát triển</h2>
      <p className="text-gray-500 max-w-md">
        Tính năng <strong>Bài kiểm tra</strong> đang được phát triển và sẽ sớm ra mắt.
        Vui lòng quay lại sau!
      </p>
    </div>
  )
}

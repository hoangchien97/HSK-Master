import { signOut } from "@/auth"
import Link from "next/link"

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đăng xuất</h1>
          <p className="mt-2 text-gray-600">Bạn có chắc chắn muốn đăng xuất?</p>
        </div>

        <div className="space-y-3">
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium transition"
            >
              Đăng xuất
            </button>
          </form>

          <Link
            href="/portal"
            className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition text-center"
          >
            Hủy
          </Link>
        </div>
      </div>
    </div>
  )
}

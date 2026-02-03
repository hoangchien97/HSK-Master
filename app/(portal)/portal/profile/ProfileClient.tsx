"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap,
  BookOpen,
  Camera,
  Save,
  X,
  Edit2,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { PageHeader } from "@/app/components/portal/shared"
import { Card, CardHeader, CardContent } from "@/app/components/portal/shared"

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserData {
  id: string
  name: string
  email: string
  image?: string | null
  role: string
  createdAt: string
}

interface StudentData {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  address?: string | null
  dateOfBirth?: string | null
  level?: string | null
  status: string
}

interface TeacherData {
  id: string
  teacherCode: string
  firstName: string
  lastName: string
  phoneNumber?: string | null
  address?: string | null
  specialization?: string | null
  biography?: string | null
  status: string
}

interface ProfileClientProps {
  user: UserData
  student: StudentData | null
  teacher: TeacherData | null
}

export default function ProfileClient({ user, student, teacher }: ProfileClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const profile = student || teacher
  const isTeacher = user.role === "TEACHER" || user.role === "ADMIN"

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phoneNumber: profile?.phoneNumber || "",
      address: profile?.address || "",
      dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...data,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        setMessage({ type: "error", text: result.error || "Cập nhật thất bại" })
        setLoading(false)
        return
      }

      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công" })
      setIsEditing(false)
      router.refresh()
    } catch {
      setMessage({ type: "error", text: "Có lỗi xảy ra. Vui lòng thử lại." })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setMessage(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Xem và chỉnh sửa thông tin cá nhân của bạn"
        actions={
          !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          )
        }
      />

      {/* Message */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isTeacher
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isTeacher ? "Giáo viên" : "Học viên"}
                  </span>
                  {profile && (
                    <span className="text-sm text-gray-500">
                      Mã: {isTeacher ? (teacher as TeacherData)?.teacherCode : (student as StudentData)?.studentCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader title="Thông tin cá nhân" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ
                </label>
                {isEditing ? (
                  <>
                    <input
                      {...register("lastName")}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </>
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.lastName || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                {isEditing ? (
                  <>
                    <input
                      {...register("firstName")}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </>
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.firstName || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                </label>
                <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                  {user.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </span>
                </label>
                {isEditing ? (
                  <input
                    {...register("phoneNumber")}
                    type="tel"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="0123456789"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.phoneNumber || "-"}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ
                  </span>
                </label>
                {isEditing ? (
                  <input
                    {...register("address")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.address || "-"}
                  </p>
                )}
              </div>

              {!isTeacher && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Ngày sinh
                    </span>
                  </label>
                  {isEditing ? (
                    <input
                      {...register("dateOfBirth")}
                      type="date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    />
                  ) : (
                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                      {student?.dateOfBirth
                        ? new Date(student.dateOfBirth).toLocaleDateString("vi-VN")
                        : "-"}
                    </p>
                  )}
                </div>
              )}

              {!isTeacher && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      Trình độ HSK
                    </span>
                  </label>
                  <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                    {student?.level || "Chưa xác định"}
                  </p>
                </div>
              )}

              {isTeacher && teacher && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      Chuyên môn
                    </span>
                  </label>
                  <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-900">
                    {teacher.specialization || "-"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

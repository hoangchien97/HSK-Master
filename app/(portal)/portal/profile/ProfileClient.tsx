"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  User, Phone, MapPin, Calendar, Save, X, 
  Camera, Briefcase, BookOpen, Award
} from "lucide-react"
import { Input } from "@/app/components/portal/ui/input"
import { Label } from "@/app/components/portal/ui/label"
import { Button } from "@/app/components/portal/ui/button"
import { Alert } from "@/app/components/portal/ui/alert"
import { Card, CardContent } from "@/app/components/portal/ui/card"
import { Badge } from "@/app/components/portal/ui/badge"
import type { 
  PortalUser, 
  StudentProfile, 
  TeacherProfile 
} from "@/app/interfaces/portal"
import { 
  validateFile, 
  uploadAvatar, 
  getAvatarInitials,
  formatDateForInput 
} from "@/app/utils"

// Validation schemas
const studentProfileSchema = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  level: z.string().optional(),
})

const teacherProfileSchema = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  specialization: z.string().optional(),
  biography: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentProfileSchema>
type TeacherFormData = z.infer<typeof teacherProfileSchema>

interface ProfileClientProps {
  user: PortalUser
  studentProfile: StudentProfile | null
  teacherProfile: TeacherProfile | null
}

export default function ProfileClient({ 
  user, 
  studentProfile, 
  teacherProfile 
}: ProfileClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const isStudent = user.role === "STUDENT"
  const isTeacher = user.role === "TEACHER" || user.role === "SYSTEM_ADMIN"
  const profile = studentProfile || teacherProfile

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<StudentFormData | TeacherFormData>({
    resolver: zodResolver(isStudent ? studentProfileSchema : teacherProfileSchema),
    defaultValues: isStudent ? {
      firstName: studentProfile?.firstName ?? "",
      lastName: studentProfile?.lastName ?? "",
      phoneNumber: studentProfile?.phoneNumber ?? "",
      address: studentProfile?.address ?? "",
      dateOfBirth: studentProfile?.dateOfBirth 
        ? formatDateForInput(new Date(studentProfile.dateOfBirth))
        : "",
      level: studentProfile?.level ?? "",
    } : {
      firstName: teacherProfile?.firstName ?? "",
      lastName: teacherProfile?.lastName ?? "",
      phoneNumber: teacherProfile?.phoneNumber ?? "",
      address: teacherProfile?.address ?? "",
      specialization: teacherProfile?.specialization ?? "",
      biography: teacherProfile?.biography ?? "",
    },
  })

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setMessage({ type: "error", text: validation.error! })
      return
    }

    setMessage(null)

    // Show preview only - don't upload yet
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    // Store file for later upload
    setAvatarFile(file)
  }

  const onSubmit = async (data: StudentFormData | TeacherFormData) => {
    setLoading(true)
    setMessage(null)

    try {
      let avatarUrl = user.image

      // Upload avatar to Supabase if new file selected
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Không thể tải ảnh lên")
        }
        avatarUrl = uploadResult.url
      }

      const updateData = {
        userId: user.id,
        name: `${data.lastName} ${data.firstName}`,
        image: avatarUrl,
        ...(isStudent && {
          studentProfile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: (data as StudentFormData).phoneNumber,
            address: (data as StudentFormData).address,
            dateOfBirth: (data as StudentFormData).dateOfBirth,
            level: (data as StudentFormData).level,
          },
        }),
        ...(isTeacher && {
          teacherProfile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: (data as TeacherFormData).phoneNumber,
            address: (data as TeacherFormData).address,
            specialization: (data as TeacherFormData).specialization,
            biography: (data as TeacherFormData).biography,
          },
        }),
      }

      const response = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Cập nhật thất bại")
      }

      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công" })
      setAvatarFile(null) // Clear file after successful upload
      router.refresh()
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Có lỗi xảy ra" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setAvatarPreview(user.image || null)
    setAvatarFile(null)
    setMessage(null)
  }

  const getRoleBadge = () => {
    const roleConfig = {
      SYSTEM_ADMIN: { label: "Quản trị viên", variant: "default" as const },
      TEACHER: { label: "Giáo viên", variant: "default" as const },
      STUDENT: { label: "Học viên", variant: "secondary" as const },
    }
    return roleConfig[user.role]
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Message */}
      {message && (
        <Alert 
          variant={message.type} 
          className="mb-6"
          closeable
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Section - Center */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={avatarPreview} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                      {getAvatarInitials(user.name)}
                    </div>
                  )}
                </div>
                
                {/* Upload button overlay */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={loading}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {profile ? `${profile.lastName} ${profile.firstName}` : user.name}
              </h2>
              <p className="text-gray-500 mt-1">{user.email}</p>
              
              {/* Badges */}
              <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
                <Badge variant={getRoleBadge().variant}>
                  {getRoleBadge().label}
                </Badge>
                {profile && "studentCode" in profile && (
                  <Badge variant="outline">
                    <User className="w-3 h-3 mr-1" />
                    {profile.studentCode}
                  </Badge>
                )}
                {profile && "teacherCode" in profile && (
                  <Badge variant="outline">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {profile.teacherCode}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-400 mt-4">
                Nhấn vào ảnh đại diện để thay đổi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("firstName")}
                  id="firstName"
                  hasError={!!errors.firstName}
                  className={errors.firstName ? "border-red-300 bg-red-50" : ""}
                  placeholder="Văn A"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Họ <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("lastName")}
                  id="lastName"
                  hasError={!!errors.lastName}
                  className={errors.lastName ? "border-red-300 bg-red-50" : ""}
                  placeholder="Nguyễn"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Số điện thoại
                </Label>
                <Input
                  {...register("phoneNumber")}
                  id="phoneNumber"
                  type="tel"
                  placeholder="0901234567"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Địa chỉ
                </Label>
                <Input
                  {...register("address")}
                  id="address"
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                />
              </div>

              {/* Student-specific fields */}
              {isStudent && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Ngày sinh
                    </Label>
                    <Input
                      {...register("dateOfBirth")}
                      id="dateOfBirth"
                      type="date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">
                      <Award className="w-4 h-4 inline mr-1" />
                      Trình độ HSK
                    </Label>
                    <select
                      {...register("level")}
                      id="level"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Chọn trình độ</option>
                      <option value="HSK1">HSK 1</option>
                      <option value="HSK2">HSK 2</option>
                      <option value="HSK3">HSK 3</option>
                      <option value="HSK4">HSK 4</option>
                      <option value="HSK5">HSK 5</option>
                      <option value="HSK6">HSK 6</option>
                    </select>
                  </div>
                </>
              )}

              {/* Teacher-specific fields */}
              {isTeacher && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      Chuyên môn
                    </Label>
                    <Input
                      {...register("specialization")}
                      id="specialization"
                      placeholder="HSK 1-3, Giao tiếp"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="biography">
                      Giới thiệu
                    </Label>
                    <textarea
                      {...register("biography")}
                      id="biography"
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Giới thiệu về bản thân, kinh nghiệm giảng dạy..."
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading || (!isDirty && !avatarFile)}
          >
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading || (!isDirty && !avatarFile)}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

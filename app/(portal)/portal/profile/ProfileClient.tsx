"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, Save, X, User, Phone, MapPin, Calendar, FileText } from "lucide-react"
import Image from "next/image"
import { toast } from "react-toastify"
import type { PortalUser } from "@/app/interfaces/portal/profile.types"
import Input from "@/app/components/common/Input"
import Button from "@/app/components/common/Button"
import Label from "@/app/components/common/Label"
import Badge from "@/app/components/common/Badge"
import { Card, CardContent } from "@/app/components/portal/shared/Card"
import { Alert } from "@/app/components/portal/shared/Alert"
import { uploadAvatar } from "@/app/utils/upload"
import { validateFile } from "@/app/utils/validation"
import { formatDateForInput } from "@/app/utils/date"
import { ROLE_LABELS } from "@/app/constants/portal"
import { UserRole } from "@/lib/constants/roles"

// Validation schema
const profileSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  biography: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileClientProps {
  user: PortalUser
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      address: user.address ?? "",
      dateOfBirth: user.dateOfBirth
        ? formatDateForInput(new Date(user.dateOfBirth))
        : "",
      biography: user.biography ?? "",
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

  const onSubmit = async (data: ProfileFormData) => {
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
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        biography: data.biography,
        image: avatarUrl,
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

      toast.success("Cập nhật hồ sơ thành công")
      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công" })
      setAvatarFile(null) // Clear file after successful upload
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      toast.error(errorMessage)
      setMessage({
        type: "error",
        text: errorMessage
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
      STUDENT: { label: "Học viên", variant: "default" as const },
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
                    <Image
                      src={avatarPreview}
                      alt={user.fullName || user.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-4xl font-bold">
                      {user.fullName?.[0] || user.name[0] || "U"}
                    </div>
                  )}
                </div>

                {/* Upload overlay */}
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
                {user.fullName || user.name}
              </h2>
              <p className="text-gray-500 mt-1">{user.email}</p>

              {/* Badges */}
              <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
                <Badge variant={getRoleBadge().variant}>
                  {getRoleBadge().label}
                </Badge>
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
              {/* Full Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("fullName")}
                  id="fullName"
                  className={errors.fullName ? "border-red-300 bg-red-50" : ""}
                  placeholder="Nguyễn Văn A"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{errors.fullName.message}</p>
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

              {/* Date of Birth */}
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

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
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

              {/* Biography */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="biography">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Giới thiệu bản thân
                </Label>
                <textarea
                  {...register("biography")}
                  id="biography"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Viết một vài dòng giới thiệu về bản thân..."
                />
              </div>
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

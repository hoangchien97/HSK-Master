"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Camera, Save, X, Mail, Phone, User } from "lucide-react"
import Image from "next/image"
import { toast } from "react-toastify"
import type { PortalUser } from "@/app/interfaces/portal/profile"
import { Form, Input, Button, Chip, Card, CardBody, Textarea } from "@heroui/react"
import { uploadAvatar } from "@/app/utils/upload"
import { validateFile } from "@/app/utils/validation"
import { useHttpClient } from "@/app/hooks"

interface ProfileClientProps {
  user: PortalUser
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const http = useHttpClient()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

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
    setIsDirty(true)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.currentTarget))

    setErrors({})
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
        fullName: formData.fullName as string,
        phoneNumber: formData.phoneNumber as string,
        address: formData.address as string,
        dateOfBirth: formData.dateOfBirth as string,
        biography: formData.biography as string,
        image: avatarUrl,
      }
      
      // Use httpClient instead of fetch - auto loading spinner
      const response = await http.put<{ error?: string }>("/api/portal/profile", updateData)

      if (!response.ok) {
        throw new Error(response.data?.error || "Cập nhật thất bại")
      }

      toast.success("Cập nhật hồ sơ thành công")
      setMessage({ type: "success", text: "Cập nhật hồ sơ thành công" })
      setAvatarFile(null) // Clear file after successful upload
      setIsDirty(false)
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
    setAvatarPreview(user.image || null)
    setAvatarFile(null)
    setMessage(null)
    setIsDirty(false)
  }

  const getRoleLabel = () => {
    const roleConfig: Record<string, string> = {
      SYSTEM_ADMIN: "Quản trị viên",
      TEACHER: "Giáo viên",
      STUDENT: "Học viên",
    }
    return roleConfig[user.role] ?? user.role
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
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Form validationErrors={errors} onSubmit={onSubmit} className="space-y-6">
        {/* Avatar Section - Center */}
        <Card>
          <CardBody className="p-8">
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
                <Chip color="primary" variant="flat">
                  {getRoleLabel()}
                </Chip>
              </div>

              <p className="text-sm text-gray-400 mt-4">
                Nhấn vào ảnh đại diện để thay đổi
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <Input
                  name="fullName"
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  labelPlacement="outside"
                  defaultValue={user.fullName || ""}
                  isRequired
                  onChange={() => setIsDirty(true)}
                  errorMessage={({ validationDetails }) => {
                    if (validationDetails.valueMissing) {
                      return "Vui lòng nhập họ và tên"
                    }
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <Input
                  name="phoneNumber"
                  label="Số điện thoại"
                  type="tel"
                  placeholder="0901234567"
                  labelPlacement="outside"
                  defaultValue={user.phoneNumber || ""}
                  onChange={() => setIsDirty(true)}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <Input
                  name="dateOfBirth"
                  label="Ngày sinh"
                  type="date"
                  labelPlacement="outside"
                  defaultValue={user.dateOfBirth || ""}
                  onChange={() => setIsDirty(true)}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <Input
                  name="address"
                  label="Địa chỉ"
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  labelPlacement="outside"
                  defaultValue={user.address || ""}
                  onChange={() => setIsDirty(true)}
                />
              </div>

              {/* Biography */}
              <div className="md:col-span-2">
                <Textarea
                  name="biography"
                  label="Giới thiệu bản thân"
                  placeholder="Viết một vài dòng giới thiệu về bản thân..."
                  labelPlacement="outside"
                  defaultValue={user.biography || ""}
                  minRows={4}
                  onChange={() => setIsDirty(true)}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="bordered"
            onPress={handleCancel}
            isDisabled={loading || (!isDirty && !avatarFile)}
            startContent={<X className="w-4 h-4" />}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            isDisabled={loading || (!isDirty && !avatarFile)}
            color="danger"
            isLoading={loading}
            startContent={!loading ? <Save className="w-4 h-4" /> : undefined}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </Form>
    </div>
  )
}

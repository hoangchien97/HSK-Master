"use client"

import { useState, useRef } from "react"
import { Camera, Save, X, User, Pencil } from "lucide-react"
import Image from "next/image"
import { toast } from "react-toastify"
import type { PortalUser } from "@/interfaces/portal/profile"
import { Form, Input, Button, Chip, Card, CardBody, Textarea, Divider } from "@heroui/react"
import { uploadAvatar } from "@/utils/upload"
import { validateFile } from "@/utils/validation"
import { updateProfileAction } from "@/actions/profile.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"

interface ProfileClientProps {
  user: PortalUser
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { startLoading, stopLoading } = usePortalUI()

  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [currentUser, setCurrentUser] = useState<PortalUser>(user)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      toast.error(validation.error!)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setAvatarFile(file)
    setIsDirty(true)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.currentTarget))

    setErrors({})
    setLoading(true)
    startLoading()

    try {
      let avatarUrl = currentUser.image

      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Không thể tải ảnh lên")
        }
        avatarUrl = uploadResult.url
      }

      const updateData = {
        name: formData.name as string,
        phoneNumber: formData.phoneNumber as string,
        address: formData.address as string,
        dateOfBirth: formData.dateOfBirth as string,
        biography: formData.biography as string,
        image: avatarUrl || undefined,
      }

      const result = await updateProfileAction(updateData)

      if (!result.success) {
        throw new Error(result.error || "Cập nhật thất bại")
      }

      if (result.user) {
        setCurrentUser(result.user)
        setAvatarPreview(result.user.image || null)
      }

      // ✅ Only toast — no inline message to avoid duplicate notification
      toast.success("Cập nhật hồ sơ thành công")
      setAvatarFile(null)
      setIsDirty(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      stopLoading()
    }
  }

  const handleCancel = () => {
    setAvatarPreview(currentUser.image || null)
    setAvatarFile(null)
    setIsDirty(false)
  }

  const getRoleLabel = () => {
    const roleConfig: Record<string, string> = {
      SYSTEM_ADMIN: "Quản trị viên",
      TEACHER: "Giáo viên",
      STUDENT: "Học viên",
    }
    return roleConfig[currentUser.role] ?? currentUser.role
  }

  const getRoleColor = () => {
    const colorMap: Record<string, "primary" | "success" | "warning"> = {
      SYSTEM_ADMIN: "warning",
      TEACHER: "success",
      STUDENT: "primary",
    }
    return colorMap[currentUser.role] ?? "primary"
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <Form validationErrors={errors} onSubmit={onSubmit} className="space-y-6 w-full items-stretch">
        {/* Avatar Section */}
        <Card shadow="sm">
          <CardBody className="py-10 px-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar with edit badge */}
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={currentUser.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                      {currentUser.name[0] || "U"}
                    </div>
                  )}
                </div>

                {/* Camera badge */}
                <button
                  type="button"
                  disabled={loading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-600" />
                </button>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Camera className="w-7 h-7 text-white" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <h2 className="mt-5 text-xl font-bold text-gray-900">
                {currentUser.name}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{currentUser.email}</p>

              <Chip
                color={getRoleColor()}
                variant="flat"
                size="sm"
                className="mt-3"
              >
                {getRoleLabel()}
              </Chip>

              <p className="text-xs text-gray-400 mt-3">
                Nhấn vào ảnh đại diện để thay đổi
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Personal Information */}
        <Card shadow="sm">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Thông tin cá nhân
            </h3>
            <Divider className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="md:col-span-2">
                <Input
                  name="name"
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  labelPlacement="outside"
                  variant="bordered"
                  defaultValue={currentUser.name || ""}
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
                  variant="bordered"
                  defaultValue={currentUser.phoneNumber || ""}
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
                  variant="bordered"
                  defaultValue={currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : ""}
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
                  variant="bordered"
                  defaultValue={currentUser.address || ""}
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
                  variant="bordered"
                  defaultValue={currentUser.biography || ""}
                  minRows={4}
                  onChange={() => setIsDirty(true)}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Action Buttons — centered */}
        <div className="flex items-center justify-center gap-3 pt-2 pb-8">
          <Button
            type="button"
            variant="bordered"
            radius="full"
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
            radius="full"
            isLoading={loading}
            startContent={!loading ? <Save className="w-4 h-4" /> : undefined}
            className="px-6"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </Form>
    </div>
  )
}

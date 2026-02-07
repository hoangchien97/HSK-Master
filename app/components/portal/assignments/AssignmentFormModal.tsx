"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react"
import { toast } from "react-toastify"
import {
  assignmentSchema,
  type AssignmentFormValues,
} from "@/app/validators/assignment"

/* ──────────────────────── types ──────────────────────── */

interface ClassInfo {
  id: string
  className: string
  classCode: string
}

interface AssignmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  classes: ClassInfo[]
  editData?: {
    id: string
    title: string
    description?: string | null
    assignmentType: string
    dueDate?: Date | null
    maxScore: number
    classId?: string
    status?: string
  } | null
}

/* ──────────────────── config ──────────────────────────── */

const ASSIGNMENT_TYPES = [
  { key: "HOMEWORK", label: "Bài tập về nhà" },
  { key: "QUIZ", label: "Kiểm tra" },
  { key: "PROJECT", label: "Dự án" },
  { key: "READING", label: "Đọc hiểu" },
  { key: "WRITING", label: "Viết" },
  { key: "SPEAKING", label: "Nói" },
  { key: "LISTENING", label: "Nghe" },
]

/* ──────────────────── component ──────────────────────── */

export default function AssignmentFormModal({
  isOpen,
  onClose,
  classes,
  editData,
}: AssignmentFormModalProps) {
  const router = useRouter()
  const isEdit = !!editData

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      classId: editData?.classId || classes[0]?.id || "",
      title: editData?.title || "",
      description: editData?.description || "",
      assignmentType: editData?.assignmentType || "HOMEWORK",
      dueDate: editData?.dueDate
        ? new Date(editData.dueDate).toISOString().slice(0, 16)
        : "",
      maxScore: editData?.maxScore || 100,
      status: (editData?.status as "ACTIVE" | "DRAFT") || "ACTIVE",
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        classId: editData?.classId || classes[0]?.id || "",
        title: editData?.title || "",
        description: editData?.description || "",
        assignmentType: editData?.assignmentType || "HOMEWORK",
        dueDate: editData?.dueDate
          ? new Date(editData.dueDate).toISOString().slice(0, 16)
          : "",
        maxScore: editData?.maxScore || 100,
        status: (editData?.status as "ACTIVE" | "DRAFT") || "ACTIVE",
      })
    }
  }, [isOpen, editData, classes, reset])

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      const url = isEdit
        ? `/api/portal/assignments/${editData!.id}`
        : "/api/portal/assignments"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        toast.success(isEdit ? "Cập nhật bài tập thành công!" : "Tạo bài tập thành công!")
        router.refresh()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || "Thao tác thất bại")
      }
    } catch {
      toast.error("Có lỗi xảy ra")
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            {isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
          </ModalHeader>

          <ModalBody className="gap-4">
            {/* Title */}
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Tiêu đề"
                  placeholder="Bài tập tuần 1 - Từ vựng"
                  isRequired
                  isInvalid={!!errors.title}
                  errorMessage={errors.title?.message}
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Mô tả"
                  placeholder="Mô tả yêu cầu bài tập..."
                  minRows={3}
                />
              )}
            />

            {/* Class + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="classId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Lớp học"
                    isRequired
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0] as string
                      field.onChange(val)
                    }}
                    isInvalid={!!errors.classId}
                    errorMessage={errors.classId?.message}
                  >
                    {classes.map((c) => (
                      <SelectItem key={c.id}>
                        {c.className}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                name="assignmentType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Loại bài tập"
                    isRequired
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0] as string
                      field.onChange(val)
                    }}
                    isInvalid={!!errors.assignmentType}
                    errorMessage={errors.assignmentType?.message}
                  >
                    {ASSIGNMENT_TYPES.map((t) => (
                      <SelectItem key={t.key}>{t.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            {/* Due Date + Max Score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    label="Hạn nộp"
                    isInvalid={!!errors.dueDate}
                    errorMessage={errors.dueDate?.message}
                  />
                )}
              />

              <Controller
                name="maxScore"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Điểm tối đa"
                    value={String(field.value)}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    min={1}
                    max={1000}
                    isInvalid={!!errors.maxScore}
                    errorMessage={errors.maxScore?.message}
                  />
                )}
              />
            </div>

            {/* Status */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Trạng thái"
                  selectedKeys={field.value ? [field.value] : ["ACTIVE"]}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string
                    field.onChange(val)
                  }}
                >
                  <SelectItem key="ACTIVE">Đang mở</SelectItem>
                  <SelectItem key="DRAFT">Nháp</SelectItem>
                </Select>
              )}
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Hủy
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting}>
              {isEdit ? "Cập nhật" : "Tạo bài tập"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

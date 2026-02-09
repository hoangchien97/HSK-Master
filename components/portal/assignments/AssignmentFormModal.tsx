"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  Form,
} from "@heroui/react"
import { toast } from "react-toastify"
import api from "@/lib/http/client"

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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classId, setClassId] = useState(editData?.classId || classes[0]?.id || "")
  const [assignmentType, setAssignmentType] = useState(editData?.assignmentType || "HOMEWORK")
  const [status, setStatus] = useState((editData?.status as "ACTIVE" | "DRAFT") || "ACTIVE")

  useEffect(() => {
    if (isOpen) {
      setClassId(editData?.classId || classes[0]?.id || "")
      setAssignmentType(editData?.assignmentType || "HOMEWORK")
      setStatus((editData?.status as "ACTIVE" | "DRAFT") || "ACTIVE")
      setErrors({})
    }
  }, [isOpen, editData, classes])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.currentTarget))

    setErrors({})
    setIsSubmitting(true)

    try {
      const values = {
        ...formData,
        classId,
        assignmentType,
        status,
        maxScore: Number(formData.maxScore),
      }

      const url = isEdit
        ? `/portal/assignments/${editData!.id}`
        : "/portal/assignments"

      if (isEdit) {
        await api.put(url, values, { meta: { loading: false } })
      } else {
        await api.post(url, values, { meta: { loading: false } })
      }

      toast.success(isEdit ? "Cập nhật bài tập thành công!" : "Tạo bài tập thành công!")
      router.refresh()
      onClose()
    } catch (error: any) {
      toast.error(error?.normalized?.message || "Có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          {isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
        </ModalHeader>

        <Form validationErrors={errors} onSubmit={onSubmit}>
          <ModalBody className="gap-4 flex flex-col">
            {/* Title */}
            <Input
              name="title"
              label="Tiêu đề"
              placeholder="Bài tập tuần 1 - Từ vựng"
              labelPlacement="outside"
              isRequired
              defaultValue={editData?.title || ""}
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing) {
                  return "Vui lòng nhập tiêu đề"
                }
              }}
            />

            {/* Description */}
            <Textarea
              name="description"
              label="Mô tả"
              placeholder="Mô tả yêu cầu bài tập..."
              labelPlacement="outside"
              minRows={3}
              defaultValue={editData?.description || ""}
            />

            {/* Class + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Lớp học"
                name="classId"
                labelPlacement="outside"
                isRequired
                selectedKeys={classId ? [classId] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string
                  setClassId(val)
                }}
                errorMessage={({ validationDetails }) => {
                  if (validationDetails.valueMissing) {
                    return "Vui lòng chọn lớp học"
                  }
                }}
              >
                {classes.map((c) => (
                  <SelectItem key={c.id}>
                    {c.className}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Loại bài tập"
                name="assignmentType"
                labelPlacement="outside"
                isRequired
                selectedKeys={assignmentType ? [assignmentType] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as string
                  setAssignmentType(val)
                }}
                errorMessage={({ validationDetails }) => {
                  if (validationDetails.valueMissing) {
                    return "Vui lòng chọn loại bài tập"
                  }
                }}
              >
                {ASSIGNMENT_TYPES.map((t) => (
                  <SelectItem key={t.key}>{t.label}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Due Date + Max Score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="dueDate"
                type="datetime-local"
                label="Hạn nộp"
                labelPlacement="outside"
                defaultValue={editData?.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : ""}
              />

              <Input
                name="maxScore"
                type="number"
                label="Điểm tối đa"
                labelPlacement="outside"
                defaultValue={String(editData?.maxScore || 100)}
                min={1}
                max={1000}
              />
            </div>

            {/* Status */}
            <Select
              label="Trạng thái"
              name="status"
              labelPlacement="outside"
              selectedKeys={status ? [status] : ["ACTIVE"]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string
                setStatus(val as "ACTIVE" | "DRAFT")
              }}
            >
              <SelectItem key="ACTIVE">Đang mở</SelectItem>
              <SelectItem key="DRAFT">Nháp</SelectItem>
            </Select>
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Hủy
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting}>
              {isEdit ? "Cập nhật" : "Tạo bài tập"}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  )
}

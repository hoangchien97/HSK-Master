"use client"

import { useEffect, useState } from "react"
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Form,
} from "@heroui/react"
import { toast } from "react-toastify"
import { createAssignmentAction, updateAssignmentAction } from "@/actions/assignment.actions"
import { FileUploadZone } from "@/components/portal/common"
import { CModal } from "@/components/portal/common/CModal"

interface ClassInfo {
  id: string
  className: string
  classCode: string
}

interface AssignmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (assignment: unknown) => void
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
    attachments?: string[]
  } | null
}

const ASSIGNMENT_TYPES = [
  { key: "HOMEWORK", label: "Bài tập về nhà" },
  { key: "QUIZ", label: "Kiểm tra" },
  { key: "PROJECT", label: "Dự án" },
  { key: "READING", label: "Đọc hiểu" },
  { key: "WRITING", label: "Viết" },
  { key: "SPEAKING", label: "Nói" },
  { key: "LISTENING", label: "Nghe" },
]

export default function AssignmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  classes,
  editData,
}: AssignmentFormModalProps) {
  const isEdit = !!editData

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classId, setClassId] = useState(editData?.classId || classes[0]?.id || "")
  const [assignmentType, setAssignmentType] = useState(editData?.assignmentType || "HOMEWORK")
  const [status, setStatus] = useState((editData?.status as "ACTIVE" | "DRAFT") || "ACTIVE")
  const [attachments, setAttachments] = useState<string[]>(editData?.attachments || [])

  useEffect(() => {
    if (isOpen) {
      setClassId(editData?.classId || classes[0]?.id || "")
      setAssignmentType(editData?.assignmentType || "HOMEWORK")
      setStatus((editData?.status as "ACTIVE" | "DRAFT") || "ACTIVE")
      setAttachments(editData?.attachments || [])
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
        classId,
        title: formData.title as string,
        description: formData.description as string,
        assignmentType,
        status,
        maxScore: Number(formData.maxScore),
        dueDate: (formData.dueDate as string) || undefined,
        attachments,
      }

      if (isEdit) {
        const result = await updateAssignmentAction(editData!.id, values)
        if (!result.success) throw new Error(result.error)
        toast.success("Cập nhật bài tập thành công!")
        onClose()
        if (result.assignment) onSuccess(result.assignment)
      } else {
        const result = await createAssignmentAction(values)
        if (!result.success) throw new Error(result.error)
        toast.success("Tạo bài tập thành công!")
        onClose()
        if (result.assignment) onSuccess(result.assignment)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      title={isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
      footer={
        <div className="flex gap-2 justify-end w-full">
          <Button variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="primary"
            type="submit"
            form="assignment-form"
            isLoading={isSubmitting}
          >
            {isEdit ? "Cập nhật" : "Tạo bài tập"}
          </Button>
        </div>
      }
    >
      <Form id="assignment-form" validationErrors={errors} onSubmit={onSubmit} className="flex flex-col gap-4">
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

        <Textarea
          name="description"
          label="Mô tả"
          placeholder="Mô tả yêu cầu bài tập..."
          labelPlacement="outside"
          minRows={3}
          defaultValue={editData?.description || ""}
        />

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="dueDate"
            type="datetime-local"
            label="Hạn nộp"
            labelPlacement="outside"
            placeholder=" "
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

        {/* ── File Attachments ── */}
        <div>
          <p className="text-sm font-medium mb-2">Tài liệu đính kèm</p>
          <FileUploadZone
            value={attachments}
            onChange={setAttachments}
            folder="assignments"
            maxFiles={10}
          />
        </div>
      </Form>
    </CModal>
  )
}

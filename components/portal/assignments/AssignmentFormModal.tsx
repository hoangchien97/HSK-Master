"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Form,
  Switch,
} from "@heroui/react"
import { Hash, ExternalLink } from "lucide-react"
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
    dueDate?: Date | null
    maxScore: number
    classId?: string
    status?: string
    attachments?: string[]
    tags?: string[]
    externalLink?: string | null
  } | null
}

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
  const [isPublished, setIsPublished] = useState(editData?.status === "PUBLISHED")
  const [attachments, setAttachments] = useState<string[]>(editData?.attachments || [])
  const [tags, setTags] = useState<string[]>(editData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [externalLink, setExternalLink] = useState(editData?.externalLink || "")

  useEffect(() => {
    if (isOpen) {
      setClassId(editData?.classId || classes[0]?.id || "")
      setIsPublished(editData?.status === "PUBLISHED")
      setAttachments(editData?.attachments || [])
      setTags(editData?.tags || [])
      setTagInput("")
      setExternalLink(editData?.externalLink || "")
      setErrors({})
    }
  }, [isOpen, editData, classes])

  /* ── Tag chip logic (Tab / Enter → add chip) ── */
  const addTag = useCallback(() => {
    const trimmed = tagInput.trim().replace(/^#/, "")
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setTagInput("")
  }, [tagInput, tags])

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault()
        addTag()
      }
      if (e.key === "Backspace" && !tagInput && tags.length > 0) {
        setTags((prev) => prev.slice(0, -1))
      }
    },
    [addTag, tagInput, tags],
  )

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.currentTarget))

    setErrors({})
    setIsSubmitting(true)

    try {
      const status = isPublished ? "PUBLISHED" : "DRAFT"

      const values = {
        classId,
        title: formData.title as string,
        description: formData.description as string,
        status,
        maxScore: 100,
        dueDate: (formData.dueDate as string) || undefined,
        attachments,
        tags,
        externalLink: externalLink || undefined,
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
        toast.success(
          isPublished
            ? "Tạo và công bố bài tập thành công!"
            : "Tạo bài tập nháp thành công!"
        )
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
            {isEdit
              ? "Cập nhật"
              : isPublished
                ? "Tạo & công bố"
                : "Lưu nháp"}
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

        <Input
          name="dueDate"
          type="datetime-local"
          label="Hạn nộp"
          labelPlacement="outside"
          placeholder=" "
          defaultValue={editData?.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : ""}
        />

        {/* ── Tags / Hashtags ── */}
        <div>
          <Input
            label="Hashtag"
            labelPlacement="outside"
            placeholder={tags.length === 0 ? "Nhập tag rồi nhấn Tab hoặc Enter..." : ""}
            size="sm"
            value={tagInput}
            onValueChange={setTagInput}
            onKeyDown={handleTagKeyDown}
            onBlur={addTag}
            startContent={
              <div className="flex items-center gap-1 flex-wrap">
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClose={() => removeTag(tag)}
                  >
                    #{tag}
                  </Chip>
                ))}
                <Hash className="w-4 h-4 text-default-400 shrink-0" />
              </div>
            }
            classNames={{
              input: "ml-1",
              innerWrapper: "flex-wrap gap-1",
            }}
          />
        </div>

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

        {/* ── External Link ── */}
        <Input
          label="Link tài liệu bên ngoài"
          labelPlacement="outside"
          placeholder="https://..."
          value={externalLink}
          onValueChange={setExternalLink}
          startContent={<ExternalLink className="w-4 h-4 text-default-400" />}
        />

        {/* ── Publish Toggle ── */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-200">
          <div>
            <p className="text-sm font-medium">
              {isPublished ? "Công bố bài tập" : "Lưu nháp"}
            </p>
            <p className="text-xs text-default-400">
              {isPublished
                ? "Học viên sẽ nhận được thông báo khi bạn lưu"
                : "Chỉ giáo viên mới nhìn thấy bài tập nháp"}
            </p>
          </div>
          <Switch
            isSelected={isPublished}
            onValueChange={setIsPublished}
            color="primary"
            size="sm"
          />
        </div>
      </Form>
    </CModal>
  )
}

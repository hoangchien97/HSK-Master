"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Button,
  Input,
  Textarea,
  Select,
  type SelectOption,
  Badge,
  Switch,
} from "@/components/ui"
import { Hash, ExternalLink } from "lucide-react"
import { toast } from "react-toastify"
import { createAssignmentAction, updateAssignmentAction } from "@/actions/assignment.actions"
import { FileUploadZone } from "@/components/portal/common"
import { CModal } from "@/components/portal/common/CModal"
import { ASSIGNMENT_STATUS } from "@/constants/portal"
import { MSG_ASSIGNMENT, MSG } from "@/constants/portal/messages"
import { ASSIGNMENT_DEFAULTS } from "@/constants/portal/ui"

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
  const [isPublished, setIsPublished] = useState(editData?.status === ASSIGNMENT_STATUS.PUBLISHED)
  const [attachments, setAttachments] = useState<string[]>(editData?.attachments || [])
  const [tags, setTags] = useState<string[]>(editData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [externalLink, setExternalLink] = useState(editData?.externalLink || "")
  const [title, setTitle] = useState(editData?.title || "")
  const [description, setDescription] = useState(editData?.description || "")
  const [dueDate, setDueDate] = useState(editData?.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : "")

  useEffect(() => {
    if (isOpen) {
      setClassId(editData?.classId || classes[0]?.id || "")
      setIsPublished(editData?.status === ASSIGNMENT_STATUS.PUBLISHED)
      setAttachments(editData?.attachments || [])
      setTags(editData?.tags || [])
      setTagInput("")
      setExternalLink(editData?.externalLink || "")
      setTitle(editData?.title || "")
      setDescription(editData?.description || "")
      setDueDate(editData?.dueDate ? new Date(editData.dueDate).toISOString().slice(0, 16) : "")
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

  const classOptions: SelectOption[] = classes.map((c) => ({ value: c.id, label: c.className }))

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!title.trim()) {
      setErrors({ title: "Vui lòng nhập tiêu đề" })
      return
    }
    if (!classId) {
      setErrors({ classId: "Vui lòng chọn lớp học" })
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const status = isPublished ? ASSIGNMENT_STATUS.PUBLISHED : ASSIGNMENT_STATUS.DRAFT

      const values = {
        classId,
        title,
        description,
        status,
        maxScore: ASSIGNMENT_DEFAULTS.MAX_SCORE,
        dueDate: dueDate || undefined,
        attachments,
        tags,
        externalLink: externalLink || undefined,
      }

      if (isEdit) {
        const result = await updateAssignmentAction(editData!.id, values)
        if (!result.success) throw new Error(result.error)
        toast.success(MSG_ASSIGNMENT.UPDATED)
        onClose()
        if (result.assignment) onSuccess(result.assignment)
      } else {
        const result = await createAssignmentAction(values)
        if (!result.success) throw new Error(result.error)
        toast.success(
          isPublished
            ? MSG_ASSIGNMENT.CREATED_PUBLISHED
            : MSG_ASSIGNMENT.CREATED_DRAFT
        )
        onClose()
        if (result.assignment) onSuccess(result.assignment)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MSG.ERROR_GENERIC)
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
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
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
      <form id="assignment-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          name="title"
          label="Tiêu đề"
          placeholder="Bài tập tuần 1 - Từ vựng"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <Textarea
          name="description"
          label="Mô tả"
          placeholder="Mô tả yêu cầu bài tập..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* ── Class & Due Date — side by side ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Select
            label="Lớp học"
            required
            value={classId}
            onChange={(val) => setClassId(val)}
            options={classOptions}
            placeholder="Chọn lớp học"
            error={errors.classId}
          />

          <Input
            name="dueDate"
            type="datetime-local"
            label="Hạn nộp"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* ── Tags / Hashtags ── */}
        <div className="w-full">
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Hashtag
          </label>
          <div
            className="flex flex-wrap items-center gap-1.5 min-h-10 w-full rounded-xl border border-default-200 bg-default-100 px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary cursor-text"
            onClick={() => {
              const inp = document.getElementById("tag-input")
              inp?.focus()
            }}
          >
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => removeTag(tag)}
                className="focus:outline-none"
              >
                <Badge size="sm" variant="primary">
                  #{tag} ×
                </Badge>
              </button>
            ))}
            <div className="flex items-center gap-1 flex-1 min-w-30">
              <Hash className="w-3.5 h-3.5 text-(--color-muted) shrink-0" />
              <input
                id="tag-input"
                type="text"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-(--color-muted)"
                placeholder={tags.length === 0 ? "Nhập tag rồi nhấn Tab hoặc Enter" : "Thêm tag..."}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
              />
            </div>
          </div>
          {tags.length > 0 && (
            <p className="text-xs text-(--color-muted) mt-1">
              {tags.length} tag · Nhấn Backspace để xoá tag cuối
            </p>
          )}
        </div>

        {/* ── File Attachments ── */}
        <div className="w-full">
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
          placeholder="https://..."
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          leftIcon={<ExternalLink className="w-4 h-4 text-(--color-muted)" />}
        />

        {/* ── Publish Toggle ── */}
        <div className="flex items-center justify-between w-full p-3 rounded-lg bg-(--color-paper) border border-(--color-smoke)">
          <div>
            <p className="text-sm font-medium">
              {isPublished ? "Công bố bài tập" : "Lưu nháp"}
            </p>
            <p className="text-xs text-(--color-muted)">
              {isPublished
                ? "Học viên sẽ nhận được thông báo khi bạn lưu"
                : "Chỉ giáo viên mới nhìn thấy bài tập nháp"}
            </p>
          </div>
          <Switch
            checked={isPublished}
            onChange={(checked) => setIsPublished(checked)}
          />
        </div>
      </form>
    </CModal>
  )
}

"use client"

import { useState, useRef, useCallback } from "react"
import { Button, Chip } from "@heroui/react"
import { Upload, X, FileText, Image as ImageIcon, File, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

/* ─── Allowed extensions for display ─── */
const FILE_ACCEPT =
  "image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv"

const ICON_MAP: Record<string, React.ReactNode> = {
  image: <ImageIcon className="w-4 h-4 text-success" />,
  pdf: <FileText className="w-4 h-4 text-danger" />,
  doc: <FileText className="w-4 h-4 text-primary" />,
  docx: <FileText className="w-4 h-4 text-primary" />,
  ppt: <FileText className="w-4 h-4 text-warning" />,
  pptx: <FileText className="w-4 h-4 text-warning" />,
  xls: <FileText className="w-4 h-4 text-success" />,
  xlsx: <FileText className="w-4 h-4 text-success" />,
  default: <File className="w-4 h-4 text-default-400" />,
}

function getFileIcon(name: string, type: string) {
  if (type.startsWith("image/")) return ICON_MAP.image
  const ext = name.split(".").pop()?.toLowerCase() || ""
  return ICON_MAP[ext] ?? ICON_MAP.default
}

/* ─── Types ─── */

export interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
}

interface FileUploadZoneProps {
  /** Already-uploaded URLs (edit mode) */
  value: string[]
  /** Called whenever the URL list changes */
  onChange: (urls: string[]) => void
  /** "assignments" | "submissions" */
  folder?: string
  /** Max number of files (0 = unlimited) */
  maxFiles?: number
  /** Disable interactions */
  disabled?: boolean
}

/* ─── Component ─── */

export default function FileUploadZone({
  value = [],
  onChange,
  folder = "assignments",
  maxFiles = 10,
  disabled = false,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  /* Upload files to the API */
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (maxFiles && value.length + fileArray.length > maxFiles) {
        toast.warning(`Tối đa ${maxFiles} file`)
        return
      }

      setUploading(true)
      try {
        const formData = new FormData()
        fileArray.forEach((f) => formData.append("files", f))

        const res = await fetch(`/api/portal/upload/file?folder=${folder}`, {
          method: "POST",
          body: formData,
        })

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || "Upload thất bại")
        }

        const newUrls = (json.files as UploadedFile[]).map((f) => f.url)
        onChange([...value, ...newUrls])

        if (json.partialErrors?.length) {
          toast.warning(`Một số file upload thất bại: ${json.partialErrors.join(", ")}`)
        } else {
          toast.success(`Đã tải lên ${newUrls.length} file`)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload thất bại")
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [value, onChange, folder, maxFiles],
  )

  /* Remove a file */
  const removeFile = useCallback(
    async (url: string) => {
      // Extract path from URL for deletion
      try {
        const urlObj = new URL(url)
        const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)/)
        if (pathMatch) {
          await fetch("/api/portal/upload/file", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: pathMatch[1] }),
          })
        }
      } catch {
        // Ignore delete errors, still remove from list
      }
      onChange(value.filter((v) => v !== url))
    },
    [value, onChange],
  )

  /* Drag & drop handlers */
  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setDragOver(true)
    },
    [disabled],
  )
  const onDragLeave = useCallback(() => setDragOver(false), [])
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (!disabled && e.dataTransfer.files.length) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [disabled, uploadFiles],
  )

  /* Extract filename from URL */
  const getFileName = (url: string) => {
    try {
      const decoded = decodeURIComponent(url)
      const parts = decoded.split("/")
      const raw = parts[parts.length - 1]
      // Remove timestamp prefix: 1234567890_filename.ext → filename.ext
      return raw.replace(/^\d+_/, "")
    } catch {
      return url
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-colors
          ${dragOver ? "border-primary bg-primary-50" : "border-default-300 hover:border-primary"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-default-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Đang tải lên...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-default-500">
            <Upload className="w-8 h-8" />
            <p className="text-sm">
              Kéo thả file vào đây hoặc <span className="text-primary font-medium">chọn file</span>
            </p>
            <p className="text-xs text-default-400">
              Hỗ trợ: ảnh, PDF, Word, PowerPoint, Excel (tối đa 10MB/file)
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={FILE_ACCEPT}
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files)
          }}
        />
      </div>

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((url) => {
            const name = getFileName(url)
            const ext = name.split(".").pop()?.toLowerCase() || ""
            const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)

            return (
              <div
                key={url}
                className="flex items-center gap-3 p-2 rounded-lg bg-default-100 group"
              >
                {getFileIcon(name, isImage ? "image/" : "")}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-foreground hover:text-primary truncate"
                  title={name}
                >
                  {name}
                </a>
                <Chip size="sm" variant="flat" className="shrink-0">
                  {ext.toUpperCase()}
                </Chip>
                {!disabled && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => removeFile(url)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

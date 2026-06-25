"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui"
import { CModal } from "@/components/portal/common/CModal"
import {
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  X,
  File,
  Eye,
} from "lucide-react"

/* ─── Helpers ─── */

function getFileName(url: string): string {
  try {
    const decoded = decodeURIComponent(url)
    const parts = decoded.split("/")
    const raw = parts[parts.length - 1]
    return raw.replace(/^\d+_/, "")
  } catch {
    return url
  }
}

function getFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() || ""
}

function isImageFile(name: string): boolean {
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(getFileExtension(name))
}

function isPdfFile(name: string): boolean {
  return getFileExtension(name) === "pdf"
}

function isPreviewable(name: string): boolean {
  return isImageFile(name) || isPdfFile(name)
}

const EXT_ICON_MAP: Record<string, { icon: React.ReactNode; color: string }> = {
  pdf: { icon: <FileText className="w-5 h-5" />, color: "text-red-600" },
  doc: { icon: <FileText className="w-5 h-5" />, color: "text-(--color-vermillion)" },
  docx: { icon: <FileText className="w-5 h-5" />, color: "text-(--color-vermillion)" },
  ppt: { icon: <FileText className="w-5 h-5" />, color: "text-amber-600" },
  pptx: { icon: <FileText className="w-5 h-5" />, color: "text-amber-600" },
  xls: { icon: <FileText className="w-5 h-5" />, color: "text-green-600" },
  xlsx: { icon: <FileText className="w-5 h-5" />, color: "text-green-600" },
  image: { icon: <ImageIcon className="w-5 h-5" />, color: "text-green-600" },
}

function getFileIcon(name: string) {
  const ext = getFileExtension(name)
  if (isImageFile(name)) return EXT_ICON_MAP.image
  return EXT_ICON_MAP[ext] || { icon: <File className="w-5 h-5" />, color: "text-gray-400" }
}

/* ─── FilePreviewModal ─── */

interface FilePreviewModalProps {
  url: string
  isOpen: boolean
  onClose: () => void
}

function FilePreviewModal({ url, isOpen, onClose }: FilePreviewModalProps) {
  const name = getFileName(url)

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      title={
        <span className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-(--color-vermillion)" />
          <span className="truncate">{name}</span>
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} leftIcon={<X className="w-4 h-4" />}>
            Đóng
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-md bg-(--color-vermillion) text-white hover:bg-(--color-vermillion-hover) transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Mở tab mới
          </a>
        </>
      }
    >
      {isImageFile(name) ? (
        <div className="flex items-center justify-center min-h-[60vh] bg-(--color-paper) p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={name}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      ) : isPdfFile(name) ? (
        <iframe
          src={url}
          className="w-full h-full min-h-[80vh]"
          title={name}
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-(--color-muted)">
          <File className="w-16 h-16" />
          <p>Không thể xem trước file này</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-md bg-(--color-vermillion) text-white hover:bg-(--color-vermillion-hover) transition-all"
          >
            <Download className="w-4 h-4" />
            Tải xuống
          </a>
        </div>
      )}
    </CModal>
  )
}

/* ─── FilePreviewList ─── */

interface FilePreviewListProps {
  urls: string[]
  title?: string
  showPreview?: boolean
}

export default function FilePreviewList({ urls, title, showPreview = true }: FilePreviewListProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handlePreview = useCallback((url: string) => {
    const name = getFileName(url)
    if (showPreview && isPreviewable(name)) {
      setPreviewUrl(url)
    } else {
      window.open(url, "_blank")
    }
  }, [showPreview])

  if (!urls.length) return null

  return (
    <div>
      {title && (
        <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-(--color-muted)" />
          {title} ({urls.length})
        </p>
      )}
      <div className="space-y-2">
        {urls.map((url) => {
          const name = getFileName(url)
          const ext = getFileExtension(name)
          const { icon, color } = getFileIcon(name)
          const canPreview = isPreviewable(name)

          return (
            <div
              key={url}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-(--color-paper) hover:bg-(--color-smoke) transition-colors group"
            >
              <span className={color}>{icon}</span>
              <button
                className="flex-1 text-left text-sm text-(--color-ink) hover:text-(--color-vermillion) truncate transition-colors"
                title={canPreview ? "Click để xem" : name}
                onClick={() => handlePreview(url)}
              >
                {name}
              </button>
              <span className="text-xs text-gray-400 uppercase font-medium shrink-0">
                {ext}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canPreview && showPreview && (
                  <button
                    type="button"
                    onClick={() => handlePreview(url)}
                    title="Xem trước"
                    className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Tải xuống"
                  className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {previewUrl && (
        <FilePreviewModal
          url={previewUrl}
          isOpen={!!previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  )
}

export { FilePreviewModal, getFileName, getFileExtension, isPreviewable }

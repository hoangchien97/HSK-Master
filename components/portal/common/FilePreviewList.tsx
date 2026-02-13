"use client"

import { useState, useCallback } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react"
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
  pdf: { icon: <FileText className="w-5 h-5" />, color: "text-danger" },
  doc: { icon: <FileText className="w-5 h-5" />, color: "text-primary" },
  docx: { icon: <FileText className="w-5 h-5" />, color: "text-primary" },
  ppt: { icon: <FileText className="w-5 h-5" />, color: "text-warning" },
  pptx: { icon: <FileText className="w-5 h-5" />, color: "text-warning" },
  xls: { icon: <FileText className="w-5 h-5" />, color: "text-success" },
  xlsx: { icon: <FileText className="w-5 h-5" />, color: "text-success" },
  image: { icon: <ImageIcon className="w-5 h-5" />, color: "text-success" },
}

function getFileIcon(name: string) {
  const ext = getFileExtension(name)
  if (isImageFile(name)) return EXT_ICON_MAP.image
  return EXT_ICON_MAP[ext] || { icon: <File className="w-5 h-5" />, color: "text-default-400" }
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
    <Modal isOpen={isOpen} onClose={onClose} size="full" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 border-b">
          <Eye className="w-5 h-5 text-primary" />
          <span className="truncate">{name}</span>
        </ModalHeader>
        <ModalBody className="p-0 flex-1">
          {isImageFile(name) ? (
            <div className="flex items-center justify-center min-h-[60vh] bg-default-50 p-4">
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
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-default-500">
              <File className="w-16 h-16" />
              <p>Không thể xem trước file này</p>
              <Button
                as="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                startContent={<Download className="w-4 h-4" />}
              >
                Tải xuống
              </Button>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="border-t">
          <Button variant="flat" onPress={onClose} startContent={<X className="w-4 h-4" />}>
            Đóng
          </Button>
          <Button
            as="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            startContent={<ExternalLink className="w-4 h-4" />}
          >
            Mở tab mới
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
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
          <FileText className="w-4 h-4 text-default-500" />
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
              className="flex items-center gap-3 p-2.5 rounded-lg bg-default-50 hover:bg-default-100 transition-colors group"
            >
              <span className={color}>{icon}</span>
              <button
                className="flex-1 text-left text-sm text-foreground hover:text-primary truncate transition-colors"
                title={canPreview ? "Click để xem" : name}
                onClick={() => handlePreview(url)}
              >
                {name}
              </button>
              <span className="text-xs text-default-400 uppercase font-medium shrink-0">
                {ext}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canPreview && showPreview && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handlePreview(url)}
                    title="Xem trước"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  as="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Tải xuống"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
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

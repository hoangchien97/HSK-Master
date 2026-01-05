"use client"

import { useState, useEffect, useCallback } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Play,
  Pause,
  RotateCw,
  Download,
  Minimize
} from "lucide-react"
import Button from "../shared/Button"

interface LightboxSlide {
  id: string
  url: string
  title?: string
  description?: string
}

interface LightboxGalleryProps {
  open: boolean
  close: () => void
  slides: LightboxSlide[]
  index: number
}

export function LightboxGallery({ open, close, slides, index }: LightboxGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(index)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  // Update currentIndex when index prop changes
  useEffect(() => {
    setCurrentIndex(index)
    setZoom(1)
    setRotation(0)
  }, [index])

  // Auto slideshow
  useEffect(() => {
    if (!open || !isPlaying) return

    const interval = setInterval(() => {
      goToNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, open, currentIndex])

  // Auto-hide controls after 3 seconds of inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true)

    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }

    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    setHideTimeout(timeout)
  }, [hideTimeout])

  const cancelHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
  }, [hideTimeout])

  useEffect(() => {
    if (!open) {
      setShowControls(true)
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
      return
    }

    // Initial timer
    const initialTimeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)
    setHideTimeout(initialTimeout)

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [open])

  // Keyboard controls
  useEffect(() => {
    if (!open) return

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          close()
          break
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
        case " ":
          e.preventDefault()
          setIsPlaying(prev => !prev)
          break
        case "+":
        case "=":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
        case "f":
        case "F":
          toggleFullscreen()
          break
        case "r":
        case "R":
          handleRotate()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [open])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setZoom(1)
    setRotation(0)
  }, [slides.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setZoom(1)
    setRotation(0)
  }, [slides.length])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = slides[currentIndex].url
    link.download = `photo-${currentIndex + 1}.jpg`
    link.target = "_blank"
    link.click()
  }

  if (!open) return null

  const currentSlide = slides[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onMouseMove={resetHideTimer}
    >
      {/* Header Controls */}
      <div
        className={`absolute top-4 left-4 right-4 flex justify-between items-center z-10 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        onMouseEnter={cancelHideTimer}
        onMouseLeave={resetHideTimer}
      >
        <div className="flex items-center gap-4">
          <Button
            onClick={close}
            variant="dark"
            size="sm"
            icon={<X className="w-4 h-4" />}
            iconPosition="left"
          >
            Đóng
          </Button>
          <span className="text-white text-sm font-medium px-3 py-2 bg-black/50 rounded-lg">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="dark"
            size="sm"
            className="!p-2 aspect-square"
            title={isPlaying ? "Tạm dừng" : "Phát tự động"}
            icon={isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          >
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          <Button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            variant="dark"
            size="sm"
            className="!p-2 aspect-square"
            title="Thu nhỏ (Phím -)"
            icon={<ZoomOut className="w-5 h-5" />}
          >
            <span className="sr-only">Zoom Out</span>
          </Button>
          <Button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            variant="dark"
            size="sm"
            className="!p-2 aspect-square"
            title="Phóng to (Phím +)"
            icon={<ZoomIn className="w-5 h-5" />}
          >
            <span className="sr-only">Zoom In</span>
          </Button>
          <Button
            onClick={handleRotate}
            variant="dark"
            size="sm"
            className="!p-2 aspect-square"
            title="Xoay (Phím R)"
            icon={<RotateCw className="w-5 h-5" />}
          >
            <span className="sr-only">Rotate</span>
          </Button>
          <Button
            onClick={toggleFullscreen}
            variant="dark"
            size="sm"
            className="!p-2 aspect-square"
            title="Toàn màn hình (Phím F)"
            icon={isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          >
            <span className="sr-only">Fullscreen</span>
          </Button>
          <Button
            onClick={handleDownload}
            variant="dark"
            size="sm"
            className="!p-2 aspect-square"
            title="Tải xuống"
            icon={<Download className="w-5 h-5" />}
          >
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
        onMouseEnter={cancelHideTimer}
        onMouseLeave={resetHideTimer}
      >
        <Button
          onClick={goToPrevious}
          variant="dark"
          size="md"
          className={`!p-3 aspect-square transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
          title="Ảnh trước (←)"
          icon={<ChevronLeft className="w-6 h-6" />}
        >
          <span className="sr-only">Previous</span>
        </Button>
      </div>

      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
        onMouseEnter={cancelHideTimer}
        onMouseLeave={resetHideTimer}
      >
        <Button
          onClick={goToNext}
          variant="dark"
          size="md"
          className={`!p-3 aspect-square transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
          title="Ảnh kế (→)"
          icon={<ChevronRight className="w-6 h-6" />}
        >
          <span className="sr-only">Next</span>
        </Button>
      </div>

      {/* Main Image Container */}
      <div className="relative flex items-center justify-center w-full h-full p-4">
        <div
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            cursor: zoom > 1 ? "grab" : "default",
            transition: "transform 0.3s ease"
          }}
          className="relative max-w-full max-h-full"
        >
          <img
            src={currentSlide.url}
            alt={currentSlide.title || currentSlide.description || ""}
            className="max-w-full max-h-[85vh] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Image Info */}
      {(currentSlide.title || currentSlide.description) && (
        <div
          className={`absolute bottom-24 left-4 right-4 text-center transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
          onMouseEnter={cancelHideTimer}
          onMouseLeave={resetHideTimer}
        >
          {currentSlide.title && (
            <h3 className="text-white text-lg font-semibold mb-2 drop-shadow-lg">
              {currentSlide.title}
            </h3>
          )}
          {currentSlide.description && (
            <p className="text-white/90 text-sm drop-shadow">
              {currentSlide.description}
            </p>
          )}
        </div>
      )}

      {/* Thumbnail Strip */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 scrollbar-hide transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        onMouseEnter={cancelHideTimer}
        onMouseLeave={resetHideTimer}
      >
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => {
              setCurrentIndex(idx)
              setZoom(1)
              setRotation(0)
            }}
            className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
              idx === currentIndex
                ? "border-blue-500 scale-105 shadow-lg shadow-blue-500/50"
                : "border-white/30 opacity-60 hover:opacity-100 hover:border-white/50"
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title || ""}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

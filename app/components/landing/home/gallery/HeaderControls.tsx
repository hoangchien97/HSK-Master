import { X, Pause, Play, ZoomOut, ZoomIn, RotateCw, Minimize, Maximize, Download } from "lucide-react";
import Button from "@/app/components/landing/shared/Button";
import { ZOOM_MIN, ZOOM_MAX } from "./types";
import { useResponsive } from "@/app/hooks/useResponsive";

interface HeaderControlsProps {
  showControls: boolean;
  currentIndex: number;
  totalSlides: number;
  isPlaying: boolean;
  zoom: number;
  isFullscreen: boolean;
  onClose: () => void;
  onTogglePlayback: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onToggleFullscreen: () => void;
  onDownload: () => void;
  cancelHideTimer: () => void;
  resetHideTimer: () => void;
}

export function HeaderControls({
  showControls,
  currentIndex,
  totalSlides,
  isPlaying,
  zoom,
  isFullscreen,
  onClose,
  onTogglePlayback,
  onZoomIn,
  onZoomOut,
  onRotate,
  onToggleFullscreen,
  onDownload,
  cancelHideTimer,
  resetHideTimer,
}: HeaderControlsProps) {
  const { isMobile } = useResponsive();

  return (
    <div
      className={`absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 flex justify-between items-center z-10 transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
        <Button
          onClick={onClose}
          variant="gallery-control"
          className="md:text-base"
          icon={<X className="w-4 h-4 md:w-5 md:h-5" />}
          iconPosition="left"
        >
          <span className="hidden sm:inline">Đóng</span>
        </Button>
        <span className="text-white text-[10px] sm:text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-2 bg-black/50 rounded-lg">
          {currentIndex + 1} / {totalSlides}
        </span>
      </div>

      {!isMobile && (
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            onClick={onTogglePlayback}
            variant="gallery-control"
            title={isPlaying ? "Tạm dừng" : "Phát tự động"}
            icon={isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
            aria-label={isPlaying ? "Tạm dừng" : "Phát tự động"}
          />

          {/* Zoom controls */}
          <div className="w-px h-6 bg-white/20" />
          <Button
            onClick={onZoomOut}
            disabled={zoom <= ZOOM_MIN}
            variant="gallery-control"
            title="Thu nhỏ (Phím -)"
            icon={<ZoomOut className="w-4 h-4 md:w-5 md:h-5" />}
            aria-label="Thu nhỏ"
          />
          <Button
            onClick={onZoomIn}
            disabled={zoom >= ZOOM_MAX}
            variant="gallery-control"
            title="Phóng to (Phím +)"
            icon={<ZoomIn className="w-4 h-4 md:w-5 md:h-5" />}
            aria-label="Phóng to"
          />

          <Button
            onClick={onRotate}
            variant="gallery-control"
            title="Xoay ảnh (Phím R)"
            icon={<RotateCw className="w-4 h-4 md:w-5 md:h-5" />}
            aria-label="Xoay ảnh"
          />

          <div className="w-px h-6 bg-white/20" />
          <Button
            onClick={onToggleFullscreen}
            variant="gallery-control"
            title={isFullscreen ? "Thoát toàn màn hình (Esc)" : "Toàn màn hình (F)"}
            icon={isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
            aria-label={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          />
          <Button
            onClick={onDownload}
            variant="gallery-control"
            title="Tải xuống (Phím D)"
            icon={<Download className="w-4 h-4 md:w-5 md:h-5" />}
            aria-label="Tải xuống"
          />
        </div>
      )}
    </div>
  );
}

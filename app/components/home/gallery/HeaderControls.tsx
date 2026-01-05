import { X, Pause, Play, ZoomOut, ZoomIn, RotateCw, Minimize, Maximize, Download } from "lucide-react";
import Button from "../../shared/Button";
import { ZOOM_MIN, ZOOM_MAX } from "./types";

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
  return (
    <div
      className={`absolute top-4 left-4 right-4 flex justify-between items-center z-10 transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      <div className="flex items-center gap-4">
        <Button
          onClick={onClose}
          variant="glass"
          size="sm"
          icon={<X className="w-4 h-4" />}
          iconPosition="left"
        >
          Đóng
        </Button>
        <span className="text-white text-sm font-medium px-3 py-2 bg-black/50 rounded-lg">
          {currentIndex + 1} / {totalSlides}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onTogglePlayback}
          variant="glass"
          size="sm"
          className="p-2! aspect-square"
          title={isPlaying ? "Tạm dừng" : "Phát tự động"}
          icon={isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        />
        <Button
          onClick={onZoomOut}
          disabled={zoom <= ZOOM_MIN}
          variant="glass"
          size="sm"
          className="p-2! aspect-square"
          title="Thu nhỏ (Phím -)"
          icon={<ZoomOut className="w-5 h-5" />}
        />
        <Button
          onClick={onZoomIn}
          disabled={zoom >= ZOOM_MAX}
          variant="glass"
          size="sm"
          className="p-2! aspect-square"
          title="Phóng to (Phím +)"
          icon={<ZoomIn className="w-5 h-5" />}
        />
        <Button
          onClick={onRotate}
          variant="glass"
          size="sm"
          className="p-2! aspect-square"
          title="Xoay (Phím R)"
          icon={<RotateCw className="w-5 h-5" />}
        />
        <Button
          onClick={onToggleFullscreen}
          variant="glass"
          size="sm"
          className="p-2! aspect-square"
          title="Toàn màn hình (Phím F)"
          icon={isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        />
        <Button
          onClick={onDownload}
          variant="glass"
          size="sm"
          className="p-2! aspect-square"
          title="Tải xuống"
          icon={<Download className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}

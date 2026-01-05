import { LightboxSlide } from "./types";

interface ThumbnailStripProps {
  slides: LightboxSlide[];
  currentIndex: number;
  onSelectSlide: (idx: number) => void;
  showControls: boolean;
  cancelHideTimer: () => void;
  resetHideTimer: () => void;
}

export function ThumbnailStrip({
  slides,
  currentIndex,
  onSelectSlide,
  showControls,
  cancelHideTimer,
  resetHideTimer,
}: ThumbnailStripProps) {
  return (
    <div
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 scrollbar-hide transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      {slides.map((slide, idx) => (
        <button
          key={slide.id}
          onClick={() => onSelectSlide(idx)}
          className={`shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
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
  );
}

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
      className={`absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 max-w-[90vw] overflow-x-auto px-2 md:px-4 py-1 md:py-2 scrollbar-hide transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      {slides.map((slide, idx) => (
        <button
          key={slide.id}
          onClick={() => onSelectSlide(idx)}
          className={`shrink-0 w-12 h-9 md:w-16 md:h-12 rounded-md overflow-hidden border-2 transition-all duration-300 ${
            idx === currentIndex
              ? "border-primary-500 scale-110 shadow-lg shadow-primary-500/50 ring-2 ring-primary-500/30"
              : "border-white/30 opacity-60 hover:opacity-100 hover:border-white/60 hover:scale-105"
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title || ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}

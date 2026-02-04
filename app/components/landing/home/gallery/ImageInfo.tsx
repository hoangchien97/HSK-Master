interface ImageInfoProps {
  title?: string;
  description?: string;
  showControls: boolean;
  cancelHideTimer: () => void;
  resetHideTimer: () => void;
}

export function ImageInfo({
  title,
  description,
  showControls,
  cancelHideTimer,
  resetHideTimer,
}: ImageInfoProps) {
  return (
    <div
      className={`absolute bottom-16 md:bottom-20 lg:bottom-24 left-2 right-2 md:left-4 md:right-4 text-center transition-opacity duration-300 ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      {title && (
        <h3 className="text-white text-sm md:text-base lg:text-lg font-semibold mb-1 md:mb-2 drop-shadow-lg">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-white/90 text-xs md:text-sm drop-shadow">{description}</p>
      )}
    </div>
  );
}

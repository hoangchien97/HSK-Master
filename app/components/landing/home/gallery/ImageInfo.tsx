import { cn } from "@/app/lib/utils";

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
      className={cn(
        "absolute bottom-16 md:bottom-20 left-4 right-4 md:left-8 md:right-8 max-w-2xl mx-auto",
        "bg-black/80 backdrop-blur-md p-3 md:p-4 lg:p-5 rounded-xl",
        "border border-white/10 shadow-2xl",
        "transition-all duration-300",
        showControls
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      )}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      {title && (
        <h3 className="text-white text-sm md:text-base lg:text-lg font-bold mb-1 md:mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-white/90 text-xs md:text-sm leading-relaxed">{description}</p>
      )}
    </div>
  );
}

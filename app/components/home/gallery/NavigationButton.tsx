import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../shared/Button";

interface NavigationButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  showControls: boolean;
  cancelHideTimer: () => void;
  resetHideTimer: () => void;
}

export function NavigationButton({
  direction,
  onClick,
  showControls,
  cancelHideTimer,
  resetHideTimer,
}: NavigationButtonProps) {
  const isLeft = direction === "left";
  const title = isLeft ? "Ảnh trước (←)" : "Ảnh kế (→)";
  const icon = isLeft ? <ChevronLeft className="w-8 h-8" /> : <ChevronRight className="w-8 h-8" />;

  return (
    <div
      className={`absolute ${isLeft ? "left-6" : "right-6"} top-1/2 -translate-y-1/2 z-10`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      <Button
        onClick={onClick}
        variant="icon-only"
        size="md"
        className={`aspect-square transition-all duration-300 bg-black/70 hover:bg-black/90 border-2 border-white/30 shadow-2xl backdrop-blur-md ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        title={title}
        icon={icon}
      />
    </div>
  );
}

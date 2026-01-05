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
  const icon = isLeft ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />;

  return (
    <div
      className={`absolute ${isLeft ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 z-10`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      <Button
        onClick={onClick}
        variant="glass"
        size="md"
        className={`p-3! aspect-square transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        title={title}
        icon={icon}
      />
    </div>
  );
}

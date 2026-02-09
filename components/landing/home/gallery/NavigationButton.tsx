import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/landing/common/Button";

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
  const icon = isLeft ? <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" /> : <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />;

  return (
    <div
      className={`absolute ${isLeft ? "left-2 md:left-4 lg:left-6" : "right-2 md:right-4 lg:right-6"} top-1/2 -translate-y-1/2 z-10`}
      onMouseEnter={cancelHideTimer}
      onMouseLeave={resetHideTimer}
    >
      <Button
        onClick={onClick}
        variant="gallery-control"
        size="sm"
        className={`aspect-square transition-all duration-300 md:size-auto hover:scale-110 ${
          showControls
            ? `opacity-100 ${isLeft ? "translate-x-0" : "-translate-x-0"}`
            : `opacity-0 ${isLeft ? "-translate-x-4" : "translate-x-4"}`
        }`}
        title={title}
        icon={icon}
      />
    </div>
  );
}

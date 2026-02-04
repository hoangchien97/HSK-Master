import { LightboxSlide } from "./types";
import OptimizedImage from "@/app/components/common/OptimizedImage";

interface ImageViewerProps {
  slide: LightboxSlide;
  zoom: number;
  rotation: number;
}

export function ImageViewer({ slide, zoom, rotation }: ImageViewerProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-full p-2 md:p-4">
      <div
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          cursor: zoom > 1 ? "grab" : "default",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="relative max-w-full max-h-full"
      >
        <div className="relative max-w-full max-h-[70vh] md:max-h-[80vh] lg:max-h-[85vh]">
          <img
            src={slide.url}
            alt={slide.title || slide.description || ""}
            className="max-w-full max-h-[70vh] md:max-h-[80vh] lg:max-h-[85vh] object-contain select-none"
            draggable={false}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}

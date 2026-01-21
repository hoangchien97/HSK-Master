import { LightboxSlide } from "./types";

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
          transition: "transform 0.3s ease",
        }}
        className="relative max-w-full max-h-full"
      >
        <img
          src={slide.url}
          alt={slide.title || slide.description || ""}
          className="max-w-full max-h-[70vh] md:max-h-[80vh] lg:max-h-[85vh] object-contain select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}

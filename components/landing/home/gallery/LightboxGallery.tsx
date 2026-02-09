"use client";

import { useState, useEffect, useCallback } from "react";
import { LightboxGalleryProps, ZOOM_STEP, ZOOM_MIN, ZOOM_MAX, ROTATION_STEP, SLIDESHOW_INTERVAL } from "./types";
import { useControlsVisibility } from "./useControlsVisibility";
import { useKeyboardControls } from "./useKeyboardControls";
import { HeaderControls } from "./HeaderControls";
import { NavigationButton } from "./NavigationButton";
import { ImageViewer } from "./ImageViewer";
import { ImageInfo } from "./ImageInfo";
import { ThumbnailStrip } from "./ThumbnailStrip";

export function LightboxGallery({
  open,
  close,
  slides,
  index,
}: LightboxGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prevIndex, setPrevIndex] = useState(index);

  const currentSlide = slides[currentIndex] || slides[0];

  // Custom hooks
  const { showControls, resetHideTimer, cancelHideTimer } = useControlsVisibility(open);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setZoom(1);
    setRotation(0);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setZoom(1);
    setRotation(0);
  }, [slides.length]);

  const goToSlide = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setZoom(1);
    setRotation(0);
  }, []);

  // Control handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + ROTATION_STEP) % 360);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleDownload = useCallback(() => {
    if (!currentSlide) return;

    const link = document.createElement("a");
    link.href = currentSlide.url;
    link.download = `photo-${currentIndex + 1}.jpg`;
    link.target = "_blank";
    link.click();
  }, [currentSlide, currentIndex]);

  // Keyboard controls
  useKeyboardControls({
    open,
    close,
    goToPrevious,
    goToNext,
    togglePlayback,
    handleZoomIn,
    handleZoomOut,
    toggleFullscreen,
    handleRotate,
  });

  // Update currentIndex when index prop changes
  if (index !== prevIndex && index >= 0 && index < slides.length) {
    setPrevIndex(index);
    setCurrentIndex(index);
    setZoom(1);
    setRotation(0);
  }

  // Auto slideshow
  useEffect(() => {
    if (!open || !isPlaying) return;

    const interval = setInterval(goToNext, SLIDESHOW_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, open, goToNext]);

  if (!open || !currentSlide) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/97 backdrop-blur-md flex items-center justify-center transition-opacity duration-300"
      onMouseMove={resetHideTimer}
    >
      <HeaderControls
        showControls={showControls}
        currentIndex={currentIndex}
        totalSlides={slides.length}
        isPlaying={isPlaying}
        zoom={zoom}
        isFullscreen={isFullscreen}
        onClose={close}
        onTogglePlayback={togglePlayback}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onToggleFullscreen={toggleFullscreen}
        onDownload={handleDownload}
        cancelHideTimer={cancelHideTimer}
        resetHideTimer={resetHideTimer}
      />

      <NavigationButton
        direction="left"
        onClick={goToPrevious}
        showControls={showControls}
        cancelHideTimer={cancelHideTimer}
        resetHideTimer={resetHideTimer}
      />

      <NavigationButton
        direction="right"
        onClick={goToNext}
        showControls={showControls}
        cancelHideTimer={cancelHideTimer}
        resetHideTimer={resetHideTimer}
      />

      <ImageViewer slide={currentSlide} zoom={zoom} rotation={rotation} />

      {(currentSlide.title || currentSlide.description) && (
        <ImageInfo
          title={currentSlide.title}
          description={currentSlide.description}
          showControls={showControls}
          cancelHideTimer={cancelHideTimer}
          resetHideTimer={resetHideTimer}
        />
      )}

      <ThumbnailStrip
        slides={slides}
        currentIndex={currentIndex}
        onSelectSlide={goToSlide}
        showControls={showControls}
        cancelHideTimer={cancelHideTimer}
        resetHideTimer={resetHideTimer}
      />
    </div>
  );
}

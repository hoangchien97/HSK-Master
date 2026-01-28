import { useCallback, useEffect } from "react";

interface UseKeyboardControlsProps {
  open: boolean;
  close: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  togglePlayback: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  toggleFullscreen: () => void;
  handleRotate: () => void;
}

export function useKeyboardControls({
  open,
  close,
  goToPrevious,
  goToNext,
  togglePlayback,
  handleZoomIn,
  handleZoomOut,
  toggleFullscreen,
  handleRotate,
}: UseKeyboardControlsProps) {
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          close();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case " ":
          e.preventDefault();
          togglePlayback();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
      }
    },
    [
      close,
      goToPrevious,
      goToNext,
      togglePlayback,
      handleZoomIn,
      handleZoomOut,
      toggleFullscreen,
      handleRotate,
    ]
  );

  useEffect(() => {
    if (!open) return;

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [open, handleKeyPress]);
}

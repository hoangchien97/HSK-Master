import { useCallback, useEffect, useState } from "react";
import { AUTO_HIDE_DELAY } from "./types";

export function useControlsVisibility(open: boolean) {
  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);

    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, AUTO_HIDE_DELAY);

    setHideTimeout(timeout);
  }, [hideTimeout]);

  const cancelHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  }, [hideTimeout]);

  useEffect(() => {
    if (!open) {
      setShowControls(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      return;
    }

    const initialTimeout = setTimeout(() => {
      setShowControls(false);
    }, AUTO_HIDE_DELAY);
    setHideTimeout(initialTimeout);

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [open]);

  return { showControls, resetHideTimer, cancelHideTimer };
}

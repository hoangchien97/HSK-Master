export interface LightboxSlide {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

export interface LightboxGalleryProps {
  open: boolean;
  close: () => void;
  slides: LightboxSlide[];
  index: number;
}

export const ZOOM_STEP = 0.25;
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
export const ROTATION_STEP = 90;
export const AUTO_HIDE_DELAY = 3000;
export const SLIDESHOW_INTERVAL = 3000;

'use client';

import { useEffect, useState } from 'react';

const MATERIAL_ICONS_HREF =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';

/**
 * Loads Material Symbols Outlined icon font asynchronously after hydration
 * using a non-blocking pattern: preload + swap.
 */
export function MaterialIconsLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if already loaded
    const existing = document.querySelector(`link[href="${MATERIAL_ICONS_HREF}"]`);
    if (existing) {
      setLoaded(true);
      return;
    }

    // Preload first, then apply as stylesheet
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'style';
    preload.href = MATERIAL_ICONS_HREF;
    document.head.appendChild(preload);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MATERIAL_ICONS_HREF;
    link.media = 'print'; // Non-blocking: load as print first
    link.onload = () => {
      link.media = 'all'; // Swap to all once loaded
      setLoaded(true);
    };
    document.head.appendChild(link);
  }, []);

  return null;
}

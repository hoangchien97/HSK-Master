'use client';

import { useEffect } from 'react';

/**
 * Loads Material Symbols Outlined icon font asynchronously.
 * This is the only font still loaded externally because icon fonts
 * are not supported by next/font/google.
 */
export function MaterialIconsLoader() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(link);
  }, []);

  return null;
}

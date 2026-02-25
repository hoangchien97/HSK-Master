'use client';

import { useEffect } from 'react';

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap';

/**
 * Loads external Google Fonts asynchronously to avoid render-blocking.
 * Uses the "preload + swap" pattern recommended by web.dev.
 */
export function AsyncFontLoader() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  return (
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />
  );
}

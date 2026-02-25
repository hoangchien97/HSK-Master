'use client';

import dynamic from 'next/dynamic';

const ScrollToTop = dynamic(
  () => import('./ScrollToTop'),
  { ssr: false }
);
const ContactBubbles = dynamic(
  () => import('./ContactBubbles'),
  { ssr: false }
);

/**
 * Lazy-loaded floating widgets (ScrollToTop + ContactBubbles).
 * Client Component wrapper so `ssr: false` works in Next.js App Router.
 */
export function LazyFloatingWidgets() {
  return (
    <>
      <ScrollToTop />
      <ContactBubbles />
    </>
  );
}

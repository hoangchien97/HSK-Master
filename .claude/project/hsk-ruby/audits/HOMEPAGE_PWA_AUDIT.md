# Ruby HSK — PWA Audit

**Date:** 2026-06-24

---

## Current PWA Status: Partial ✅

### What's in place

| Item | File | Status |
|---|---|---|
| Web App Manifest | `public/manifest.json` | ✅ Complete |
| Manifest referenced in layout | `app/layout.tsx` metadata `manifest` field | ✅ |
| 192×192 icon | `public/android-chrome-192x192.png` | ✅ |
| 512×512 icon | `public/android-chrome-512x512.png` | ✅ |
| Apple touch icon | `public/apple-touch-icon.png` (180×180) | ✅ |
| `theme-color` meta tag | `app/layout.tsx` other metadata | ✅ `#ec131e` |
| `apple-mobile-web-app-capable` | `app/layout.tsx` | ✅ |
| `mobile-web-app-capable` | `app/layout.tsx` | ✅ |
| `msapplication-TileColor` | `app/layout.tsx` | ✅ |
| Favicon (ICO + PNG) | `public/` | ✅ |

### What's missing

| Item | Priority | Notes |
|---|---|---|
| Service Worker | P3 | No offline support — users need connectivity for every page |
| Offline fallback page | P3 | A cached shell would allow browsing course list offline |
| Background sync | P3 | Contact form submissions could queue when offline |
| Push notifications | P3 | Could notify students of new assignments via Supabase Realtime + Web Push |

---

## Manifest Completeness (`public/manifest.json`)

Expected fields for full installability:

```json
{
  "name": "Ruby HSK",
  "short_name": "Ruby HSK",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ec131e",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Verify `purpose: "maskable"` is set on the 512×512 icon for adaptive icons on Android.

---

## Service Worker Roadmap (P3)

If service worker is ever added, recommended approach: **`next-pwa`** (wraps Workbox).

```bash
npm install next-pwa
```

Cache strategy for Ruby HSK:
- **Landing shell** (Header, Footer) → `CacheFirst`
- **Course listing page** → `StaleWhileRevalidate` (fresh every 10 min)
- **Course detail pages** → `StaleWhileRevalidate`
- **API routes** → `NetworkFirst` (mutations must not be cached)

Do NOT add service worker without also testing the portal (`/portal/*`) exclusion — portal pages must not be cached offline.

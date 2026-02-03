import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HSK Master - Trung tâm tiếng Trung',
    short_name: 'HSK Master',
    description: 'Trung tâm tiếng Trung HSK Master - Đào tạo HSK 1-6, giao tiếp, thương mại',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ec131e',
    orientation: 'portrait',
    categories: ['education', 'language'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

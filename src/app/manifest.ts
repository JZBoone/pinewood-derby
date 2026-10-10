import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pack 272 Pinewood Derby',
    short_name: 'Derby 272',
    start_url: '/',
    display: 'standalone',
    background_color: '#132150',
    theme_color: '#132150',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

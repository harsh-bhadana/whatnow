import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WhatNow?',
    short_name: 'WhatNow',
    description: 'An AI-curated entertainment discovery app',
    start_url: '/',
    display: 'standalone',
    background_color: '#141218',
    theme_color: '#381E72',
    icons: [
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}

import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'C-Report',
    short_name: 'C-Report',
    description: 'Next-gen Creator Management Platform',
    start_url: '/',
    display: 'standalone', // Makes it look like a native app without browser UI
    background_color: '#054ab3', // The navy blue theme
    theme_color: '#054ab3',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
    ],
  }
}

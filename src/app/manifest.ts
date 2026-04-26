import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Editor HQ Terminal',
    short_name: 'Editor HQ',
    description: 'Next-gen Creator Management Platform',
    start_url: '/',
    display: 'standalone', // Makes it look like a native app without browser UI
    background_color: '#054ab3', // The navy blue theme
    theme_color: '#054ab3',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon', // This points to our dynamic icon.tsx we just created!
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}

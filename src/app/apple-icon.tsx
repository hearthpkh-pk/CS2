import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120, 
          background: '#054ab3',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          // Apple icons must be completely square. iOS rounds the corners automatically!
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        C
      </div>
    ),
    {
      ...size,
    }
  )
}

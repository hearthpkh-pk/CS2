import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 30,
  height: 34,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 28, // ใหญ่ขึ้นนิดหน่อยเพื่อความชัด
          background: '#054ab3',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%', // วงกลมสมบูรณ์แบบ
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 900, // หนาที่สุด
          lineHeight: 1,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
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

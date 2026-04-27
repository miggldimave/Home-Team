import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const w = Number(searchParams.get('w') ?? 1170)
  const h = Number(searchParams.get('h') ?? 2532)

  const iconPath = path.join(process.cwd(), 'public/icons/icon-512.png')
  const iconBase64 = `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDF8F1',
        }}
      >
        <img src={iconBase64} width={120} height={120} />
      </div>
    ),
    { width: w, height: h },
  )
}

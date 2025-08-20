import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  try {
    const [width, height] = params.dimensions
    
    if (!width || !height) {
      return new NextResponse('Invalid dimensions', { status: 400 })
    }

    const w = parseInt(width)
    const h = parseInt(height)
    
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || w > 2000 || h > 2000) {
      return new NextResponse('Invalid dimensions', { status: 400 })
    }

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#E5E7EB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#F3F4F6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w, h) * 0.15}" fill="#D1D5DB" opacity="0.7"/>
        <text x="${w/2}" y="${h/2 + 8}" font-family="Inter, sans-serif" font-size="14" fill="#9CA3AF" text-anchor="middle" font-weight="500">
          ${w} × ${h}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error generating placeholder:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}